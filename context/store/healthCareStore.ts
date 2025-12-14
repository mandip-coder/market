import { create } from "zustand";

interface HelathcareStore {
  viewMode: 'grid' | 'table'
  toggleViewMode: () => void
  addHealthCareModal: boolean
  setHealthCareModal: (open: boolean) => void
}
export const useHealthCareStore = create<HelathcareStore>((set, get,) => ({
  viewMode: 'grid',
  toggleViewMode: () => set({ viewMode: get().viewMode === 'grid' ? 'table' : 'grid' }),
  addHealthCareModal: false,
  setHealthCareModal: (open: boolean) => set({ addHealthCareModal: open }),
}
));
