import { create } from 'zustand';

interface UIStore {
  isAddDroneModalOpen: boolean;
  openAddDroneModal: () => void;
  closeAddDroneModal: () => void;
  toggleAddDroneModal: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isAddDroneModalOpen: false,
  openAddDroneModal: () => set({ isAddDroneModalOpen: true }),
  closeAddDroneModal: () => set({ isAddDroneModalOpen: false }),
  toggleAddDroneModal: () => set((state) => ({ isAddDroneModalOpen: !state.isAddDroneModalOpen })),
}));