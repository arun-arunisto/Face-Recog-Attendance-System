import { api } from './api';
import { AuditLog } from '../types/audit.types';

export const auditService = {
  async getAuditLogs(params?: {
    action?: string;
    entity_type?: string;
    start_date?: string;
    end_date?: string;
    search?: string;
    page?: number;
  }): Promise<{ results: AuditLog[]; count: number }> {
    const response = await api.get<{ results: AuditLog[]; count: number } | AuditLog[]>('/audit-logs/', {
      params,
    });
    if (Array.isArray(response.data)) {
      return { results: response.data, count: response.data.length };
    }
    return response.data;
  },
};
