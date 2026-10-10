import { api } from './api';
import { Camera } from '../types/camera.types';

export const cameraService = {
  async getCameras(): Promise<Camera[]> {
    const response = await api.get<{ results: Camera[] } | Camera[]>('/cameras/');
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return response.data.results || [];
  },

  async getCameraById(id: number | string): Promise<Camera> {
    const response = await api.get<Camera>(`/cameras/${id}/`);
    return response.data;
  },

  async createCamera(data: Partial<Camera>): Promise<Camera> {
    const response = await api.post<Camera>('/cameras/', data);
    return response.data;
  },

  async updateCamera(id: number | string, data: Partial<Camera>): Promise<Camera> {
    const response = await api.patch<Camera>(`/cameras/${id}/`, data);
    return response.data;
  },

  async deleteCamera(id: number | string): Promise<void> {
    await api.delete(`/cameras/${id}/`);
  },
};
