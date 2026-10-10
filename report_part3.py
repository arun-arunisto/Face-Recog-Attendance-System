import os
from docx.shared import Inches, Pt, RGBColor
from report_builder_core import ReportBuilder, DIAGRAMS_DIR, SCREENSHOTS_DIR

def build_part_3(rb: ReportBuilder):
    doc = rb.doc

    # =========================================================================
    # CHAPTER 11: FACE RECOGNITION MODULE & COMPUTER VISION PIPELINE
    # =========================================================================
    rb.add_chapter_heading(11, "Face Recognition Module & Computer Vision Pipeline")

    rb.add_section_heading("11.1", "Introduction to Applied Facial Biometrics")
    rb.add_paragraph(
        "The computer vision subsystem constitutes the computational core of the Smart Face Recognition Attendance System. "
        "It translates uncalibrated, two-dimensional video frames captured across standard consumer webcams into mathematical "
        "invariants within a high-dimensional metric space. By leveraging OpenCV for frame preprocessing and deep convolutional "
        "embeddings for feature extraction, the system achieves robust identification that is invariant to minor variations in "
        "head pose, ambient lighting, and facial expression."
    )

    rb.add_section_heading("11.2", "Detailed Vision Pipeline Flowchart")
    rb.add_paragraph(
        "Figure 11.1 depicts the complete operational flowchart of the vision pipeline, tracing the lifecycle of each incoming "
        "frame from WebSocket decoding through contrast verification, single-face validation, vector comparison, and attendance triggering."
    )
    rb.add_figure(os.path.join(DIAGRAMS_DIR, 'diagram_18_face_recognition_flowchart.png'), "Figure 11.1: Detailed Face Recognition Pipeline Flowchart")

    rb.add_section_heading("11.3", "Webcam Capture & Frame Transmission")
    rb.add_paragraph(
        "Video acquisition occurs in the client browser via the HTML5 MediaDevices API (`navigator.mediaDevices.getUserMedia`). "
        "The browser captures 30 FPS video at 1280x720 resolution. At configured intervals (800ms in live recognition mode), an off-screen "
        "HTML5 `<canvas>` element captures the active frame, compresses it into an optimized JPEG string with a 0.85 quality factor, "
        "and dispatches a JSON payload (`{type: 'frame', image: 'data:image/jpeg;base64,...'}`) across the WebSocket connection."
    )

    rb.add_section_heading("11.4", "Image Preprocessing & Normalization")
    rb.add_paragraph(
        "Upon receipt, the backend `RecognitionPipelineService.decode_base64_image()` strips the URI header and converts the base64 "
        "buffer into an 8-bit unsigned integer NumPy buffer (`np.frombuffer`). The buffer is decoded via `cv2.imdecode(..., cv2.IMREAD_COLOR)` "
        "into a BGR matrix. If the image width exceeds 1,024 pixels, the service dynamically resizes the frame using area interpolation "
        "(`cv2.INTER_AREA`), capping computational latency. The frame is then converted to standard RGB (`cv2.COLOR_BGR2RGB`)."
    )

    rb.add_section_heading("11.5", "Quality Check & Illumination Filtering")
    rb.add_paragraph(
        "To prevent false rejections caused by degraded lighting, `check_image_quality()` converts the frame to grayscale and computes "
        "the global mean pixel intensity: Brightness = (1 / (W * H)) * sum(Gray(x, y)). If Brightness < 30.0, the frame is rejected with "
        "`LOW_QUALITY` ('Image is too dark. Increase ambient lighting.'). If Brightness > 240.0, it is rejected ('Image is overexposed. Reduce glare.')."
    )

    rb.add_section_heading("11.6", "Face Detection & Single Subject Validation")
    rb.add_paragraph(
        "Face detection is executed via `provider.detect_faces(img_rgb)`. In the production provider (`RealFaceRecognitionProvider`), "
        "detection utilizes dlib's frontal face detector or OpenCV's pre-trained Haar Feature-based Cascade Classifier (`haarcascade_frontalface_default.xml`). "
        "Prior to cascade detection, histogram equalization (`cv2.equalizeHist`) is applied to maximize contrast across facial features. "
        "The system enforces strict single-face validation: if 0 faces are detected, it emits `FACE_NOT_DETECTED`; if > 1 faces are detected, "
        "it emits `MULTIPLE_FACES` to eliminate ambiguous attendance attribution."
    )

    rb.add_section_heading("11.7", "128-Dimensional Facial Embedding Extraction")
    rb.add_paragraph(
        "For the validated face crop, `provider.extract_encodings()` generates a standardized 128-dimensional embedding vector. "
        "When `face_recognition` (dlib ResNet) is loaded, the deep neural network maps the aligned face into a 128-D hypersphere. "
        "In the fallback OpenCV configuration, the service crops the facial bounding box, resizes it to a normalized 64x64 grid, computes a "
        "128-bin multi-cell intensity histogram (`cv2.calcHist`), and normalizes the vector to unit length (L2 norm ||v|| = 1.0)."
    )

    rb.add_section_heading("11.8", "Euclidean Distance Metric & Decision Threshold")
    rb.add_paragraph(
        "Identity verification is performed by computing the Euclidean distance (L2 norm) between the candidate vector c and all known "
        "registered student vectors k_i in the database:\n"
        "Distance(k_i, c) = sqrt( sum_{j=1}^{128} (k_{i, j} - c_j)^2 )\n\n"
        "The minimum distance across the candidate set is evaluated against the configurable threshold (default `threshold = 0.60`). "
        "If min_distance <= 0.60, a biometric match is declared. If min_distance > 0.60, the subject is classified as `UNKNOWN_FACE`."
    )

    rb.add_section_heading("11.9", "Confidence Score Computation Model")
    rb.add_paragraph(
        "The raw Euclidean distance is translated into an intuitive 0.0 to 1.0 confidence score via a piecewise linear mapping function:\n"
        "• For Distance <= Threshold: Confidence = 1.0 - (Distance / (Threshold * 2.0)), mapped to the range [0.50, 0.99]. "
        "A distance of 0.0 yields 1.0 (100% confidence); a distance of 0.30 yields 0.75 (75% confidence).\n"
        "• For Distance > Threshold: Confidence = (1.0 - Distance) / ((1.0 - Threshold) * 2.0), decaying from 0.50 down to 0.0."
    )

    rb.add_section_heading("11.10", "Biometric Provider Abstraction Architecture")
    rb.add_paragraph(
        "The system decouples computer vision mechanics via the `FaceRecognitionProvider` abstract base class (`apps/recognition/providers/base.py`). "
        "Two concrete implementations are provided:\n"
        "1. `RealFaceRecognitionProvider`: Production pipeline utilizing OpenCV cascades, histogram feature extraction, or dlib ResNet embeddings.\n"
        "2. `DevelopmentFaceRecognitionProvider`: A deterministic mock provider for continuous integration (CI) and zero-hardware testing environments. "
        "It generates centered bounding boxes and seeded 128-D vectors, allowing developers and examiners to test full-stack workflows without a physical webcam."
    )

    rb.add_section_heading("11.11", "Error Classification & Resolution")
    rb.add_paragraph(
        "Table 11.1 details the structured error codes emitted across the WebSocket stream and their institutional resolutions."
    )

    err_headers = ["Error Code", "Trigger Condition", "Server Message", "Operational Resolution"]
    err_rows = [
        ["FACE_NOT_DETECTED", "0 faces located in frame", "No face detected in camera view.", "Student must step forward and look directly into camera."],
        ["MULTIPLE_FACES", ">= 2 faces located in frame", "Multiple faces detected. Only one student must be in view.", "Ensure only one student approaches the camera turnstile at a time."],
        ["LOW_QUALITY", "Brightness < 30 or > 240", "Image is too dark / overexposed.", "Adjust ambient illumination or eliminate direct backlight glare."],
        ["UNKNOWN_FACE", "Min distance > 0.60", "Face not recognized. Student identity unverified.", "Subject is either unregistered or biometric template needs re-enrollment."],
        ["CAMERA_ERROR", "Invalid base64 payload", "Invalid frame data / malformed image.", "Verify client browser WebRTC permissions and video stream encoding."]
    ]
    rb.add_table_data(err_headers, err_rows, "Table 11.1: Error Classification Codes & Resolution Strategies in Vision Pipeline", col_widths=[1.5, 1.5, 1.5, 1.5])

    # =========================================================================
    # CHAPTER 12: ATTENDANCE MANAGEMENT ENGINE
    # =========================================================================
    rb.add_chapter_heading(12, "Attendance Management Engine")

    rb.add_section_heading("12.1", "Operational Attendance Lifecycle")
    rb.add_paragraph(
        "The Attendance Management Engine executes within the backend service layer, enforcing institutional academic attendance "
        "policies. Figure 12.1 illustrates the complete workflow and status transition logic."
    )
    rb.add_figure(os.path.join(DIAGRAMS_DIR, 'diagram_19_attendance_flowchart.png'), "Figure 12.1: Attendance Engine Workflow & Status Transition Flowchart")

    rb.add_section_heading("12.2", "Automated Check-In & On-Time Status")
    rb.add_paragraph(
        "When an identified student triggers attendance for the first time on a calendar date, the engine records the current UTC timestamp "
        "as `check_in_time`. The check-in time is evaluated against the institutional cutoff (09:30:00). If arrival is on or before 09:30 AM, "
        "the record is marked as `PRESENT`. If arrival occurs after 09:30 AM, the status is automatically assigned as `LATE`."
    )

    rb.add_section_heading("12.3", "Duplicate Attendance Suppression & Check-Out Workflow")
    rb.add_paragraph(
        "To prevent database flooding from students lingering in front of the camera, the system enforces a duplicate suppression check. "
        "If a student's attendance has already been recorded for today, the engine calculates the time elapsed since initial check-in: "
        "`delta = now - check_in_time`. If delta <= 600 seconds (10 minutes), the engine suppresses insertion, returning `already_marked=True`. "
        "If delta > 600 seconds and `check_out_time` is null, the engine records the current time as `check_out_time`, updating the record "
        "to reflect a full academic day."
    )

    rb.add_section_heading("12.4", "Absent Status Determination")
    rb.add_paragraph(
        "Rather than creating empty absent rows in advance, `absent_count` is computed dynamically as: "
        "Absent = max(0, Total Active Students - Total Marked Today). In individual student calendars, any past weekday without an attendance "
        "record is rendered as `ABSENT` with red badge indicators."
    )

    rb.add_section_heading("12.5", "Institutional Reporting Services")
    rb.add_paragraph(
        "The reporting engine (`apps/reports/services.py`) provides two high-performance streaming formats:\n"
        "1. Comma-Separated Values (`build_attendance_csv_response`): Uses an in-memory `io.StringIO` buffer to stream UTF-8 rows directly to the HTTP response.\n"
        "2. Formatted Microsoft Excel (`build_attendance_xlsx_response`): Uses `openpyxl` to generate rich workbooks featuring dark-navy header rows, "
        "bold white titles, auto-fitted column widths, formatted timestamps, and color-coded status fills (Soft Green for PRESENT, Light Amber for LATE, Soft Red for ABSENT)."
    )

    # =========================================================================
    # CHAPTER 13: ADMINISTRATOR MODULE
    # =========================================================================
    rb.add_chapter_heading(13, "Administrator Module")

    rb.add_section_heading("13.1", "Administrative Privileges & Scope")
    rb.add_paragraph(
        "The Administrator module provides institutional leadership (Deans, Registrars, Department Heads) with comprehensive oversight. "
        "Administrators possess root permissions across all database entities, configuration settings, and audit logs."
    )

    rb.add_section_heading("13.2", "Administrative Operational Modules")
    rb.add_paragraph(
        "The administrative console comprises nine integrated operational centers:\n"
        "1. Executive Dashboard: High-level KPI summary, attendance percentages, and interactive 3D WebGL Attendance Control Center.\n"
        "2. Live Recognition Studio: Real-time camera viewfinder with holographic HUD scanner and live attendance feed.\n"
        "3. Student Directory: Full lifecycle student management (create, search, department filter, edit, delete).\n"
        "4. Face Enrollment Center: Dedicated webcam modal capturing 5-sample bursts to compute stabilized biometric templates.\n"
        "5. Attendance Ledger: Complete attendance history with multi-parameter filtering and manual override modals.\n"
        "6. Visual Analytics Studio: Recharts graphs depicting 14-day daily trends, 8-week bars, and department performance rankings.\n"
        "7. Reports Generator: Dynamic Excel (.xlsx) and CSV export center with date range and class filters.\n"
        "8. Camera Nodes Manager: Registration and health monitoring of campus vision cameras.\n"
        "9. Security Audit Inspector: Immutable, chronological ledger tracking all administrative actions."
    )

    # =========================================================================
    # CHAPTER 14: STUDENT SELF-SERVICE PORTAL
    # =========================================================================
    rb.add_chapter_heading(14, "Student Self-Service Portal")

    rb.add_section_heading("14.1", "Student Role Architecture & Least Privilege")
    rb.add_paragraph(
        "The Student Portal is engineered on the principle of Least Privilege. When a user with `role = 'STUDENT'` logs in, the "
        "frontend router restricts navigation to `/student/*` routes. The backend enforces `IsOwnerOrAdmin` across all student "
        "endpoints, dynamically filtering database querysets to the authenticated user's profile."
    )

    rb.add_section_heading("14.2", "Student Portal Functional Features")
    rb.add_paragraph(
        "The student portal provides four dedicated views:\n"
        "1. Student Dashboard: Features an interactive 3D Attendance Ring displaying the student's cumulative attendance percentage, "
        "today's check-in/out timestamps, and attendance status.\n"
        "2. Personal Attendance Ledger: Displays historical attendance records with date, time, status, and camera location.\n"
        "3. Monthly Attendance Calendar: An interactive calendar grid color-coding each day as PRESENT (green), LATE (amber), or ABSENT (red).\n"
        "4. Biometric Profile View: Displays academic details, department, cohort, section, and biometric registration status."
    )

    rb.add_section_heading("14.3", "Data Privacy & Anti-Tampering Protections")
    rb.add_paragraph(
        "Strict backend isolation prevents students from viewing or altering peer records. If a student attempts to query "
        "`/api/attendance/student/STU-2026-002/` while authenticated as `STU-2026-001`, the backend immediately terminates the request with "
        "`403 Forbidden` (`{\"error\": \"Forbidden: You cannot access another student's attendance records.\"}`)."
    )

    # =========================================================================
    # CHAPTER 15: COMPLETE REST API SPECIFICATION
    # =========================================================================
    rb.add_chapter_heading(15, "Complete REST API Specification")

    rb.add_section_heading("15.1", "API Standards & Authentication Header")
    rb.add_paragraph(
        "All REST API endpoints conform to JSON API standards. Protected endpoints require the standard HTTP Authorization header: "
        "`Authorization: Bearer <access_token>`. Tables 15.1 through 15.5 provide the complete specification for all 20+ endpoints."
    )

    # Table 15.1 Auth APIs
    t1_headers = ["Endpoint", "HTTP Method", "Role / Auth", "Request Body / Parameters", "Success Response (200/201)"]
    t1_rows = [
        ["/api/auth/login/", "POST", "AllowAny", "{\"email\": str, \"password\": str}", "{\"access\": token, \"refresh\": token, \"user\": dict}"],
        ["/api/auth/refresh/", "POST", "AllowAny", "{\"refresh\": str}", "{\"access\": new_access_token}"],
        ["/api/auth/logout/", "POST", "IsAuthenticated", "None", "{\"message\": \"Successfully logged out.\"}"],
        ["/api/auth/me/", "GET", "IsAuthenticated", "None", "User profile object with role and student_profile metadata"],
        ["/api/auth/departments/", "GET", "IsAuthenticated", "None", "Array of academic departments with student counts"]
    ]
    rb.add_table_data(t1_headers, t1_rows, "Table 15.1: REST API Specification — Authentication Endpoints", col_widths=[1.5, 0.9, 1.1, 1.3, 1.2])

    # Table 15.2 Student APIs
    t2_headers = ["Endpoint", "HTTP Method", "Role / Auth", "Request Body / Parameters", "Success Response (200/201)"]
    t2_rows = [
        ["/api/students/", "GET", "IsAuthenticated", "?department, ?face_registered, ?search", "Paginated array of StudentProfile records"],
        ["/api/students/", "POST", "IsAdminUserRole", "{\"student_id\", \"full_name\", \"email\", \"department\", ...}", "201 Created StudentProfile object"],
        ["/api/students/{id}/", "GET", "IsOwnerOrAdmin", "URL path parameter {id}", "Detailed StudentProfile object"],
        ["/api/students/{id}/", "PATCH", "IsAdminUserRole", "{\"class_name\", \"section\", \"is_active\", ...}", "Updated StudentProfile object"],
        ["/api/students/{id}/", "DELETE", "IsAdminUserRole", "URL path parameter {id}", "204 No Content"],
        ["/api/students/{id}/face/register/", "POST", "IsAdminUserRole", "{\"frames\": [b64,...], \"profile_photo\": b64}", "{\"message\": str, \"samples_processed\": int}"],
        ["/api/students/{id}/face/verify/", "POST", "IsAuthenticated", "{\"image\": b64}", "{\"match\": bool, \"confidence\": float, \"distance\": float}"],
        ["/api/students/{id}/face/", "DELETE", "IsAdminUserRole", "URL path parameter {id}", "{\"message\": \"Face registration deleted.\" }"]
    ]
    rb.add_table_data(t2_headers, t2_rows, "Table 15.2: REST API Specification — Student Management Endpoints", col_widths=[1.5, 0.9, 1.1, 1.3, 1.2])

    # Table 15.3 Attendance APIs
    t3_headers = ["Endpoint", "HTTP Method", "Role / Auth", "Request Body / Parameters", "Success Response (200/201)"]
    t3_rows = [
        ["/api/attendance/", "GET", "IsAuthenticated", "?date, ?start_date, ?end_date, ?status, ?dept", "Paginated array of Attendance records"],
        ["/api/attendance/mark/", "POST", "IsAdminUserRole", "{\"student_id\", \"date\", \"status\", \"notes\"}", "201/200 OK serialized Attendance record"],
        ["/api/attendance/today/", "GET", "IsAuthenticated", "None", "Summary: {total, present, late, absent, pct, recent_feed}"],
        ["/api/attendance/calendar/", "GET", "IsAuthenticated", "?month=YYYY-MM, ?student_id", "Monthly breakdown: {year, month, records: [...]}"],
        ["/api/attendance/student/{id}/", "GET", "IsOwnerOrAdmin", "URL path parameter {student_id}", "Personal history: {student, summary, attendances}"]
    ]
    rb.add_table_data(t3_headers, t3_rows, "Table 15.3: REST API Specification — Attendance Management Endpoints", col_widths=[1.5, 0.9, 1.1, 1.3, 1.2])

    # Table 15.4 Analytics & Reports
    t4_headers = ["Endpoint", "HTTP Method", "Role / Auth", "Request Body / Parameters", "Success Response (200/201)"]
    t4_rows = [
        ["/api/analytics/overview/", "GET", "IsAuthenticated", "None", "KPIs: {total_students, registered_faces, present, pct, ...}"],
        ["/api/analytics/daily/", "GET", "IsAuthenticated", "?days=14", "Daily trend array: [{date, day_name, present, late, pct}]"],
        ["/api/analytics/weekly/", "GET", "IsAuthenticated", "None", "Weekly trend array: [{week_label, present, late, pct}]"],
        ["/api/analytics/departments/", "GET", "IsAuthenticated", "None", "Department breakdown array with attendance rates"],
        ["/api/reports/attendance.csv", "GET", "IsAdminUserRole", "?start_date, ?end_date, ?department", "Streaming text/csv file attachment"],
        ["/api/reports/attendance.xlsx", "GET", "IsAdminUserRole", "?start_date, ?end_date, ?department", "Streaming formatted application/vnd.ms-excel file"]
    ]
    rb.add_table_data(t4_headers, t4_rows, "Table 15.4: REST API Specification — Analytics & Reporting Endpoints", col_widths=[1.5, 0.9, 1.1, 1.3, 1.2])

    # Table 15.5 Cameras & Audit
    t5_headers = ["Endpoint", "HTTP Method", "Role / Auth", "Request Body / Parameters", "Success Response (200/201)"]
    t5_rows = [
        ["/api/cameras/", "GET, POST", "IsAdminUserRole", "GET: None; POST: {name, location, camera_type...}", "Array of Camera nodes / Created Camera object"],
        ["/api/cameras/{id}/", "PATCH, DELETE", "IsAdminUserRole", "PATCH: {status, is_active}; DELETE: None", "Updated Camera object / 204 No Content"],
        ["/api/audit-logs/", "GET", "IsAdminUserRole", "?action, ?entity_type", "Paginated array of AuditLog entries"],
        ["/api/recognition/status/", "GET", "IsAuthenticated", "None", "Engine parameters: {provider, threshold, cooldown}"]
    ]
    rb.add_table_data(t5_headers, t5_rows, "Table 15.5: REST API Specification — Camera & Audit Infrastructure Endpoints", col_widths=[1.5, 0.9, 1.1, 1.3, 1.2])

    rb.add_section_heading("15.2", "Interactive OpenAPI 3.0 Documentation Showcase")
    rb.add_paragraph(
        "Figure 15.1 and Figure 15.2 showcase the live OpenAPI documentation interfaces compiled automatically by `drf-spectacular` "
        "and served directly by the backend Daphne server."
    )
    rb.add_figure(os.path.join(SCREENSHOTS_DIR, '18_swagger_api_docs.png'), "Figure 15.1: Screenshot 18 — Interactive OpenAPI 3.0 Swagger Documentation Interface")
    rb.add_figure(os.path.join(SCREENSHOTS_DIR, '19_redoc_api_docs.png'), "Figure 15.2: Screenshot 19 — Comprehensive ReDoc API Reference Interface")

    print("Report Part 3 (Ch 11-15) compiled successfully.")

if __name__ == '__main__':
    rb = ReportBuilder()
    build_part_3(rb)
    rb.save()
