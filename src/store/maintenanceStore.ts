import { create } from 'zustand';
import type { MaintenanceLog } from '../types';
import { maintenanceService, type MaintenanceFilters } from '../services/maintenance.service';

interface MaintenanceStore {
  logs: MaintenanceLog[];
  total: number;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  filters: MaintenanceFilters;
  hasMore: boolean;
  
  // Actions
  fetchLogs: (filters?: MaintenanceFilters) => Promise<void>;
  fetchLogById: (id: string) => Promise<MaintenanceLog | null>;
  addLog: (data: Omit<MaintenanceLog, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateLog: (id: string, data: Partial<MaintenanceLog>) => Promise<void>;
  deleteLog: (id: string) => Promise<void>;
  setFilters: (filters: MaintenanceFilters) => void;
  clearError: () => void;
  loadMore: () => Promise<void>;
}

export const useMaintenanceStore = create<MaintenanceStore>((set, get) => ({
  logs: [],
  total: 0,
  currentPage: 1,
  totalPages: 0,
  isLoading: false,
  isLoadingMore: false,
  error: null,
  filters: { page: 1, limit: 20 },
  hasMore: true,

  fetchLogs: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const currentFilters = { ...get().filters, ...filters };
      const response = await maintenanceService.getAll(currentFilters);
      
      set({
        logs: response.items,
        total: response.total,
        currentPage: response.page,
        totalPages: response.totalPages,
        filters: currentFilters,
        isLoading: false,
        hasMore: response.page < response.totalPages,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Bakım kayıtları yüklenirken hata oluştu',
        isLoading: false,
      });
    }
  },

  loadMore: async () => {
    const { currentPage, totalPages, filters, logs, isLoadingMore } = get();
    
    if (currentPage >= totalPages || !get().hasMore || isLoadingMore) {
      set({ hasMore: false });
      return;
    }

    set({ isLoadingMore: true });
    try {
      const nextPage = currentPage + 1;
      const response = await maintenanceService.getAll({
        ...filters,
        page: nextPage,
        limit: 20,
      });
      
      set({
        logs: [...logs, ...response.items],
        currentPage: response.page,
        totalPages: response.totalPages,
        total: response.total,
        isLoadingMore: false,
        hasMore: response.page < response.totalPages,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Daha fazla bakım kaydı yüklenirken hata oluştu',
        isLoadingMore: false,
      });
    }
  },

  fetchLogById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const log = await maintenanceService.getById(id);
      set({ isLoading: false });
      return log;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Bakım kaydı yüklenirken hata oluştu',
        isLoading: false,
      });
      return null;
    }
  },

  addLog: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const newLog = await maintenanceService.create(data);
      set((state) => ({
        logs: [newLog, ...state.logs],
        total: state.total + 1,
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Bakım kaydı eklenirken hata oluştu',
        isLoading: false,
      });
      throw error;
    }
  },

  updateLog: async (id: string, data: Partial<MaintenanceLog>) => {
    set({ isLoading: true, error: null });
    try {
      const updatedLog = await maintenanceService.update(id, data);
      set((state) => ({
        logs: state.logs.map((log) =>
          log.id === id ? updatedLog : log
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Bakım kaydı güncellenirken hata oluştu',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteLog: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await maintenanceService.delete(id);
      set((state) => ({
        logs: state.logs.filter((log) => log.id !== id),
        total: state.total - 1,
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Bakım kaydı silinirken hata oluştu',
        isLoading: false,
      });
      throw error;
    }
  },

  setFilters: (filters: MaintenanceFilters) => {
    set({ filters: { ...get().filters, ...filters } });
  },

  clearError: () => {
    set({ error: null });
  },
}));