import api from './api';
import type { Year, YearData, MemberWithBalance, OpeningBalance } from '../types';

export const yearService = {
  getYears: async (): Promise<Year[]> => {
    const response = await api.get<Year[]>('/api/years');
    return response.data;
  },

  getYearData: async (yearKey: string): Promise<YearData> => {
    const response = await api.get<YearData>(`/api/years/${yearKey}`);
    return response.data;
  },

  createYear: async (
    yearKey: string,
    openingBalances?: OpeningBalance[]
  ): Promise<YearData> => {
    const response = await api.post<YearData>('/api/years', {
      yearKey,
      openingBalances: openingBalances || [],
    });
    return response.data;
  },

  deleteYear: async (yearKey: string): Promise<void> => {
    await api.delete(`/api/years/${yearKey}`);
  },

  getYearBalances: async (yearKey: string): Promise<MemberWithBalance[]> => {
    const response = await api.get<MemberWithBalance[]>(
      `/api/years/${yearKey}/balances`
    );
    return response.data;
  },

  setOpeningBalance: async (
    yearKey: string,
    memberId: string,
    classes: number,
    moneyBalance?: number
  ): Promise<void> => {
    await api.post(`/api/years/${yearKey}/opening-balance`, {
      memberId,
      classes,
      moneyBalance: moneyBalance || 0.0,
    });
  },

  sellPackage: async (
    yearKey: string,
    data: {
      memberId: string;
      packageType: string;
      price: number;
      classCount: number;
      amountPaid: number;
      purchaseDate: string;
      paymentMethod?: string;
    }
  ) => {
    const response = await api.post(`/api/years/${yearKey}/packages`, data);
    return response.data;
  },

  markAttendance: async (
    yearKey: string,
    data: {
      date: string;
      time: string;
      memberIds: string[];
      classType?: string;
    }
  ) => {
    const response = await api.post(`/api/years/${yearKey}/attendance`, data);
    return response.data;
  },

  addRefund: async (
    yearKey: string,
    data: {
      memberId: string;
      classesRefunded: number;
      refundAmount: number;
      refundDate: string;
    }
  ) => {
    const response = await api.post(`/api/years/${yearKey}/refunds`, data);
    return response.data;
  },
};
