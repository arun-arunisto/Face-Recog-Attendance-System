import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches

DIAGRAMS_DIR = os.path.join(os.path.dirname(__file__), 'diagrams')
os.makedirs(DIAGRAMS_DIR, exist_ok=True)

BG_COLOR = '#F8FAFC'
PRIMARY_COLOR = '#1E293B'
BOX_BG = '#FFFFFF'
BOX_BORDER = '#94A3B8'
TEXT_MAIN = '#0F172A'
TEXT_MUTED = '#475569'

def draw_box(ax, x, y, w, h, title, subtitle="", bg=BOX_BG, border=BOX_BORDER, title_color=TEXT_MAIN, corner_radius=0.03):
    rect = patches.FancyBboxPatch(
        (x, y), w, h,
        boxstyle=f"round,pad=0.02,rounding_size={corner_radius}",
        facecolor=bg, edgecolor=border, linewidth=1.5, zorder=2
    )
    ax.add_patch(rect)
    if subtitle:
        ax.text(x + w/2, y + h*0.62, title, ha='center', va='center', fontsize=9.5, fontweight='bold', color=title_color, zorder=3)
        ax.text(x + w/2, y + h*0.28, subtitle, ha='center', va='center', fontsize=8, color=TEXT_MUTED, zorder=3)
    else:
        ax.text(x + w/2, y + h/2, title, ha='center', va='center', fontsize=9, fontweight='bold', color=title_color, zorder=3)

def draw_arrow(ax, x1, y1, x2, y2, label="", color='#64748B', style='->', lw=1.5):
    ax.annotate(
        '', xy=(x2, y2), xytext=(x1, y1),
        arrowprops=dict(arrowstyle=style, color=color, lw=lw, shrinkA=3, shrinkB=3),
        zorder=4
    )
    if label:
        mx, my = (x1 + x2)/2, (y1 + y2)/2
        ax.text(mx, my + 0.02, label, ha='center', va='bottom', fontsize=7.5, color='#334155', backgroundcolor='#FFFFFF', zorder=5)

def gen_seq_student_registration():
    fig, ax = plt.subplots(figsize=(10, 6.5), dpi=300)
    ax.set_facecolor(BG_COLOR)
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis('off')

    ax.text(0.5, 0.95, "Figure 6.4: Sequence Diagram — Student Profile Registration", ha='center', fontsize=11, fontweight='bold', color=PRIMARY_COLOR)

    lifelines = [
        (0.12, "Administrator"),
        (0.38, "StudentNewPage"),
        (0.64, "StudentViewSet"),
        (0.88, "PostgreSQL / DB")
    ]
    for lx, lname in lifelines:
        draw_box(ax, lx - 0.10, 0.85, 0.20, 0.07, lname, bg='#FFFFFF', border='#64748B')
        ax.plot([lx, lx], [0.85, 0.08], color='#CBD5E1', linestyle='--', linewidth=1.5, zorder=1)

    steps = [
        (0.12, 0.38, 0.78, "1. Enters student ID, name, email, department, class"),
        (0.38, 0.64, 0.68, "2. POST /api/students/ {student_id, full_name, email...}"),
        (0.64, 0.64, 0.58, "3. IsAdminUserRole permission check & validation"),
        (0.64, 0.88, 0.48, "4. Create User(role=STUDENT) & StudentProfile"),
        (0.88, 0.64, 0.38, "5. Profile Record Created"),
        (0.64, 0.64, 0.28, "6. log_audit_event(STUDENT_CREATE)"),
        (0.64, 0.38, 0.18, "7. 201 Created {StudentProfileSerializer.data}"),
        (0.38, 0.12, 0.10, "8. Display student created toast & redirect to list")
    ]
    for x1, x2, y, text in steps:
        if x1 != x2:
            draw_arrow(ax, x1, y, x2, y, text)
        else:
            ax.annotate(text, xy=(x1 + 0.02, y), xytext=(x1 + 0.05, y),
                        fontsize=7.5, color='#0F172A', backgroundcolor='#FFFFFF', zorder=5)

    plt.tight_layout()
    fig.savefig(os.path.join(DIAGRAMS_DIR, 'diagram_09_seq_student_registration.png'), dpi=300)
    plt.close(fig)

