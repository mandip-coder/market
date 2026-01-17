
import { type UseQueryOptions } from '@tanstack/react-query';
import type { DealStage, KPIStats, TopProduct } from './dashboard.types';
import { dashboardKeys } from './keys';
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { dashboardService } from "./dashboard.service";

// Re-export mutations from leads/deals hooks so we don't have to import them individually in widgets
// and can keep the dashboard widget clean
export {
  useCancelFollowUp as useCancelLeadFollowUp, useCompleteFollowUp as useCompleteLeadFollowUp, useDeleteFollowUp as useDeleteLeadFollowUp, useRescheduleFollowUp as useRescheduleLeadFollowUp
} from "@/app/(main)/leads/services/leads.hooks";

export {
  useCancelFollowUp as useCancelDealFollowUp, useCompleteFollowUp as useCompleteDealFollowUp, useDeleteFollowUp as useDeleteDealFollowUp, useRescheduleFollowUp as useRescheduleDealFollowUp
} from "@/app/(main)/deals/services/deals.hooks";



export const useDashboardLeadFollowUps = () => {
  return useQuery({
    queryKey: dashboardKeys.leadFollowUps(),
    queryFn: () => dashboardService.fetchDashboardLeadFollowUps(),
    placeholderData: keepPreviousData,
  });
};

export const useDashboardDealFollowUps = () => {
  return useQuery({
    queryKey: dashboardKeys.dealFollowUps(),
    queryFn: () => dashboardService.fetchDashboardDealFollowUps(),
    placeholderData: keepPreviousData,
  });
};

// Hook to invalidate dashboard queries when actions occur
export const useInvalidateDashboardFollowUps = () => {
  const queryClient = useQueryClient();
  
  return {
    invalidateLeadFollowUps: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.leadFollowUps() });
    },
    invalidateDealFollowUps: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.dealFollowUps() });
    }
  };
};



export const useKPIStatsQuery = (
  options?: Omit<UseQueryOptions<KPIStats>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: dashboardKeys.kpi(),
    queryFn: dashboardService.getKPIStats,
    staleTime: 5 * 60 * 1000,
    ...options,
  })
}

export const useTopProductsQuery = (
  options?: Omit<UseQueryOptions<TopProduct[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: dashboardKeys.topProducts(),
    queryFn: dashboardService.getTopProducts,
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  })
}

export const useDealStagesQuery = (
  options?: Omit<UseQueryOptions<DealStage[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: dashboardKeys.dealStages(),
    queryFn: dashboardService.getDealStages,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  })
}


