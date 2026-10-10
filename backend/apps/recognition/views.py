from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.conf import settings
from apps.cameras.models import Camera
from .services import RecognitionPipelineService
from .providers import get_recognition_provider

class RecognitionStatusView(APIView):
    """
    Returns the current configuration and operational status of the recognition pipeline.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        provider = get_recognition_provider()
        cameras_online = Camera.objects.filter(status='ONLINE').count()
        threshold = getattr(settings, 'FACE_MATCH_THRESHOLD', 0.6)

        return Response({
            "provider_name": provider.get_provider_name(),
            "is_development_mode": provider.is_development_mode(),
            "match_threshold": threshold,
            "cameras_online": cameras_online,
            "status": "OPERATIONAL"
        })


class DirectFrameVerifyView(APIView):
    """
    REST alternative to verify a single frame without WebSocket.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        image = request.data.get('image')
        if not image:
            return Response({"error": "Missing 'image' base64 payload"}, status=status.HTTP_400_BAD_REQUEST)

        camera_id = request.data.get('camera_id')
        camera = None
        if camera_id:
            camera = Camera.objects.filter(id=camera_id).first()

        pipeline = RecognitionPipelineService()
        result = pipeline.process_frame(image, camera=camera)
        return Response(result)
