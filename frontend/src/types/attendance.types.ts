export type AttendanceStatusType = 'PRESENT' | 'LATE' | 'ABSENT';

export interface AttendanceRecord {
  id: number;
  student: number;
  student_id: string;
  student_name: string;
  department: string;
  department_code: string;
  class_name: string;
  date: string;
  check_in_time: string | null;
  check_out_time: string | null;
  status: AttendanceStatusType;
  recognition_confidence: number;
  camera: number | null;
  camera_name: string;
  marked_manually: boolean;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface TodayAttendanceSummary {
  date: string;
  total_students: number;
  present_today: number;
  late_today: number;
  absent_today: number;
  total_marked: number;
  attendance_percentage: number;
  recent_feed: AttendanceRecord[];
}

export interface CalendarDayRecord {
  date: string;
  status: AttendanceStatusType;
  check_in: string | null;
  check_out: string | null;
  confidence: number;
  camera: string | null;
  notes?: string;
}

export interface CalendarResponse {
  year: number;
  month: number;
  student_id: string | null;
  student_name: string | null;
  records: CalendarDayRecord[];
}

export interface StudentAttendanceHistoryResponse {
  student: {
    student_id: string;
    full_name: string;
    department: string;
    class_name: string;
    face_registered: boolean;
  };
  summary: {
    total_days: number;
    present_days: number;
    late_days: number;
    absent_days: number;
    attendance_percentage: number;
  };
  attendances: AttendanceRecord[];
}
