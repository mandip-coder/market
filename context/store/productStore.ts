import { Product, ProductFormData } from "@/app/(main)/products/services/types";
import { create } from "zustand";



interface ProductStore {
  addProductDrawer: boolean;
  toggleProductDrawer: () => void;
  editProduct: ProductFormData | null;
  setEditProduct: (product: ProductFormData | null) => void;
  tableDataState: Product[];
  setTableDataState: (data: Product[] | ((prev: Product[]) => Product[])) => void;
}

export const useProductStore = create<ProductStore>((set, get) => ({
  addProductDrawer: false,
  toggleProductDrawer: () => set({ addProductDrawer: !get().addProductDrawer }),
  editProduct: null,
  setEditProduct: (product) => set({ editProduct: product }),

  tableDataState: [],
  setTableDataState: (data) =>
    set((state) => ({
      tableDataState: typeof data === "function" ? data(state.tableDataState) : data,
    })),

}));
