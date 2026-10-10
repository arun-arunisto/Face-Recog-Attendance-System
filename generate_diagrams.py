import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches

DIAGRAMS_DIR = os.path.join(os.path.dirname(__file__), 'diagrams')
os.makedirs(DIAGRAMS_DIR, exist_ok=True)

# Styling palette
BG_COLOR = '#F8FAFC'
PRIMARY_COLOR = '#1E293B'  # Slate 800
ACCENT_BLUE = '#2563EB'    # Blue 600
ACCENT_CYAN = '#0284C7'    # Sky 600
ACCENT_GREEN = '#16A34A'   # Green 600
ACCENT_AMBER = '#D97706'   # Amber 600
ACCENT_RED = '#DC2626'     # Red 600
BOX_BG = '#FFFFFF'
BOX_BORDER = '#94A3B8'     # Slate 400
TEXT_MAIN = '#0F172A'      # Slate 900
TEXT_MUTED = '#475569'     # Slate 600

def draw_box(ax, x, y, w, h, title, subtitle="", bg=BOX_BG, border=BOX_BORDER, title_color=TEXT_MAIN, corner_radius=0.03):
    rect = patches.FancyBboxPatch(
        (x, y), w, h,
        boxstyle=f"round,pad=0.02,rounding_size={corner_radius}",
        facecolor=bg, edgecolor=border, linewidth=1.5, zorder=2
    )
    ax.add_patch(rect)
    if subtitle:
        ax.text(x + w/2, y + h*0.62, title, ha='center', va='center', fontsize=10, fontweight='bold', color=title_color, zorder=3)
        ax.text(x + w/2, y + h*0.28, subtitle, ha='center', va='center', fontsize=8, color=TEXT_MUTED, zorder=3)
    else:
        ax.text(x + w/2, y + h/2, title, ha='center', va='center', fontsize=9.5, fontweight='bold', color=title_color, zorder=3)

def draw_arrow(ax, x1, y1, x2, y2, label="", color='#64748B', style='->', lw=1.5):
    ax.annotate(
        '', xy=(x2, y2), xytext=(x1, y1),
        arrowprops=dict(arrowstyle=style, color=color, lw=lw, shrinkA=3, shrinkB=3),
        zorder=4
    )
    if label:
        mx, my = (x1 + x2)/2, (y1 + y2)/2
        ax.text(mx, my + 0.02, label, ha='center', va='bottom', fontsize=8, color='#334155', backgroundcolor='#FFFFFF', zorder=5)

# -------------------------------------------------------------
# 1. System Architecture
# -------------------------------------------------------------
def gen_system_architecture():
    fig, ax = plt.subplots(figsize=(11, 7), dpi=300)
    ax.set_facecolor(BG_COLOR)
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis('off')

    # Title
    ax.text(0.5, 0.95, "Figure 5.1: High-Level System Architecture", ha='center', fontsize=13, fontweight='bold', color=PRIMARY_COLOR)

    # Layers
    # Client Tier
    draw_box(ax, 0.05, 0.65, 0.25, 0.22, "Client Tier (Browser)", "Webcam Video Stream\nThree.js HUD & UI Controls", bg='#EFF6FF', border='#3B82F6')
    draw_box(ax, 0.07, 0.67, 0.21, 0.07, "React 18 + Vite", "TypeScript / Tailwind", bg='#FFFFFF', border='#93C5FD')

    # Gateway / Transport
    draw_box(ax, 0.38, 0.65, 0.24, 0.22, "API Gateway / ASGI", "Daphne Protocol Server\nChannels WebSocket Router", bg='#F0FDF4', border='#22C55E')
    draw_box(ax, 0.40, 0.67, 0.20, 0.07, "JSON Web Tokens", "SimpleJWT Authentication", bg='#FFFFFF', border='#86EFAC')

    # Backend Tier
    draw_box(ax, 0.70, 0.65, 0.26, 0.22, "Application Tier", "Django 5 REST Framework\n8 Modular Domain Apps", bg='#FDF4FF', border='#C084FC')
    draw_box(ax, 0.72, 0.67, 0.22, 0.07, "Service Controllers", "Permissions & Audit Triggers", bg='#FFFFFF', border='#E9D5FF')

    # Recognition Engine Subsystem
    draw_box(ax, 0.15, 0.28, 0.70, 0.25, "Biometric Computer Vision Subsystem", "apps.recognition.services.RecognitionPipelineService", bg='#F8FAFC', border='#64748B')
    draw_box(ax, 0.18, 0.31, 0.18, 0.15, "Frame Preprocessing", "Base64 Decoding\nLighting & Contrast", bg='#FFFFFF', border='#CBD5E1')
    draw_box(ax, 0.41, 0.31, 0.18, 0.15, "Face Detection", "OpenCV Haar / dlib\nSingle Face Validation", bg='#FFFFFF', border='#CBD5E1')
    draw_box(ax, 0.64, 0.31, 0.18, 0.15, "Feature Embedder", "128-D Euclidean Vector\nTolerance Threshold <= 0.6", bg='#FFFFFF', border='#CBD5E1')

    # Database Tier
    draw_box(ax, 0.25, 0.04, 0.50, 0.16, "Data Tier (Relational Persistence)", "PostgreSQL 15 / SQLite3 (Zero-setup Dev)\nMedia File Storage (/media/profiles/)", bg='#FEF3C7', border='#F59E0B')

    # Arrows
    draw_arrow(ax, 0.30, 0.76, 0.38, 0.76, "HTTP / WS")
    draw_arrow(ax, 0.62, 0.76, 0.70, 0.76, "ASGI Routing")
    draw_arrow(ax, 0.75, 0.65, 0.75, 0.53, "Async Handshake")
    draw_arrow(ax, 0.50, 0.65, 0.50, 0.53, "WebSocket Frames")
    draw_arrow(ax, 0.36, 0.38, 0.41, 0.38, "RGB Mat")
    draw_arrow(ax, 0.59, 0.38, 0.64, 0.38, "Face Crop")
    draw_arrow(ax, 0.50, 0.28, 0.50, 0.20, "Query Vectors & Insert Logs")

    plt.tight_layout()
    fig.savefig(os.path.join(DIAGRAMS_DIR, 'diagram_01_system_architecture.png'), dpi=300)
    plt.close(fig)

