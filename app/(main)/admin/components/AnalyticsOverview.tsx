"use client";

import dayjs, { Dayjs } from "dayjs";
import { useMemo, useState } from "react";
import {
  useAnalyticsOverview,
  useDealSummary,
  useLeadsVsDeals,
} from "../services/admin.hooks";
import AnalyticsCharts from "./AnalyticsCharts";
import GlobalFilter from "./GlobalFilter";
import KPISummary from "./KPISummary";
import UserPerformanceTable from "./UserPerformanceTable";

const AnalyticsOverview = () => {
  // State - Initialize with current month by default
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([
    dayjs().startOf('month'),
    dayjs().endOf('month'),
  ]);

  const analyticsParams = useMemo(() => {
    if (dateRange[0] && dateRange[1]) {
      return {
        startDate: dateRange[0]?.toISOString(),
        endDate: dateRange[1]?.toISOString(),
      };
    }
    return {}; // Return empty object if no date range selected
  }, [dateRange]);

  // Queries
  const { data: kpiData, isLoading: kpiLoading, error: kpiError } =
    useAnalyticsOverview(analyticsParams);
  const { data: dealSummaryData, isLoading: dealSummaryLoading, error: dealSummaryError } =
    useDealSummary(analyticsParams);
  const { data: leadsVsDealsData, isLoading: leadsVsDealsLoading, error: leadsVsDealsError } =
    useLeadsVsDeals(analyticsParams);



  return (
    <div className="space-y-6">
      {/* Global Filter */}
      <GlobalFilter
        startDate={dateRange[0]}
        endDate={dateRange[1]}
        onDateRangeChange={(dates) => setDateRange(dates || [null, null])}
      />

      {/* KPI Summary */}
      <KPISummary data={kpiData} loading={kpiLoading} error={kpiError} />

      {/* Charts */}
      <AnalyticsCharts 
        dealSummaryData={dealSummaryData}
        dealSummaryLoading={dealSummaryLoading}
        dealSummaryError={dealSummaryError}
        leadsVsDealsData={leadsVsDealsData}
        leadsVsDealsLoading={leadsVsDealsLoading}
        leadsVsDealsError={leadsVsDealsError}
      />

      <UserPerformanceTable />
    </div>
  );
};

export default AnalyticsOverview;
