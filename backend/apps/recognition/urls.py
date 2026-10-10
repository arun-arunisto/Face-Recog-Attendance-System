from django.urls import path
from .views import RecognitionStatusView, DirectFrameVerifyView

urlpatterns = [
    path('status/', RecognitionStatusView.as_view(), name='recognition_status'),
    path('verify/', DirectFrameVerifyView.as_view(), name='direct_verify'),
]
