import { api } from './api';
import {
  OverviewKPIs,
  DailyTrendItem,
  WeeklyTrendItem,
  DepartmentStat,
} from '../types/analytics.types';

export const analyticsService = {
  async getOverview(): Promise<OverviewKPIs> {
    const response = await api.get<OverviewKPIs>('/analytics/overview/');
    return response.data;
  },

  async getDailyTrends(days: number = 14): Promise<DailyTrendItem[]> {
    const response = await api.get<DailyTrendItem[]>('/analytics/daily/', {
      params: { days },
    });
    return response.data;
  },

  async getWeeklyTrends(): Promise<WeeklyTrendItem[]> {
    const response = await api.get<WeeklyTrendItem[]>('/analytics/weekly/');
    return response.data;
  },

  async getMonthlyTrends(): Promise<any[]> {
    const response = await api.get<any[]>('/analytics/monthly/');
    return response.data;
  },

  async getDepartmentStats(): Promise<DepartmentStat[]> {
    const response = await api.get<DepartmentStat[]>('/analytics/departments/');
    return response.data;
  },

  async getStudentAnalytics(studentId: string): Promise<any> {
    const response = await api.get<any>(`/analytics/student/${studentId}/`);
    return response.data;
  },
};
