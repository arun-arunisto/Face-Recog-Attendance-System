from rest_framework import serializers
from apps.students.models import StudentProfile
from apps.cameras.models import Camera
from .models import Attendance, AttendanceStatus, AttendanceSession

class AttendanceSerializer(serializers.ModelSerializer):
    student_id = serializers.CharField(source='student.student_id', read_only=True)
    student_name = serializers.CharField(source='student.user.full_name', read_only=True)
    department = serializers.CharField(source='student.department.name', read_only=True)
    department_code = serializers.CharField(source='student.department.code', read_only=True)
    class_name = serializers.CharField(source='student.class_name', read_only=True)
    camera_name = serializers.CharField(source='camera.name', read_only=True, default='Manual')

    class Meta:
        model = Attendance
        fields = [
            'id', 'student', 'student_id', 'student_name',
            'department', 'department_code', 'class_name',
            'date', 'check_in_time', 'check_out_time',
            'status', 'recognition_confidence', 'camera', 'camera_name',
            'marked_manually', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class AttendanceMarkManualSerializer(serializers.Serializer):
    student_id = serializers.CharField(max_length=50)
    date = serializers.DateField()
    status = serializers.ChoiceField(choices=AttendanceStatus.choices, default=AttendanceStatus.PRESENT)
    check_in_time = serializers.TimeField(required=False, allow_null=True)
    check_out_time = serializers.TimeField(required=False, allow_null=True)
    notes = serializers.CharField(required=False, allow_blank=True, default='')


class AttendanceCalendarItemSerializer(serializers.Serializer):
    date = serializers.DateField()
    status = serializers.CharField()
    check_in = serializers.TimeField(allow_null=True)
    check_out = serializers.TimeField(allow_null=True)
    confidence = serializers.FloatField()
    camera = serializers.CharField(allow_null=True)
