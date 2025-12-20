// Dashboard TypeScript interfaces
export interface KPIStats {
  activeOpenDealsAll: number
  wonDealsAll: number
  totalDealsAll: number
  activeMonth: number
}

export interface TopProduct {
  productUUID: string
  productName: string
  productCode: string
  totalCount: number
  therapeuticArea?: string
}

export interface DealStage {
  stageName: string
  stageCount: number
}

export interface DashboardData {
  kpiStats: KPIStats
  topProducts: TopProduct[]
  dealStages: DealStage[]
}
