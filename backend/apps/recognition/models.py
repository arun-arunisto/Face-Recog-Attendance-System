from django.db import models
from apps.cameras.models import Camera
from apps.students.models import StudentProfile

class RecognitionEvent(models.Model):
    camera = models.ForeignKey(
        Camera,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='recognition_events'
    )
    student = models.ForeignKey(
        StudentProfile,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='recognition_events'
    )
    status = models.CharField(max_length=50) # RECOGNIZED, UNKNOWN_FACE, ATTENDANCE_MARKED, ALREADY_MARKED, MULTIPLE_FACES
    confidence = models.FloatField(default=0.0)
    bounding_box = models.JSONField(default=dict, blank=True)
    latency_ms = models.FloatField(default=0.0)
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['timestamp']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        student_id = self.student.student_id if self.student else "Unknown"
        return f"{self.timestamp.strftime('%H:%M:%S')} - {self.status} [{student_id}] ({self.confidence:.2f})"