# -------------------------------------------------------------
# 2. DFD Level 0 (Context Level)
# -------------------------------------------------------------
def gen_dfd_level_0():
    fig, ax = plt.subplots(figsize=(10, 6), dpi=300)
    ax.set_facecolor(BG_COLOR)
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis('off')

    ax.text(0.5, 0.94, "Figure 7.1: Context Level Data Flow Diagram (DFD Level 0)", ha='center', fontsize=12, fontweight='bold', color=PRIMARY_COLOR)

    # External Entities
    draw_box(ax, 0.05, 0.65, 0.22, 0.18, "Administrator", "External Entity", bg='#EFF6FF', border='#3B82F6')
    draw_box(ax, 0.05, 0.20, 0.22, 0.18, "Student", "External Entity", bg='#EFF6FF', border='#3B82F6')
    draw_box(ax, 0.73, 0.65, 0.22, 0.18, "Vision Camera / Sensor", "External Entity", bg='#FEF2F2', border='#EF4444')
    draw_box(ax, 0.73, 0.20, 0.22, 0.18, "Reporting / Audit Sink", "External Entity", bg='#FEF3C7', border='#F59E0B')

    # Central Process
    circ = patches.Circle((0.5, 0.5), 0.16, facecolor='#F0FDF4', edgecolor='#22C55E', linewidth=2, zorder=2)
    ax.add_patch(circ)
    ax.text(0.5, 0.53, "0.0\nSmart Face Recognition\nAttendance System", ha='center', va='center', fontsize=9.5, fontweight='bold', color=TEXT_MAIN, zorder=3)

    # Flows
    draw_arrow(ax, 0.27, 0.72, 0.38, 0.58, "Admin Credentials, Config, Profiles")
    draw_arrow(ax, 0.40, 0.62, 0.27, 0.76, "Analytics, Logs, Status Responses")

    draw_arrow(ax, 0.27, 0.32, 0.38, 0.44, "Student Login, Profile Query")
    draw_arrow(ax, 0.41, 0.40, 0.27, 0.26, "Personal Attendance & Calendar")

    draw_arrow(ax, 0.73, 0.72, 0.62, 0.58, "Live JPEG Video Frames (WS)")
    draw_arrow(ax, 0.60, 0.62, 0.73, 0.76, "Recognition Feedback & Bounding Boxes")

    draw_arrow(ax, 0.62, 0.44, 0.73, 0.32, "Exported XLSX/CSV & Audit Logs")

    plt.tight_layout()
    fig.savefig(os.path.join(DIAGRAMS_DIR, 'diagram_02_dfd_level_0.png'), dpi=300)
    plt.close(fig)

