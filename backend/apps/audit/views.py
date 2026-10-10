from rest_framework import viewsets, filters
from apps.accounts.permissions import IsAdminUserRole
from .models import AuditLog
from .serializers import AuditLogSerializer

class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    List and retrieve audit logs. Admin only.
    """
    queryset = AuditLog.objects.all().select_related('user')
    serializer_class = AuditLogSerializer
    permission_classes = [IsAdminUserRole]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['action', 'entity_type', 'entity_id', 'user__email', 'user__full_name', 'ip_address']
    ordering_fields = ['timestamp', 'action', 'entity_type']
    ordering = ['-timestamp']

    def get_queryset(self):
        qs = super().get_queryset()
        action = self.request.query_params.get('action')
        entity_type = self.request.query_params.get('entity_type')
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')

        if action:
            qs = qs.filter(action=action)
        if entity_type:
            qs = qs.filter(entity_type=entity_type)
        if start_date:
            qs = qs.filter(timestamp__date__gte=start_date)
        if end_date:
            qs = qs.filter(timestamp__date__lte=end_date)
        return qs
