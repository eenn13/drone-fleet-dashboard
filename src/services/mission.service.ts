import apiClient from "../api/client";
import type { Mission } from "../types";

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface MissionFilters {
  page?: number;
  limit?: number;
  status?: string;
  droneId?: string;
  startDate?: string;
  endDate?: string;
}

export const missionService = {
  async getAll(
    filters: MissionFilters = {},
  ): Promise<PaginatedResponse<Mission>> {
    const {
      page = 1,
      limit = 20,
      status,
      droneId,
      startDate,
      endDate,
    } = filters;
    const params = new URLSearchParams();

    params.append("page", page.toString());
    params.append("limit", limit.toString());
    if (status) params.append("status", status);
    if (droneId) params.append("droneId", droneId);
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const response = await apiClient.get<PaginatedResponse<Mission>>(
      `/missions?${params.toString()}`,
    );
    return response.data;
  },

  async getById(id: string): Promise<Mission> {
    const response = await apiClient.get<Mission>(`/missions/${id}`);
    return response.data;
  },

  async create(
    data: Omit<Mission, "id" | "createdAt" | "updatedAt">,
  ): Promise<Mission> {
    const response = await apiClient.post<Mission>("/missions", data);
    return response.data;
  },

  async update(id: string, data: Partial<Mission>): Promise<Mission> {
    const response = await apiClient.put<Mission>(`/missions/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/missions/${id}`);
  },
};
