from .base import FaceRecognitionProvider
from .real import RealFaceRecognitionProvider
from .development import DevelopmentFaceRecognitionProvider

def get_recognition_provider(provider_type: str = None) -> FaceRecognitionProvider:
    """
    Factory to obtain the configured FaceRecognitionProvider instance.
    """
    from django.conf import settings
    mode = provider_type or getattr(settings, 'FACE_RECOGNITION_PROVIDER', 'real')
    if mode.lower() == 'development':
        return DevelopmentFaceRecognitionProvider()
    return RealFaceRecognitionProvider()
