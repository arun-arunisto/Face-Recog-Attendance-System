from rest_framework import viewsets, status
from rest_framework.response import Response
from apps.accounts.permissions import IsAdminUserRole
from apps.audit.services import log_audit_event
from apps.audit.models import AuditAction
from .models import Camera
from .serializers import CameraSerializer

class CameraViewSet(viewsets.ModelViewSet):
    queryset = Camera.objects.all()
    serializer_class = CameraSerializer
    permission_classes = [IsAdminUserRole]

    def perform_create(self, serializer):
        camera = serializer.save()
        log_audit_event(
            action=AuditAction.CAMERA_CREATE,
            entity_type='CAMERA',
            entity_id=camera.id,
            metadata={'name': camera.name, 'location': camera.location},
            request=self.request
        )

    def perform_update(self, serializer):
        camera = serializer.save()
        log_audit_event(
            action=AuditAction.CAMERA_UPDATE,
            entity_type='CAMERA',
            entity_id=camera.id,
            metadata={'name': camera.name, 'status': camera.status},
            request=self.request
        )

    def perform_destroy(self, instance):
        camera_id = instance.id
        camera_name = instance.name
        instance.delete()
        log_audit_event(
            action=AuditAction.CAMERA_DELETE,
            entity_type='CAMERA',
            entity_id=camera_id,
            metadata={'name': camera_name},
            request=self.request
        )
