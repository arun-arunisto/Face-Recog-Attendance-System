import pytest
from datetime import date, time
from rest_framework.test import APIClient
from django.urls import reverse
from apps.students.models import StudentProfile
from apps.attendance.models import Attendance, AttendanceStatus

@pytest.mark.django_db
class TestAttendanceEngine:
    def setup_method(self):
        self.client = APIClient()
        res = self.client.post(reverse('token_obtain_pair'), {
            'email': 'admin@example.com',
            'password': 'Admin@123456'
        })
        self.token = res.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')

    def test_get_today_attendance_summary(self):
        url = reverse('attendance_today')
        response = self.client.get(url)
        assert response.status_code == 200
        assert 'total_students' in response.data
        assert 'present_today' in response.data
        assert 'attendance_percentage' in response.data
        assert response.data['total_students'] == 12

    def test_manual_mark_attendance(self):
        student = StudentProfile.objects.first()
        test_date = date(2026, 8, 15)
        url = reverse('attendance_mark_manual')
        response = self.client.post(url, {
            'student_id': student.student_id,
            'date': str(test_date),
            'status': 'PRESENT',
            'notes': 'Verified manually by Dean'
        }, format='json')
        assert response.status_code in [200, 201]

        # Duplicate check: marking again updates record instead of inserting duplicate
        response2 = self.client.post(url, {
            'student_id': student.student_id,
            'date': str(test_date),
            'status': 'LATE',
            'notes': 'Updated status'
        }, format='json')
        assert response2.status_code in [200, 201]
        assert Attendance.objects.filter(student=student, date=test_date).count() == 1
