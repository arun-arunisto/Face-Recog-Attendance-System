import base64
from django.core.files.base import ContentFile
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.accounts.permissions import IsAdminUserRole, IsOwnerOrAdmin
from apps.accounts.models import UserRole
from apps.audit.services import log_audit_event
from apps.audit.models import AuditAction
from apps.recognition.services import RecognitionPipelineService
from .models import StudentProfile, ClassSection
from .serializers import (
    StudentProfileSerializer,
    StudentCreateSerializer,
    FaceRegisterPayloadSerializer,
)

class StudentViewSet(viewsets.ModelViewSet):
    """
    Comprehensive Student Management ViewSet.
    Authoritative role filtering: Students can only view their own profile.
    """
    queryset = StudentProfile.objects.all().select_related('user', 'department').prefetch_related('attendances')
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['student_id', 'user__full_name', 'user__email', 'department__name', 'class_name']
    ordering_fields = ['student_id', 'user__full_name', 'created_at']
    ordering = ['student_id']

    def get_permissions(self):
        if self.action in ['create', 'destroy']:
            return [IsAdminUserRole()]
        if self.action in ['face_register', 'face_delete']:
            return [IsAdminUserRole()]
        return [IsAuthenticated(), IsOwnerOrAdmin()]

    def get_serializer_class(self):
        if self.action == 'create':
            return StudentCreateSerializer
        return StudentProfileSerializer

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()

        # Strict security isolation: student can only query themselves
        if user.role == UserRole.STUDENT and not (user.is_staff or user.is_superuser):
            return qs.filter(user=user)

        # Admin filters
        department_id = self.request.query_params.get('department')
        face_registered = self.request.query_params.get('face_registered')
        class_name = self.request.query_params.get('class_name')
        section = self.request.query_params.get('section')
        is_active = self.request.query_params.get('is_active')

        if department_id:
            qs = qs.filter(department_id=department_id)
        if face_registered is not None:
            val = face_registered.lower() in ('true', '1')
            qs = qs.filter(face_registered=val)
        if class_name:
            qs = qs.filter(class_name=class_name)
        if section:
            qs = qs.filter(section=section)
        if is_active is not None:
            val = is_active.lower() in ('true', '1')
            qs = qs.filter(user__is_active=val)

        return qs

    def perform_create(self, serializer):
        profile = serializer.save()
        log_audit_event(
            action=AuditAction.STUDENT_CREATE,
            entity_type='STUDENT',
            entity_id=profile.student_id,
            metadata={'name': profile.user.full_name, 'email': profile.user.email},
            request=self.request
        )

    def perform_update(self, serializer):
        # Update user fields if provided
        user_data = {}
        if 'full_name' in self.request.data:
            user_data['full_name'] = self.request.data['full_name']
        if 'is_active' in self.request.data:
            user_data['is_active'] = self.request.data['is_active']
        
        instance = self.get_object()
        if user_data:
            for k, v in user_data.items():
                setattr(instance.user, k, v)
            instance.user.save()

        profile = serializer.save()
        log_audit_event(
            action=AuditAction.STUDENT_UPDATE,
            entity_type='STUDENT',
            entity_id=profile.student_id,
            metadata={'name': profile.user.full_name},
            request=self.request
        )

    def perform_destroy(self, instance):
        student_id = instance.student_id
        student_name = instance.user.full_name
        user = instance.user
        instance.delete()
        user.delete()
        log_audit_event(
            action=AuditAction.STUDENT_DELETE,
            entity_type='STUDENT',
            entity_id=student_id,
            metadata={'name': student_name},
            request=self.request
        )

    @action(detail=True, methods=['post'], url_path='face/register')
    def face_register(self, request, pk=None):
        """
        Processes captured frames from webcam, averages embeddings, and updates profile.
        """
        student = self.get_object()
        serializer = FaceRegisterPayloadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        frames = serializer.validated_data['frames']
        profile_photo_b64 = serializer.validated_data.get('profile_photo')

        pipeline = RecognitionPipelineService()
        result = pipeline.register_face_from_frames(student, frames)

        if not result['success']:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)

        # Save profile photo if provided
        if profile_photo_b64 and ',' in profile_photo_b64:
            try:
                format_info, imgstr = profile_photo_b64.split(';base64,')
                ext = format_info.split('/')[-1]
                data = ContentFile(base64.b64decode(imgstr), name=f"{student.student_id}_profile.{ext}")
                student.profile_photo = data
                student.save(update_fields=['profile_photo'])
            except Exception as e:
                pass

        return Response({
            "message": "Face registration completed successfully.",
            "samples_processed": result.get('samples_processed', len(frames)),
            "face_registered": True
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='face/verify')
    def face_verify(self, request, pk=None):
        """
        Verifies a single test frame against this specific student.
        """
        student = self.get_object()
        if not student.face_registered or not student.face_encoding:
            return Response({"error": "Student has not registered face data yet."}, status=status.HTTP_400_BAD_REQUEST)

        image_b64 = request.data.get('image')
        if not image_b64:
            return Response({"error": "Missing image payload"}, status=status.HTTP_400_BAD_REQUEST)

        pipeline = RecognitionPipelineService()
        try:
            img_rgb = pipeline.decode_base64_image(image_b64)
            faces = pipeline.provider.detect_faces(img_rgb)
            if not faces:
                return Response({"match": False, "message": "No face detected in test frame."}, status=status.HTTP_200_OK)

            encodings = pipeline.provider.extract_encodings(img_rgb, faces)
            if not encodings:
                return Response({"match": False, "message": "Could not extract facial features."}, status=status.HTTP_200_OK)

            candidate = encodings[0]
            known = [student.face_encoding]
            dist = float(pipeline.provider.compute_face_distance(known, candidate)[0])
            confidence = pipeline.provider.compute_confidence(dist, pipeline.threshold)
            match = dist <= pipeline.threshold

            return Response({
                "match": match,
                "confidence": round(confidence, 2),
                "distance": round(dist, 4),
                "threshold": pipeline.threshold,
                "message": "Match verified" if match else "Face does not match registered biometric template"
            })
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['delete'], url_path='face')
    def face_delete(self, request, pk=None):
        """
        Deletes stored face encoding for a student.
        """
        student = self.get_object()
        student.face_encoding = []
        student.face_registered = False
        student.save(update_fields=['face_encoding', 'face_registered', 'updated_at'])

        log_audit_event(
            action=AuditAction.FACE_DELETE,
            entity_type='STUDENT_FACE',
            entity_id=student.student_id,
            request=request
        )

        return Response({"message": "Face registration deleted successfully."}, status=status.HTTP_200_OK)