def gen_seq_attendance_marking():
    fig, ax = plt.subplots(figsize=(10.5, 6.5), dpi=300)
    ax.set_facecolor(BG_COLOR)
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis('off')

    ax.text(0.5, 0.95, "Figure 6.7: Sequence Diagram — Manual Attendance Override & Marking", ha='center', fontsize=11, fontweight='bold', color=PRIMARY_COLOR)

    lifelines = [
        (0.12, "Administrator"),
        (0.38, "AttendanceModal"),
        (0.64, "MarkAttendanceManualView"),
        (0.88, "Attendance Table")
    ]
    for lx, lname in lifelines:
        draw_box(ax, lx - 0.10, 0.85, 0.20, 0.07, lname, bg='#FFFFFF', border='#64748B')
        ax.plot([lx, lx], [0.85, 0.08], color='#CBD5E1', linestyle='--', linewidth=1.5, zorder=1)

    steps = [
        (0.12, 0.38, 0.78, "1. Selects student, date, status (PRESENT/LATE/ABSENT), notes"),
        (0.38, 0.64, 0.68, "2. POST /api/attendance/mark/ {student_id, date, status, notes}"),
        (0.64, 0.64, 0.58, "3. Validate Admin permission & student existence"),
        (0.64, 0.88, 0.48, "4. update_or_create(student, date, defaults={marked_manually: True})"),
        (0.88, 0.64, 0.38, "5. Return attendance instance"),
        (0.64, 0.64, 0.28, "6. log_audit_event(ATTENDANCE_MARK / UPDATE)"),
        (0.64, 0.38, 0.18, "7. 200/201 OK {AttendanceSerializer.data}"),
        (0.38, 0.12, 0.10, "8. Refresh table & show success notification")
    ]
    for x1, x2, y, text in steps:
        if x1 != x2:
            draw_arrow(ax, x1, y, x2, y, text)
        else:
            ax.annotate(text, xy=(x1 + 0.02, y), xytext=(x1 + 0.05, y),
                        fontsize=7.5, color='#0F172A', backgroundcolor='#FFFFFF', zorder=5)

    plt.tight_layout()
    fig.savefig(os.path.join(DIAGRAMS_DIR, 'diagram_12_seq_attendance_marking.png'), dpi=300)
    plt.close(fig)

def gen_seq_report_generation():
    fig, ax = plt.subplots(figsize=(10, 6.5), dpi=300)
    ax.set_facecolor(BG_COLOR)
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis('off')

    ax.text(0.5, 0.95, "Figure 6.8: Sequence Diagram — Attendance Report Generation & Streaming", ha='center', fontsize=11, fontweight='bold', color=PRIMARY_COLOR)

    lifelines = [
        (0.12, "Administrator"),
        (0.38, "ReportsPage UI"),
        (0.64, "AttendanceXLSXReportView"),
        (0.88, "openpyxl Engine")
    ]
    for lx, lname in lifelines:
        draw_box(ax, lx - 0.10, 0.85, 0.20, 0.07, lname, bg='#FFFFFF', border='#64748B')
        ax.plot([lx, lx], [0.85, 0.08], color='#CBD5E1', linestyle='--', linewidth=1.5, zorder=1)

    steps = [
        (0.12, 0.38, 0.78, "1. Selects date range, dept, format (XLSX/CSV)"),
        (0.38, 0.64, 0.68, "2. GET /api/reports/attendance.xlsx?start_date=..."),
        (0.64, 0.64, 0.58, "3. Query filtered attendance queryset with relations"),
        (0.64, 0.88, 0.48, "4. build_attendance_xlsx_response(qs, filename)"),
        (0.88, 0.88, 0.38, "5. Format styled headers, status colors, KPI summary"),
        (0.88, 0.64, 0.28, "6. Return binary HttpResponse(application/vnd.ms-excel)"),
        (0.64, 0.64, 0.20, "7. log_audit_event(REPORT_EXPORT)"),
        (0.64, 0.38, 0.12, "8. Stream binary file payload with Content-Disposition"),
        (0.38, 0.12, 0.05, "9. Browser triggers automatic file download")
    ]
    for x1, x2, y, text in steps:
        if x1 != x2:
            draw_arrow(ax, x1, y, x2, y, text)
        else:
            ax.annotate(text, xy=(x1 + 0.02, y), xytext=(x1 + 0.05, y),
                        fontsize=7.5, color='#0F172A', backgroundcolor='#FFFFFF', zorder=5)

    plt.tight_layout()
    fig.savefig(os.path.join(DIAGRAMS_DIR, 'diagram_13_seq_report_generation.png'), dpi=300)
    plt.close(fig)

