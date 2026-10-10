import pytest
from rest_framework.test import APIClient
from django.urls import reverse
from apps.accounts.models import User
from apps.students.models import StudentProfile

@pytest.mark.django_db
class TestPermissionsAndIsolation:
    def setup_method(self):
        self.client = APIClient()

        # Admin client
        res = self.client.post(reverse('token_obtain_pair'), {
            'email': 'admin@example.com',
            'password': 'Admin@123456'
        })
        self.admin_token = res.data['access']

        # Student 1 client
        res = self.client.post(reverse('token_obtain_pair'), {
            'email': 'arun.kumar@example.com',
            'password': 'Student@123456'
        })
        self.student1_token = res.data['access']

    def test_student_cannot_view_other_students_attendance(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.student1_token}')
        # Arun Kumar tries to access Priya Sharma's (STU-2026-002) records
        url = reverse('student_attendance_history', kwargs={'student_id': 'STU-2026-002'})
        response = self.client.get(url)
        assert response.status_code == 403

    def test_student_can_view_own_attendance(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.student1_token}')
        url = reverse('student_attendance_history', kwargs={'student_id': 'STU-2026-001'})
        response = self.client.get(url)
        assert response.status_code == 200
        assert response.data['student']['student_id'] == 'STU-2026-001'

    def test_student_cannot_access_audit_logs(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.student1_token}')
        response = self.client.get('/api/audit-logs/')
        assert response.status_code == 403

    def test_admin_can_access_audit_logs(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.admin_token}')
        response = self.client.get('/api/audit-logs/')
        assert response.status_code == 200

    def test_student_cannot_create_students(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.student1_token}')
        response = self.client.post('/api/students/', {
            'student_id': 'HACK-001',
            'full_name': 'Hacker',
            'email': 'hacker@example.com'
        })
        assert response.status_code == 403
