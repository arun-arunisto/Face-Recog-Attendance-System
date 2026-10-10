from datetime import datetime, timedelta
from django.utils import timezone
from rest_framework import viewsets, status, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.accounts.permissions import IsAdminUserRole, IsOwnerOrAdmin
from apps.accounts.models import UserRole
from apps.students.models import StudentProfile
from apps.audit.services import log_audit_event
from apps.audit.models import AuditAction
from .models import Attendance, AttendanceStatus
from .serializers import (
    AttendanceSerializer,
    AttendanceMarkManualSerializer,
    AttendanceCalendarItemSerializer,
)

class AttendanceViewSet(viewsets.ModelViewSet):
    """
    CRUD ViewSet for Attendance.
    Strict ownership rule: Students can only view their own attendance records.
    """
    queryset = Attendance.objects.all().select_related('student__user', 'student__department', 'camera')
    serializer_class = AttendanceSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['student__student_id', 'student__user__full_name', 'notes']
    ordering_fields = ['date', 'check_in_time', 'status', 'created_at']
    ordering = ['-date', '-check_in_time']

    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            return [IsAdminUserRole()]
        return [IsAuthenticated(), IsOwnerOrAdmin()]

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()

        # Strict security: students can only see their own attendance
        if user.role == UserRole.STUDENT and not (user.is_staff or user.is_superuser):
            return qs.filter(student__user=user)

        # Filters for Admin
        date = self.request.query_params.get('date')
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        department = self.request.query_params.get('department')
        class_name = self.request.query_params.get('class_name')
        attendance_status = self.request.query_params.get('status')
        camera_id = self.request.query_params.get('camera')
        student_id = self.request.query_params.get('student_id')

        if date:
            qs = qs.filter(date=date)
        if start_date:
            qs = qs.filter(date__gte=start_date)
        if end_date:
            qs = qs.filter(date__lte=end_date)
        if department:
            qs = qs.filter(student__department_id=department)
        if class_name:
            qs = qs.filter(student__class_name=class_name)
        if attendance_status:
            qs = qs.filter(status=attendance_status)
        if camera_id:
            qs = qs.filter(camera_id=camera_id)
        if student_id:
            qs = qs.filter(student__student_id=student_id)

        return qs

    def perform_update(self, serializer):
        instance = serializer.save(marked_manually=True)
        log_audit_event(
            action=AuditAction.ATTENDANCE_UPDATE,
            entity_type='ATTENDANCE',
            entity_id=instance.id,
            metadata={
                'student_id': instance.student.student_id,
                'status': instance.status,
                'date': str(instance.date)
            },
            request=self.request
        )