def gen_activity_attendance():
    fig, ax = plt.subplots(figsize=(10, 7.5), dpi=300)
    ax.set_facecolor(BG_COLOR)
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis('off')

    ax.text(0.5, 0.96, "Figure 6.10: UML Activity Diagram — Attendance Marking & Duplicate Protection", ha='center', fontsize=11, fontweight='bold', color=PRIMARY_COLOR)

    start = patches.Circle((0.5, 0.90), 0.02, facecolor='#0F172A', edgecolor='#0F172A', zorder=3)
    ax.add_patch(start)

    draw_arrow(ax, 0.5, 0.88, 0.5, 0.82)
    draw_box(ax, 0.32, 0.76, 0.36, 0.06, "Face Matched with Student (dist <= 0.6)", bg='#EFF6FF', border='#3B82F6')

    draw_arrow(ax, 0.5, 0.76, 0.5, 0.70)
    draw_box(ax, 0.30, 0.64, 0.40, 0.06, "Query Attendance where student=S & date=Today", bg='#EFF6FF', border='#3B82F6')

    draw_arrow(ax, 0.5, 0.64, 0.5, 0.57)
    draw_box(ax, 0.35, 0.51, 0.30, 0.06, "Record Exists for Today?", bg='#FEF3C7', border='#F59E0B')

    # Path 1: Record already exists
    draw_arrow(ax, 0.65, 0.54, 0.80, 0.54, "Yes (Exists)")
    draw_box(ax, 0.70, 0.41, 0.26, 0.08, "Check Cooldown (>600s)\n& check_out_time is null?", bg='#FDF4FF', border='#C084FC')

    draw_arrow(ax, 0.83, 0.41, 0.83, 0.31, "Yes: Record Check-out")
    draw_box(ax, 0.70, 0.24, 0.26, 0.06, "Update check_out_time=Now", bg='#F0FDF4', border='#22C55E')

    draw_arrow(ax, 0.70, 0.45, 0.58, 0.45, "No: Within Cooldown")
    draw_box(ax, 0.44, 0.38, 0.24, 0.06, "Status: ALREADY_MARKED\n(Prevent Duplication)", bg='#FEF2F2', border='#EF4444')

    # Path 2: New Record
    draw_arrow(ax, 0.35, 0.54, 0.18, 0.54, "No (New)")
    draw_box(ax, 0.06, 0.41, 0.26, 0.08, "Check Check-In Time\nvs Cutoff (09:30 AM)", bg='#EFF6FF', border='#3B82F6')

    draw_arrow(ax, 0.19, 0.41, 0.19, 0.30)
    draw_box(ax, 0.05, 0.24, 0.28, 0.06, "Time <= 09:30 ? PRESENT : LATE", bg='#F0FDF4', border='#22C55E')

    draw_arrow(ax, 0.19, 0.24, 0.19, 0.14)
    draw_box(ax, 0.05, 0.07, 0.28, 0.07, "Insert Attendance Record\n& log_audit_event", bg='#F0FDF4', border='#22C55E')

    plt.tight_layout()
    fig.savefig(os.path.join(DIAGRAMS_DIR, 'diagram_15_activity_attendance.png'), dpi=300)
    plt.close(fig)

