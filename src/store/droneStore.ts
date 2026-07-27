import { create } from 'zustand';
import type { Drone, DroneModel, DroneStatus } from '../types';
import { generateMockDrones } from '../data/mockDataLarge';

interface DroneStore {
  drones: Drone[];
  isLoading: boolean;
  error: string | null;
  
  // CRUD Operations
  addDrone: (drone: Omit<Drone, 'id'>) => void;
  updateDrone: (id: string, drone: Partial<Drone>) => void;
  deleteDrone: (id: string) => void;
  getDrone: (id: string) => Drone | undefined;
  
  // Bulk Operations
  loadDrones: (count: number) => void;
  clearDrones: () => void;
}

export const useDroneStore = create<DroneStore>((set, get) => ({
  drones: [],
  isLoading: false,
  error: null,

  addDrone: (droneData) => {
    set((state) => {
      const newDrone: Drone = {
        ...droneData,
        id: `DRN-${String(state.drones.length + 1).padStart(3, '0')}`,
      };
      return {
        drones: [...state.drones, newDrone],
        error: null,
      };
    });
  },

  updateDrone: (id, droneData) => {
    set((state) => ({
      drones: state.drones.map((drone) =>
        drone.id === id ? { ...drone, ...droneData } : drone
      ),
      error: null,
    }));
  },

  deleteDrone: (id) => {
    set((state) => ({
      drones: state.drones.filter((drone) => drone.id !== id),
      error: null,
    }));
  },

  getDrone: (id) => {
    return get().drones.find((drone) => drone.id === id);
  },

  loadDrones: (count) => {
    set({ isLoading: true, error: null });
    try {
      const newDrones = generateMockDrones(count);
      set((state) => ({
        drones: [...state.drones, ...newDrones],
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Drone yüklenirken hata oluştu',
        isLoading: false,
      });
    }
  },

  clearDrones: () => {
    set({ drones: [], error: null });
  },
}));