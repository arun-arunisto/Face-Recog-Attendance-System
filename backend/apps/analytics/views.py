from datetime import timedelta
from django.utils import timezone
from django.db.models import Count, Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from apps.accounts.permissions import IsAdminUserRole
from apps.accounts.models import Department, UserRole
from apps.students.models import StudentProfile
from apps.attendance.models import Attendance, AttendanceStatus
from apps.cameras.models import Camera

class OverviewAnalyticsView(APIView):
    """
    High-level dashboard KPIs and trends.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = timezone.now().date()
        total_students = StudentProfile.objects.filter(user__is_active=True).count()
        registered_faces = StudentProfile.objects.filter(face_registered=True, user__is_active=True).count()
        active_cameras = Camera.objects.filter(status='ONLINE', is_active=True).count()

        today_records = Attendance.objects.filter(date=today)
        present_today = today_records.filter(status=AttendanceStatus.PRESENT).count()
        late_today = today_records.filter(status=AttendanceStatus.LATE).count()
        total_marked = present_today + late_today
        absent_today = max(0, total_students - total_marked)

        attendance_pct = round((total_marked / total_students * 100), 1) if total_students > 0 else 0.0

        # 30-day average attendance
        past_30_days = today - timedelta(days=30)
        past_records = Attendance.objects.filter(date__gte=past_30_days, date__lte=today)
        total_past_att = past_records.filter(status__in=[AttendanceStatus.PRESENT, AttendanceStatus.LATE]).count()
        expected_att = total_students * 30 if total_students > 0 else 1
        avg_30_days = round(min(100.0, (total_past_att / max(1, expected_att) * 100)), 1)

        return Response({
            "total_students": total_students,
            "registered_faces": registered_faces,
            "face_registration_pct": round((registered_faces / total_students * 100), 1) if total_students > 0 else 0.0,
            "present_today": present_today,
            "late_today": late_today,
            "absent_today": absent_today,
            "total_marked_today": total_marked,
            "today_attendance_percentage": attendance_pct,
            "average_30_days_percentage": avg_30_days,
            "active_cameras": active_cameras,
        })


class DailyAnalyticsView(APIView):
    """
    Daily attendance trend over the last 14 or 30 days.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        days = int(request.query_params.get('days', 14))
        days = min(60, max(7, days))
        today = timezone.now().date()
        total_students = StudentProfile.objects.filter(user__is_active=True).count()

        daily_data = []
        for i in range(days - 1, -1, -1):
            day_date = today - timedelta(days=i)
            # Skip weekends if desired or include all
            records = Attendance.objects.filter(date=day_date)
            present = records.filter(status=AttendanceStatus.PRESENT).count()
            late = records.filter(status=AttendanceStatus.LATE).count()
            marked = present + late
            absent = max(0, total_students - marked)
            pct = round((marked / total_students * 100), 1) if total_students > 0 else 0.0

            daily_data.append({
                "date": str(day_date),
                "day_name": day_date.strftime("%a"),
                "present": present,
                "late": late,
                "absent": absent,
                "total": total_students,
                "percentage": pct
            })

        return Response(daily_data)


