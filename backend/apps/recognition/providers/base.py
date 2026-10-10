from abc import ABC, abstractmethod
from typing import List, Dict, Any, Tuple
import numpy as np

class FaceRecognitionProvider(ABC):
    """
    Abstract interface for Face Recognition implementations.
    Decouples detection and encoding mechanics from the attendance service.
    """

    @abstractmethod
    def detect_faces(self, image_rgb: np.ndarray) -> List[Dict[str, int]]:
        """
        Detect face bounding boxes in an RGB image.
        Returns list of dicts with keys: 'top', 'right', 'bottom', 'left'.
        """
        pass

    @abstractmethod
    def extract_encodings(self, image_rgb: np.ndarray, face_locations: List[Dict[str, int]] = None) -> List[np.ndarray]:
        """
        Extract 128-dimensional facial embedding vectors from the detected face locations.
        """
        pass

    @abstractmethod
    def compare_faces(self, known_encodings: List[np.ndarray], candidate_encoding: np.ndarray, tolerance: float = 0.6) -> List[bool]:
        """
        Compare candidate encoding against a list of known encodings.
        """
        pass

    @abstractmethod
    def compute_face_distance(self, known_encodings: List[np.ndarray], candidate_encoding: np.ndarray) -> np.ndarray:
        """
        Calculate Euclidean distances between candidate and known encodings.
        """
        pass

    def compute_confidence(self, distance: float, threshold: float = 0.6) -> float:
        """
        Convert Euclidean distance to a 0.0 - 1.0 confidence score.
        """
        if distance > threshold:
            # Linear decay from 0.5 down to 0.0
            range_val = 1.0 - threshold
            if range_val <= 0:
                return 0.0
            linear_val = (1.0 - distance) / (range_val * 2.0)
            return float(np.clip(linear_val, 0.0, 0.5))
        else:
            # Distance <= threshold gives confidence between 0.5 and 1.0
            linear_val = 1.0 - (distance / (threshold * 2.0))
            return float(np.clip(linear_val, 0.5, 0.99))

    @abstractmethod
    def is_development_mode(self) -> bool:
        """
        Returns True if this provider is running in development/mock mode.
        """
        pass

    @abstractmethod
    def get_provider_name(self) -> str:
        """
        Returns human readable provider name.
        """
        pass
