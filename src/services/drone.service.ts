import apiClient from '../api/client';
import type { Drone } from '../types';

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DroneFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export const droneService = {
  // Tüm droneları getir
  async getAll(filters: DroneFilters = {}): Promise<PaginatedResponse<Drone>> {
    const { page = 1, limit = 20, search, status } = filters;
    const params = new URLSearchParams();
    
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (search) params.append('search', search);
    if (status && status !== 'ALL') params.append('status', status);
    
    const response = await apiClient.get<PaginatedResponse<Drone>>(`/drones?${params.toString()}`);
    return response.data;
  },

  // Tek bir drone getir
  async getById(id: string): Promise<Drone> {
    const response = await apiClient.get<Drone>(`/drones/${id}`);
    return response.data;
  },

  // Yeni drone oluştur
  async create(data: Omit<Drone, 'id' | 'createdAt' | 'updatedAt'>): Promise<Drone> {
    const response = await apiClient.post<Drone>('/drones', data);
    return response.data;
  },

  // Drone güncelle
  async update(id: string, data: Partial<Drone>): Promise<Drone> {
    const response = await apiClient.put<Drone>(`/drones/${id}`, data);
    return response.data;
  },

  // Drone sil
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/drones/${id}`);
  },

  // Bakım durumunu güncelle
  async updateMaintenance(id: string, action: 'complete' | 'schedule'): Promise<Drone> {
    const response = await apiClient.post<Drone>(`/drones/${id}/maintenance?action=${action}`);
    return response.data;
  },
};