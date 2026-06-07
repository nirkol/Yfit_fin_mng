import api from './api';
import type { Trainer, TrainerStats } from '../types';

export const trainerService = {
  getTrainers: async (activeOnly?: boolean): Promise<Trainer[]> => {
    const params = activeOnly !== undefined ? { active_only: activeOnly } : {};
    const response = await api.get('/api/trainers', { params });
    return response.data;
  },

  getTrainer: async (id: string): Promise<Trainer> => {
    const response = await api.get(`/api/trainers/${id}`);
    return response.data;
  },

  createTrainer: async (data: {
    name: string;
    phone?: string;
    dateOfBirth?: string;
    username: string;
    password: string;
    role?: 'admin' | 'trainer';
  }): Promise<Trainer> => {
    const response = await api.post('/api/trainers', data);
    return response.data;
  },

  updateTrainer: async (
    id: string,
    data: {
      name?: string;
      phone?: string;
      dateOfBirth?: string;
      username?: string;
      password?: string;
      isActive?: boolean;
      role?: string;
    }
  ): Promise<Trainer> => {
    const response = await api.put(`/api/trainers/${id}`, data);
    return response.data;
  },

  deleteTrainer: async (id: string): Promise<void> => {
    await api.delete(`/api/trainers/${id}`);
  },

  getTrainerStats: async (id: string, yearKey: string): Promise<TrainerStats> => {
    const response = await api.get(`/api/trainers/${id}/stats/${yearKey}`);
    return response.data;
  },

  updateCredentials: async (
    id: string,
    username: string,
    password: string
  ): Promise<void> => {
    await api.put(`/api/trainers/${id}/credentials`, { username, password });
  },
};
