from django.urls import path
from .views import (
    OverviewAnalyticsView,
    DailyAnalyticsView,
    WeeklyAnalyticsView,
    MonthlyAnalyticsView,
    DepartmentAnalyticsView,
    StudentSpecificAnalyticsView,
)

urlpatterns = [
    path('overview/', OverviewAnalyticsView.as_view(), name='analytics_overview'),
    path('daily/', DailyAnalyticsView.as_view(), name='analytics_daily'),
    path('weekly/', WeeklyAnalyticsView.as_view(), name='analytics_weekly'),
    path('monthly/', MonthlyAnalyticsView.as_view(), name='analytics_monthly'),
    path('departments/', DepartmentAnalyticsView.as_view(), name='analytics_departments'),
    path('student/<str:student_id>/', StudentSpecificAnalyticsView.as_view(), name='analytics_student'),
]
