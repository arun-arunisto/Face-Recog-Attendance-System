# WebSocket Recognition Protocol

## Endpoint
`ws://<host>:<port>/ws/recognition/<camera_id>/`

## Message Types

### 1. Connection Handshake
Sent by server upon successful connection:
```json
{
  "type": "connection_status",
  "state": "CAMERA_CONNECTED",
  "camera_id": "default",
  "camera_name": "Main Entrance",
  "provider": "RealFaceRecognitionProvider",
  "is_development_mode": false,
  "timestamp": "2026-09-21T03:00:00Z"
}
```

### 2. Client Frame Transmission
Sent by frontend client at configured interval (e.g. 800ms):
```json
{
  "type": "frame",
  "image": "data:image/jpeg;base64,/9j/4AAQ..."
}
```

### 3. Server Recognition Result
Returned when face is successfully identified:
```json
{
  "type": "recognition_result",
  "recognized": true,
  "student_id": "STU-2026-001",
  "student_name": "Arun Kumar",
  "department": "Computer Science & Engineering",
  "confidence": 0.95,
  "attendance_marked": true,
  "already_marked": false,
  "status": "PRESENT",
  "check_in_time": "08:45:10",
  "timestamp": "2026-09-21T03:00:00Z",
  "message": "Attendance marked as PRESENT",
  "bounding_boxes": [{"top": 90, "right": 310, "bottom": 350, "left": 130}],
  "latency_ms": 135.4
}
```

### 4. Server Recognition Error
Returned when no face is found, multiple faces are detected, or identity cannot be resolved:
```json
{
  "type": "recognition_error",
  "code": "MULTIPLE_FACES",
  "message": "Multiple faces detected. Only one student must be in view.",
  "bounding_boxes": [...],
  "latency_ms": 88.0
}
```
Possible error codes:
- `FACE_NOT_DETECTED`
- `MULTIPLE_FACES`
- `UNKNOWN_FACE`
- `LOW_QUALITY`
- `CAMERA_ERROR`
