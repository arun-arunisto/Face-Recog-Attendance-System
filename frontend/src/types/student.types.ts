export interface StudentProfile {
  id: number;
  student_id: string;
  full_name: string;
  email: string;
  department: number;
  department_name: string;
  department_code: string;
  class_name: string;
  section: string;
  profile_photo: string | null;
  face_registered: boolean;
  is_active: boolean;
  attendance_percentage: number;
  today_status: {
    status: 'PRESENT' | 'LATE' | 'ABSENT' | 'NOT_MARKED';
    check_in_time?: string;
    check_out_time?: string;
    confidence?: number;
  };
  created_at: string;
  updated_at: string;
}

export interface StudentCreatePayload {
  student_id: string;
  full_name: string;
  email: string;
  password?: string;
  department_id: number;
  class_name: string;
  section: string;
  profile_photo?: File | null;
}

export interface FaceRegisterPayload {
  frames: string[]; // base64 array
  profile_photo?: string;
}

export interface FaceVerifyResponse {
  match: boolean;
  confidence: number;
  distance: number;
  threshold: number;
  message: string;
}
