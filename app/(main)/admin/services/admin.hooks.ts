import { useQuery } from "@tanstack/react-query";
import { ADMIN_KEYS } from "./admin.keys";
import { 
    fetchAnalyticsOverview, 
    fetchDealSummary,
    fetchLeadsVsDeals,
    fetchUserPerformance, 
    fetchUserDetail,
    AnalyticsParams 
} from "./admin.services";

const defaultCacheParams = {
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
}
export const useAnalyticsOverview = (params: AnalyticsParams) => {
  return useQuery({
    queryKey: [ADMIN_KEYS.ANALYTICS.OVERVIEW, params],
    queryFn: () => fetchAnalyticsOverview(params),
    ...defaultCacheParams,
  });
};


export const useDealSummary = (params: AnalyticsParams) => {
  return useQuery({
    queryKey: [ADMIN_KEYS.ANALYTICS.DEAL_SUMMARY, params],
    queryFn: () => fetchDealSummary(params),
    ...defaultCacheParams,
  });
};

export const useLeadsVsDeals = (params: AnalyticsParams) => {
  return useQuery({
    queryKey: [ADMIN_KEYS.ANALYTICS.LEADS_VS_DEALS, params],
    queryFn: () => fetchLeadsVsDeals(params),
    ...defaultCacheParams,
  });
};

export const useUserPerformance = (params: AnalyticsParams) => {
  return useQuery({
    queryKey: [ADMIN_KEYS.USERS.PERFORMANCE, params],
    queryFn: () => fetchUserPerformance(params),
    ...defaultCacheParams,
  });
};

export const useUserDetails = (userId: string | null) => {
  return useQuery({
    queryKey: [ADMIN_KEYS.USERS.DETAIL, userId],
    queryFn: () => fetchUserDetail(userId!),
    enabled: !!userId,
    ...defaultCacheParams,
  });
};
