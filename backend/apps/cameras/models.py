from django.db import models

class CameraStatus(models.TextChoices):
    ONLINE = 'ONLINE', 'Online'
    OFFLINE = 'OFFLINE', 'Offline'
    ERROR = 'ERROR', 'Error'


class CameraType(models.TextChoices):
    WEBCAM = 'WEBCAM', 'Browser Webcam'
    IP_CAMERA = 'IP_CAMERA', 'IP Camera'
    RTSP = 'RTSP', 'RTSP Stream'
    USB = 'USB', 'USB External Camera'


class Camera(models.Model):
    name = models.CharField(max_length=100)
    location = models.CharField(max_length=150, help_text="e.g. Main Entrance, CS Lab 1")
    camera_type = models.CharField(max_length=20, choices=CameraType.choices, default=CameraType.WEBCAM)
    status = models.CharField(max_length=20, choices=CameraStatus.choices, default=CameraStatus.ONLINE, db_index=True)
    stream_identifier = models.CharField(max_length=255, default='default', help_text="Webcam ID, RTSP URL, or index")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['is_active']),
        ]

    def __str__(self):
        return f"{self.name} ({self.location}) - [{self.status}]"
