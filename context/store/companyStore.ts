import { CompanyFormData } from "@/app/(main)/master/company-master/components/AddCompanyDrawer";
import { CompanyDataResponse } from "@/app/(main)/master/company-master/components/CompanyDataTable";
import { create } from "zustand";

interface CompanyStore {
  addCompanyDrawer: boolean;
  toggleCompanyDrawer: () => void;
  editCompany: CompanyFormData | null;
  setEditCompany: (user: CompanyFormData | null) => void;
  tableDataState: CompanyDataResponse["data"]["companies"];
  setTableDataState: (data: CompanyDataResponse["data"]["companies"] | ((prev: CompanyDataResponse["data"]["companies"]) => CompanyDataResponse["data"]["companies"])) => void;
}

export const useCompanyStore = create<CompanyStore>((set, get) => ({
  addCompanyDrawer: false,
  toggleCompanyDrawer: () => set({ addCompanyDrawer: !get().addCompanyDrawer }),
  editCompany: null,
  setEditCompany: (company) => set({ editCompany: company }),

  tableDataState: [],
  setTableDataState: (data) =>
    set((state) => ({
      tableDataState: typeof data === "function" ? data(state.tableDataState) : data,
    })),

}));