# -------------------------------------------------------------
# 3. DFD Level 1 Admin
# -------------------------------------------------------------
def gen_dfd_level_1_admin():
    fig, ax = plt.subplots(figsize=(11, 7), dpi=300)
    ax.set_facecolor(BG_COLOR)
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis('off')

    ax.text(0.5, 0.95, "Figure 7.2: DFD Level 1 — Administrator Subsystem", ha='center', fontsize=12, fontweight='bold', color=PRIMARY_COLOR)

    # Admin Entity
    draw_box(ax, 0.03, 0.42, 0.16, 0.20, "Administrator", "Role: ADMIN", bg='#EFF6FF', border='#3B82F6')

    # Processes
    draw_box(ax, 0.28, 0.74, 0.25, 0.15, "1.0 Auth Controller", "Verify JWT & Roles", bg='#F0FDF4', border='#22C55E')
    draw_box(ax, 0.28, 0.50, 0.25, 0.15, "2.0 Student Manager", "CRUD & Face Enroller", bg='#F0FDF4', border='#22C55E')
    draw_box(ax, 0.28, 0.26, 0.25, 0.15, "3.0 Attendance Manager", "Manual Override & Summary", bg='#F0FDF4', border='#22C55E')
    draw_box(ax, 0.28, 0.04, 0.25, 0.15, "4.0 Reporting & Audit", "CSV/XLSX Export Engine", bg='#F0FDF4', border='#22C55E')

    # Data Stores
    draw_box(ax, 0.68, 0.74, 0.26, 0.14, "D1: User & Dept Store", "accounts_user, department", bg='#FEF3C7', border='#F59E0B')
    draw_box(ax, 0.68, 0.50, 0.26, 0.14, "D2: Student Profile Store", "studentprofile (128-D vector)", bg='#FEF3C7', border='#F59E0B')
    draw_box(ax, 0.68, 0.26, 0.26, 0.14, "D3: Attendance Store", "attendance, session records", bg='#FEF3C7', border='#F59E0B')
    draw_box(ax, 0.68, 0.04, 0.26, 0.14, "D4: Audit Log Store", "audit_auditlog ledger", bg='#FEF3C7', border='#F59E0B')

    # Connect Admin to Processes
    draw_arrow(ax, 0.19, 0.55, 0.28, 0.79, "Credentials")
    draw_arrow(ax, 0.19, 0.52, 0.28, 0.57, "Student Payload")
    draw_arrow(ax, 0.19, 0.50, 0.28, 0.33, "Manual Mark / Date Filter")
    draw_arrow(ax, 0.19, 0.45, 0.28, 0.11, "Export Request")

    # Connect Processes to Data Stores
    draw_arrow(ax, 0.53, 0.81, 0.68, 0.81, "Validate / Read")
    draw_arrow(ax, 0.53, 0.57, 0.68, 0.57, "Persist Profile & Face Data")
    draw_arrow(ax, 0.53, 0.33, 0.68, 0.33, "Query & Update Records")
    draw_arrow(ax, 0.53, 0.11, 0.68, 0.11, "Read Records & Append Audit")

    plt.tight_layout()
    fig.savefig(os.path.join(DIAGRAMS_DIR, 'diagram_03_dfd_level_1_admin.png'), dpi=300)
    plt.close(fig)

# -------------------------------------------------------------
# 4. DFD Level 1 Student
# -------------------------------------------------------------
def gen_dfd_level_1_student():
    fig, ax = plt.subplots(figsize=(10, 6), dpi=300)
    ax.set_facecolor(BG_COLOR)
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis('off')

    ax.text(0.5, 0.95, "Figure 7.3: DFD Level 1 — Student Portal Subsystem", ha='center', fontsize=12, fontweight='bold', color=PRIMARY_COLOR)

    # Student Entity
    draw_box(ax, 0.05, 0.40, 0.18, 0.22, "Student", "Role: STUDENT\n(Strictly Isolated)", bg='#EFF6FF', border='#3B82F6')

    # Processes
    draw_box(ax, 0.35, 0.70, 0.26, 0.16, "1.0 Student Auth", "Authenticate & Obtain JWT", bg='#F0FDF4', border='#22C55E')
    draw_box(ax, 0.35, 0.42, 0.26, 0.16, "2.0 Profile Controller", "Get Self Profile & Photo", bg='#F0FDF4', border='#22C55E')
    draw_box(ax, 0.35, 0.14, 0.26, 0.16, "3.0 Personal Attendance", "Query Own Records & Calendar", bg='#F0FDF4', border='#22C55E')

    # Data Stores
    draw_box(ax, 0.72, 0.70, 0.24, 0.15, "D1: User Accounts", "Verify Password Hash", bg='#FEF3C7', border='#F59E0B')
    draw_box(ax, 0.72, 0.42, 0.24, 0.15, "D2: StudentProfile", "Read-only Self Match", bg='#FEF3C7', border='#F59E0B')
    draw_box(ax, 0.72, 0.14, 0.24, 0.15, "D3: Attendance Store", "Filter: student=request.user", bg='#FEF3C7', border='#F59E0B')

    # Connections
    draw_arrow(ax, 0.23, 0.54, 0.35, 0.76, "Student Credentials")
    draw_arrow(ax, 0.23, 0.51, 0.35, 0.50, "Token Me Request")
    draw_arrow(ax, 0.23, 0.48, 0.35, 0.22, "History / Calendar Request")

    draw_arrow(ax, 0.61, 0.78, 0.72, 0.78, "Check Active Status")
    draw_arrow(ax, 0.61, 0.50, 0.72, 0.50, "Fetch Own Details")
    draw_arrow(ax, 0.61, 0.22, 0.72, 0.22, "Fetch Filtered Attendances")

    plt.tight_layout()
    fig.savefig(os.path.join(DIAGRAMS_DIR, 'diagram_04_dfd_level_1_student.png'), dpi=300)
    plt.close(fig)

