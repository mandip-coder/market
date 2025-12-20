'use client'

import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { dashboardService } from '../services/dashboard.service'
import { dashboardKeys } from './keys'
import type { KPIStats, TopProduct, DealStage } from '../types/dashboard.types'

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


