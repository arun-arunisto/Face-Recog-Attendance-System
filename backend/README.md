# Smart Attendance System - Backend

Production-ready Django REST Framework & Django Channels (ASGI/Daphne) server with OpenCV biometric face recognition.

## Features
- **Authentication**: JWT token authentication (`rest_framework_simplejwt`) with custom payload containing user profile and role.
- **Role Isolation**: Strictly enforced backend permissions (`IsAdminUserRole`, `IsStudentUserRole`, `IsOwnerOrAdmin`). Students are barred from accessing or modifying other students' data.
- **Biometric Recognition Engine**: `FaceRecognitionProvider` abstraction supporting OpenCV / `face_recognition` with Euclidean vector matching and deterministic `DevelopmentFaceRecognitionProvider`.
- **Real-Time WebSocket**: Daphne ASGI consumer at `/ws/recognition/{camera_id}/` receiving base64 image frames, checking duplicate attendance, and broadcasting verified results.
- **Reports**: Instant streaming generation of CSV and formatted Microsoft Excel (`.xlsx` using `openpyxl`).
- **Audit Logs**: Immutable audit log ledger tracking all system and administrative events.
- **OpenAPI / Swagger**: Interactive API documentation at `/api/docs/` and `/api/redoc/`.

---

## Localhost Setup & Run (Windows PowerShell)

### 1. Activate Virtual Environment
The virtual environment is located at `backend\.venv`:
```powershell
# In PowerShell:
.\.venv\Scripts\Activate.ps1
```

### 2. Install Requirements (Already Completed)
```powershell
pip install -r requirements.txt
```

### 3. Database Migrations
SQLite3 is configured out-of-the-box (`db.sqlite3`) for seamless zero-dependency local execution:
```powershell
python manage.py makemigrations
python manage.py migrate
```

### 4. Seed Initial Data
Populates Admin account, 4 academic departments, 12 students with face embeddings, and 30 days of realistic attendance history:
```powershell
python manage.py seed_data
```

### 5. Run Server (ASGI / Daphne)
Run the ASGI server to handle both REST HTTP endpoints and WebSockets:
```powershell
python manage.py runserver 8000
```
Or directly with Daphne:
```powershell
daphne -b 127.0.0.1 -p 8000 config.asgi:application
```

---

## Default Seed Credentials

| Role | Email | Password | Details |
|------|-------|----------|---------|
| **Admin** | `admin@example.com` | `Admin@123456` | Full administrative access |
| **Student 1** | `arun.kumar@example.com` | `Student@123456` | ID: `STU-2026-001`, CSE Department |
| **Student 2** | `priya.sharma@example.com` | `Student@123456` | ID: `STU-2026-002`, CSE Department |
| **Student 3** | `rahul.verma@example.com` | `Student@123456` | ID: `STU-2026-003`, IT Department |

---

## Running Automated Tests
```powershell
pytest
```
All 13 pytest tests verify authentication, role permissions, attendance duplicate prevention, report generation, and recognition vector distances.
