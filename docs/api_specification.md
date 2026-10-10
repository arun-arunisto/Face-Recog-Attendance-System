# REST API Specification

All endpoints return JSON responses. Authentication requires the `Authorization: Bearer <access_token>` header.

## Authentication Endpoints
- `POST /api/auth/login/`: Validates credentials, returns tokens and user object.
- `POST /api/auth/refresh/`: Accepts `refresh` token, returns new `access` token.
- `POST /api/auth/logout/`: Confirms logout.
- `GET  /api/auth/me/`: Returns profile of currently authenticated user.

## Student Management
- `GET /api/students/`: List of students with search and filters.
- `POST /api/students/`: Create student (Admin only).
- `GET /api/students/{id}/`: Retrieve student by ID.
- `PATCH /api/students/{id}/`: Update student details (Admin only).
- `DELETE /api/students/{id}/`: Delete student (Admin only).
- `POST /api/students/{id}/face/register/`: Register face samples.
- `POST /api/students/{id}/face/verify/`: Verify face against student template.
- `DELETE /api/students/{id}/face/`: Delete registered face template.

## Attendance Management
- `GET /api/attendance/`: Query attendance records.
- `POST /api/attendance/mark/`: Manual attendance marking (Admin only).
- `GET /api/attendance/today/`: Today's real-time statistics.
- `GET /api/attendance/calendar/`: Monthly breakdown.
- `GET /api/attendance/student/{student_id}/`: Specific student history.

## Reports & Analytics
- `GET /api/reports/attendance.csv`: Download CSV report.
- `GET /api/reports/attendance.xlsx`: Download formatted Excel spreadsheet.
- `GET /api/analytics/overview/`: High-level metrics.
- `GET /api/analytics/daily/`: Daily trend charts.
- `GET /api/analytics/weekly/`: Weekly trend charts.
- `GET /api/analytics/departments/`: Department performance breakdown.
