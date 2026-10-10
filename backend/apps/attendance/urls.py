from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AttendanceViewSet,
    TodayAttendanceView,
    MarkAttendanceManualView,
    CalendarAttendanceView,
    StudentAttendanceHistoryView,
)

router = DefaultRouter()
router.register(r'', AttendanceViewSet, basename='attendance')

urlpatterns = [
    path('today/', TodayAttendanceView.as_view(), name='attendance_today'),
    path('mark/', MarkAttendanceManualView.as_view(), name='attendance_mark_manual'),
    path('calendar/', CalendarAttendanceView.as_view(), name='attendance_calendar'),
    path('student/<str:student_id>/', StudentAttendanceHistoryView.as_view(), name='student_attendance_history'),
    path('', include(router.urls)),
]
