import { LeadFormData } from "@/app/(main)/leads/components/LeadDrawer";
import { create } from "zustand";


interface LeadsStore {
  page: number;
  pageSize: number;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  leadModal: boolean;
  preFilledData?: Partial<LeadFormData>;
  recommendationUUID?: string;
  toggleLeadDrawer: (
    preFilledData?: Partial<LeadFormData>
  ) => void;
  setRecommendationUUID: (uuid: string) => void;
  clearRecommendationUUID: () => void;
}

export const useLeadStore = create<LeadsStore>((set, get) => ({
  page: 1,
  pageSize: 10,
  leadUUID: "",
  productList: [],
  setPage: (page: number) => set({ page }),
  setPageSize: (pageSize: number) => set({ pageSize }),
  leadModal: false,
  preFilledData: undefined,
  recommendationUUID: undefined,
  toggleLeadDrawer: (preFilledData?: Partial<LeadFormData>) => {
    const currentModal = get().leadModal;
    set({
      leadModal: !currentModal,
      preFilledData: !currentModal ? preFilledData : undefined,
    });
  },
  setRecommendationUUID: (uuid: string) => set({ recommendationUUID: uuid }),
  clearRecommendationUUID: () => set({ recommendationUUID: undefined }),
}));
