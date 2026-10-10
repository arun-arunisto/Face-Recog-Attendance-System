from django.db import models
from django.conf import settings

class AuditAction(models.TextChoices):
    LOGIN = 'LOGIN', 'User Login'
    LOGOUT = 'LOGOUT', 'User Logout'
    STUDENT_CREATE = 'STUDENT_CREATE', 'Student Created'
    STUDENT_UPDATE = 'STUDENT_UPDATE', 'Student Updated'
    STUDENT_DELETE = 'STUDENT_DELETE', 'Student Deleted'
    FACE_REGISTER = 'FACE_REGISTER', 'Face Registered'
    FACE_VERIFY = 'FACE_VERIFY', 'Face Verified'
    FACE_DELETE = 'FACE_DELETE', 'Face Deleted'
    ATTENDANCE_MARK = 'ATTENDANCE_MARK', 'Attendance Marked'
    ATTENDANCE_UPDATE = 'ATTENDANCE_UPDATE', 'Attendance Updated'
    REPORT_EXPORT = 'REPORT_EXPORT', 'Report Exported'
    CAMERA_CREATE = 'CAMERA_CREATE', 'Camera Created'
    CAMERA_UPDATE = 'CAMERA_UPDATE', 'Camera Updated'
    CAMERA_DELETE = 'CAMERA_DELETE', 'Camera Deleted'


class AuditLog(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='audit_logs'
    )
    action = models.CharField(max_length=50, choices=AuditAction.choices, db_index=True)
    entity_type = models.CharField(max_length=50, db_index=True)
    entity_id = models.CharField(max_length=100, blank=True, default='')
    metadata = models.JSONField(default=dict, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['action']),
            models.Index(fields=['entity_type']),
            models.Index(fields=['timestamp']),
        ]

    def __str__(self):
        user_str = self.user.email if self.user else "System"
        return f"[{self.timestamp.strftime('%Y-%m-%d %H:%M:%S')}] {user_str} - {self.action} on {self.entity_type} {self.entity_id}"
