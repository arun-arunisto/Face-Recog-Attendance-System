import { create } from 'zustand';
import { User, UserRole } from '../types/auth.types';
import { authService } from '../services/auth.service';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<User>;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  isAdmin: () => boolean;
  isStudent: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('access_token'),
  isAuthenticated: !!localStorage.getItem('access_token'),
  isLoading: true,

  initializeAuth: async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      return;
    }

    try {
      const user = await authService.getCurrentUser();
      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (email, pass) => {
    set({ isLoading: true });
    try {
      const response = await authService.login(email, pass);
      localStorage.setItem('access_token', response.access);
      localStorage.setItem('refresh_token', response.refresh);
      localStorage.setItem('user_data', JSON.stringify(response.user));

      set({
        user: response.user,
        token: response.access,
        isAuthenticated: true,
        isLoading: false,
      });
      return response.user;
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    await authService.logout();
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },

  isAdmin: () => {
    const user = get().user;
    return user?.role === 'ADMIN';
  },

  isStudent: () => {
    const user = get().user;
    return user?.role === 'STUDENT';
  },
}));
