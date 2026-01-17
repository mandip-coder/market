import { FollowUP } from "@/lib/types"

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
  stageCountNumber?:number
  stageColor?:string
}

export interface DashboardData {
  kpiStats: KPIStats
  topProducts: TopProduct[]
  dealStages: DealStage[]
}

export interface DashboardFollowUp extends FollowUP {
  leadName?: string;
  dealName?: string;
  hcoName?: string;
}

export interface DashboardFollowUpsResponse {
  data: DashboardFollowUp[];
}
