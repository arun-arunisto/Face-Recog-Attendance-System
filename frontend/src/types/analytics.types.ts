export interface OverviewKPIs {
  total_students: number;
  registered_faces: number;
  face_registration_pct: number;
  present_today: number;
  late_today: number;
  absent_today: number;
  total_marked_today: number;
  today_attendance_percentage: number;
  average_30_days_percentage: number;
  active_cameras: number;
}

export interface DailyTrendItem {
  date: string;
  day_name: string;
  present: number;
  late: number;
  absent: number;
  total: number;
  percentage: number;
}

export interface WeeklyTrendItem {
  week_label: string;
  start_date: string;
  end_date: string;
  present: number;
  late: number;
  percentage: number;
}

export interface DepartmentStat {
  id: number;
  name: string;
  code: string;
  student_count: number;
  today_present: number;
  today_rate: number;
  overall_rate: number;
}
