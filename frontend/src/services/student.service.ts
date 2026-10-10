import { api } from './api';
import {
  StudentProfile,
  StudentCreatePayload,
  FaceRegisterPayload,
  FaceVerifyResponse,
} from '../types/student.types';

export const studentService = {
  async getStudents(params?: {
    search?: string;
    department?: number;
    class_name?: string;
    section?: string;
    face_registered?: boolean;
    page?: number;
  }): Promise<{ results: StudentProfile[]; count: number }> {
    const response = await api.get<{ results: StudentProfile[]; count: number } | StudentProfile[]>('/students/', {
      params,
    });
    if (Array.isArray(response.data)) {
      return { results: response.data, count: response.data.length };
    }
    return response.data;
  },

  async getStudentById(id: number | string): Promise<StudentProfile> {
    const response = await api.get<StudentProfile>(`/students/${id}/`);
    return response.data;
  },

  async createStudent(payload: StudentCreatePayload): Promise<StudentProfile> {
    const response = await api.post<StudentProfile>('/students/', payload);
    return response.data;
  },

  async updateStudent(id: number | string, data: Partial<StudentProfile> & { full_name?: string }): Promise<StudentProfile> {
    const response = await api.patch<StudentProfile>(`/students/${id}/`, data);
    return response.data;
  },

  async deleteStudent(id: number | string): Promise<void> {
    await api.delete(`/students/${id}/`);
  },

  async registerFace(studentId: number | string, payload: FaceRegisterPayload): Promise<{ message: string; samples_processed: number }> {
    const response = await api.post(`/students/${studentId}/face/register/`, payload);
    return response.data;
  },

  async verifyFace(studentId: number | string, imageBase64: string): Promise<FaceVerifyResponse> {
    const response = await api.post<FaceVerifyResponse>(`/students/${studentId}/face/verify/`, {
      image: imageBase64,
    });
    return response.data;
  },

  async deleteFace(studentId: number | string): Promise<void> {
    await api.delete(`/students/${studentId}/face/`);
  },
};
