import { CompanyFormData } from "@/app/(main)/master/company-master/components/AddCompanyDrawer";
import { create } from "zustand";

interface CompanyStore {
  addCompanyDrawer: boolean;
  toggleCompanyDrawer: () => void;
  editCompany: CompanyFormData | null;
  setEditCompany: (user: CompanyFormData | null) => void;
}

export const useCompanyStore = create<CompanyStore>((set, get) => ({
  addCompanyDrawer: false,
  toggleCompanyDrawer: () => set({ addCompanyDrawer: !get().addCompanyDrawer }),
  editCompany: null,
  setEditCompany: (company) => set({ editCompany: company }),
}));
