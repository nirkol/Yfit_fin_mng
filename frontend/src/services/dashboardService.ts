import api from './api';
import type { FinancialStats, AttendanceStats } from '../types';

export const dashboardService = {
  getDashboard: async (
    yearKey: string
  ): Promise<{ financial: FinancialStats; attendance: AttendanceStats }> => {
    const response = await api.get(`/api/dashboard/${yearKey}`);
    return response.data;
  },
};
