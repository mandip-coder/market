export interface ProductFormData extends Product {
  productUUID: string;
}

export interface Product {
  productName: string;
  therapeuticArea: string;
  therapeuticAreaUUID: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  productUUID: string;
  dealProductUUID: string;
  partCode: string[];
  BNFCode: string[];
  status?: string;
}

export interface ProductFilters {
  page: number;
  pageSize: number;
  searchQuery?: string;
  therapeuticAreaFilter?: string;
}

export interface CreateProductData {
  productName: string;
  therapeuticAreaUUID: string;
  partCode: string[];
  BNFCode: string[];
}

export interface UpdateProductData extends Partial<CreateProductData> {
  productUUID: string;
}

export interface ProductDocument {
  createdAt: string;
  createdBy: string;
  documentCategoryName: string;
  documentCategoryUUID: string;
  documentName: string;
  fileName: string;
  filePath: string;
  mimeType: string;
  notes: string;
  productDocumentUUID: string;
  sensitive: boolean;
  size: number;
  status: string;
  updatedAt: string;
  updatedBy: string;
  url: string;
}

export interface ProductDocumentPayload {
  documentName: string;
  documentCategoryUUID: string;
  notes?: string;
  fileName: string;
  filePath: string;
  mimeType: string;
  sensitive: boolean;
  productUUID: string;
  url: string;
  size: number;
}
