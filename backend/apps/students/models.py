from django.db import models
from django.conf import settings
from apps.accounts.models import Department

class ClassSection(models.Model):
    name = models.CharField(max_length=60) # e.g. "CS-3A"
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='sections')
    academic_year = models.CharField(max_length=20, default='2025-2026')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']
        unique_together = ('name', 'department', 'academic_year')

    def __str__(self):
        return f"{self.name} - {self.department.code}"


class StudentProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='student_profile'
    )
    student_id = models.CharField(max_length=50, unique=True, db_index=True)
    department = models.ForeignKey(
        Department,
        on_delete=models.PROTECT,
        related_name='students'
    )
    class_name = models.CharField(max_length=60, default='Computer Science')
    section = models.CharField(max_length=20, default='A')
    profile_photo = models.ImageField(upload_to='profiles/', null=True, blank=True)
    face_encoding = models.JSONField(default=list, blank=True, help_text="128-dimensional facial embedding vector")
    face_registered = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['student_id']
        indexes = [
            models.Index(fields=['student_id']),
            models.Index(fields=['department']),
            models.Index(fields=['face_registered']),
        ]

    def __str__(self):
        return f"{self.student_id} - {self.user.full_name}"

    @property
    def full_name(self):
        return self.user.full_name

    @property
    def email(self):
        return self.user.email

    @property
    def is_active(self):
        return self.user.is_active