def gen_component_diagram():
    fig, ax = plt.subplots(figsize=(11, 7), dpi=300)
    ax.set_facecolor(BG_COLOR)
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis('off')

    ax.text(0.5, 0.95, "Figure 6.11: UML Component Diagram", ha='center', fontsize=12, fontweight='bold', color=PRIMARY_COLOR)

    # Subsystem 1: Frontend SPA
    draw_box(ax, 0.04, 0.45, 0.28, 0.44, "<<Component>>\nFrontend SPA (React 18)", "UI Modules:\n- AppShell & Nav Router\n- Three.js 3D Visualizer\n- LiveCameraHUD Scanner\n- TanStack Query Manager\n- Zustand State Store", bg='#EFF6FF', border='#3B82F6')

    # Subsystem 2: Backend ASGI Core
    draw_box(ax, 0.36, 0.45, 0.30, 0.44, "<<Component>>\nBackend Core (Django 5)", "Service Controllers:\n- SimpleJWT Auth Engine\n- Async WebSocket Consumer\n- RecognitionPipelineService\n- Attendance Verification\n- Report Builder (openpyxl)", bg='#F0FDF4', border='#22C55E')

    # Subsystem 3: Biometric Vision Provider
    draw_box(ax, 0.70, 0.45, 0.26, 0.44, "<<Component>>\nBiometric Provider", "Vision Engines:\n- RealFaceRecognitionProvider\n- OpenCV Cascade / Haar\n- dlib ResNet Embedder\n- DevelopmentMockProvider", bg='#FDF4FF', border='#A855F7')

    # Data layer
    draw_box(ax, 0.36, 0.08, 0.30, 0.25, "<<Component>>\nPersistence Tier", "Database Storage:\n- PostgreSQL 15 / SQLite3\n- Relational Models & Indexes\n- User, Student, Attendance\n- AuditLog, Cameras", bg='#FEF3C7', border='#F59E0B')

    # Connections
    draw_arrow(ax, 0.32, 0.70, 0.36, 0.70, "REST / WebSockets")
    draw_arrow(ax, 0.66, 0.70, 0.70, 0.70, "Biometric Delegate")
    draw_arrow(ax, 0.51, 0.45, 0.51, 0.33, "ORM Queries / Django DB")

    plt.tight_layout()
    fig.savefig(os.path.join(DIAGRAMS_DIR, 'diagram_16_component_diagram.png'), dpi=300)
    plt.close(fig)

def gen_face_recog_flowchart():
    fig, ax = plt.subplots(figsize=(10, 8), dpi=300)
    ax.set_facecolor(BG_COLOR)
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis('off')

    ax.text(0.5, 0.96, "Figure 11.1: Detailed Face Recognition Pipeline Flowchart", ha='center', fontsize=11, fontweight='bold', color=PRIMARY_COLOR)

    nodes = [
        (0.5, 0.90, "Start Frame Reception"),
        (0.5, 0.81, "Base64 Decoding & RGB Conversion"),
        (0.5, 0.72, "Image Quality Check (Brightness 30-240)"),
        (0.5, 0.63, "Face Detection (OpenCV / dlib)"),
        (0.5, 0.54, "Face Count Validation (Count == 1)"),
        (0.5, 0.45, "Extract 128-Dimensional Vector"),
        (0.5, 0.36, "Calculate Euclidean Distances (Known vs Candidate)"),
        (0.5, 0.27, "Select Minimum Distance Student"),
        (0.5, 0.18, "Distance <= Threshold (0.6) ?"),
        (0.5, 0.08, "Identity Verified & Trigger Attendance")
    ]
    for i in range(len(nodes)):
        x, y, text = nodes[i]
        bg = '#F0FDF4' if i in [0, 9] else ('#FEF3C7' if '?' in text or 'Validation' in text else '#EFF6FF')
        border = '#22C55E' if i in [0, 9] else ('#F59E0B' if '?' in text or 'Validation' in text else '#3B82F6')
        draw_box(ax, 0.25, y - 0.03, 0.50, 0.06, text, bg=bg, border=border)
        if i < len(nodes) - 1:
            draw_arrow(ax, 0.5, y - 0.03, 0.5, nodes[i+1][1] + 0.03)

    # Rejection exits
    draw_arrow(ax, 0.75, 0.72, 0.88, 0.72, "Low Light")
    draw_box(ax, 0.82, 0.69, 0.16, 0.05, "LOW_QUALITY", bg='#FEF2F2', border='#EF4444')

    draw_arrow(ax, 0.75, 0.54, 0.88, 0.54, "Count != 1")
    draw_box(ax, 0.82, 0.51, 0.16, 0.05, "REJECT_FRAME", bg='#FEF2F2', border='#EF4444')

    draw_arrow(ax, 0.75, 0.18, 0.88, 0.18, "Dist > 0.6")
    draw_box(ax, 0.82, 0.15, 0.16, 0.05, "UNKNOWN_FACE", bg='#FEF2F2', border='#EF4444')

    plt.tight_layout()
    fig.savefig(os.path.join(DIAGRAMS_DIR, 'diagram_18_face_recognition_flowchart.png'), dpi=300)
    plt.close(fig)

