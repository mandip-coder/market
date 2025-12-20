import { apiClient } from '@/lib/apiClient/apiClient'
import { APIPATH } from '@/shared/constants/url'
import type { KPIStats, TopProduct, DealStage } from '../types/dashboard.types'


export const dashboardService = {
  getKPIStats: async (): Promise<KPIStats> => {
    const response = await apiClient.get<{ data: KPIStats }>(
      APIPATH.DASHBOARD.KPIDATA
    )
    return response.data
  },

  getTopProducts: async (): Promise<TopProduct[]> => {
    const response = await apiClient.get<{ data: TopProduct[] }>(
      APIPATH.DASHBOARD.TOPPRODUCTS
    )
    return response.data
  },
  getDealStages: async (): Promise<DealStage[]> => {
    const response = await apiClient.get<{ data: DealStage[] }>(
      APIPATH.DASHBOARD.STAGECOUNTS
    )
    return response.data
  },
}
