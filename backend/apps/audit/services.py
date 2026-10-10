import logging
from .models import AuditLog

logger = logging.getLogger(__name__)

def get_client_ip(request):
    if not request:
        return None
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR')

def log_audit_event(action, entity_type, entity_id='', metadata=None, user=None, request=None):
    """
    Centralized audit logging service.
    """
    try:
        ip = get_client_ip(request)
        if user is None and request and hasattr(request, 'user') and request.user.is_authenticated:
            user = request.user

        log = AuditLog.objects.create(
            user=user if user and user.is_authenticated else None,
            action=action,
            entity_type=entity_type,
            entity_id=str(entity_id),
            metadata=metadata or {},
            ip_address=ip
        )
        return log
    except Exception as e:
        logger.error(f"Failed to record audit log: {e}", exc_info=True)
        return None
