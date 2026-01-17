import { create } from "zustand";

interface HealthcareStore {
  viewMode: 'grid' | 'table'
  toggleViewMode: () => void
  addHealthCareModal: boolean
  setHealthCareModal: (open: boolean) => void
  page: number
  pageSize: number
  setPage: (page: number) => void
  setPageSize: (pageSize: number) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  typeFilter: string
  setTypeFilter: (type: string) => void
  statusFilter: string
  setStatusFilter: (status: string) => void
}

export const useHealthCareStore = create<HealthcareStore>((set, get) => ({
  viewMode: 'grid',
  toggleViewMode: () => set({ viewMode: get().viewMode === 'grid' ? 'table' : 'grid' }),
  addHealthCareModal: false,
  setHealthCareModal: (open: boolean) => set({ addHealthCareModal: open }),
  page: 1,
  pageSize: 10,
  setPage: (page: number) => set({ page }),
  setPageSize: (pageSize: number) => set({ pageSize }),
  searchQuery: '',
  setSearchQuery: (query: string) => set({ searchQuery: query }),
  typeFilter: '',
  setTypeFilter: (type: string) => set({ typeFilter: type }),
  statusFilter: '',
  setStatusFilter: (status: string) => set({ statusFilter: status }),
}));
