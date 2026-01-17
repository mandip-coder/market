"use client";

import { useState, useMemo } from 'react';
import { Card, DatePicker } from 'antd';
import { BarChart3, Calendar as CalendarIcon } from 'lucide-react';
import dayjs, { Dayjs } from 'dayjs';
import { CoverageCharts } from './CoverageCharts';
import { ChartData } from '../types/coverage.types';
import { MOCK_PRODUCT_DEALS, MOCK_HEALTHCARES_WITH_DEALS } from './mockCoverageData';
import { useDropdownDealStages } from '@/services/dropdowns/dropdowns.hooks';
import { getStageColor } from '@/Utils/helpers';

interface CoverageAnalyticsTabProps {
  productId: string;
}

// export const CoverageAnalyticsTab = ({ productId }: CoverageAnalyticsTabProps) => {
//   const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([null, null]);
//   const [timeGranularity, setTimeGranularity] = useState<'day' | 'month' | 'year'>('month');
//   const [spanGranularity, setSpanGranularity] = useState<'day' | 'month' | 'year'>('day');

//   // Fetch dynamic deal stages
//   const { data: dealStages = [] } = useDropdownDealStages();

//   // For demo purposes, use mock data
//   const allDeals = MOCK_PRODUCT_DEALS;

//   // Filter deals by date range
//   const dealsForCharts = useMemo(() => {
//     if (!dateRange || !dateRange[0] || !dateRange[1]) {
//       return allDeals;
//     }

//     return allDeals.filter(deal => {
//       const dealDate = dayjs(deal.dealDate);
//       return dealDate.isAfter(dateRange[0]!.startOf('day')) &&
//         dealDate.isBefore(dateRange[1]!.endOf('day'));
//     });
//   }, [allDeals, dateRange]);

//   // Prepare chart data
//   const chartData = useMemo((): ChartData => {


//     // Deals over time
//     const dealsByTime = dealsForCharts.reduce((acc, deal) => {
//       let format = 'MMM YYYY';
//       if (timeGranularity === 'day') format = 'MMM DD, YYYY';
//       if (timeGranularity === 'year') format = 'YYYY';

//       const timeKey = dayjs(deal.dealDate).format(format);

//       if (!acc[timeKey]) {
//         acc[timeKey] = {
//           total: 0,
//           byStage: {} as Record<string, number>
//         };
//       }

//       acc[timeKey].total += 1;

//       if (acc[timeKey].byStage[deal.dealStage] !== undefined) {
//         acc[timeKey].byStage[deal.dealStage] += 1;
//       } else {
//         acc[timeKey].byStage[deal.dealStage] = 1;
//       }

//       return acc;
//     }, {} as Record<string, { total: number, byStage: Record<string, number> }>);

//     const dealsOverTime = Object.entries(dealsByTime)
//       .map(([date, data]: any) => ({
//         date,
//         count: data.total,
//         byStage: data.byStage
//       }))
//       .sort((a, b) => {
//         let format = 'MMM YYYY';
//         if (timeGranularity === 'day') format = 'MMM DD, YYYY';
//         if (timeGranularity === 'year') format = 'YYYY';
//         return dayjs(a.date, format).unix() - dayjs(b.date, format).unix();
//       });

//     // Distribution by type - count deals by healthcare type
//     const dealsByType = dealsForCharts.reduce((acc, deal) => {
//       const healthcare = MOCK_HEALTHCARES_WITH_DEALS.find(h => h.hcoUUID === deal.hcoUUID);
//       if (healthcare) {
//         acc[healthcare.hcoType] = (acc[healthcare.hcoType] || 0) + 1;
//       }
//       return acc;
//     }, {} as Record<string, number>);

//     const totalDealsInCharts = dealsForCharts.length;
//     const distributionByType = [
//       {
//         type: 'NHS',
//         count: dealsByType['NHS'] || 0,
//         percentage: totalDealsInCharts > 0 ? ((dealsByType['NHS'] || 0) / totalDealsInCharts) * 100 : 0,
//       },
//       {
//         type: 'ICB',
//         count: dealsByType['ICB'] || 0,
//         percentage: totalDealsInCharts > 0 ? ((dealsByType['ICB'] || 0) / totalDealsInCharts) * 100 : 0,
//       },
//       {
//         type: 'PCN',
//         count: dealsByType['PCN'] || 0,
//         percentage: totalDealsInCharts > 0 ? ((dealsByType['PCN'] || 0) / totalDealsInCharts) * 100 : 0,
//       },
//     ];

//     // Distribution by stage - use dynamic stage names from data
//     const dealsByStage = dealsForCharts.reduce((acc, deal) => {
//       acc[deal.dealStage] = (acc[deal.dealStage] || 0) + 1;
//       return acc;
//     }, {} as Record<string, number>);

