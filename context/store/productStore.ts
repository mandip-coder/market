import { create } from "zustand";

export interface ProductFormData extends Product {
  productUUID: string;
}

export interface Product {
  productErpId: number,
  productCode: string,
  productName: string,
  genericName: string,
  therapeuticArea: string,
  createdAt: string,
  updatedAt: string,
  createdBy: string,
  updatedBy: string,
  productUUID: string,
  dealProductUUID: string
}

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
