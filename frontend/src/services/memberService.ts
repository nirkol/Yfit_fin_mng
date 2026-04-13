import api from './api';
import type { Member, MemberWithBalance } from '../types';

export const memberService = {
  getMembers: async (archived?: boolean): Promise<Member[]> => {
    const params = archived !== undefined ? { archived } : {};
    const response = await api.get<Member[]>('/api/members', { params });
    return response.data;
  },

  getMember: async (id: string): Promise<Member> => {
    const response = await api.get<Member>(`/api/members/${id}`);
    return response.data;
  },

  createMember: async (data: {
    name: string;
    phone?: string;
    dateOfBirth?: string;
  }): Promise<Member> => {
    const response = await api.post<Member>('/api/members', data);
    return response.data;
  },

  updateMember: async (
    id: string,
    data: {
      name?: string;
      phone?: string;
      dateOfBirth?: string;
      isArchived?: boolean;
    }
  ): Promise<Member> => {
    const response = await api.put<Member>(`/api/members/${id}`, data);
    return response.data;
  },

  deleteMember: async (id: string): Promise<void> => {
    await api.delete(`/api/members/${id}`);
  },
};
