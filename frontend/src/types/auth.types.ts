export type UserRole = 'ADMIN' | 'STUDENT';

export interface Department {
  id: number;
  name: string;
  code: string;
  description?: string;
  student_count?: number;
  created_at: string;
}

export interface StudentProfileSummary {
  id: number;
  student_id: string;
  class_name: string;
  section: string;
  face_registered: boolean;
  profile_photo?: string | null;
}

export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: UserRole;
  department?: string | null;
  department_id?: number | null;
  student_profile?: StudentProfileSummary | null;
  is_active: boolean;
  created_at?: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}