def gen_attendance_flowchart():
    fig, ax = plt.subplots(figsize=(10, 8), dpi=300)
    ax.set_facecolor(BG_COLOR)
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis('off')

    ax.text(0.5, 0.96, "Figure 12.1: Attendance Engine Workflow & Status Transition Flowchart", ha='center', fontsize=11, fontweight='bold', color=PRIMARY_COLOR)

    draw_box(ax, 0.30, 0.88, 0.40, 0.06, "Attendance Event Initiated (Live / Manual)", bg='#EFF6FF', border='#3B82F6')
    draw_arrow(ax, 0.50, 0.88, 0.50, 0.81)

    draw_box(ax, 0.28, 0.75, 0.44, 0.06, "Lookup Attendance(student, date=Today)", bg='#EFF6FF', border='#3B82F6')
    draw_arrow(ax, 0.50, 0.75, 0.50, 0.67)

    draw_box(ax, 0.32, 0.61, 0.36, 0.06, "Does Record Already Exist?", bg='#FEF3C7', border='#F59E0B')

    # Path A: Exists
    draw_arrow(ax, 0.68, 0.64, 0.82, 0.64, "Yes")
    draw_box(ax, 0.70, 0.50, 0.26, 0.08, "Check Duration\n(Now - CheckIn) > 10 min?", bg='#FDF4FF', border='#C084FC')

    draw_arrow(ax, 0.83, 0.50, 0.83, 0.38, "Yes & No CheckOut")
    draw_box(ax, 0.70, 0.31, 0.26, 0.07, "Record Check-Out Time\n& Set Status Updated", bg='#F0FDF4', border='#22C55E')

    draw_arrow(ax, 0.70, 0.54, 0.56, 0.54, "No")
    draw_box(ax, 0.42, 0.47, 0.24, 0.06, "ALREADY_MARKED\n(No Duplication)", bg='#FEF2F2', border='#EF4444')

    # Path B: New
    draw_arrow(ax, 0.32, 0.64, 0.18, 0.64, "No")
    draw_box(ax, 0.06, 0.50, 0.25, 0.08, "Evaluate Check-In Time\nCutoff: 09:30 AM", bg='#EFF6FF', border='#3B82F6')

    draw_arrow(ax, 0.18, 0.50, 0.18, 0.38)
    draw_box(ax, 0.06, 0.31, 0.25, 0.07, "Time <= 09:30 ?\nPRESENT : LATE", bg='#F0FDF4', border='#22C55E')

    draw_arrow(ax, 0.18, 0.31, 0.18, 0.19)
    draw_box(ax, 0.06, 0.12, 0.25, 0.07, "Insert Attendance Record\n+ Confidence Score", bg='#F0FDF4', border='#22C55E')

    # Merge into audit
    draw_arrow(ax, 0.31, 0.15, 0.45, 0.15)
    draw_arrow(ax, 0.70, 0.34, 0.55, 0.17)
    draw_box(ax, 0.40, 0.03, 0.24, 0.06, "Log Audit Ledger\n& Emit WS Notification", bg='#FEF3C7', border='#F59E0B')

    plt.tight_layout()
    fig.savefig(os.path.join(DIAGRAMS_DIR, 'diagram_19_attendance_flowchart.png'), dpi=300)
    plt.close(fig)

print("Generating remaining diagrams...")
gen_seq_student_registration()
gen_seq_attendance_marking()
gen_seq_report_generation()
gen_activity_attendance()
gen_component_diagram()
gen_face_recog_flowchart()
gen_attendance_flowchart()
print("All remaining diagrams generated successfully!")