# -------------------------------------------------------------
# 5. ER Diagram
# -------------------------------------------------------------
def gen_er_diagram():
    fig, ax = plt.subplots(figsize=(12, 8), dpi=300)
    ax.set_facecolor(BG_COLOR)
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis('off')

    ax.text(0.5, 0.96, "Figure 8.1: Entity-Relationship Diagram (Actual Database Schema)", ha='center', fontsize=12, fontweight='bold', color=PRIMARY_COLOR)

    # Tables
    # Department
    draw_box(ax, 0.04, 0.70, 0.24, 0.20, "Department", "id (PK, Auto)\nname (Char, Unique)\ncode (Char, Unique)\ndescription (Text)", bg='#EFF6FF', border='#3B82F6')

    # User
    draw_box(ax, 0.38, 0.70, 0.24, 0.22, "User (AbstractUser)", "id (PK, Auto)\nemail (EmailField, Unique)\nfull_name (CharField)\nrole [ADMIN|STUDENT]\ndepartment_id (FK)", bg='#EFF6FF', border='#3B82F6')

    # StudentProfile
    draw_box(ax, 0.72, 0.70, 0.25, 0.22, "StudentProfile", "id (PK, Auto)\nuser_id (1:1 FK -> User)\nstudent_id (Char, Unique)\ndepartment_id (FK)\nface_encoding (JSONField 128D)\nface_registered (Boolean)", bg='#F0FDF4', border='#22C55E')

    # Attendance
    draw_box(ax, 0.72, 0.32, 0.25, 0.24, "Attendance", "id (PK, Auto)\nstudent_id (FK -> StudentProfile)\ndate (DateField, Indexed)\ncheck_in_time (TimeField)\ncheck_out_time (TimeField, Null)\nstatus [PRESENT|ABSENT|LATE]\nconfidence (FloatField)\ncamera_id (FK, Null)", bg='#FDF4FF', border='#A855F7')

    # Camera
    draw_box(ax, 0.38, 0.35, 0.24, 0.20, "Camera", "id (PK, Auto)\nname (CharField)\nlocation (CharField)\ncamera_type (Choice)\nstatus [ONLINE|OFFLINE]\nstream_identifier (CharField)", bg='#FEF3C7', border='#F59E0B')

    # AuditLog
    draw_box(ax, 0.04, 0.35, 0.24, 0.20, "AuditLog", "id (PK, Auto)\nuser_id (FK -> User, Null)\naction (Choice Enum)\nentity_type (CharField)\nentity_id (CharField)\nmetadata (JSONField)\nip_address (GenericIPField)", bg='#FEF2F2', border='#EF4444')

    # RecognitionEvent
    draw_box(ax, 0.38, 0.05, 0.25, 0.18, "RecognitionEvent", "id (PK, Auto)\ncamera_id (FK -> Camera)\nstudent_id (FK, Null)\nstatus (CharField)\nconfidence (FloatField)\nlatency_ms (FloatField)", bg='#F1F5F9', border='#64748B')

    # Relationships
    draw_arrow(ax, 0.28, 0.80, 0.38, 0.80, "1 : N")
    draw_arrow(ax, 0.62, 0.80, 0.72, 0.80, "1 : 1")
    draw_arrow(ax, 0.84, 0.70, 0.84, 0.56, "1 : N")
    draw_arrow(ax, 0.62, 0.44, 0.72, 0.44, "N : 1")
    draw_arrow(ax, 0.38, 0.75, 0.20, 0.55, "1 : N")
    draw_arrow(ax, 0.50, 0.35, 0.50, 0.23, "1 : N")

    # Constraints text
    ax.text(0.85, 0.28, "Constraint: unique_together = ('student', 'date')", ha='center', fontsize=8, color=ACCENT_RED, style='italic')

    plt.tight_layout()
    fig.savefig(os.path.join(DIAGRAMS_DIR, 'diagram_05_er_diagram.png'), dpi=300)
    plt.close(fig)

