import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const systemService = {
  async authenticateAdmin(username: string, password: string): Promise<{ success: boolean; message: string }> {
    const response = await api.post('/api/system/admin-auth', { username, password });
    return response.data;
  },

  async updateAdminCredentials(username: string, password: string): Promise<{ success: boolean; message: string }> {
    const response = await api.post('/api/system/admin-credentials', { username, password });
    return response.data;
  },

  async resetAllData(): Promise<{ success: boolean; message: string }> {
    const response = await api.post('/api/system/reset-all-data');
    return response.data;
  },
};
