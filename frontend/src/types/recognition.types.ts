export interface BoundingBox {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export type RecognitionState =
  | 'CAMERA_CONNECTING'
  | 'CAMERA_CONNECTED'
  | 'FACE_NOT_DETECTED'
  | 'MULTIPLE_FACES'
  | 'PROCESSING'
  | 'RECOGNIZED'
  | 'UNKNOWN_FACE'
  | 'ATTENDANCE_MARKED'
  | 'ALREADY_MARKED'
  | 'LOW_QUALITY'
  | 'CAMERA_ERROR';

export interface RecognitionResult {
  type: 'recognition_result';
  recognized: boolean;
  student_id: string;
  student_pk?: number;
  student_name: string;
  department: string;
  confidence: number;
  attendance_marked: boolean;
  already_marked?: boolean;
  status: string;
  check_in_time?: string;
  check_out_time?: string;
  timestamp: string;
  message: string;
  bounding_boxes?: BoundingBox[];
  latency_ms?: number;
  is_development_mode?: boolean;
}

export interface RecognitionError {
  type: 'recognition_error';
  code: string;
  message: string;
  confidence?: number;
  bounding_boxes?: BoundingBox[];
  latency_ms?: number;
}

export interface ConnectionStatusMessage {
  type: 'connection_status';
  state: RecognitionState;
  camera_id: string;
  camera_name: string;
  provider: string;
  is_development_mode: boolean;
  timestamp: string;
}

export type WebSocketMessage = RecognitionResult | RecognitionError | ConnectionStatusMessage;