class TodayAttendanceView(APIView):
    """
    Overview of today's attendance metrics and live recognized stream.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = timezone.now().date()
        total_students = StudentProfile.objects.filter(user__is_active=True).count()

        today_records = Attendance.objects.filter(date=today).select_related('student__user', 'student__department', 'camera')
        present_count = today_records.filter(status=AttendanceStatus.PRESENT).count()
        late_count = today_records.filter(status=AttendanceStatus.LATE).count()
        total_marked = present_count + late_count
        absent_count = max(0, total_students - total_marked)
        percentage = round((total_marked / total_students * 100), 1) if total_students > 0 else 0.0

        # Feed of the latest 20 today attendance entries
        recent_feed = AttendanceSerializer(today_records.order_by('-check_in_time')[:20], many=True).data

        return Response({
            "date": str(today),
            "total_students": total_students,
            "present_today": present_count,
            "late_today": late_count,
            "absent_today": absent_count,
            "total_marked": total_marked,
            "attendance_percentage": percentage,
            "recent_feed": recent_feed
        })


class MarkAttendanceManualView(APIView):
    """
    Manually mark attendance by Admin.
    """
    permission_classes = [IsAdminUserRole]

    def post(self, request):
        serializer = AttendanceMarkManualSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        student = StudentProfile.objects.filter(student_id=data['student_id']).first()
        if not student:
            return Response({"error": "Student ID not found."}, status=status.HTTP_404_NOT_FOUND)

        target_date = data['date']
        attendance, created = Attendance.objects.update_or_create(
            student=student,
            date=target_date,
            defaults={
                'status': data['status'],
                'check_in_time': data.get('check_in_time') or timezone.now().time(),
                'check_out_time': data.get('check_out_time'),
                'marked_manually': True,
                'notes': data.get('notes', ''),
                'recognition_confidence': 1.0
            }
        )

        log_audit_event(
            action=AuditAction.ATTENDANCE_MARK if created else AuditAction.ATTENDANCE_UPDATE,
            entity_type='ATTENDANCE',
            entity_id=attendance.id,
            metadata={'student_id': student.student_id, 'manual': True, 'status': data['status']},
            request=request
        )

        return Response(AttendanceSerializer(attendance).data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class CalendarAttendanceView(APIView):
    """
    Monthly calendar attendance records.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        target_student_id = request.query_params.get('student_id')

        # Role validation
        if user.role == UserRole.STUDENT and not (user.is_staff or user.is_superuser):
            student = getattr(user, 'student_profile', None)
            if not student:
                return Response({"error": "Student profile not found"}, status=status.HTTP_404_NOT_FOUND)
        else:
            # Admin can specify student_id or default to overall
            if target_student_id:
                student = StudentProfile.objects.filter(student_id=target_student_id).first()
                if not student:
                    return Response({"error": "Student not found"}, status=status.HTTP_404_NOT_FOUND)
            else:
                student = None

        month_str = request.query_params.get('month') # YYYY-MM
        if month_str:
            try:
                year, month = map(int, month_str.split('-'))
            except ValueError:
                year, month = timezone.now().year, timezone.now().month
        else:
            year, month = timezone.now().year, timezone.now().month

        qs = Attendance.objects.filter(date__year=year, date__month=month)
        if student:
            qs = qs.filter(student=student)

        results = []
        for att in qs.select_related('camera'):
            results.append({
                "date": str(att.date),
                "status": att.status,
                "check_in": att.check_in_time.strftime("%H:%M:%S") if att.check_in_time else None,
                "check_out": att.check_out_time.strftime("%H:%M:%S") if att.check_out_time else None,
                "confidence": att.recognition_confidence,
                "camera": att.camera.name if att.camera else "Manual",
                "notes": att.notes,
            })

        return Response({
            "year": year,
            "month": month,
            "student_id": student.student_id if student else None,
            "student_name": student.user.full_name if student else None,
            "records": results
        })


class StudentAttendanceHistoryView(APIView):
    """
    List attendance history for a single student.
    Strict security: Students can NEVER access another student's data.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, student_id):
        user = request.user
        student = StudentProfile.objects.filter(student_id=student_id).select_related('user', 'department').first()
        if not student:
            return Response({"error": "Student not found"}, status=status.HTTP_404_NOT_FOUND)

        # Strict security ownership enforcement
        if user.role == UserRole.STUDENT and not (user.is_staff or user.is_superuser):
            if not hasattr(user, 'student_profile') or user.student_profile.id != student.id:
                return Response(
                    {"error": "Forbidden: You cannot access another student's attendance records."},
                    status=status.HTTP_403_FORBIDDEN
                )

        attendances = Attendance.objects.filter(student=student).select_related('camera').order_by('-date')
        serializer = AttendanceSerializer(attendances, many=True)

        total_days = attendances.count()
        present_days = attendances.filter(status=AttendanceStatus.PRESENT).count()
        late_days = attendances.filter(status=AttendanceStatus.LATE).count()
        absent_days = attendances.filter(status=AttendanceStatus.ABSENT).count()
        rate = round(((present_days + late_days) / total_days * 100), 1) if total_days > 0 else 100.0

        return Response({
            "student": {
                "student_id": student.student_id,
                "full_name": student.user.full_name,
                "department": student.department.name,
                "class_name": student.class_name,
                "face_registered": student.face_registered,
            },
            "summary": {
                "total_days": total_days,
                "present_days": present_days,
                "late_days": late_days,
                "absent_days": absent_days,
                "attendance_percentage": rate,
            },
            "attendances": serializer.data
        })
