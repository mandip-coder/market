import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient/apiClient';
import { APIPATH } from '@/shared/constants/url';
import { Deal } from '@/app/(main)/deals/services/deals.types';

/**
 * Fetch all deals for a specific product
 */
export const useFetchProductDeals = (productUUID: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['product-deals', productUUID],
    queryFn: async (): Promise<Deal[]> => {
      const response = await apiClient.get<{ data: Deal[] }>(
        APIPATH.PRODUCTS.PRODUCTWISEDEALS(productUUID)
      );
      return response.data;
    },
    enabled: enabled && !!productUUID,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