# -------------------------------------------------------------
# 6. UML Use Case Diagram
# -------------------------------------------------------------
def gen_use_case_diagram():
    fig, ax = plt.subplots(figsize=(11, 7.5), dpi=300)
    ax.set_facecolor(BG_COLOR)
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis('off')

    ax.text(0.5, 0.96, "Figure 6.1: UML Use Case Diagram", ha='center', fontsize=12, fontweight='bold', color=PRIMARY_COLOR)

    # Boundary Box
    bound = patches.Rectangle((0.24, 0.05), 0.52, 0.86, facecolor='#FFFFFF', edgecolor='#64748B', linewidth=1.5, linestyle='--')
    ax.add_patch(bound)
    ax.text(0.5, 0.88, "Smart Attendance Boundary", ha='center', fontsize=9.5, fontweight='bold', color=TEXT_MUTED)

    # Actors
    draw_box(ax, 0.03, 0.65, 0.16, 0.16, "Administrator", "<<Actor>>", bg='#EFF6FF', border='#3B82F6')
    draw_box(ax, 0.03, 0.20, 0.16, 0.16, "Student", "<<Actor>>", bg='#EFF6FF', border='#3B82F6')
    draw_box(ax, 0.81, 0.45, 0.16, 0.16, "Vision Camera", "<<System Actor>>", bg='#FEF2F2', border='#EF4444')

    # Use Cases (Ovals)
    use_cases = [
        (0.5, 0.80, "UC1: Authenticate (Login/JWT)"),
        (0.5, 0.70, "UC2: Manage Students (CRUD)"),
        (0.5, 0.60, "UC3: Register Face Biometrics"),
        (0.5, 0.50, "UC4: Stream Frames & Recognize"),
        (0.5, 0.40, "UC5: Mark & Validate Attendance"),
        (0.5, 0.30, "UC6: View Self Attendance & Calendar"),
        (0.5, 0.20, "UC7: Export Attendance Reports"),
        (0.5, 0.10, "UC8: Audit & Camera Management"),
    ]

    for ux, uy, utext in use_cases:
        ellipse = patches.Ellipse((ux, uy), 0.38, 0.07, facecolor='#F8FAFC', edgecolor='#0284C7', linewidth=1.2, zorder=2)
        ax.add_patch(ellipse)
        ax.text(ux, uy, utext, ha='center', va='center', fontsize=8.5, fontweight='bold', color=TEXT_MAIN, zorder=3)

    # Admin Associations
    draw_arrow(ax, 0.19, 0.75, 0.31, 0.80, style='-')
    draw_arrow(ax, 0.19, 0.73, 0.31, 0.70, style='-')
    draw_arrow(ax, 0.19, 0.71, 0.31, 0.60, style='-')
    draw_arrow(ax, 0.19, 0.69, 0.31, 0.50, style='-')
    draw_arrow(ax, 0.19, 0.67, 0.31, 0.40, style='-')
    draw_arrow(ax, 0.19, 0.65, 0.31, 0.20, style='-')
    draw_arrow(ax, 0.19, 0.63, 0.31, 0.10, style='-')

    # Student Associations
    draw_arrow(ax, 0.19, 0.30, 0.31, 0.80, style='-')
    draw_arrow(ax, 0.19, 0.27, 0.31, 0.30, style='-')

    # Vision Camera Associations
    draw_arrow(ax, 0.81, 0.53, 0.69, 0.50, style='-')
    draw_arrow(ax, 0.81, 0.51, 0.69, 0.40, style='-')

    plt.tight_layout()
    fig.savefig(os.path.join(DIAGRAMS_DIR, 'diagram_06_use_case.png'), dpi=300)
    plt.close(fig)

# -------------------------------------------------------------
# 7. UML Class Diagram
# -------------------------------------------------------------
def gen_class_diagram():
    fig, ax = plt.subplots(figsize=(12, 8), dpi=300)
    ax.set_facecolor(BG_COLOR)
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis('off')

    ax.text(0.5, 0.96, "Figure 6.2: UML Class Diagram — Core Domain Model", ha='center', fontsize=12, fontweight='bold', color=PRIMARY_COLOR)

    # Classes
    draw_box(ax, 0.05, 0.55, 0.26, 0.35, "User", "- email: EmailField\n- full_name: CharField\n- role: UserRole\n- department: ForeignKey\n+ is_admin_role(): bool\n+ is_student_role(): bool", bg='#EFF6FF', border='#3B82F6')
    draw_box(ax, 0.38, 0.55, 0.26, 0.35, "StudentProfile", "- student_id: CharField\n- class_name: CharField\n- section: CharField\n- face_encoding: JSONField\n- face_registered: Boolean\n+ full_name(): str\n+ email(): str", bg='#F0FDF4', border='#22C55E')
    draw_box(ax, 0.71, 0.55, 0.25, 0.35, "Attendance", "- date: DateField\n- check_in_time: TimeField\n- check_out_time: TimeField\n- status: AttendanceStatus\n- confidence: FloatField\n- marked_manually: bool\n+ __str__(): str", bg='#FDF4FF', border='#A855F7')

    draw_box(ax, 0.05, 0.10, 0.26, 0.35, "FaceRecognitionProvider\n<<Abstract>>", "+ detect_faces(img): List[dict]\n+ extract_encodings(img): List[ndarray]\n+ compare_faces(known, cand): List[bool]\n+ compute_face_distance(): ndarray\n+ compute_confidence(dist): float", bg='#FEF3C7', border='#F59E0B')
    draw_box(ax, 0.38, 0.10, 0.26, 0.35, "RecognitionPipelineService", "- provider: Provider\n- threshold: float\n+ decode_base64_image(b64): ndarray\n+ check_image_quality(img): dict\n+ process_frame(frame, cam): dict\n+ register_face_from_frames(): dict", bg='#F1F5F9', border='#64748B')
    draw_box(ax, 0.71, 0.10, 0.25, 0.35, "AsyncRecognitionConsumer", "- camera_id: str\n- pipeline: PipelineService\n- is_processing_frame: bool\n+ connect(): void\n+ disconnect(code): void\n+ receive(text_data): void\n+ process_frame_async(): dict", bg='#FEF2F2', border='#EF4444')

    # Connectors
    draw_arrow(ax, 0.31, 0.72, 0.38, 0.72, "1 : 1")
    draw_arrow(ax, 0.64, 0.72, 0.71, 0.72, "1 : N")
    draw_arrow(ax, 0.31, 0.27, 0.38, 0.27, "implements / uses")
    draw_arrow(ax, 0.64, 0.27, 0.71, 0.27, "dispatches frames")
    draw_arrow(ax, 0.51, 0.45, 0.51, 0.55, "updates biometric")
    draw_arrow(ax, 0.75, 0.45, 0.75, 0.55, "creates records")

    plt.tight_layout()
    fig.savefig(os.path.join(DIAGRAMS_DIR, 'diagram_07_class_diagram.png'), dpi=300)
    plt.close(fig)

