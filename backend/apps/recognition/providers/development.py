import logging
from typing import List, Dict, Any
import numpy as np
from .base import FaceRecognitionProvider

logger = logging.getLogger(__name__)

class DevelopmentFaceRecognitionProvider(FaceRecognitionProvider):
    """
    Deterministic Development Face Recognition Provider.
    Clearly labeled for development and automated testing environments.
    Simulates face detection and returns deterministic embeddings.
    """

    def __init__(self, default_face_count: int = 1):
        self.default_face_count = default_face_count

    def get_provider_name(self) -> str:
        return "DevelopmentFaceRecognitionProvider (MOCK / DEV MODE)"

    def is_development_mode(self) -> bool:
        return True

    def detect_faces(self, image_rgb: np.ndarray) -> List[Dict[str, int]]:
        h, w = image_rgb.shape[:2]
        if self.default_face_count == 0:
            return []

        # Return a centered bounding box
        box_w = int(w * 0.45)
        box_h = int(h * 0.55)
        top = int((h - box_h) / 2)
        left = int((w - box_w) / 2)

        faces = [{
            'top': top,
            'right': left + box_w,
            'bottom': top + box_h,
            'left': left
        }]

        if self.default_face_count > 1:
            faces.append({
                'top': top + 20,
                'right': min(w, left + box_w + 100),
                'bottom': top + box_h + 20,
                'left': min(w - 10, left + box_w)
            })

        return faces

    def extract_encodings(self, image_rgb: np.ndarray, face_locations: List[Dict[str, int]] = None) -> List[np.ndarray]:
        # Return deterministic 128-d vector based on image average or seed
        if not face_locations:
            face_locations = self.detect_faces(image_rgb)

        encodings = []
        for i, loc in enumerate(face_locations):
            # Seed vector with deterministic values
            vec = np.zeros(128, dtype=np.float64)
            vec[0:10] = 0.5 + (i * 0.1)
            norm = np.linalg.norm(vec)
            encodings.append(vec / norm if norm > 0 else vec)
        return encodings

    def compare_faces(self, known_encodings: List[np.ndarray], candidate_encoding: np.ndarray, tolerance: float = 0.6) -> List[bool]:
        if not known_encodings:
            return []
        distances = self.compute_face_distance(known_encodings, candidate_encoding)
        return list(distances <= tolerance)

    def compute_face_distance(self, known_encodings: List[np.ndarray], candidate_encoding: np.ndarray) -> np.ndarray:
        if not known_encodings:
            return np.empty(0)
        candidate = np.array(candidate_encoding, dtype=np.float64)
        knowns = np.array(known_encodings, dtype=np.float64)
        return np.linalg.norm(knowns - candidate, axis=1)
