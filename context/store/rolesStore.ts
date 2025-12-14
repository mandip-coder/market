import { RolesFormData } from "@/app/(main)/master/roles-master/components/AddRoleDrawer";
import { RolesDataResponse } from "@/app/(main)/master/roles-master/components/RoleDataTable";
import { create } from "zustand";

interface RolesStore {
  addRolesDrawer: boolean;
  toggleRolesDrawer: () => void;
  editRole: RolesFormData | null;
  setEditRole: (role: RolesFormData | null) => void;
  tableDataState: RolesDataResponse["data"];
  setTableDataState: (data: RolesDataResponse["data"] | ((prev: RolesDataResponse["data"]) => RolesDataResponse["data"])) => void;
}

export const useRoleStore = create<RolesStore>((set, get) => ({
  addRolesDrawer: false,
  toggleRolesDrawer: () => set({ addRolesDrawer: !get().addRolesDrawer }),
  editRole: null,
  setEditRole: (role) => set({ editRole: role }),

  tableDataState: [],
  setTableDataState: (data) =>
    set((state) => ({
      tableDataState: typeof data === "function" ? data(state.tableDataState) : data,
    })),

}));
