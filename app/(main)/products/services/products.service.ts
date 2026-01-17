import { apiClient } from '@/lib/apiClient/apiClient';
import { APIPATH } from '@/shared/constants/url';
import { CreateProductData, Product, ProductDocument, ProductDocumentPayload, UpdateProductData } from './types';
import { CoverageSnapshot } from '../[id]/types/coverage.types';

/**
 * Products API Service
 * Encapsulates all product-related API calls
 */
export const productsService = {
  /**
   * Fetch paginated products with filters
   */
  fetchProducts: async (): Promise<Product[]> => {
    const response = await apiClient.get<{ data: Product[] }>(
      `${APIPATH.PRODUCTS.GETPRODUCTS}`
    );
    return response.data;
  },

  /**
   * Fetch individual product by ID
   */
  fetchProductById: async (id: string): Promise<Product> => {
    const response = await apiClient.get<{ data: Product }>(APIPATH.PRODUCTS.GETPRODUCT(id));
    return response.data;
  },



  fetchProductCounts: async (productUUID: string): Promise<CoverageSnapshot> => {
    const response = await apiClient.get<{ data: CoverageSnapshot }>(APIPATH.PRODUCTS.GETPRODUCTCOUNTS(productUUID));
    return response.data;
  },

  /**
   * Create a new product
   */
  createProduct: async (data: CreateProductData): Promise<Product> => {
    const response = await apiClient.post<{ data: Product }>(APIPATH.PRODUCTS.CREATEPRODUCT, data);
    return response.data;
  },

  /**
   * Update an existing product
   */
  updateProduct: async (data: UpdateProductData): Promise<Product> => {
    const { productUUID, ...updateData } = data;
    const response = await apiClient.put<{ data: Product }>(
      APIPATH.PRODUCTS.UPDATEPRODUCT(productUUID),
      updateData
    );
    return response.data;
  },

  /**
   * Delete a product
   */
  deleteProduct: async (productUUID: string): Promise<void> => {
    await apiClient.delete(APIPATH.PRODUCTS.DELETEPRODUCT + productUUID);
  },

  /**
   * Update product status
   */
  updateProductStatus: async (productUUID: string, status: string): Promise<Product> => {
    const response = await apiClient.patch<{ data: Product }>(
      APIPATH.PRODUCTS.UPDATESTATUS(productUUID),
      { status }
    );
    return response.data;
  },
  fetchProductDocuments: async (productUUID: string): Promise<ProductDocument[]> => {
    const response = await apiClient.get<{ data: ProductDocument[] }>(
      APIPATH.PRODUCTS.DOCUMENTS.GETALL(productUUID)
    );
    return response.data;
  },
  createProductDocument: async (data: ProductDocumentPayload): Promise<ProductDocument> => {
    const response = await apiClient.post<{ data: ProductDocument }>(APIPATH.PRODUCTS.DOCUMENTS.CREATE, data);
    return response.data;
  },
  updateProductDocument: async (data: ProductDocumentPayload, productDocumentUUID: string): Promise<ProductDocument> => {
    const response = await apiClient.put<{ data: ProductDocument }>(APIPATH.PRODUCTS.DOCUMENTS.UPDATE(productDocumentUUID), data);
    return response.data;
  },
  deleteProductDocument: async (productDocumentUUID: string): Promise<void> => {
    await apiClient.delete(APIPATH.PRODUCTS.DOCUMENTS.DELETE(productDocumentUUID));
  },
  updateDocumentSecurity: async (productDocumentUUID: string, sensitive: boolean): Promise<ProductDocument> => {
    const response = await apiClient.patch<{ data: ProductDocument }>(APIPATH.PRODUCTS.DOCUMENTS.UPDATESTATUS(productDocumentUUID, sensitive));
    return response.data;
  },

};
