export type AuditActionType =
  | 'LOGIN'
  | 'LOGOUT'
  | 'STUDENT_CREATE'
  | 'STUDENT_UPDATE'
  | 'STUDENT_DELETE'
  | 'FACE_REGISTER'
  | 'FACE_VERIFY'
  | 'FACE_DELETE'
  | 'ATTENDANCE_MARK'
  | 'ATTENDANCE_UPDATE'
  | 'REPORT_EXPORT'
  | 'CAMERA_CREATE'
  | 'CAMERA_UPDATE'
  | 'CAMERA_DELETE';

export interface AuditLog {
  id: number;
  user: number | null;
  user_email: string;
  user_name: string;
  action: AuditActionType;
  entity_type: string;
  entity_id: string;
  metadata: Record<string, any>;
  ip_address: string | null;
  timestamp: string;
}
