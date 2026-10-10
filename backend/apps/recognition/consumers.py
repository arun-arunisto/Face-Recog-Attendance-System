import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone
from apps.cameras.models import Camera, CameraStatus
from .services import RecognitionPipelineService

logger = logging.getLogger(__name__)

class AsyncRecognitionConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer handling real-time camera frames and recognition results.
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.camera_id = None
        self.camera = None
        self.pipeline = None
        self.is_processing_frame = False

    async def connect(self):
        self.camera_id = self.scope['url_route']['kwargs'].get('camera_id', 'default')
        self.pipeline = RecognitionPipelineService()

        # Retrieve camera from database asynchronously
        self.camera = await self.get_or_init_camera(self.camera_id)

        await self.accept()

        # Notify client of successful connection
        await self.send(text_data=json.dumps({
            "type": "connection_status",
            "state": "CAMERA_CONNECTED",
            "camera_id": self.camera_id,
            "camera_name": self.camera.name if self.camera else "Local Webcam",
            "provider": self.pipeline.provider.get_provider_name(),
            "is_development_mode": self.pipeline.provider.is_development_mode(),
            "timestamp": timezone.now().isoformat()
        }))

    async def disconnect(self, close_code):
        logger.info(f"Recognition WebSocket closed for camera {self.camera_id} with code {close_code}")

    async def receive(self, text_data=None, bytes_data=None):
        if not text_data:
            return

        try:
            data = json.loads(text_data)
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                "type": "recognition_error",
                "code": "INVALID_PAYLOAD",
                "message": "Malformed JSON message"
            }))
            return

        msg_type = data.get('type')

        if msg_type == 'ping':
            await self.send(text_data=json.dumps({"type": "pong", "timestamp": timezone.now().isoformat()}))
            return

        if msg_type == 'frame':
            # Skip if still processing prior frame to preserve 1-2s response latency
            if self.is_processing_frame:
                return

            image_b64 = data.get('image')
            if not image_b64:
                await self.send(text_data=json.dumps({
                    "type": "recognition_error",
                    "code": "CAMERA_ERROR",
                    "message": "Missing image frame data"
                }))
                return

            self.is_processing_frame = True
            try:
                # Process frame via RecognitionPipelineService in sync database thread
                result = await self.process_frame_async(image_b64)
                await self.send(text_data=json.dumps(result))
            except Exception as e:
                logger.error(f"Error in recognition consumer processing: {e}", exc_info=True)
                await self.send(text_data=json.dumps({
                    "type": "recognition_error",
                    "code": "PROCESSING_ERROR",
                    "message": f"Server processing error: {str(e)}"
                }))
            finally:
                self.is_processing_frame = False

    @database_sync_to_async
    def get_or_init_camera(self, camera_id):
        try:
            if camera_id.isdigit():
                return Camera.objects.filter(id=int(camera_id)).first()
            camera, _ = Camera.objects.get_or_create(
                stream_identifier=camera_id,
                defaults={
                    'name': f"Camera {camera_id.title()}",
                    'location': "Main Entrance",
                    'status': CameraStatus.ONLINE
                }
            )
            return camera
        except Exception as e:
            logger.warning(f"Could not resolve camera: {e}")
            return None

    @database_sync_to_async
    def process_frame_async(self, image_b64):
        return self.pipeline.process_frame(image_b64, camera=self.camera)
