from rest_framework import permissions
from .models import UserRole

class IsAdminUserRole(permissions.BasePermission):
    """
    Permission check for ADMIN role or Superuser.
    Authoritative backend check.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.role == UserRole.ADMIN or request.user.is_superuser or request.user.is_staff)
        )


class IsStudentUserRole(permissions.BasePermission):
    """
    Permission check for STUDENT role.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == UserRole.STUDENT
        )


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Ensures that a student can only view/modify their own records,
    while administrators have full access.
    """
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False

        if request.user.role == UserRole.ADMIN or request.user.is_superuser:
            return True

        # Check if obj is StudentProfile
        if hasattr(obj, 'user'):
            return obj.user == request.user

        # Check if obj is Attendance (has student attribute)
        if hasattr(obj, 'student') and hasattr(obj.student, 'user'):
            return obj.student.user == request.user

        return False
