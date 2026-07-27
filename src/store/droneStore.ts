import { create } from 'zustand';
import type { Drone } from '../types';
import { droneService, type DroneFilters } from '../services/drone.service';

interface DroneStore {
  drones: Drone[];
  total: number;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  filters: DroneFilters;
  
  // Actions
  fetchDrones: (filters?: DroneFilters) => Promise<void>;
  fetchDroneById: (id: string) => Promise<Drone | null>;
  addDrone: (data: Omit<Drone, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateDrone: (id: string, data: Partial<Drone>) => Promise<void>;
  deleteDrone: (id: string) => Promise<void>;
  updateMaintenance: (id: string, action: 'complete' | 'schedule') => Promise<void>;
  setFilters: (filters: DroneFilters) => void;
  clearError: () => void;
}

export const useDroneStore = create<DroneStore>((set, get) => ({
  drones: [],
  total: 0,
  currentPage: 1,
  totalPages: 0,
  isLoading: false,
  error: null,
  filters: { page: 1, limit: 20 },

  fetchDrones: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const currentFilters = { ...get().filters, ...filters };
      const response = await droneService.getAll(currentFilters);
      
      set({
        drones: response.items,
        total: response.total,
        currentPage: response.page,
        totalPages: response.totalPages,
        filters: currentFilters,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Dronelar yüklenirken hata oluştu',
        isLoading: false,
      });
    }
  },

  fetchDroneById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const drone = await droneService.getById(id);
      set({ isLoading: false });
      return drone;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Drone yüklenirken hata oluştu',
        isLoading: false,
      });
      return null;
    }
  },

  addDrone: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const newDrone = await droneService.create(data);
      set((state) => ({
        drones: [newDrone, ...state.drones],
        total: state.total + 1,
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Drone eklenirken hata oluştu',
        isLoading: false,
      });
      throw error;
    }
  },

  updateDrone: async (id: string, data: Partial<Drone>) => {
    set({ isLoading: true, error: null });
    try {
      const updatedDrone = await droneService.update(id, data);
      set((state) => ({
        drones: state.drones.map((drone) =>
          drone.id === id ? updatedDrone : drone
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Drone güncellenirken hata oluştu',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteDrone: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await droneService.delete(id);
      set((state) => ({
        drones: state.drones.filter((drone) => drone.id !== id),
        total: state.total - 1,
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Drone silinirken hata oluştu',
        isLoading: false,
      });
      throw error;
    }
  },

  updateMaintenance: async (id: string, action: 'complete' | 'schedule') => {
    set({ isLoading: true, error: null });
    try {
      const updatedDrone = await droneService.updateMaintenance(id, action);
      set((state) => ({
        drones: state.drones.map((drone) =>
          drone.id === id ? updatedDrone : drone
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Bakım güncellenirken hata oluştu',
        isLoading: false,
      });
      throw error;
    }
  },

  setFilters: (filters: DroneFilters) => {
    set({ filters: { ...get().filters, ...filters } });
  },

  clearError: () => {
    set({ error: null });
  },
}));