# -------------------------------------------------------------
# 8. Sequence Diagrams (Login, Face Registration, Recognition)
# -------------------------------------------------------------
def gen_seq_login():
    fig, ax = plt.subplots(figsize=(10, 6), dpi=300)
    ax.set_facecolor(BG_COLOR)
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis('off')

    ax.text(0.5, 0.95, "Figure 6.3: Sequence Diagram — Authentication & JWT Token Issuance", ha='center', fontsize=11, fontweight='bold', color=PRIMARY_COLOR)

    # Lifelines
    lifelines = [
        (0.12, "User / Browser"),
        (0.38, "React AuthStore"),
        (0.64, "TokenObtainView"),
        (0.88, "PostgreSQL / SQLite")
    ]
    for lx, lname in lifelines:
        draw_box(ax, lx - 0.10, 0.85, 0.20, 0.07, lname, bg='#FFFFFF', border='#64748B')
        ax.plot([lx, lx], [0.85, 0.10], color='#CBD5E1', linestyle='--', linewidth=1.5, zorder=1)

    # Messages
    steps = [
        (0.12, 0.38, 0.78, "1. Enters email/pass & clicks Sign In"),
        (0.38, 0.64, 0.68, "2. POST /api/auth/login/ {email, password}"),
        (0.64, 0.88, 0.58, "3. Query User & verify Argon2/PBKDF2 hash"),
        (0.88, 0.64, 0.48, "4. User record + role valid"),
        (0.64, 0.38, 0.38, "5. 200 OK {access, refresh, user_payload}"),
        (0.38, 0.12, 0.28, "6. Store JWT in localStorage & set Zustand"),
        (0.12, 0.12, 0.18, "7. Navigate to /admin/dashboard or /student/dashboard")
    ]
    for x1, x2, y, text in steps:
        if x1 != x2:
            draw_arrow(ax, x1, y, x2, y, text)
        else:
            # self call
            ax.annotate(text, xy=(x1 + 0.02, y), xytext=(x1 + 0.15, y),
                        fontsize=8, color='#0F172A', backgroundcolor='#FFFFFF', zorder=5)

    plt.tight_layout()
    fig.savefig(os.path.join(DIAGRAMS_DIR, 'diagram_08_seq_login.png'), dpi=300)
    plt.close(fig)

def gen_seq_face_registration():
    fig, ax = plt.subplots(figsize=(10, 6.5), dpi=300)
    ax.set_facecolor(BG_COLOR)
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis('off')

    ax.text(0.5, 0.95, "Figure 6.5: Sequence Diagram — Face Biometric Registration", ha='center', fontsize=11, fontweight='bold', color=PRIMARY_COLOR)

    lifelines = [
        (0.12, "Admin / Webcam"),
        (0.38, "FaceCaptureModal"),
        (0.64, "RecognitionPipeline"),
        (0.88, "StudentProfile DB")
    ]
    for lx, lname in lifelines:
        draw_box(ax, lx - 0.10, 0.85, 0.20, 0.07, lname, bg='#FFFFFF', border='#64748B')
        ax.plot([lx, lx], [0.85, 0.08], color='#CBD5E1', linestyle='--', linewidth=1.5, zorder=1)

    steps = [
        (0.12, 0.38, 0.78, "1. Captures 5 webcam bursts"),
        (0.38, 0.64, 0.68, "2. POST /api/students/{id}/face/register/ {frames}"),
        (0.64, 0.64, 0.58, "3. Decode base64, detect face, quality checks"),
        (0.64, 0.64, 0.48, "4. Extract 128-D embeddings & average vectors"),
        (0.64, 0.88, 0.38, "5. Save face_encoding & face_registered=True"),
        (0.88, 0.64, 0.28, "6. DB Commit Success"),
        (0.64, 0.38, 0.20, "7. 200 OK {message, samples_processed: 5}"),
        (0.38, 0.12, 0.12, "8. Render success toast & mark badge Active")
    ]
    for x1, x2, y, text in steps:
        if x1 != x2:
            draw_arrow(ax, x1, y, x2, y, text)
        else:
            ax.annotate(text, xy=(x1 + 0.02, y), xytext=(x1 + 0.05, y),
                        fontsize=7.5, color='#0F172A', backgroundcolor='#FFFFFF', zorder=5)

    plt.tight_layout()
    fig.savefig(os.path.join(DIAGRAMS_DIR, 'diagram_10_seq_face_registration.png'), dpi=300)
    plt.close(fig)

