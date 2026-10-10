from django.urls import path
from .views import AttendanceCSVReportView, AttendanceXLSXReportView

urlpatterns = [
    path('attendance.csv', AttendanceCSVReportView.as_view(), name='report_attendance_csv'),
    path('attendance.xlsx', AttendanceXLSXReportView.as_view(), name='report_attendance_xlsx'),
]
