from rest_framework import serializers
from .models import Camera, CameraStatus, CameraType

class CameraSerializer(serializers.ModelSerializer):
    today_attendance_count = serializers.SerializerMethodField(read_only=True)
    recent_event_count = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Camera
        fields = [
            'id', 'name', 'location', 'camera_type', 'status',
            'stream_identifier', 'is_active', 'today_attendance_count',
            'recent_event_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_today_attendance_count(self, obj):
        from django.utils import timezone
        today = timezone.now().date()
        return obj.attendances.filter(date=today).count()

    def get_recent_event_count(self, obj):
        # Recognition events through camera
        if hasattr(obj, 'recognition_events'):
            return obj.recognition_events.count()
        return 0
