import { UserFormValues } from "@/app/(main)/master/user-management/components/Add-User-Drawer";
import { UsersDataResponse } from "@/app/(main)/master/user-management/components/UserDataTable";
import { create } from "zustand";

interface UsersStore {
  addUserDrawer: boolean;
  toggleAddUserDrawer: () => void;
  editUser: UserFormValues | null;
  setEditUser: (user: UserFormValues | null) => void;
  tableDataState: UsersDataResponse["data"]["users"];
  setTableDataState: (data: UsersDataResponse["data"]["users"] | ((prev: UsersDataResponse["data"]["users"]) => UsersDataResponse["data"]["users"])) => void;
  lockModal: boolean;
  setLockModal: (lock: boolean) => void;
}

export const useUsersStore = create<UsersStore>((set, get) => ({
  addUserDrawer: false,
  toggleAddUserDrawer: () => set({ addUserDrawer: !get().addUserDrawer }),
  editUser: null,
  setEditUser: (user) => set({ editUser: user }),

  tableDataState: [],
  setTableDataState: (data) =>
    set((state) => ({
      tableDataState: typeof data === "function" ? data(state.tableDataState) : data,
    })),

  lockModal: false,
  setLockModal: (lock) => set({ lockModal: lock }),
}));
