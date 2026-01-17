import { User } from "@/app/(main)/master/user-management/services/user.types";
import { create } from "zustand";

interface UsersStore {
  addUserDrawer: boolean;
  toggleAddUserDrawer: () => void;
  editUser: Partial<User> | null;
  setEditUser: (user: Partial<User> | null) => void;
  lockModal: boolean;
  setLockModal: (lock: boolean) => void;
}

export const useUsersStore = create<UsersStore>((set, get) => ({
  addUserDrawer: false,
  toggleAddUserDrawer: () => set({ addUserDrawer: !get().addUserDrawer }),
  editUser: null,
  setEditUser: (user) => set({ editUser: user }),

  lockModal: false,
  setLockModal: (lock) => set({ lockModal: lock }),
}));
