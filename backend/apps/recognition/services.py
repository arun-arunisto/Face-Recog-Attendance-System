import base64
import time
import logging
from datetime import datetime
from typing import Dict, Any, List, Optional
import numpy as np
import cv2
from django.utils import timezone
from django.conf import settings
from apps.students.models import StudentProfile
from apps.attendance.models import Attendance, AttendanceStatus
from apps.audit.services import log_audit_event
from apps.audit.models import AuditAction
from .models import RecognitionEvent
from .providers import get_recognition_provider

logger = logging.getLogger(__name__)

class RecognitionPipelineService:
    """
    Core Face Recognition Processing Pipeline.
    Orchestrates decoding, quality checking, face detection, vector matching,
    duplicate attendance protection, and database logging.
    """

    def __init__(self, provider_type: Optional[str] = None):
        self.provider = get_recognition_provider(provider_type)
        self.threshold = getattr(settings, 'FACE_MATCH_THRESHOLD', 0.6)

    def decode_base64_image(self, base64_str: str) -> np.ndarray:
        """
        Decodes a base64 encoded image string (with or without data URI prefix)
        into an RGB numpy array.
        """
        if ',' in base64_str:
            base64_str = base64_str.split(',', 1)[1]

        image_bytes = base64.b64decode(base64_str)
        nparr = np.frombuffer(image_bytes, np.uint8)
        img_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img_bgr is None:
            raise ValueError("Failed to decode image from base64 data.")

        # Resize if overly large to optimize processing latency
        h, w = img_bgr.shape[:2]
        if w > 1024:
            scale = 1024.0 / w
            img_bgr = cv2.resize(img_bgr, (1024, int(h * scale)), interpolation=cv2.INTER_AREA)

        # Convert to RGB
        img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
        return img_rgb

    def check_image_quality(self, img_rgb: np.ndarray) -> Dict[str, Any]:
        """
        Checks illumination and focus quality.
        """
        gray = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2GRAY)
        brightness = float(np.mean(gray))
        if brightness < 30.0:
            return {'pass': False, 'reason': 'Image is too dark. Increase ambient lighting.'}
        if brightness > 240.0:
            return {'pass': False, 'reason': 'Image is overexposed. Reduce glare.'}
        return {'pass': True, 'brightness': brightness}

    def process_frame(self, base64_str: str, camera=None, session=None) -> Dict[str, Any]:
        start_time = time.time()
        now = timezone.now()
        today = now.date()

        try:
            img_rgb = self.decode_base64_image(base64_str)
        except Exception as e:
            return {
                "type": "recognition_error",
                "code": "CAMERA_ERROR",
                "message": f"Invalid frame data: {str(e)}",
                "latency_ms": 0,
            }

        # Quality check
        quality = self.check_image_quality(img_rgb)
        if not quality['pass']:
            latency = (time.time() - start_time) * 1000
            return {
                "type": "recognition_error",
                "code": "LOW_QUALITY",
                "message": quality['reason'],
                "latency_ms": round(latency, 2),
            }

        # Step 4: Detect faces
        faces = self.provider.detect_faces(img_rgb)
        face_count = len(faces)

        # Step 5: Validate face count
        if face_count == 0:
            latency = (time.time() - start_time) * 1000
            return {
                "type": "recognition_error",
                "code": "FACE_NOT_DETECTED",
                "message": "No face detected in camera view.",
                "bounding_boxes": [],
                "latency_ms": round(latency, 2),
            }

        if face_count > 1:
            latency = (time.time() - start_time) * 1000
            return {
                "type": "recognition_error",
                "code": "MULTIPLE_FACES",
                "message": "Multiple faces detected. Only one student must be in view.",
                "bounding_boxes": faces,
                "latency_ms": round(latency, 2),
            }

        # Step 6: Generate facial encoding
        candidate_encodings = self.provider.extract_encodings(img_rgb, faces)
        if not candidate_encodings:
            latency = (time.time() - start_time) * 1000
            return {
                "type": "recognition_error",
                "code": "FACE_NOT_DETECTED",
                "message": "Face features could not be extracted.",
                "bounding_boxes": faces,
                "latency_ms": round(latency, 2),
            }

        candidate_encoding = candidate_encodings[0]

        # Step 7: Compare against registered student encodings
        registered_students = list(
            StudentProfile.objects.filter(face_registered=True, user__is_active=True)
            .select_related('user', 'department')
        )

        if not registered_students:
            latency = (time.time() - start_time) * 1000
            return {
                "type": "recognition_error",
                "code": "UNKNOWN_FACE",
                "message": "No registered students in database.",
                "bounding_boxes": faces,
                "latency_ms": round(latency, 2),
            }

        known_encodings = []
        valid_students = []
        for student in registered_students:
            if student.face_encoding and len(student.face_encoding) == 128:
                known_encodings.append(np.array(student.face_encoding, dtype=np.float64))
                valid_students.append(student)

        if not known_encodings:
            latency = (time.time() - start_time) * 1000
            return {
                "type": "recognition_error",
                "code": "UNKNOWN_FACE",
                "message": "No registered facial templates found.",
                "bounding_boxes": faces,
                "latency_ms": round(latency, 2),
            }

        # Calculate distances
        distances = self.provider.compute_face_distance(known_encodings, candidate_encoding)
        best_match_idx = int(np.argmin(distances))
        best_distance = float(distances[best_match_idx])
        matched_student = valid_students[best_match_idx]

        confidence = self.provider.compute_confidence(best_distance, self.threshold)

        # Step 10: Apply threshold
        if best_distance > self.threshold:
            latency = (time.time() - start_time) * 1000
            RecognitionEvent.objects.create(
                camera=camera,
                student=None,
                status='UNKNOWN_FACE',
                confidence=round(confidence, 4),
                bounding_box=faces[0] if faces else {},
                latency_ms=round(latency, 2)
            )
            return {
                "type": "recognition_error",
                "code": "UNKNOWN_FACE",
                "message": "Face not recognized. Student identity could not be verified.",
                "confidence": round(confidence, 2),
                "bounding_boxes": faces,
                "latency_ms": round(latency, 2),
            }

        # Step 11: Check duplicate attendance protection
        existing_attendance = Attendance.objects.filter(
            student=matched_student,
            date=today
        ).first()

        latency = (time.time() - start_time) * 1000

        if existing_attendance:
            # Check-out logic: if marked over 10 minutes ago and no check-out time is set, record check-out
            current_time = now.time()
            check_in_dt = datetime.combine(today, existing_attendance.check_in_time)
            time_diff = (now - timezone.make_aware(check_in_dt) if timezone.is_aware(now) else now - check_in_dt).total_seconds()

            checkout_updated = False
            if time_diff > 600 and not existing_attendance.check_out_time:
                existing_attendance.check_out_time = current_time
                existing_attendance.save(update_fields=['check_out_time', 'updated_at'])
                checkout_updated = True

            RecognitionEvent.objects.create(
                camera=camera,
                student=matched_student,
                status='CHECK_OUT' if checkout_updated else 'ALREADY_MARKED',
                confidence=round(confidence, 4),
                bounding_box=faces[0] if faces else {},
                latency_ms=round(latency, 2)
            )

            msg = "Check-out recorded successfully" if checkout_updated else "Attendance already marked for today"

            return {
                "type": "recognition_result",
                "recognized": True,
                "student_id": matched_student.student_id,
                "student_pk": matched_student.id,
                "student_name": matched_student.user.full_name,
                "department": matched_student.department.name,
                "confidence": round(confidence, 2),
                "attendance_marked": False,
                "already_marked": True,
                "check_out_updated": checkout_updated,
                "check_in_time": existing_attendance.check_in_time.strftime("%H:%M:%S"),
                "check_out_time": existing_attendance.check_out_time.strftime("%H:%M:%S") if existing_attendance.check_out_time else None,
                "status": existing_attendance.status,
                "timestamp": now.isoformat(),
                "message": msg,
                "bounding_boxes": faces,
                "latency_ms": round(latency, 2),
                "is_development_mode": self.provider.is_development_mode(),
            }

        # Step 12: Mark attendance
        # If check-in is after 9:30 AM, label as LATE, otherwise PRESENT
        cutoff_late = now.replace(hour=9, minute=30, second=0, microsecond=0).time()
        attendance_status = AttendanceStatus.LATE if now.time() > cutoff_late else AttendanceStatus.PRESENT

        attendance_record = Attendance.objects.create(
            student=matched_student,
            date=today,
            check_in_time=now.time(),
            status=attendance_status,
            recognition_confidence=round(confidence, 4),
            camera=camera,
            session=session
        )

        # Step 14: Audit log & recognition event
        log_audit_event(
            action=AuditAction.ATTENDANCE_MARK,
            entity_type='ATTENDANCE',
            entity_id=attendance_record.id,
            metadata={
                'student_id': matched_student.student_id,
                'status': attendance_status,
                'confidence': round(confidence, 4),
                'camera': camera.name if camera else 'Webcam'
            }
        )

        RecognitionEvent.objects.create(
            camera=camera,
            student=matched_student,
            status='ATTENDANCE_MARKED',
            confidence=round(confidence, 4),
            bounding_box=faces[0] if faces else {},
            latency_ms=round(latency, 2)
        )

        return {
            "type": "recognition_result",
            "recognized": True,
            "student_id": matched_student.student_id,
            "student_pk": matched_student.id,
            "student_name": matched_student.user.full_name,
            "department": matched_student.department.name,
            "confidence": round(confidence, 2),
            "attendance_marked": True,
            "already_marked": False,
            "status": attendance_status,
            "check_in_time": attendance_record.check_in_time.strftime("%H:%M:%S"),
            "timestamp": now.isoformat(),
            "message": f"Attendance marked as {attendance_status}",
            "bounding_boxes": faces,
            "latency_ms": round(latency, 2),
            "is_development_mode": self.provider.is_development_mode(),
        }

    def register_face_from_frames(self, student: StudentProfile, frames: List[str]) -> Dict[str, Any]:
        """
        Registers face encodings for a student from multiple captured frames.
        Computes a stable average 128-d vector.
        """
        encodings = []
        valid_frames = 0

        for frame in frames:
            try:
                img_rgb = self.decode_base64_image(frame)
                faces = self.provider.detect_faces(img_rgb)
                if len(faces) == 1:
                    enc = self.provider.extract_encodings(img_rgb, faces)
                    if enc:
                        encodings.append(enc[0])
                        valid_frames += 1
            except Exception as e:
                logger.warning(f"Failed to process capture frame: {e}")

        if not encodings:
            return {
                "success": False,
                "message": "No clear face could be detected in the captured frames. Please ensure proper lighting and look directly at the camera."
            }

        # Average the vectors to form a robust facial signature
        avg_encoding = np.mean(encodings, axis=0)
        norm = np.linalg.norm(avg_encoding)
        if norm > 0:
            avg_encoding = avg_encoding / norm

        student.face_encoding = avg_encoding.tolist()
        student.face_registered = True
        student.save(update_fields=['face_encoding', 'face_registered', 'updated_at'])

        log_audit_event(
            action=AuditAction.FACE_REGISTER,
            entity_type='STUDENT_FACE',
            entity_id=student.student_id,
            metadata={'samples_count': valid_frames}
        )

        return {
            "success": True,
            "message": f"Face registration completed successfully with {valid_frames} quality samples.",
            "samples_processed": valid_frames
        }
