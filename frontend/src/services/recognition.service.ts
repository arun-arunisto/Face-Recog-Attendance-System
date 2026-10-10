import { api } from './api';

export interface RecognitionPipelineStatus {
  provider_name: string;
  is_development_mode: boolean;
  match_threshold: number;
  cameras_online: number;
  status: string;
}

export const recognitionService = {
  async getStatus(): Promise<RecognitionPipelineStatus> {
    const response = await api.get<RecognitionPipelineStatus>('/recognition/status/');
    return response.data;
  },

  async verifyDirectFrame(imageB64: string, cameraId?: number): Promise<any> {
    const response = await api.post('/recognition/verify/', {
      image: imageB64,
      camera_id: cameraId,
    });
    return response.data;
  },
};
