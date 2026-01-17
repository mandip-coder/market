import { Role } from "@/app/(main)/master/roles-master/services/roles.types";
import { create } from "zustand";

interface RolesStore {
  addRolesDrawer: boolean;
  toggleRolesDrawer: () => void;
  editRole: Role | null;
  setEditRole: (role: Role | null) => void;
}

export const useRoleStore = create<RolesStore>((set, get) => ({
  addRolesDrawer: false,
  toggleRolesDrawer: () => set({ addRolesDrawer: !get().addRolesDrawer }),
  editRole: null,
  setEditRole: (role) => set({ editRole: role }),
}));
