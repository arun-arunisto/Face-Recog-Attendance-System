import pytest
import numpy as np
from apps.recognition.providers.development import DevelopmentFaceRecognitionProvider
from apps.recognition.providers.real import RealFaceRecognitionProvider
from apps.recognition.services import RecognitionPipelineService

def test_development_face_provider():
    provider = DevelopmentFaceRecognitionProvider(default_face_count=1)
    dummy_img = np.zeros((480, 640, 3), dtype=np.uint8)

    # 1 face detection
    faces = provider.detect_faces(dummy_img)
    assert len(faces) == 1
    assert 'top' in faces[0] and 'right' in faces[0]

    # Encoding extraction
    encodings = provider.extract_encodings(dummy_img, faces)
    assert len(encodings) == 1
    assert encodings[0].shape == (128,)

    # Distance matching
    known = [encodings[0]]
    dists = provider.compute_face_distance(known, encodings[0])
    assert dists[0] == pytest.approx(0.0, abs=1e-5)
    conf = provider.compute_confidence(dists[0], 0.6)
    assert conf >= 0.95


def test_real_provider_distance_and_confidence():
    provider = RealFaceRecognitionProvider()
    vec1 = np.random.randn(128)
    vec1 = vec1 / np.linalg.norm(vec1)

    # Self match distance should be 0.0
    dist = provider.compute_face_distance([vec1], vec1)[0]
    assert dist == pytest.approx(0.0, abs=1e-5)
    conf = provider.compute_confidence(dist, 0.6)
    assert conf > 0.90
