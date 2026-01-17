import { Deal } from '@/app/(main)/deals/services/deals.types';
import { Healthcare } from '@/app/(main)/healthcares/services/types';

/**
 * Healthcare organization with all deals for a specific product
 */
export interface HealthcareWithDeals extends Healthcare {
  deals: Deal[];
  latestDealStage: string; // dealStageUUID
  lastActivityDate: string;
  involvedPeople: string[]; // Names from contact persons across all deals
}

/**
 * Executive snapshot metrics for product coverage
 */
export interface CoverageSnapshot {
  totalDeals: number;
  activeDeals: number; // Deals not in Closed Won/Lost
  closedWon: number;
  closedLost: number;
  followups: number;
  meetings: number;
  emails: number;
  hcos: number;
  icbs: number;
  callLogs: number;
  contactPersons: number;
}

/**
 * Chart data for coverage analytics
 */
export interface ChartData {
  dealsOverTime: TimeSeriesDataPoint[];
  distributionByType: DistributionDataPoint[];
  distributionByStage: StageDistributionDataPoint[];
  topEmployees: EmployeeDataPoint[];
  userDealSpans: UserDealSpanDataPoint[];
}

export interface TimeSeriesDataPoint {
  date: string;
  count: number;
  byStage: Record<string, number>;
}

export interface DistributionDataPoint {
  type: string;
  count: number;
  percentage: number;
}

export interface StageDistributionDataPoint {
  stage: string;
  count: number;
  color: string;
}

export interface EmployeeDataPoint {
  name: string;
  dealCount: number;
  wonCount: number;
  lostCount: number;
}

export interface UserDealSpanDataPoint {
  userName: string;
  dealName: string;
  stage: string;
  startDate: string; // ISO string
  endDate: string; // ISO string
  durationDays: number;
  dealUUID: string;
}

/**
 * Grouped healthcare data by type
 */
export interface GroupedHealthcares {
  NHS: HealthcareWithDeals[];
  ICB: HealthcareWithDeals[];
  PCN: HealthcareWithDeals[];
}
