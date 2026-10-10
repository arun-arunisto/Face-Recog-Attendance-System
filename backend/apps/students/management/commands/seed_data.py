import random
from datetime import datetime, timedelta, time
import numpy as np
from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.accounts.models import User, UserRole, Department
from apps.students.models import StudentProfile, ClassSection
from apps.attendance.models import Attendance, AttendanceStatus, AttendanceSession
from apps.cameras.models import Camera, CameraStatus, CameraType
from apps.audit.models import AuditLog, AuditAction

class Command(BaseCommand):
    help = 'Seeds initial departments, admin account, 12 students, cameras, and 30-day attendance history.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("==> Seeding database for Smart Face Attendance System..."))

        # 1. Departments
        dept_data = [
            {"name": "Computer Science & Engineering", "code": "CSE", "description": "School of Computing"},
            {"name": "Electronics & Communication", "code": "ECE", "description": "School of Electrical Sciences"},
            {"name": "Information Technology", "code": "IT", "description": "Software & Information Systems"},
            {"name": "Mechanical Engineering", "code": "ME", "description": "School of Mechanical Sciences"},
        ]
        departments = {}
        for d in dept_data:
            dept, created = Department.objects.get_or_create(code=d['code'], defaults=d)
            departments[d['code']] = dept
            if created:
                self.stdout.write(f"  Created Department: {dept.name}")

        # 2. Admin User
        admin_email = "admin@example.com"
        admin_pass = "Admin@123456"
        admin_user, created = User.objects.get_or_create(
            email=admin_email,
            defaults={
                "username": admin_email,
                "full_name": "Chief Administrator",
                "role": UserRole.ADMIN,
                "is_staff": True,
                "is_superuser": True,
                "department": departments["CSE"],
            }
        )
        if created:
            admin_user.set_password(admin_pass)
            admin_user.save()
            self.stdout.write(self.style.SUCCESS(f"  Created Admin: {admin_email} / {admin_pass}"))
        else:
            admin_user.set_password(admin_pass)
            admin_user.save()

        # 3. Cameras
        cameras_data = [
            {"name": "Main Entrance Gate A", "location": "Academic Block Lobby", "camera_type": CameraType.WEBCAM, "status": CameraStatus.ONLINE, "stream_identifier": "default"},
            {"name": "CS Lab Alpha Cam", "location": "CS Building Room 204", "camera_type": CameraType.IP_CAMERA, "status": CameraStatus.ONLINE, "stream_identifier": "cam_cslab"},
            {"name": "Central Library Turnstile", "location": "Library Ground Floor", "camera_type": CameraType.RTSP, "status": CameraStatus.OFFLINE, "stream_identifier": "cam_lib"},
        ]
        cameras = []
        for c in cameras_data:
            cam, _ = Camera.objects.get_or_create(name=c['name'], defaults=c)
            cameras.append(cam)

        # 4. Students (12 students)
        student_roster = [
            {"id": "STU-2026-001", "name": "Arun Kumar", "email": "arun.kumar@example.com", "dept": "CSE", "class": "CS-4A", "section": "A", "registered": True},
            {"id": "STU-2026-002", "name": "Priya Sharma", "email": "priya.sharma@example.com", "dept": "CSE", "class": "CS-4A", "section": "A", "registered": True},
            {"id": "STU-2026-003", "name": "Rahul Verma", "email": "rahul.verma@example.com", "dept": "IT", "class": "IT-3B", "section": "B", "registered": True},
            {"id": "STU-2026-004", "name": "Sneha Patel", "email": "sneha.patel@example.com", "dept": "ECE", "class": "EC-2A", "section": "A", "registered": True},
            {"id": "STU-2026-005", "name": "Vikram Singh", "email": "vikram.singh@example.com", "dept": "ME", "class": "ME-3A", "section": "A", "registered": True},
            {"id": "STU-2026-006", "name": "Ananya Roy", "email": "ananya.roy@example.com", "dept": "CSE", "class": "CS-2B", "section": "B", "registered": True},
            {"id": "STU-2026-007", "name": "Karthik Nair", "email": "karthik.nair@example.com", "dept": "ECE", "class": "EC-3A", "section": "A", "registered": False},
            {"id": "STU-2026-008", "name": "Meera Joshi", "email": "meera.joshi@example.com", "dept": "IT", "class": "IT-4A", "section": "A", "registered": False},
            {"id": "STU-2026-009", "name": "Rohan Deshmukh", "email": "rohan.deshmukh@example.com", "dept": "ME", "class": "ME-2B", "section": "B", "registered": False},
            {"id": "STU-2026-010", "name": "Divya Krishnan", "email": "divya.krishnan@example.com", "dept": "CSE", "class": "CS-3A", "section": "A", "registered": True},
            {"id": "STU-2026-011", "name": "Aditya Reddy", "email": "aditya.reddy@example.com", "dept": "ECE", "class": "EC-4B", "section": "B", "registered": True},
            {"id": "STU-2026-012", "name": "Neha Gupta", "email": "neha.gupta@example.com", "dept": "IT", "class": "IT-2A", "section": "A", "registered": True},
        ]

        created_students = []
        for i, s in enumerate(student_roster):
            dept = departments[s['dept']]
            user, u_created = User.objects.get_or_create(
                email=s['email'],
                defaults={
                    "username": s['email'],
                    "full_name": s['name'],
                    "role": UserRole.STUDENT,
                    "department": dept
                }
            )
            user.set_password("Student@123456")
            user.save()

            # Deterministic 128-d normalized vector if registered
            encoding = []
            if s['registered']:
                np.random.seed(42 + i)
                vec = np.random.randn(128)
                norm = np.linalg.norm(vec)
                encoding = (vec / norm).tolist()

            profile, p_created = StudentProfile.objects.get_or_create(
                student_id=s['id'],
                defaults={
                    "user": user,
                    "department": dept,
                    "class_name": s['class'],
                    "section": s['section'],
                    "face_registered": s['registered'],
                    "face_encoding": encoding
                }
            )
            created_students.append(profile)

        self.stdout.write(self.style.SUCCESS(f"  Created {len(created_students)} student accounts."))

        # 5. Generate 30 days of past attendance history
        today = timezone.now().date()
        primary_camera = cameras[0]
        attendance_count = 0

        # Deterministic seed for reproducible dates
        random.seed(100)

        for day_offset in range(30, -1, -1):
            date_val = today - timedelta(days=day_offset)
            # Skip Sundays
            if date_val.weekday() == 6:
                continue

            for stu in created_students:
                # 85% chance present, 8% late, 7% absent
                dice = random.random()
                if dice < 0.82:
                    status_val = AttendanceStatus.PRESENT
                    check_in = time(hour=8, minute=random.randint(40, 59), second=random.randint(10, 55))
                    check_out = time(hour=16, minute=random.randint(0, 30), second=random.randint(10, 55))
                    conf = round(random.uniform(0.91, 0.98), 2)
                elif dice < 0.92:
                    status_val = AttendanceStatus.LATE
                    check_in = time(hour=9, minute=random.randint(35, 55), second=random.randint(10, 55))
                    check_out = time(hour=16, minute=random.randint(10, 45), second=random.randint(10, 55))
                    conf = round(random.uniform(0.88, 0.95), 2)
                else:
                    status_val = AttendanceStatus.ABSENT
                    check_in = None
                    check_out = None
                    conf = 0.0

                if day_offset == 0 and dice >= 0.92:
                    # today some are not marked yet
                    continue

                if check_in:
                    Attendance.objects.update_or_create(
                        student=stu,
                        date=date_val,
                        defaults={
                            "status": status_val,
                            "check_in_time": check_in,
                            "check_out_time": check_out,
                            "recognition_confidence": conf,
                            "camera": primary_camera,
                        }
                    )
                    attendance_count += 1

        self.stdout.write(self.style.SUCCESS(f"  Generated {attendance_count} attendance records across past 30 days."))

        # 6. Audit logs
        AuditLog.objects.get_or_create(
            action=AuditAction.LOGIN,
            entity_type="SYSTEM",
            defaults={
                "user": admin_user,
                "metadata": {"source": "System Initialization Seed"},
                "ip_address": "127.0.0.1"
            }
        )

        self.stdout.write(self.style.SUCCESS("==> Seeding successfully completed!"))
