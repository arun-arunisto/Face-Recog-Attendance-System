from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User, Department, UserRole

class DepartmentSerializer(serializers.ModelSerializer):
    student_count = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Department
        fields = ['id', 'name', 'code', 'description', 'student_count', 'created_at']

    def get_student_count(self, obj):
        return getattr(obj, 'students_count', 0) or obj.students.count() if hasattr(obj, 'students') else 0


class UserSummarySerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True, default='')

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'full_name', 'role', 'department', 'department_name', 'is_active']


class UserSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True, default='')
    student_profile = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'full_name', 'role',
            'department', 'department_name', 'student_profile',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_student_profile(self, obj):
        if hasattr(obj, 'student_profile'):
            profile = obj.student_profile
            return {
                'id': profile.id,
                'student_id': profile.student_id,
                'class_name': profile.class_name,
                'section': profile.section,
                'face_registered': profile.face_registered,
                'profile_photo': profile.profile_photo.url if profile.profile_photo else None,
            }
        return None


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Enhanced JWT token serializer returning rich user payload.
    """
    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user

        student_info = None
        if hasattr(user, 'student_profile'):
            student_info = {
                'id': user.student_profile.id,
                'student_id': user.student_profile.student_id,
                'class_name': user.student_profile.class_name,
                'section': user.student_profile.section,
                'face_registered': user.student_profile.face_registered,
            }

        data['user'] = {
            'id': user.id,
            'email': user.email,
            'username': user.username,
            'full_name': user.full_name,
            'role': user.role,
            'department': user.department.name if user.department else None,
            'department_id': user.department.id if user.department else None,
            'student_profile': student_info,
        }
        return data

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['email'] = user.email
        token['role'] = user.role
        token['full_name'] = user.full_name
        if hasattr(user, 'student_profile'):
            token['student_id'] = user.student_profile.student_id
            token['profile_id'] = user.student_profile.id
        return token
