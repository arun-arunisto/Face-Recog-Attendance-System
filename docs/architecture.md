# Architectural Specification: Smart Face Recognition Attendance System

## 1. Monorepo Organization
The repository is split into decoupled layers:
- `backend/`: Python Django REST Framework + Channels server.
- `frontend/`: React 18 + TypeScript + Vite + Tailwind + Three.js client.
- `docker/`: Containerization specifications and reverse proxy configs.

## 2. Separation of Concerns
1. **Camera Processing**:
   - The browser captures video frames from the webcam via `navigator.mediaDevices.getUserMedia()`.
   - The frames are compressed to JPEG base64 strings and streamed over WebSockets to the ASGI backend.
2. **Biometric Face Recognition**:
   - The backend decodes the frame with OpenCV.
   - Quality checks ensure proper lighting and sharp focus.
   - The `FaceRecognitionProvider` extracts 128-dimensional biometric embeddings.
   - The embeddings are compared against database templates using Euclidean distance with configured threshold tolerances.
3. **Three.js Visualizations**:
   - Three.js and React Three Fiber are strictly restricted to 3D visualization, holographic HUD scanning effects, and interactive control center scenes.
   - Three.js never executes facial recognition calculations.

## 3. Security & Permission Architecture
- Authentication uses JSON Web Tokens (JWT) with access and refresh tokens.
- Role-based permissions (`ADMIN`, `STUDENT`) are authoritative in Django views and serializers.
- Students are forbidden from querying any student ID other than their own, verified by `request.user.student_profile`.
