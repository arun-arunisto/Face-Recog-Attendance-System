import { api } from './api';
import { LoginResponse, User, Department } from '../types/auth.types';

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login/', {
      email,
      password,
    });
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/auth/me/');
    return response.data;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout/');
    } catch {
      // ignore
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_data');
    }
  },

  async getDepartments(): Promise<Department[]> {
    const response = await api.get<{ results: Department[] } | Department[]>('/auth/departments/');
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return response.data.results || [];
  },
};
