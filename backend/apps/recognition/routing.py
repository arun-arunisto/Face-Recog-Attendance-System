from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'^ws/recognition/(?P<camera_id>[^/]+)/?$', consumers.AsyncRecognitionConsumer.as_asgi()),
]
