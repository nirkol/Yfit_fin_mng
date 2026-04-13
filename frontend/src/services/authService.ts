import api from './api';
import type { LoginResponse } from '../types';

export const authService = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/api/auth/login', {
      username,
      password,
    });
    return response.data;
  },

  updateCredentials: async (
    currentPassword: string,
    newUsername: string,
    newPassword: string
  ): Promise<void> => {
    await api.post('/api/auth/update-credentials', {
      currentPassword,
      newUsername,
      newPassword,
    });
  },
};
