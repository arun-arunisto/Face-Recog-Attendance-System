from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from apps.accounts.permissions import IsAdminUserRole
from apps.attendance.models import Attendance
from apps.audit.services import log_audit_event
from apps.audit.models import AuditAction
from .services import build_attendance_csv_response, build_attendance_xlsx_response

def get_filtered_attendance_qs(params):
    qs = Attendance.objects.all().select_related('student__user', 'student__department', 'camera')
    start_date = params.get('start_date')
    end_date = params.get('end_date')
    department = params.get('department')
    class_name = params.get('class_name')
    section = params.get('section')
    student_id = params.get('student_id')
    status_filter = params.get('status')

    if start_date:
        qs = qs.filter(date__gte=start_date)
    if end_date:
        qs = qs.filter(date__lte=end_date)
    if department:
        qs = qs.filter(student__department_id=department)
    if class_name:
        qs = qs.filter(student__class_name=class_name)
    if section:
        qs = qs.filter(student__section=section)
    if student_id:
        qs = qs.filter(student__student_id=student_id)
    if status_filter:
        qs = qs.filter(status=status_filter)

    return qs.order_by('-date', 'student__student_id')


class AttendanceCSVReportView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        qs = get_filtered_attendance_qs(request.query_params)
        timestamp_str = timezone.now().strftime("%Y%m%d_%H%M%S")
        filename = f"attendance_report_{timestamp_str}.csv"

        log_audit_event(
            action=AuditAction.REPORT_EXPORT,
            entity_type='REPORT_CSV',
            metadata={'filters': dict(request.query_params), 'count': qs.count()},
            request=request
        )

        return build_attendance_csv_response(qs, filename=filename)


class AttendanceXLSXReportView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        qs = get_filtered_attendance_qs(request.query_params)
        timestamp_str = timezone.now().strftime("%Y%m%d_%H%M%S")
        filename = f"attendance_report_{timestamp_str}.xlsx"

        log_audit_event(
            action=AuditAction.REPORT_EXPORT,
            entity_type='REPORT_XLSX',
            metadata={'filters': dict(request.query_params), 'count': qs.count()},
            request=request
        )

        return build_attendance_xlsx_response(qs, filename=filename)
