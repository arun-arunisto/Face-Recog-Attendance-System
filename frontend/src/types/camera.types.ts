export type CameraStatusType = 'ONLINE' | 'OFFLINE' | 'ERROR';
export type CameraTypeEnum = 'WEBCAM' | 'IP_CAMERA' | 'RTSP' | 'USB';

export interface Camera {
  id: number;
  name: string;
  location: string;
  camera_type: CameraTypeEnum;
  status: CameraStatusType;
  stream_identifier: string;
  is_active: boolean;
  today_attendance_count: number;
  recent_event_count: number;
  created_at: string;
  updated_at: string;
}
