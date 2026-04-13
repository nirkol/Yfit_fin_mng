import api from './api';
import type { Settings } from '../types';

export const settingsService = {
  getSettings: async (): Promise<Settings> => {
    const response = await api.get<Settings>('/api/settings');
    return response.data;
  },

  updateSettings: async (data: Partial<Settings>): Promise<Settings> => {
    const response = await api.put<Settings>('/api/settings', data);
    return response.data;
  },

  exportData: async (): Promise<any> => {
    const response = await api.post('/api/settings/export');
    return response.data;
  },

  importData: async (data: any): Promise<void> => {
    await api.post('/api/settings/import', data);
  },
};
