import apiClient from '../api/client';
import type { MaintenanceLog } from '../types';

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface MaintenanceFilters {
  page?: number;
  limit?: number;
  droneId?: string;
}

export const maintenanceService = {
  async getAll(filters: MaintenanceFilters = {}): Promise<PaginatedResponse<MaintenanceLog>> {
    const { page = 1, limit = 20, droneId } = filters;
    const params = new URLSearchParams();
    
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (droneId) params.append('droneId', droneId);
    
    const response = await apiClient.get<PaginatedResponse<MaintenanceLog>>(`/maintenance?${params.toString()}`);
    return response.data;
  },

  async getById(id: string): Promise<MaintenanceLog> {
    const response = await apiClient.get<MaintenanceLog>(`/maintenance/${id}`);
    return response.data;
  },

  async create(data: Omit<MaintenanceLog, 'id' | 'createdAt' | 'updatedAt'>): Promise<MaintenanceLog> {
    const response = await apiClient.post<MaintenanceLog>('/maintenance', data);
    return response.data;
  },

  async update(id: string, data: Partial<MaintenanceLog>): Promise<MaintenanceLog> {
    const response = await apiClient.put<MaintenanceLog>(`/maintenance/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/maintenance/${id}`);
  },
};