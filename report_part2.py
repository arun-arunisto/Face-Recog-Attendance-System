import os
from docx.shared import Inches, Pt, RGBColor
from report_builder_core import ReportBuilder, DIAGRAMS_DIR, SCREENSHOTS_DIR

def build_part_2(rb: ReportBuilder):
    doc = rb.doc

    # =========================================================================
    # CHAPTER 6: UML AND SYSTEM DIAGRAMS
    # =========================================================================
    rb.add_chapter_heading(6, "UML and System Diagrams")

    rb.add_section_heading("6.1", "UML Modeling Methodology")
    rb.add_paragraph(
        "Unified Modeling Language (UML 2.5) provides a standardized, visual specification language for modeling the structural "
        "and behavioral characteristics of the software system. This chapter presents twelve formal UML diagrams representing the "
        "actual implementation artifacts present in the codebase. All diagrams reflect the concrete classes, controllers, and "
        "workflows of the deployed application."
    )

    rb.add_section_heading("6.2", "Use Case Diagram")
    rb.add_paragraph(
        "The Use Case Diagram (Figure 6.1) delineates the functional interactions between external actors (Administrator, Student, "
        "and Vision Camera Node) and the system boundaries. The Administrator actor interacts with student management, face biometric "
        "enrollment, live recognition monitoring, attendance overrides, report streaming, and audit trails. The Student actor interacts "
        "with authentication, profile inspection, personal attendance history, and the monthly calendar. The Vision Camera system actor "
        "continuously streams video frames to the recognition process."
    )
    rb.add_figure(os.path.join(DIAGRAMS_DIR, 'diagram_06_use_case.png'), "Figure 6.1: UML Use Case Diagram")

    rb.add_section_heading("6.3", "Class Diagram — Core Domain Model")
    rb.add_paragraph(
        "The Class Diagram (Figure 6.2) models the static structural design of the backend object model. It details the relationships "
        "between the custom `User` model, `Department`, `StudentProfile` (storing the 128-D vector), `Attendance`, `Camera`, "
        "`AuditLog`, and the service controllers `RecognitionPipelineService` and `FaceRecognitionProvider`."
    )
    rb.add_figure(os.path.join(DIAGRAMS_DIR, 'diagram_07_class_diagram.png'), "Figure 6.2: UML Class Diagram — Core Domain Entity Model")

    rb.add_section_heading("6.4", "Sequence Diagram — Authentication & Token Issuance")
    rb.add_paragraph(
        "Figure 6.3 details the synchronous message exchange during user authentication. The client submits credentials to "
        "`/api/auth/login/`; `CustomTokenObtainPairView` verifies the password hash against the database, serializes user role and "
        "student profile metadata, and issues signed HMAC-SHA256 JWT access and refresh tokens."
    )
    rb.add_figure(os.path.join(DIAGRAMS_DIR, 'diagram_08_seq_login.png'), "Figure 6.3: Sequence Diagram — Authentication & JWT Token Issuance")

    rb.add_section_heading("6.5", "Sequence Diagram — Student Profile Registration")
    rb.add_paragraph(
        "Figure 6.4 depicts the administrator workflow when enrolling a new student into the institutional directory. The payload is "
        "validated by `StudentCreateSerializer`, atomic database transactions instantiate the `User` and `StudentProfile` records, and "
        "`log_audit_event` records an immutable audit trail."
    )
    rb.add_figure(os.path.join(DIAGRAMS_DIR, 'diagram_09_seq_student_registration.png'), "Figure 6.4: Sequence Diagram — Student Profile Registration")

    rb.add_section_heading("6.6", "Sequence Diagram — Face Biometric Registration")
    rb.add_paragraph(
        "Figure 6.5 details the webcam biometric enrollment process. Five continuous frames captured by `FaceCaptureModal` are "
        "transmitted to `/api/students/{id}/face/register/`. `RecognitionPipelineService` processes each frame, extracts five 128-D "
        "embedding vectors, computes the normalized centroid average, updates `StudentProfile.face_encoding`, and sets `face_registered=True`."
    )
    rb.add_figure(os.path.join(DIAGRAMS_DIR, 'diagram_10_seq_face_registration.png'), "Figure 6.5: Sequence Diagram — Face Biometric Registration")

    rb.add_section_heading("6.7", "Sequence Diagram — Real-Time WebSocket Recognition & Marking")
    rb.add_paragraph(
        "Figure 6.6 illustrates the real-time asynchronous recognition loop. `LiveCameraHUD` streams frames over WebSockets to "
        "`AsyncRecognitionConsumer`. The consumer invokes `process_frame()`, computes Euclidean distances against registered templates, "
        "evaluates the 0.60 threshold, records attendance, and emits a JSON result back to the browser within 300ms."
    )
    rb.add_figure(os.path.join(DIAGRAMS_DIR, 'diagram_11_seq_face_recognition.png'), "Figure 6.6: Sequence Diagram — Real-Time WebSocket Recognition & Marking")

    rb.add_section_heading("6.8", "Sequence Diagram — Manual Attendance Override & Marking")
    rb.add_paragraph(
        "Figure 6.7 models the administrative manual override workflow. An administrator submits manual attendance adjustments via "
        "`/api/attendance/mark/`. The view performs an atomic `update_or_create` on the `Attendance` table and appends a `ATTENDANCE_UPDATE` "
        "entry to the enterprise audit log."
    )
    rb.add_figure(os.path.join(DIAGRAMS_DIR, 'diagram_12_seq_attendance_marking.png'), "Figure 6.7: Sequence Diagram — Manual Attendance Override & Marking")

    rb.add_section_heading("6.9", "Sequence Diagram — Attendance Report Generation & Streaming")
    rb.add_paragraph(
        "Figure 6.8 illustrates the report export engine. The administrator triggers an export request with custom date and department "
        "filters. The backend builds an optimized queryset and streams a styled Microsoft Excel (`openpyxl`) or CSV binary stream directly "
        "to the client with appropriate `Content-Disposition` headers."
    )
    rb.add_figure(os.path.join(DIAGRAMS_DIR, 'diagram_13_seq_report_generation.png'), "Figure 6.8: Sequence Diagram — Attendance Report Generation & Streaming")

    rb.add_section_heading("6.10", "Activity Diagram — Face Recognition Lifecycle")
    rb.add_paragraph(
        "Figure 6.9 visualizes the decision logic executed for every video frame: base64 decoding, lighting quality validation (30 <= B <= 240), "
        "face localization, single-face count verification, 128-D vector extraction, Euclidean distance computation, and threshold branching."
    )
    rb.add_figure(os.path.join(DIAGRAMS_DIR, 'diagram_14_activity_face_recognition.png'), "Figure 6.9: UML Activity Diagram — Face Recognition Lifecycle")

    rb.add_section_heading("6.11", "Activity Diagram — Attendance Marking & Duplicate Protection")
    rb.add_paragraph(
        "Figure 6.10 details the business logic executed upon positive biometric identification: checking existing attendance records for "
        "today, checking cooldown thresholds (>600s) for automated check-outs, preventing duplicate check-ins, comparing against the 09:30 AM "
        "cutoff for ON-TIME vs LATE status, and persisting records to the database."
    )
    rb.add_figure(os.path.join(DIAGRAMS_DIR, 'diagram_15_activity_attendance.png'), "Figure 6.10: UML Activity Diagram — Attendance Marking & Duplicate Protection")

    rb.add_section_heading("6.12", "Component & Deployment Diagrams")
    rb.add_paragraph(
        "Figure 6.11 displays the UML Component Diagram depicting dependencies between frontend UI modules, backend Django services, "
        "biometric providers, and database stores. Figure 6.12 models the physical UML Deployment Diagram illustrating client nodes, "
        "the Daphne ASGI application server, and the relational database tier."
    )
    rb.add_figure(os.path.join(DIAGRAMS_DIR, 'diagram_16_component_diagram.png'), "Figure 6.11: UML Component Diagram — System Subsystem Interaction")
    rb.add_figure(os.path.join(DIAGRAMS_DIR, 'diagram_17_deployment_diagram.png'), "Figure 6.12: UML Deployment Diagram — Production Multi-Tier Physical Architecture")

    # =========================================================================
    # CHAPTER 7: DATA FLOW DESIGN
    # =========================================================================
    rb.add_chapter_heading(7, "Data Flow Design")

    rb.add_section_heading("7.1", "Data Flow Principles in Biometric Systems")
    rb.add_paragraph(
        "Data Flow Diagrams (DFDs) model how data moves through a system, specifying input sources, transformation processes, "
        "data store persistence, and output destinations. In biometric systems, DFDs are vital for demonstrating where raw video "
        "matrices are converted into mathematical embedding vectors and discarded, ensuring data privacy."
    )

    rb.add_section_heading("7.2", "Context Level DFD (Level 0)")
    rb.add_paragraph(
        "Figure 7.1 presents the Context Level DFD (Level 0). The entire system is represented as a single central process (0.0), "
        "interacting with four external entities: Administrator, Student, Vision Camera / Sensor, and the Reporting / Audit Sink."
    )
    rb.add_figure(os.path.join(DIAGRAMS_DIR, 'diagram_02_dfd_level_0.png'), "Figure 7.1: Context Level Data Flow Diagram (DFD Level 0)")

    rb.add_section_heading("7.3", "Level-1 Administrator Subsystem DFD")
    rb.add_paragraph(
        "Figure 7.2 decomposes the administrative workflow into four discrete Level-1 processes: 1.0 Auth Controller, 2.0 Student "
        "Manager, 3.0 Attendance Manager, and 4.0 Reporting & Audit Engine, interfacing with data stores D1 through D4."
    )
    rb.add_figure(os.path.join(DIAGRAMS_DIR, 'diagram_03_dfd_level_1_admin.png'), "Figure 7.2: DFD Level 1 — Administrator Subsystem Data Flow")

    rb.add_section_heading("7.4", "Level-1 Student Portal Subsystem DFD")
    rb.add_paragraph(
        "Figure 7.3 decomposes the student portal into three Level-1 processes: 1.0 Student Auth, 2.0 Profile Controller, and 3.0 "
        "Personal Attendance Query Engine. The diagram highlights strict data isolation, ensuring queries read only rows matching "
        "`student__user = request.user`."
    )
    rb.add_figure(os.path.join(DIAGRAMS_DIR, 'diagram_04_dfd_level_1_student.png'), "Figure 7.3: DFD Level 1 — Student Portal Subsystem Data Flow")

    rb.add_section_heading("7.5", "Face Recognition Pipeline Data Flow")
    rb.add_paragraph(
        "The computer vision data flow is strictly unidirectional: 1) Camera captures RGB frame -> 2) Canvas encodes to JPEG Base64 -> "
        "3) WebSocket transmits string payload -> 4) Daphne decodes bytes into NumPy ndarray -> 5) Preprocessor equalizes histogram -> "
        "6) Detector crops face bounding box -> 7) Embedder generates 128-D float64 vector -> 8) Comparator computes Euclidean distances -> "
        "9) Matched StudentProfile extracted -> 10) Attendance record created."
    )

    rb.add_section_heading("7.6", "Attendance Recording & State Transition Data Flow")
    rb.add_paragraph(
        "The attendance state transition data flow operates under a deterministic state machine: unrecorded dates initialize as "
        "UNMARKED; on-time check-ins transition to PRESENT; arrivals past 09:30 AM transition to LATE; repeat scans within 10 minutes "
        "retain state and emit ALREADY_MARKED; and repeat scans after 10 minutes update `check_out_time`."
    )

    rb.add_section_heading("7.7", "Institutional Report Streaming Data Flow")
    rb.add_paragraph(
        "Report streaming avoids in-memory buffer saturation: query parameters are translated to indexed SQL filters; Django ORM "
        "iterates over chunks; the generator writes rows directly into `HttpResponse` buffers; and binary file bytes stream "
        "continuously to the client browser."
    )

    # =========================================================================
    # CHAPTER 8: DATABASE DESIGN & SCHEMA SPECIFICATION
    # =========================================================================
    rb.add_chapter_heading(8, "Database Design & Schema Specification")

    rb.add_section_heading("8.1", "Database Architecture Overview")
    rb.add_paragraph(
        "The database architecture is designed for high-concurrency relational integrity, rapid indexed query execution, and zero-setup "
        "developer onboarding. The system operates natively on PostgreSQL 15 in production containerized deployments and utilizes "
        "SQLite3 for seamless, zero-dependency localhost prototyping."
    )

    rb.add_section_heading("8.2", "Entity-Relationship (ER) Diagram")
    rb.add_paragraph(
        "Figure 8.1 depicts the formal Entity-Relationship (ER) Diagram of the database schema, detailing all entities, primary keys, "
        "foreign key constraints, and 1:1, 1:N cardinality relationships."
    )
    rb.add_figure(os.path.join(DIAGRAMS_DIR, 'diagram_05_er_diagram.png'), "Figure 8.1: Entity-Relationship Diagram (Actual Database Relational Schema)")

    rb.add_section_heading("8.3", "Physical Schema Tables Specification")
    rb.add_paragraph(
        "The physical database schema contains seven primary tables, detailed in Tables 8.1 through 8.7."
    )

    # Table 8.1 User
    u_headers = ["Column Name", "Data Type", "Constraints / Index", "Description"]
    u_rows = [
        ["id", "BigAutoField", "PK, Auto Increment", "Unique internal user identifier"],
        ["email", "EmailField(254)", "Unique, Indexed, Required", "Authentication username and email address"],
        ["password", "CharField(128)", "Not Null, Hashed", "PBKDF2 SHA-256 cryptographic password hash"],
        ["full_name", "CharField(150)", "Not Null", "User's full legal name"],
        ["role", "CharField(20)", "Indexed, Default: 'STUDENT'", "User role: 'ADMIN' or 'STUDENT'"],
        ["department_id", "BigInt (FK)", "Null=True, on_delete=SET_NULL", "Associated academic department"],
        ["is_active", "BooleanField", "Default: True", "Account active status"],
        ["created_at", "DateTimeField", "Auto_now_add=True", "Timestamp of account creation"]
    ]
    rb.add_table_data(u_headers, u_rows, "Table 8.1: Physical Database Schema — Accounts User Table (`accounts_user`)", col_widths=[1.4, 1.4, 1.6, 2.0])

    # Table 8.2 Department
    d_headers = ["Column Name", "Data Type", "Constraints / Index", "Description"]
    d_rows = [
        ["id", "BigAutoField", "PK, Auto Increment", "Department primary key"],
        ["name", "CharField(120)", "Unique, Not Null", "Full department name (e.g. Computer Science)"],
        ["code", "CharField(20)", "Unique, Not Null", "Department acronym code (e.g. CSE, IT, ECE)"],
        ["description", "TextField", "Blank=True", "Department descriptive summary"],
        ["created_at", "DateTimeField", "Auto_now_add=True", "Record creation timestamp"]
    ]
    rb.add_table_data(d_headers, d_rows, "Table 8.2: Physical Database Schema — Department Table (`accounts_department`)", col_widths=[1.4, 1.4, 1.6, 2.0])

    # Table 8.3 StudentProfile
    sp_headers = ["Column Name", "Data Type", "Constraints / Index", "Description"]
    sp_rows = [
        ["id", "BigAutoField", "PK, Auto Increment", "Student profile primary key"],
        ["user_id", "BigInt (1:1 FK)", "Unique, on_delete=CASCADE", "Direct reference to `accounts_user.id`"],
        ["student_id", "CharField(50)", "Unique, Indexed, Not Null", "Institutional roll number (e.g. STU-2026-001)"],
        ["department_id", "BigInt (FK)", "Indexed, on_delete=PROTECT", "Associated department"],
        ["class_name", "CharField(60)", "Default: 'Computer Science'", "Academic cohort / class"],
        ["section", "CharField(20)", "Default: 'A'", "Class section identifier"],
        ["face_encoding", "JSONField", "Default: list, Blank=True", "128-dimensional facial embedding vector"],
        ["face_registered", "BooleanField", "Indexed, Default: False", "Flag indicating biometric enrollment status"],
        ["profile_photo", "ImageField", "Null=True, Blank=True", "Archived profile photograph file path"]
    ]
    rb.add_table_data(sp_headers, sp_rows, "Table 8.3: Physical Database Schema — Student Profile Table (`students_studentprofile`)", col_widths=[1.4, 1.4, 1.6, 2.0])

    # Table 8.4 Attendance
    att_headers = ["Column Name", "Data Type", "Constraints / Index", "Description"]
    att_rows = [
        ["id", "BigAutoField", "PK, Auto Increment", "Attendance record primary key"],
        ["student_id", "BigInt (FK)", "Indexed, on_delete=CASCADE", "Student profile reference"],
        ["date", "DateField", "Indexed, Default: now()", "Calendar date of attendance session"],
        ["check_in_time", "TimeField", "Default: now()", "Initial morning check-in time"],
        ["check_out_time", "TimeField", "Null=True, Blank=True", "Afternoon departure / check-out time"],
        ["status", "CharField(20)", "Indexed, Choices", "Attendance status: PRESENT, LATE, ABSENT"],
        ["recognition_confidence", "FloatField", "Default: 0.0", "Biometric confidence score (0.0 to 1.0)"],
        ["camera_id", "BigInt (FK)", "Null=True, on_delete=SET_NULL", "Camera node recording attendance"],
        ["marked_manually", "BooleanField", "Default: False", "Flag indicating administrative override"],
        ["notes", "TextField", "Blank=True", "Administrative remarks or verification notes"]
    ]
    rb.add_table_data(att_headers, att_rows, "Table 8.4: Physical Database Schema — Attendance Table (`attendance_attendance`)", col_widths=[1.4, 1.4, 1.6, 2.0])

    # Table 8.5 Camera
    cam_headers = ["Column Name", "Data Type", "Constraints / Index", "Description"]
    cam_rows = [
        ["id", "BigAutoField", "PK, Auto Increment", "Camera primary key"],
        ["name", "CharField(100)", "Not Null", "Human-readable camera designation"],
        ["location", "CharField(150)", "Not Null", "Physical installation location"],
        ["camera_type", "CharField(20)", "Choices", "WEBCAM, IP_CAMERA, RTSP, USB"],
        ["status", "CharField(20)", "Indexed, Default: ONLINE", "Operational status: ONLINE, OFFLINE, ERROR"],
        ["stream_identifier", "CharField(255)", "Default: 'default'", "Stream URI, index, or unique hardware ID"],
        ["is_active", "BooleanField", "Indexed, Default: True", "Administrative activation flag"]
    ]
    rb.add_table_data(cam_headers, cam_rows, "Table 8.5: Physical Database Schema — Camera Table (`cameras_camera`)", col_widths=[1.4, 1.4, 1.6, 2.0])

    # Table 8.6 AuditLog
    aud_headers = ["Column Name", "Data Type", "Constraints / Index", "Description"]
    aud_rows = [
        ["id", "BigAutoField", "PK, Auto Increment", "Audit entry primary key"],
        ["user_id", "BigInt (FK)", "Null=True, on_delete=SET_NULL", "User initiating the action"],
        ["action", "CharField(50)", "Indexed, Choices", "Action Enum: LOGIN, FACE_REGISTER, ATTENDANCE_MARK..."],
        ["entity_type", "CharField(50)", "Indexed, Not Null", "Target entity: STUDENT, ATTENDANCE, REPORT..."],
        ["entity_id", "CharField(100)", "Blank=True", "Primary key / identifier of modified entity"],
        ["metadata", "JSONField", "Default: dict, Blank=True", "Contextual metadata payload"],
        ["ip_address", "GenericIPField", "Null=True, Blank=True", "Client IPv4 / IPv6 network address"],
        ["timestamp", "DateTimeField", "Indexed, Auto_now_add=True", "Immutable UTC execution timestamp"]
    ]
    rb.add_table_data(aud_headers, aud_rows, "Table 8.6: Physical Database Schema — Audit Log Table (`audit_auditlog`)", col_widths=[1.4, 1.4, 1.6, 2.0])

    # Table 8.7 RecognitionEvent
    rec_headers = ["Column Name", "Data Type", "Constraints / Index", "Description"]
    rec_rows = [
        ["id", "BigAutoField", "PK, Auto Increment", "Recognition event primary key"],
        ["camera_id", "BigInt (FK)", "Null=True, on_delete=SET_NULL", "Vision camera detecting event"],
        ["student_id", "BigInt (FK)", "Null=True, on_delete=SET_NULL", "Identified student (or null if unknown)"],
        ["status", "CharField(40)", "Indexed, Not Null", "ATTENDANCE_MARKED, ALREADY_MARKED, UNKNOWN_FACE..."],
        ["confidence", "FloatField", "Default: 0.0", "Biometric confidence score"],
        ["bounding_box", "JSONField", "Default: dict", "Pixel coordinates: {top, right, bottom, left}"],
        ["latency_ms", "FloatField", "Default: 0.0", "Processing duration in milliseconds"],
        ["created_at", "DateTimeField", "Auto_now_add=True", "Timestamp of vision event"]
    ]
    rb.add_table_data(rec_headers, rec_rows, "Table 8.7: Physical Database Schema — Recognition Event Table (`recognition_recognitionevent`)", col_widths=[1.4, 1.4, 1.6, 2.0])

    rb.add_section_heading("8.4", "Biometric Vector Storage Architecture")
    rb.add_paragraph(
        "A critical architectural decision was storing the 128-dimensional facial embedding vector directly within `StudentProfile.face_encoding` "
        "as a native `JSONField(default=list)` rather than maintaining raw facial images in the database. A normalized 128-D vector of 64-bit "
        "floating point numbers consumes approximately 1,024 bytes per student. For an institution of 5,000 students, the entire facial "
        "biometric database consumes approximately 5 MB of memory, enabling the backend to preload and cache all biometric templates "
        "in RAM for sub-millisecond vector array dot products and Euclidean distance computations."
    )

    rb.add_section_heading("8.5", "Database Normalization Analysis")
    rb.add_paragraph(
        "The relational schema satisfies Boyce-Codd Normal Form (BCNF):\n"
        "• 1NF: All attributes contain atomic scalar values. Repeating groups in `face_encoding` are represented as structured JSON arrays.\n"
        "• 2NF: All non-key attributes depend entirely on the composite primary keys.\n"
        "• 3NF & BCNF: There are zero transitive dependencies; department codes and names reside in `accounts_department` and are referenced "
        "via foreign keys, eliminating update anomalies."
    )

    # =========================================================================
    # CHAPTER 9: FRONTEND IMPLEMENTATION
    # =========================================================================
    rb.add_chapter_heading(9, "Frontend Implementation & UI Showcase")

    rb.add_section_heading("9.1", "Frontend Technology Architecture")
    rb.add_paragraph(
        "The presentation tier is implemented as a modern React 18 Single-Page Application (SPA) authored in TypeScript and bundled "
        "via Vite. It features responsive dark-mode styling utilizing Tailwind CSS, state management powered by Zustand, asynchronous "
        "data caching with TanStack React Query, and real-time 3D spatial visualizations rendered via Three.js and React Three Fiber (R3F)."
    )

    rb.add_section_heading("9.2", "User Interface Showcase & Visual Documentation")
    rb.add_paragraph(
        "The following figures showcase the authentic, running application interfaces captured directly from the live deployment."
    )

    # Screenshot 01: Login
    rb.add_subsection_heading("9.2.1", "Authentication & Quick Demo Access Interface")
    rb.add_paragraph(
        "Figure 9.1 illustrates the login interface featuring email and password fields, error alert banners, and 1-click Prototype "
        "Quick Demo Access buttons for instant administrative and student testing."
    )
    rb.add_figure(os.path.join(SCREENSHOTS_DIR, '01_login_page.png'), "Figure 9.1: Screenshot 01 — Biometric Portal Login & Demo Access Interface")

    # Screenshot 02: Admin Dashboard
    rb.add_subsection_heading("9.2.2", "Administrator Control Center & Real-Time KPIs")
    rb.add_paragraph(
        "Figure 9.2 showcases the primary Administrator Dashboard, displaying high-level institutional KPI cards (Total Students: 12, "
        "Registered Biometrics: 9, Present Today, Late Today, Absent Today, Today Attendance %: 100%, 30-Day Average: 89.2%), "
        "and an interactive Three.js 3D Attendance Control Center."
    )
    rb.add_figure(os.path.join(SCREENSHOTS_DIR, '02_admin_dashboard.png'), "Figure 9.2: Screenshot 02 — Administrator Control Center & Real-Time KPIs")

    # Screenshot 03: Live Recognition Studio
    rb.add_subsection_heading("9.2.3", "Live Recognition Studio & Holographic Camera HUD")
    rb.add_paragraph(
        "Figure 9.3 displays the Live Face Recognition Studio. It features a live camera stream viewfinder with a holographic laser "
        "sweep HUD, real-time recognition status badges, latency indicators, and an instant feed of verified students."
    )
    rb.add_figure(os.path.join(SCREENSHOTS_DIR, '03_live_recognition.png'), "Figure 9.3: Screenshot 03 — Live Face Recognition Studio & Holographic Camera HUD")

    # Screenshot 04: Students Management
    rb.add_subsection_heading("9.2.4", "Student Directory & Management Panel")
    rb.add_paragraph(
        "Figure 9.4 illustrates the Student Management directory, listing registered students with academic roll numbers, full names, "
        "departments, class sections, biometric enrollment badges ('Registered' in green, 'Not Enrolled' in amber), and quick actions."
    )
    rb.add_figure(os.path.join(SCREENSHOTS_DIR, '04_student_management.png'), "Figure 9.4: Screenshot 04 — Student Management Directory & Filter Panel")

    # Screenshot 05: Student Registration
    rb.add_subsection_heading("9.2.5", "Student Registration Form")
    rb.add_paragraph(
        "Figure 9.5 displays the student enrollment form, allowing administrators to input student roll IDs, names, email addresses, "
        "department selections, academic cohorts, and sections."
    )
    rb.add_figure(os.path.join(SCREENSHOTS_DIR, '05_student_registration.png'), "Figure 9.5: Screenshot 05 — Student Account & Profile Registration Form")

    # Screenshot 06: Student Detail
    rb.add_subsection_heading("9.2.6", "Student Detail Profile View")
    rb.add_paragraph(
        "Figure 9.6 shows the comprehensive Student Detail view, providing complete academic parameters, individual attendance percentages, "
        "biometric status, and direct face management triggers."
    )
    rb.add_figure(os.path.join(SCREENSHOTS_DIR, '06_student_detail.png'), "Figure 9.6: Screenshot 06 — Student Academic & Biometric Detail Profile")

    # Screenshot 07: Face Registration Modal
    rb.add_subsection_heading("9.2.7", "Face Biometric Capture Modal")
    rb.add_paragraph(
        "Figure 9.7 presents the modal dialog for webcam face registration. It renders an active camera feed with an elliptical alignment "
        "guide, a frame capture burst counter, and instant sample processing feedback."
    )
    rb.add_figure(os.path.join(SCREENSHOTS_DIR, '07_face_registration_modal.png'), "Figure 9.7: Screenshot 07 — Multi-Frame Webcam Face Biometric Registration Modal")

    # Screenshot 08: Attendance Records
    rb.add_subsection_heading("9.2.8", "Attendance Records Table")
    rb.add_paragraph(
        "Figure 9.8 illustrates the central Attendance Records ledger, providing tabular inspection of all check-in/out records, "
        "color-coded status badges (PRESENT, LATE, ABSENT), recognition confidence percentages, camera names, and manual override controls."
    )
    rb.add_figure(os.path.join(SCREENSHOTS_DIR, '08_attendance_records.png'), "Figure 9.8: Screenshot 08 — Institutional Attendance Records Table & Verification Filter")

    # Screenshot 09: Analytics Dashboard
    rb.add_subsection_heading("9.2.9", "Analytics Dashboard & Visual Trend Charts")
    rb.add_paragraph(
        "Figure 9.9 showcases the Visual Analytics Dashboard featuring Recharts line charts for 14-day daily attendance trends, weekly "
        "historical bars, and department performance breakdowns (CSE: 95.8%, IT: 91.2%, ECE: 88.5%, ME: 84.1%)."
    )
    rb.add_figure(os.path.join(SCREENSHOTS_DIR, '09_analytics_dashboard.png'), "Figure 9.9: Screenshot 09 — Visual Attendance Analytics & Multi-Department Trend Charts")

    # Screenshot 10: Reports Export
    rb.add_subsection_heading("9.2.10", "Reports Generation & Export Interface")
    rb.add_paragraph(
        "Figure 9.10 displays the Reports Export center, enabling administrators to configure date ranges, department scopes, and "
        "download formatted Microsoft Excel (.xlsx) or CSV files with a single click."
    )
    rb.add_figure(os.path.join(SCREENSHOTS_DIR, '10_reports_export.png'), "Figure 9.10: Screenshot 10 — Formatted Excel (XLSX) & CSV Report Streaming Interface")

    # Screenshot 11: Camera Management
    rb.add_subsection_heading("9.2.11", "Camera Infrastructure Management")
    rb.add_paragraph(
        "Figure 9.11 illustrates the Camera Management console, listing active vision nodes (Main Entrance Gate A, CS Lab Alpha Cam, "
        "Central Library Turnstile), operational statuses (ONLINE, OFFLINE), and hardware stream identifiers."
    )
    rb.add_figure(os.path.join(SCREENSHOTS_DIR, '11_camera_management.png'), "Figure 9.11: Screenshot 11 — Distributed Vision Camera Infrastructure Management")

    # Screenshot 12: Audit Logs
    rb.add_subsection_heading("9.2.12", "Enterprise Security Audit Trail")
    rb.add_paragraph(
        "Figure 9.12 displays the immutable Audit Trail ledger, showing exact chronological logs of user logins, student updates, "
        "face registrations, manual attendance overrides, and report exports with IP addresses."
    )
    rb.add_figure(os.path.join(SCREENSHOTS_DIR, '12_audit_logs.png'), "Figure 9.12: Screenshot 12 — Enterprise Immutable Security Audit Trail Ledger")

    # Screenshot 13: System Settings
    rb.add_subsection_heading("9.2.13", "System Settings & Vision Parameters")
    rb.add_paragraph(
        "Figure 9.13 displays the administrative Settings interface, detailing active biometric tolerance thresholds (0.60), "
        "cooldown intervals (30s), active provider mode, and system parameters."
    )
    rb.add_figure(os.path.join(SCREENSHOTS_DIR, '13_system_settings.png'), "Figure 9.13: Screenshot 13 — System Configuration & Biometric Recognition Tuning Panel")

    # Screenshot 14: Student Dashboard
    rb.add_subsection_heading("9.2.14", "Student Portal Dashboard")
    rb.add_paragraph(
        "Figure 9.14 showcases the Student Portal Dashboard. It presents personal attendance percentage metrics via an interactive "
        "Three.js 3D Attendance Ring, today's check-in/out status, and immediate personal statistics."
    )
    rb.add_figure(os.path.join(SCREENSHOTS_DIR, '14_student_dashboard.png'), "Figure 9.14: Screenshot 14 — Student Portal Dashboard with 3D Ring Progress Indicator")

    # Screenshot 15: Student Attendance History
    rb.add_subsection_heading("9.2.15", "Student Personal Attendance History")
    rb.add_paragraph(
        "Figure 9.15 displays the student's personal historical attendance records, showing exact session dates, check-in times, "
        "camera locations, and attendance statuses with zero access to peer data."
    )
    rb.add_figure(os.path.join(SCREENSHOTS_DIR, '15_student_attendance.png'), "Figure 9.15: Screenshot 15 — Student Personal Attendance History & Verification Log")

    # Screenshot 16: Student Calendar
    rb.add_subsection_heading("9.2.16", "Student Monthly Attendance Calendar")
    rb.add_paragraph(
        "Figure 9.16 displays the student's interactive monthly attendance calendar, visualizing days marked PRESENT (green), "
        "LATE (amber), and ABSENT (red) across the month."
    )
    rb.add_figure(os.path.join(SCREENSHOTS_DIR, '16_student_calendar.png'), "Figure 9.16: Screenshot 16 — Student Interactive Monthly Attendance Calendar View")

    # Screenshot 17: Student Profile
    rb.add_subsection_heading("9.2.17", "Student Profile & Biometric Status")
    rb.add_paragraph(
        "Figure 9.17 displays the student's personal profile view, detailing academic department, class cohort, section, and verified "
        "biometric enrollment status."
    )
    rb.add_figure(os.path.join(SCREENSHOTS_DIR, '17_student_profile.png'), "Figure 9.17: Screenshot 17 — Student Biometric Profile & Personal Enrollment Status")

    # =========================================================================
    # CHAPTER 10: BACKEND IMPLEMENTATION
    # =========================================================================
    rb.add_chapter_heading(10, "Backend Implementation & Service Layer")

    rb.add_section_heading("10.1", "Backend Technology Selection & Organization")
    rb.add_paragraph(
        "The backend is developed in Python 3.11 utilizing Django 5 and Django REST Framework (DRF), running under Daphne ASGI. "
        "The application follows a modular architecture organized into eight specialized domain applications located within `backend/apps/`:\n"
        "1. `apps.accounts`: Custom user model, department models, authentication viewsets, and JWT token serializers.\n"
        "2. `apps.students`: Student profile models, class sections, student CRUD viewsets, and face enrollment actions.\n"
        "3. `apps.attendance`: Attendance records, sessions, today's summary endpoints, calendar calculations, and manual override views.\n"
        "4. `apps.recognition`: Computer vision pipeline service, WebSocket consumers, routing, and provider implementations.\n"
        "5. `apps.cameras`: Camera hardware configuration and status tracking viewsets.\n"
        "6. `apps.reports`: Excel (.xlsx) and CSV streaming report generation services.\n"
        "7. `apps.audit`: Centralized audit logging service and immutable audit log API.\n"
        "8. `apps.analytics`: High-level KPI aggregations, daily/weekly trends, and departmental analytics."
    )

    rb.add_section_heading("10.2", "Core Code Implementations & Architectural Snippets")
    rb.add_paragraph(
        "The following listings highlight critical backend implementations, demonstrating clean architectural patterns and strict security."
    )

    # Snippet 1: Permissions
    perm_code = """
class IsAdminUserRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and
            (request.user.role == UserRole.ADMIN or request.user.is_superuser or request.user.is_staff)
        )

class IsOwnerOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role == UserRole.ADMIN or request.user.is_superuser:
            return True
        if hasattr(obj, 'user'):
            return obj.user == request.user
        if hasattr(obj, 'student') and hasattr(obj.student, 'user'):
            return obj.student.user == request.user
        return False
"""
    rb.add_code_block(perm_code, "apps/accounts/permissions.py — Authoritative Role & Ownership Permissions")

    # Snippet 2: Recognition Consumer
    consumer_code = """
class AsyncRecognitionConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.camera_id = self.scope['url_route']['kwargs'].get('camera_id', 'default')
        self.pipeline = RecognitionPipelineService()
        self.camera = await self.get_or_init_camera(self.camera_id)
        await self.accept()
        await self.send(text_data=json.dumps({
            "type": "connection_status",
            "state": "CAMERA_CONNECTED",
            "provider": self.pipeline.provider.get_provider_name()
        }))

    async def receive(self, text_data=None, bytes_data=None):
        data = json.loads(text_data)
        if data.get('type') == 'frame':
            if self.is_processing_frame:
                return  # Drop frame to preserve sub-300ms latency
            self.is_processing_frame = True
            try:
                result = await self.process_frame_async(data.get('image'))
                await self.send(text_data=json.dumps(result))
            finally:
                self.is_processing_frame = False
"""
    rb.add_code_block(consumer_code, "apps/recognition/consumers.py — Asynchronous WebSocket Recognition Consumer")

    # Snippet 3: Attendance Engine
    att_code = """
# Step 11: Check duplicate attendance protection
existing_attendance = Attendance.objects.filter(student=matched_student, date=today).first()

if existing_attendance:
    current_time = now.time()
    check_in_dt = datetime.combine(today, existing_attendance.check_in_time)
    time_diff = (now - timezone.make_aware(check_in_dt)).total_seconds()
    checkout_updated = False
    if time_diff > 600 and not existing_attendance.check_out_time:
        existing_attendance.check_out_time = current_time
        existing_attendance.save(update_fields=['check_out_time', 'updated_at'])
        checkout_updated = True
    return {"type": "recognition_result", "recognized": True, "already_marked": True, ...}

# Step 12: Mark attendance with 09:30 AM cutoff
cutoff_late = now.replace(hour=9, minute=30, second=0).time()
status = AttendanceStatus.LATE if now.time() > cutoff_late else AttendanceStatus.PRESENT
attendance_record = Attendance.objects.create(
    student=matched_student, date=today, check_in_time=now.time(),
    status=status, recognition_confidence=round(confidence, 4), camera=camera
)
"""
    rb.add_code_block(att_code, "apps/recognition/services.py — Duplicate Prevention & Cutoff Evaluation Logic")

    print("Report Part 2 (Ch 6-10) compiled successfully.")

if __name__ == '__main__':
    rb = ReportBuilder()
    build_part_2(rb)
    rb.save()
