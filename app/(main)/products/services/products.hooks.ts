import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productsKeys } from "./products.keys";
import { productsService } from "./products.service";
import {
  CreateProductData,
  Product,
  ProductDocument,
  ProductDocumentPayload,
  UpdateProductData,
} from "./types";
import { toast } from '@/components/AppToaster/AppToaster';

export const useProductsList = () => {
  return useQuery({
    queryKey: productsKeys.lists(),
    queryFn: () => productsService.fetchProducts(),
    staleTime: 60 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 1,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductData) =>
      productsService.createProduct(data),
    onSuccess: (newProduct: Product) => {
      // Optimistically update the cache with the new product
      queryClient.setQueryData(
        productsKeys.lists(),
        (oldData: Product[] | undefined) => {
          if (!oldData) return [newProduct];
          return [...oldData, newProduct];
        }
      );
      toast.success("Product created successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create product!");
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProductData) =>
      productsService.updateProduct(data),
    onSuccess: (updatedProduct: Product) => {
      // Optimistically update the cache with the updated product
      queryClient.setQueryData(
        productsKeys.lists(),
        (oldData: Product[] | undefined) => {
          if (!oldData) return [updatedProduct];
          return oldData.map((product) =>
            product.productUUID === updatedProduct.productUUID
              ? updatedProduct
              : product
          );
        }
      );
      toast.success("Product updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update product!");
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productUUID: string) =>
      productsService.deleteProduct(productUUID),
    onSuccess: (_, productUUID: string) => {
      queryClient.setQueryData(
        productsKeys.lists(),
        (oldData: Product[] | undefined) => {
          if (!oldData) return;
          return oldData.filter(
            (product) => product.productUUID !== productUUID
          );
        }
      );
      toast.success("Product deleted successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete product!");
    }
  });
};

export const useProductById = (id: string) => {
  return useQuery({
    queryKey: productsKeys.detail(id),
    queryFn: () => productsService.fetchProductById(id),
    staleTime: 60 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 1,
  });
};


export const useProductCounts = (id: string) => {
  return useQuery({
    queryKey: productsKeys.counts(id),
    queryFn: () => productsService.fetchProductCounts(id),
    staleTime: 60 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 1,
  });
}
export const useFetchProductDocuments = (id: string) => {
  return useQuery({
    queryKey: productsKeys.documents(id),
    queryFn: () => productsService.fetchProductDocuments(id),
    staleTime: 60 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 1,
  });
};

export const useCreateProductDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProductDocumentPayload) =>
      productsService.createProductDocument(data),
    onSuccess: (newProductDocument: ProductDocument, variables) => {
      // Optimistically update the cache with the new document
      queryClient.setQueryData(
        productsKeys.documents(variables.productUUID),
        (oldData: ProductDocument[] | undefined) => {
          if (!oldData) return [newProductDocument];
          return [...oldData, newProductDocument];
        }
      );
      toast.success("Document created successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create document!");
    }
  });
};

export const useUpdateProductDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProductDocumentPayload & { productDocumentUUID: string }) =>
      productsService.updateProductDocument(data, data.productDocumentUUID),
    onSuccess: (updatedProductDocument: ProductDocument, variables) => {
      // Optimistically update the cache with the updated document
      queryClient.setQueryData(
        productsKeys.documents(variables.productUUID),
        (oldData: ProductDocument[] | undefined) => {
          if (!oldData) return [updatedProductDocument];
          return oldData.map((doc) =>
            doc.productDocumentUUID === updatedProductDocument.productDocumentUUID
              ? updatedProductDocument
              : doc
          );
        }
      );
      toast.success("Document updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update document!");
    }
  });
};
export const useUpdateDocumentStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productUUID, productDocumentUUID, sensitive }: { productUUID: string, productDocumentUUID: string, sensitive: boolean }) =>
      productsService.updateDocumentSecurity(productDocumentUUID, sensitive),
    onSuccess: (updatedProductDocument: ProductDocument, variables) => {
      
      queryClient.setQueryData(
        productsKeys.documents(variables.productUUID),
        (oldData: ProductDocument[] | undefined) => {
          if (!oldData) return [updatedProductDocument];
          return oldData.map((doc) =>
            doc.productDocumentUUID === variables.productDocumentUUID
              ? { ...doc, sensitive: variables.sensitive }
              : doc
          );
        }
      );
      toast.success("Document status updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update document status!");
    }
  });
};

export const useDeleteProductDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productUUID, productDocumentUUID }: { productUUID: string, productDocumentUUID: string }) =>
      productsService.deleteProductDocument(productDocumentUUID),
    onSuccess: (_, variables) => {
      // Optimistically update the cache by removing the deleted document
      queryClient.setQueryData(
        productsKeys.documents(variables.productUUID),
        (oldData: ProductDocument[] | undefined) => {
          if (!oldData) return [];
          return oldData.filter(
            (doc) => doc.productDocumentUUID !== variables.productDocumentUUID
          );
        }
      );
      toast.success("Document deleted successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete document!");
    }
  });
};