def gen_seq_recognition():
    fig, ax = plt.subplots(figsize=(10.5, 7), dpi=300)
    ax.set_facecolor(BG_COLOR)
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis('off')

    ax.text(0.5, 0.96, "Figure 6.6: Sequence Diagram — Real-Time WebSocket Recognition & Marking", ha='center', fontsize=11, fontweight='bold', color=PRIMARY_COLOR)

    lifelines = [
        (0.10, "LiveCameraHUD"),
        (0.35, "AsyncConsumer"),
        (0.62, "RecognitionPipeline"),
        (0.90, "Attendance DB")
    ]
    for lx, lname in lifelines:
        draw_box(ax, lx - 0.09, 0.86, 0.18, 0.07, lname, bg='#FFFFFF', border='#64748B')
        ax.plot([lx, lx], [0.86, 0.08], color='#CBD5E1', linestyle='--', linewidth=1.5, zorder=1)

    steps = [
        (0.10, 0.35, 0.80, "1. WS Connect ws://.../ws/recognition/default/"),
        (0.35, 0.10, 0.74, "2. {type: 'connection_status', state: 'CAMERA_CONNECTED'}"),
        (0.10, 0.35, 0.66, "3. {type: 'frame', image: 'data:image/jpeg;base64...'}"),
        (0.35, 0.62, 0.58, "4. process_frame(image_b64)"),
        (0.62, 0.62, 0.50, "5. Decode -> Lighting Check -> 1 Face Detected"),
        (0.62, 0.62, 0.42, "6. Extract 128-D vector & compute Euclidean dist <= 0.6"),
        (0.62, 0.90, 0.34, "7. Check existing attendance & insert new record"),
        (0.90, 0.62, 0.26, "8. Created Attendance(status=PRESENT, confidence=0.96)"),
        (0.62, 0.35, 0.18, "9. Return recognition_result dict"),
        (0.35, 0.10, 0.11, "10. WS Send {type: 'recognition_result', attendance_marked: true}")
    ]
    for x1, x2, y, text in steps:
        if x1 != x2:
            draw_arrow(ax, x1, y, x2, y, text)
        else:
            ax.annotate(text, xy=(x1 + 0.02, y), xytext=(x1 + 0.05, y),
                        fontsize=7.5, color='#0F172A', backgroundcolor='#FFFFFF', zorder=5)

    plt.tight_layout()
    fig.savefig(os.path.join(DIAGRAMS_DIR, 'diagram_11_seq_face_recognition.png'), dpi=300)
    plt.close(fig)

