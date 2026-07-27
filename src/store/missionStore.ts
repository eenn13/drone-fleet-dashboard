import { create } from 'zustand';
import type { Mission } from '../types';
import { missionService, type MissionFilters } from '../services/mission.service';

interface MissionStore {
  missions: Mission[];
  total: number;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  filters: MissionFilters;
  
  // Actions
  fetchMissions: (filters?: MissionFilters) => Promise<void>;
  fetchMissionById: (id: string) => Promise<Mission | null>;
  addMission: (data: Omit<Mission, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateMission: (id: string, data: Partial<Mission>) => Promise<void>;
  deleteMission: (id: string) => Promise<void>;
  setFilters: (filters: MissionFilters) => void;
  clearError: () => void;
}

export const useMissionStore = create<MissionStore>((set, get) => ({
  missions: [],
  total: 0,
  currentPage: 1,
  totalPages: 0,
  isLoading: false,
  error: null,
  filters: { page: 1, limit: 20 },

  fetchMissions: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const currentFilters = { ...get().filters, ...filters };
      const response = await missionService.getAll(currentFilters);
      
      set({
        missions: response.items,
        total: response.total,
        currentPage: response.page,
        totalPages: response.totalPages,
        filters: currentFilters,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Görevler yüklenirken hata oluştu',
        isLoading: false,
      });
    }
  },

  fetchMissionById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const mission = await missionService.getById(id);
      set({ isLoading: false });
      return mission;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Görev yüklenirken hata oluştu',
        isLoading: false,
      });
      return null;
    }
  },

  addMission: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const newMission = await missionService.create(data);
      set((state) => ({
        missions: [newMission, ...state.missions],
        total: state.total + 1,
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Görev eklenirken hata oluştu',
        isLoading: false,
      });
      throw error;
    }
  },

  updateMission: async (id: string, data: Partial<Mission>) => {
    set({ isLoading: true, error: null });
    try {
      const updatedMission = await missionService.update(id, data);
      set((state) => ({
        missions: state.missions.map((mission) =>
          mission.id === id ? updatedMission : mission
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Görev güncellenirken hata oluştu',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteMission: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await missionService.delete(id);
      set((state) => ({
        missions: state.missions.filter((mission) => mission.id !== id),
        total: state.total - 1,
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Görev silinirken hata oluştu',
        isLoading: false,
      });
      throw error;
    }
  },

  setFilters: (filters: MissionFilters) => {
    set({ filters: { ...get().filters, ...filters } });
  },

  clearError: () => {
    set({ error: null });
  },
}));