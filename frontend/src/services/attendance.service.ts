import { api } from './api';
import {
  AttendanceRecord,
  TodayAttendanceSummary,
  CalendarResponse,
  StudentAttendanceHistoryResponse,
  AttendanceStatusType,
} from '../types/attendance.types';

export const attendanceService = {
  async getAttendanceList(params?: {
    date?: string;
    start_date?: string;
    end_date?: string;
    department?: number;
    class_name?: string;
    status?: AttendanceStatusType;
    camera?: number;
    search?: string;
    student_id?: string;
    page?: number;
  }): Promise<{ results: AttendanceRecord[]; count: number }> {
    const response = await api.get<{ results: AttendanceRecord[]; count: number } | AttendanceRecord[]>('/attendance/', {
      params,
    });
    if (Array.isArray(response.data)) {
      return { results: response.data, count: response.data.length };
    }
    return response.data;
  },

  async getTodaySummary(): Promise<TodayAttendanceSummary> {
    const response = await api.get<TodayAttendanceSummary>('/attendance/today/');
    return response.data;
  },

  async getCalendarData(month?: string, studentId?: string): Promise<CalendarResponse> {
    const response = await api.get<CalendarResponse>('/attendance/calendar/', {
      params: { month, student_id: studentId },
    });
    return response.data;
  },

  async getStudentAttendance(studentId: string): Promise<StudentAttendanceHistoryResponse> {
    const response = await api.get<StudentAttendanceHistoryResponse>(`/attendance/student/${studentId}/`);
    return response.data;
  },

  async markManual(payload: {
    student_id: string;
    date: string;
    status: AttendanceStatusType;
    check_in_time?: string;
    check_out_time?: string;
    notes?: string;
  }): Promise<AttendanceRecord> {
    const response = await api.post<AttendanceRecord>('/attendance/mark/', payload);
    return response.data;
  },

  async updateAttendance(id: number, data: Partial<AttendanceRecord>): Promise<AttendanceRecord> {
    const response = await api.patch<AttendanceRecord>(`/attendance/${id}/`, data);
    return response.data;
  },
};
