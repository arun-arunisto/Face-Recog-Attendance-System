import pytest
from rest_framework.test import APIClient
from django.urls import reverse
from apps.accounts.models import User, UserRole

@pytest.mark.django_db
class TestAuthentication:
    def setup_method(self):
        self.client = APIClient()

    def test_admin_login_success(self):
        login_url = reverse('token_obtain_pair')
        response = self.client.post(login_url, {
            'email': 'admin@example.com',
            'password': 'Admin@123456'
        }, format='json')
        assert response.status_code == 200
        assert 'access' in response.data
        assert 'refresh' in response.data
        assert response.data['user']['role'] == 'ADMIN'
        assert response.data['user']['email'] == 'admin@example.com'

    def test_student_login_success(self):
        login_url = reverse('token_obtain_pair')
        response = self.client.post(login_url, {
            'email': 'arun.kumar@example.com',
            'password': 'Student@123456'
        }, format='json')
        assert response.status_code == 200
        assert response.data['user']['role'] == 'STUDENT'
        assert response.data['user']['student_profile'] is not None
        assert response.data['user']['student_profile']['student_id'] == 'STU-2026-001'

    def test_login_invalid_password(self):
        login_url = reverse('token_obtain_pair')
        response = self.client.post(login_url, {
            'email': 'admin@example.com',
            'password': 'WrongPassword999'
        }, format='json')
        assert response.status_code == 401

    def test_auth_me_endpoint(self):
        # Obtain token
        login_res = self.client.post(reverse('token_obtain_pair'), {
            'email': 'admin@example.com',
            'password': 'Admin@123456'
        })
        token = login_res.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        me_res = self.client.get(reverse('auth_me'))
        assert me_res.status_code == 200
        assert me_res.data['email'] == 'admin@example.com'
        assert me_res.data['role'] == 'ADMIN'