# -------------------------------------------------------------
# 9. Activity Diagram — Face Recognition Lifecycle
# -------------------------------------------------------------
def gen_activity_face_recog():
    fig, ax = plt.subplots(figsize=(10, 7.5), dpi=300)
    ax.set_facecolor(BG_COLOR)
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis('off')

    ax.text(0.5, 0.96, "Figure 6.9: UML Activity Diagram — Face Recognition & Quality Pipeline", ha='center', fontsize=11, fontweight='bold', color=PRIMARY_COLOR)

    # Start node
    start = patches.Circle((0.5, 0.90), 0.02, facecolor='#0F172A', edgecolor='#0F172A', zorder=3)
    ax.add_patch(start)

    draw_arrow(ax, 0.5, 0.88, 0.5, 0.83)
    draw_box(ax, 0.35, 0.77, 0.30, 0.06, "Receive Video Frame (Base64)", bg='#EFF6FF', border='#3B82F6')

    draw_arrow(ax, 0.5, 0.77, 0.5, 0.72)
    draw_box(ax, 0.35, 0.66, 0.30, 0.06, "Decode OpenCV & Resize <= 1024px", bg='#EFF6FF', border='#3B82F6')

    draw_arrow(ax, 0.5, 0.66, 0.5, 0.61)
    draw_box(ax, 0.35, 0.55, 0.30, 0.06, "Quality & Lighting Check (30 <= B <= 240)", bg='#EFF6FF', border='#3B82F6')

    # Decision: Lighting
    draw_arrow(ax, 0.5, 0.55, 0.5, 0.49)
    draw_box(ax, 0.35, 0.43, 0.30, 0.06, "Detect Faces (Haar / dlib)", bg='#EFF6FF', border='#3B82F6')

    # Decision Face Count
    draw_arrow(ax, 0.5, 0.43, 0.5, 0.36)
    draw_box(ax, 0.36, 0.30, 0.28, 0.06, "Validate Single Face in Frame", bg='#FEF3C7', border='#F59E0B')

    draw_arrow(ax, 0.5, 0.30, 0.5, 0.23)
    draw_box(ax, 0.33, 0.17, 0.34, 0.06, "Compute 128-D Embedding & Distance", bg='#F0FDF4', border='#22C55E')

    draw_arrow(ax, 0.5, 0.17, 0.5, 0.10)
    draw_box(ax, 0.33, 0.04, 0.34, 0.06, "Evaluate Distance <= 0.6 Threshold", bg='#F0FDF4', border='#22C55E')

    # Branches to error
    draw_arrow(ax, 0.65, 0.58, 0.82, 0.58, "Too Dark/Bright")
    draw_box(ax, 0.75, 0.53, 0.22, 0.05, "LOW_QUALITY Error", bg='#FEF2F2', border='#EF4444')

    draw_arrow(ax, 0.64, 0.33, 0.82, 0.33, "Count != 1")
    draw_box(ax, 0.75, 0.28, 0.22, 0.05, "MULTIPLE_FACES / NONE", bg='#FEF2F2', border='#EF4444')

    draw_arrow(ax, 0.67, 0.07, 0.82, 0.07, "Dist > 0.6")
    draw_box(ax, 0.75, 0.04, 0.22, 0.05, "UNKNOWN_FACE Error", bg='#FEF2F2', border='#EF4444')

    plt.tight_layout()
    fig.savefig(os.path.join(DIAGRAMS_DIR, 'diagram_14_activity_face_recognition.png'), dpi=300)
    plt.close(fig)

# -------------------------------------------------------------
# 10. Deployment Diagram
# -------------------------------------------------------------
def gen_deployment_diagram():
    fig, ax = plt.subplots(figsize=(10.5, 6.5), dpi=300)
    ax.set_facecolor(BG_COLOR)
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis('off')

    ax.text(0.5, 0.95, "Figure 6.12: UML Deployment Diagram", ha='center', fontsize=12, fontweight='bold', color=PRIMARY_COLOR)

    # 3D Node boxes
    draw_box(ax, 0.05, 0.40, 0.26, 0.46, "<<Device>>\nClient Workstation / Tablet", "OS: Windows / macOS / Linux\n\n<<Execution Env>>\nChromium / WebGL Browser\n- React 18 SPA\n- Three.js 3D Canvas\n- Web Audio & Camera Feed", bg='#EFF6FF', border='#3B82F6')

    draw_box(ax, 0.38, 0.40, 0.28, 0.46, "<<Device>>\nApp Server / Container", "Docker / Linux Host\n\n<<Execution Env>>\nDaphne ASGI Server (:8000)\n- Python 3.11 Runtime\n- Django 5 Framework\n- OpenCV & dlib Embedder\n- Channels In-Memory / Redis", bg='#F0FDF4', border='#22C55E')

    draw_box(ax, 0.72, 0.40, 0.24, 0.46, "<<Device>>\nDatabase Host", "Docker / Linux Host\n\n<<Execution Env>>\nPostgreSQL 15 Server (:5432)\n/ SQLite3 Dev Database\n- Relational Tables\n- Unique Index Enforcers\n- JSON Vector Storage", bg='#FEF3C7', border='#F59E0B')

    # Connections
    draw_arrow(ax, 0.31, 0.65, 0.38, 0.65, "HTTP / HTTPS (:80, :443)\nWebSocket ws:// (:8000)")
    draw_arrow(ax, 0.66, 0.65, 0.72, 0.65, "TCP / IP (:5432)\nSQL Queries")

    # Reverse Proxy note
    draw_box(ax, 0.20, 0.12, 0.60, 0.16, "Production Reverse Proxy (Nginx Container)", "Terminates SSL, routes /api and /ws to Daphne (:8000), and serves static React assets (:80)", bg='#FFFFFF', border='#94A3B8')
    draw_arrow(ax, 0.50, 0.28, 0.50, 0.40, "Proxy Pass")

    plt.tight_layout()
    fig.savefig(os.path.join(DIAGRAMS_DIR, 'diagram_17_deployment_diagram.png'), dpi=300)
    plt.close(fig)

# Generate all
print("Generating diagrams...")
gen_system_architecture()
gen_dfd_level_0()
gen_dfd_level_1_admin()
gen_dfd_level_1_student()
gen_er_diagram()
gen_use_case_diagram()
gen_class_diagram()
gen_seq_login()
gen_seq_face_registration()
gen_seq_recognition()
gen_activity_face_recog()
gen_deployment_diagram()
print("All diagrams generated successfully!")