//     const distributionByStage = Object.entries(dealsByStage).map(([stageUUID, count]) => {
//       const stage = dealStages.find(s => s.dealStageUUID === stageUUID);
//       const stageName = stage?.dealStageName || 'Unknown';
//       return {
//         stage: stageName,
//         count,
//         color: getStageColor(stageName as string),
//       };
//     });

//     // Top employees
//     const employeeCounts = dealsForCharts.reduce((acc, deal) => {
//       if (!acc[deal.createdBy]) {
//         acc[deal.createdBy] = { total: 0, won: 0, lost: 0 };
//       }
//       acc[deal.createdBy].total += 1;
//       // Check if stage name contains "won" or "lost" using dynamic lookup
//       const stage = dealStages.find(s => s.dealStageUUID === deal.dealStage);
//       const stageName = stage?.dealStageName.toLowerCase() || '';
//       if (stageName.includes('won')) {
//         acc[deal.createdBy].won += 1;
//       } else if (stageName.includes('lost')) {
//         acc[deal.createdBy].lost += 1;
//       }
//       return acc;
//     }, {} as Record<string, { total: number, won: number, lost: number }>);

//     const topEmployees = Object.entries(employeeCounts)
//       .map(([name, counts]: any) => ({
//         name,
//         dealCount: counts.total,
//         wonCount: counts.won,
//         lostCount: counts.lost
//       }))
//       .sort((a, b) => b.dealCount - a.dealCount)

//     // User Deal Spans (Gantt Chart Data)
//     const userDealSpans = dealsForCharts.map(deal => {
//       // Determine End Date
//       let endDateStr = '';
//       const stage = dealStages.find(s => s.dealStageUUID === deal.dealStage);
//       const stageName = stage?.dealStageName.toLowerCase() || '';
//       if (stageName.includes('won') || stageName.includes('lost')) {
//         endDateStr = deal.updatedAt;
//       } else {
//         // For open deals, use today
//         endDateStr = new Date().toISOString();
//       }

//       const startDate = dayjs(deal.dealDate);
//       const endDate = dayjs(endDateStr);
//       const durationDays = endDate.diff(startDate, 'day');

//       return {
//         userName: deal.createdBy, // Assuming createdBy is the user name for display
//         dealName: deal.dealName,
//         stage: stage?.dealStageName || 'Unknown',
//         startDate: deal.dealDate,
//         endDate: endDateStr,
//         durationDays: durationDays > 0 ? durationDays : 0,
//         dealUUID: deal.dealUUID
//       };
//     }).sort((a, b) => a.userName.localeCompare(b.userName)); // Sort by user name for grouping

//     return {
//       dealsOverTime,
//       distributionByType,
//       distributionByStage,
//       topEmployees,
//       userDealSpans,
//     };
//   }, [dealsForCharts, timeGranularity, dealStages]);

//   return (
//     <div className="space-y-6">
//       {/* Charts Card with Date Filter */}
//       <Card
//         title={
//           <div className="flex items-center gap-2">
//             <BarChart3 className="h-5 w-5 text-green-600 dark:text-green-400" />
//             <span className="font-semibold">Coverage Analytics</span>
//           </div>
//         }
//         extra={
//           <div className="flex items-center gap-2">
//             <CalendarIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
//             <DatePicker.RangePicker
//               value={dateRange}
//               onChange={(dates) => setDateRange(dates || [null, null])}
//               format="MMM DD, YYYY"
//               placeholder={['Start Date', 'End Date']}
//               allowClear
//               presets={[
//                 { label: 'Last 7 Days', value: [dayjs().subtract(7, 'day'), dayjs()] },
//                 { label: 'Last 30 Days', value: [dayjs().subtract(30, 'day'), dayjs()] },
//                 { label: 'Last 3 Months', value: [dayjs().subtract(3, 'month'), dayjs()] },
//                 { label: 'Last 6 Months', value: [dayjs().subtract(6, 'month'), dayjs()] },
//                 { label: 'This Year', value: [dayjs().startOf('year'), dayjs()] },
//                 { label: 'All Time', value: [null, null] },
//               ]}
//               className="w-64"
//             />
//           </div>
//         }
//         className="!border-gray-200 dark:!border-gray-700"
//       >
//         <CoverageCharts
//           chartData={chartData}
//           timeGranularity={timeGranularity}
//           onTimeGranularityChange={setTimeGranularity}
//           spanGranularity={spanGranularity}
//           onSpanGranularityChange={setSpanGranularity}
//         />
//       </Card>
//     </div>
//   );
// };
