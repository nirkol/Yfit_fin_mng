import api from './api';

export interface Report {
  filename: string;
  year: string;
  reportType: string;
  size: number;
  createdAt: string;
  path: string;
}

export const reportService = {
  getReports: async (year?: string): Promise<Report[]> => {
    const params = year ? { year } : {};
    const response = await api.get('/api/reports', { params });
    return response.data;
  },

  downloadReport: async (year: string, filename: string): Promise<void> => {
    const response = await api.get(`/api/reports/${year}/${filename}`, {
      responseType: 'blob'
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  saveReport: async (year: string, reportType: string, content: string, date?: string): Promise<void> => {
    await api.post('/api/reports', {
      year,
      reportType,
      content,
      date
    });
  },

  deleteReport: async (year: string, filename: string): Promise<void> => {
    await api.delete(`/api/reports/${year}/${filename}`);
  }
};