class WeeklyAnalyticsView(APIView):
    """
    Weekly attendance metrics over the past 8 weeks.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = timezone.now().date()
        total_students = StudentProfile.objects.filter(user__is_active=True).count()
        weeks_data = []

        for i in range(7, -1, -1):
            start_week = today - timedelta(weeks=i+1)
            end_week = today - timedelta(weeks=i)
            records = Attendance.objects.filter(date__gt=start_week, date__lte=end_week)
            present = records.filter(status=AttendanceStatus.PRESENT).count()
            late = records.filter(status=AttendanceStatus.LATE).count()
            total_expected = total_students * 5 # Assuming 5 school days
            pct = round(((present + late) / max(1, total_expected) * 100), 1)

            weeks_data.append({
                "week_label": f"Wk {end_week.strftime('%U')}",
                "start_date": str(start_week),
                "end_date": str(end_week),
                "present": present,
                "late": late,
                "percentage": min(100.0, pct)
            })

        return Response(weeks_data)


class MonthlyAnalyticsView(APIView):
    """
    Monthly attendance trends.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = timezone.now().date()
        months_data = []

        for i in range(5, -1, -1):
            # approximate 30-day blocks
            m_date = today - timedelta(days=i * 30)
            year, month = m_date.year, m_date.month
            records = Attendance.objects.filter(date__year=year, date__month=month)
            present = records.filter(status=AttendanceStatus.PRESENT).count()
            late = records.filter(status=AttendanceStatus.LATE).count()
            absent = records.filter(status=AttendanceStatus.ABSENT).count()

            months_data.append({
                "month_name": m_date.strftime("%b %Y"),
                "present": present,
                "late": late,
                "absent": absent,
                "total_records": records.count()
            })

        return Response(months_data)


class DepartmentAnalyticsView(APIView):
    """
    Attendance breakdown by academic department.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        departments = Department.objects.all().prefetch_related('students__attendances')
        today = timezone.now().date()

        result = []
        for dept in departments:
            student_count = dept.students.filter(user__is_active=True).count()
            today_present = Attendance.objects.filter(
                student__department=dept,
                date=today,
                status__in=[AttendanceStatus.PRESENT, AttendanceStatus.LATE]
            ).count()

            total_records = Attendance.objects.filter(student__department=dept).count()
            present_records = Attendance.objects.filter(
                student__department=dept,
                status__in=[AttendanceStatus.PRESENT, AttendanceStatus.LATE]
            ).count()

            overall_rate = round((present_records / max(1, total_records) * 100), 1) if total_records > 0 else 100.0
            today_rate = round((today_present / max(1, student_count) * 100), 1) if student_count > 0 else 0.0

            result.append({
                "id": dept.id,
                "name": dept.name,
                "code": dept.code,
                "student_count": student_count,
                "today_present": today_present,
                "today_rate": today_rate,
                "overall_rate": overall_rate,
            })

        return Response(result)


class StudentSpecificAnalyticsView(APIView):
    """
    Individual student attendance analytics.
    Strict security: Students can only view their own analytics.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, student_id):
        user = request.user
        student = StudentProfile.objects.filter(student_id=student_id).select_related('user', 'department').first()
        if not student:
            return Response({"error": "Student not found"}, status=status.HTTP_404_NOT_FOUND)

        if user.role == UserRole.STUDENT and not (user.is_staff or user.is_superuser):
            if not hasattr(user, 'student_profile') or user.student_profile.id != student.id:
                return Response({"error": "Forbidden: You cannot access another student's analytics."}, status=status.HTTP_403_FORBIDDEN)

        attendances = Attendance.objects.filter(student=student)
        total_days = attendances.count()
        present_count = attendances.filter(status=AttendanceStatus.PRESENT).count()
        late_count = attendances.filter(status=AttendanceStatus.LATE).count()
        absent_count = attendances.filter(status=AttendanceStatus.ABSENT).count()

        percentage = round(((present_count + late_count) / max(1, total_days) * 100), 1) if total_days > 0 else 100.0

        # Last 14 days log
        today = timezone.now().date()
        recent_trend = []
        for i in range(13, -1, -1):
            d = today - timedelta(days=i)
            rec = attendances.filter(date=d).first()
            recent_trend.append({
                "date": str(d),
                "day": d.strftime("%a"),
                "status": rec.status if rec else "NO_CLASS",
                "check_in": rec.check_in_time.strftime("%H:%M:%S") if rec and rec.check_in_time else None
            })

        return Response({
            "student_id": student.student_id,
            "full_name": student.user.full_name,
            "department": student.department.name,
            "class_name": student.class_name,
            "total_classes": total_days,
            "present_count": present_count,
            "late_count": late_count,
            "absent_count": absent_count,
            "attendance_percentage": percentage,
            "recent_trend": recent_trend
        })
