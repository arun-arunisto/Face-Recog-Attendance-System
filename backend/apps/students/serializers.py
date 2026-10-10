from rest_framework import serializers
from django.db import transaction
from apps.accounts.models import User, UserRole, Department
from apps.accounts.serializers import DepartmentSerializer
from .models import StudentProfile, ClassSection

class StudentProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email')
    full_name = serializers.CharField(source='user.full_name')
    is_active = serializers.BooleanField(source='user.is_active', default=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    department_code = serializers.CharField(source='department.code', read_only=True)
    attendance_percentage = serializers.SerializerMethodField(read_only=True)
    today_status = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = StudentProfile
        fields = [
            'id', 'student_id', 'full_name', 'email', 'department',
            'department_name', 'department_code', 'class_name', 'section',
            'profile_photo', 'face_registered', 'is_active',
            'attendance_percentage', 'today_status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'face_registered', 'created_at', 'updated_at']

    def get_attendance_percentage(self, obj):
        attendances = obj.attendances.all()
        total = attendances.count()
        if total == 0:
            return 100.0
        present = attendances.filter(status__in=['PRESENT', 'LATE']).count()
        return round((present / total) * 100, 1)

    def get_today_status(self, obj):
        from django.utils import timezone
        today = timezone.now().date()
        today_record = obj.attendances.filter(date=today).first()
        if today_record:
            return {
                'status': today_record.status,
                'check_in_time': today_record.check_in_time.strftime('%H:%M:%S'),
                'check_out_time': today_record.check_out_time.strftime('%H:%M:%S') if today_record.check_out_time else None,
                'confidence': today_record.recognition_confidence
            }
        return {'status': 'NOT_MARKED'}


class StudentCreateSerializer(serializers.Serializer):
    student_id = serializers.CharField(max_length=50)
    full_name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, required=False, default='Student@123456')
    department_id = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(),
        source='department'
    )
    class_name = serializers.CharField(max_length=60, default='Computer Science')
    section = serializers.CharField(max_length=20, default='A')
    profile_photo = serializers.ImageField(required=False, allow_null=True)

    def validate_student_id(self, value):
        if StudentProfile.objects.filter(student_id=value).exists():
            raise serializers.ValidationError("Student with this ID already exists.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("User with this email already exists.")
        return value

    @transaction.atomic
    def create(self, validated_data):
        department = validated_data.pop('department')
        student_id = validated_data.pop('student_id')
        class_name = validated_data.pop('class_name')
        section = validated_data.pop('section')
        profile_photo = validated_data.pop('profile_photo', None)
        email = validated_data.pop('email')
        full_name = validated_data.pop('full_name')
        password = validated_data.pop('password', 'Student@123456')

        user = User.objects.create_user(
            username=email,
            email=email,
            full_name=full_name,
            role=UserRole.STUDENT,
            department=department
        )
        user.set_password(password)
        user.save()

        profile = StudentProfile.objects.create(
            user=user,
            student_id=student_id,
            department=department,
            class_name=class_name,
            section=section,
            profile_photo=profile_photo
        )
        return profile


class FaceRegisterPayloadSerializer(serializers.Serializer):
    frames = serializers.ListField(
        child=serializers.CharField(),
        min_length=1,
        help_text="List of base64 encoded image frames"
    )
    profile_photo = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text="Optional base64 profile photo to set on student profile"
    )
