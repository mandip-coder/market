'use client'

import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { recommendationsKeys } from './recommendations.queryKeys';
import { recommendationsService, RecommendationFilters } from './recommendations.service';
import { RecommendationsResponse } from '../(mainTabs)/@recommendations/types';


export function useInfiniteRecommendations(
  filters: Omit<RecommendationFilters, 'page' | 'size'>,
  enabled?: boolean
) {
  return useInfiniteQuery({
    queryKey: recommendationsKeys.list(filters),
    queryFn: ({ pageParam = 1 }) =>
      recommendationsService.fetchRecommendations({
        ...filters,
        page: pageParam,
        size: 10,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage: RecommendationsResponse) => {
      return lastPage.data.hasNext ? lastPage.data.page + 1 : undefined;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: enabled !== false,
    retry: 1,
  });
}

export function useApplyRecommendation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (recommendationUUID: string) =>
      recommendationsService.applyRecommendation(recommendationUUID),
    onSuccess: () => {
      // Invalidate all recommendations queries to refetch
      queryClient.invalidateQueries({ queryKey: recommendationsKeys.lists() });
      toast.success('Recommendation applied successfully');
    },
    onError: (error: Error) => {
      console.error('Error applying recommendation:', error);
      toast.error(error.message || 'Failed to apply recommendation');
    },
  });
}
