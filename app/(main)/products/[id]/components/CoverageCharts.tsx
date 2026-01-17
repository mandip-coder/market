"use client";

import { Card, Segmented } from 'antd';
import ReactECharts from 'echarts-for-react';
import { ChartData } from '../types/coverage.types';
import { BarChart3, PieChart, TrendingUp, Users, Clock } from 'lucide-react';
import * as echarts from 'echarts';
import { useDropdownDealStages } from '@/services/dropdowns/dropdowns.hooks';
import { getStageColor } from '@/Utils/helpers';


interface CoverageChartsProps {
  chartData: ChartData;
  timeGranularity: 'day' | 'month' | 'year';
  onTimeGranularityChange: (value: 'day' | 'month' | 'year') => void;
  spanGranularity: 'day' | 'month' | 'year';
  onSpanGranularityChange: (value: 'day' | 'month' | 'year') => void;
}

const renderItem = (params: any, api: any) => {
  const categoryIndex = api.value(0);
  const start = api.coord([api.value(1), categoryIndex]);
  const end = api.coord([api.value(2), categoryIndex]);
  const height = api.size([0, 1])[1] * 0.6;
  const rectShape = echarts.graphic.clipRectByRect(
    {
      x: start[0],
      y: start[1] - height / 2,
      width: end[0] - start[0],
      height: height,
    },
    {
      x: params.coordSys.x,
      y: params.coordSys.y,
      width: params.coordSys.width,
      height: params.coordSys.height,
    }
  );
  return (
    rectShape && {
      type: 'rect',
      transition: ['shape'],
      shape: rectShape,
      style: {
        fill: params.itemStyle?.color || '#3b82f6',
        opacity: params.itemStyle?.opacity || 0.8,
      },
    }
  );
};


export const CoverageCharts = ({ 
  chartData, 
  timeGranularity, 
  onTimeGranularityChange,
  spanGranularity,
  onSpanGranularityChange
}: CoverageChartsProps) => {
  // Fetch dynamic deal stages
  const { data: dealStages = [] } = useDropdownDealStages();


  // Deals Over Time Chart - using dynamic stages from chartData
  const dealsOverTimeOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: {
        color: '#374151',
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: chartData.dealsOverTime.map((d) => d.date),
      axisLabel: {
        color: '#6b7280',
      },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: '#6b7280',
      },
    },
    series: Object.keys(chartData.dealsOverTime[0]?.byStage || {}).map(stageUUID => {
      // Get stage info dynamically
      const stage = dealStages.find(s => s.dealStageUUID === stageUUID);
      const stageName = stage?.dealStageName || 'Unknown';
      const stageColor = getStageColor(stageName as string);

      return {
        name: stageName,
        type: 'line',
        smooth: true,
        data: chartData.dealsOverTime.map((d) => d.byStage[stageUUID] || 0),
        itemStyle: {
          color: stageColor,
        },
        areaStyle: {
          opacity: 0.1,
          color: stageColor
        },
      };
    }),
  };

  // Distribution by Healthcare Type Chart
  const distributionByTypeOption = {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: {
        color: '#374151',
      },
    },
    legend: {
      orient: 'vertical',
      bottom: '50%',
      left: '70%',
      icon: 'roundRect',
      textStyle: {
        color: '#6b7280',
      },
    },
    series: [
      {
        name: 'Healthcare Type',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['35%', '50%'],
        data: chartData.distributionByType.map((d) => ({
          value: d.count,
          name: d.type,
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
        label: {
          formatter: '{b}: {d}%',
          color: '#6b7280',
        },
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2,
        },
        color: ['#3b82f6', '#8b5cf6', '#10b981'],
      },
    ],
  };

  // Distribution by Stage Chart
  const distributionByStageOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: {
        color: '#374151',
      },
    },
    legend: {
      orient: 'vertical',
      bottom: '50%',
      left: '70%',
      icon: 'roundRect',
      textStyle: {
        color: '#6b7280',
      },
    },
    series: [
      {
        name: 'Deal Stage',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['35%', '50%'],
        data: chartData.distributionByStage.map((d) => ({
          value: d.count,
          name: d.stage,
          itemStyle: {
            color: d.color,
          },
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
        label: {
          formatter: '{b}: {d}%',
          color: '#6b7280',
        },
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2,
        },
      },
    ],
  };

  // Top Employees Chart
  const topEmployeesOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: {
        color: '#374151',
      },
    },
    legend: {
        data: ['Won', 'Lost', 'Active'],
        bottom: 0,
        textStyle: {
            color: '#6b7280',
        },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      axisLabel: {
        color: '#6b7280',
      },
    },
    yAxis: {
      type: 'category',
      data: chartData.topEmployees.map((d) => d.name),
      axisLabel: {
        color: '#6b7280',
      },
    },
    series: [
      {
        name: 'Won',
        type: 'bar',
        data: chartData.topEmployees.map((d) => d.wonCount),
        itemStyle: {
          color: '#10b981', // Green
           borderRadius: [0, 4, 4, 0],
        },
      },
      {
        name: 'Lost',
        type: 'bar',
        data: chartData.topEmployees.map((d) => d.lostCount),
        itemStyle: {
          color: '#ef4444', // Red
           borderRadius: [0, 4, 4, 0],
        },
      },
      {
        name: 'Active',
        type: 'bar',
        data: chartData.topEmployees.map((d) => d.dealCount - d.wonCount - d.lostCount),
        itemStyle: {
           color: '#3b82f6', // Blue
           borderRadius: [0, 4, 4, 0],
        },
      },
    ],
  };

  // User Deal Spans (Gantt Chart)
  const users = Array.from(new Set(chartData.userDealSpans.map(d => d.userName)));
  
  const userDealSpansOption = {
    tooltip: {
      formatter: (params: any) => {
        const start = new Date(params.value[1]).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
        const end = new Date(params.value[2]).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
        return `${params.marker} <b>${params.name}</b><br/>
                Stage: ${params.value[4]}<br/>
                Duration: ${params.value[3]} days<br/>
                ${start} - ${end}`;
      },
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: {
        color: '#374151',
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%', // increased for legend
      containLabel: true,
    },
    xAxis: {
      type: 'time',
      axisLabel: {
        formatter: (val: number) => {
          if (spanGranularity === 'year') {
            return new Date(val).toLocaleDateString(undefined, { year: 'numeric' });
          }
          if (spanGranularity === 'month') {
            return new Date(val).toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
          }
          return new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        },
        color: '#6b7280',
      },
    },
    yAxis: {
      data: users,
      axisLabel: {
        color: '#6b7280',
      },
    },
    series: [
      {
        name: 'Deal Span',
        type: 'custom',
        renderItem: renderItem,
        itemStyle: {
          opacity: 0.8,
        },
        encode: {
          x: [1, 2],
          y: 0,
        },
        data: chartData.userDealSpans.map(item => {
          let color = '#3b82f6'; // default discussion
          if (item.stage.toLowerCase().includes('won')) color = '#10b981';
          else if (item.stage.toLowerCase().includes('lost')) color = '#ef4444';
          else if (item.stage.toLowerCase().includes('negotiation')) color = '#f59e0b';
          
          return {
            name: item.dealName,
            value: [
              users.indexOf(item.userName),
              new Date(item.startDate).getTime(),
              new Date(item.endDate).getTime(),
              item.durationDays,
              item.stage
            ],
            itemStyle: {
              color: color
            }
          };
        })
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deals Over Time */}
        <Card
          title={
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="font-semibold">Deals Over Time</span>
              </div>
              <Segmented
                options={[
                  { label: 'Day', value: 'day' },
                  { label: 'Month', value: 'month' },
                  { label: 'Year', value: 'year' },
                ]}
                value={timeGranularity}
                onChange={(val) => onTimeGranularityChange(val as 'day' | 'month' | 'year')}
                size="small"
              />
            </div>
          }
          className="border-gray-200 dark:border-gray-700"
        >
          <ReactECharts
            option={dealsOverTimeOption}
            style={{ height: '300px' }}
            opts={{ renderer: 'svg' }}
            notMerge={true}
            lazyUpdate={true}
          />
        </Card>

        {/* Distribution by Healthcare Type */}
        <Card
          title={
            <div className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <span className="font-semibold">Distribution by Healthcare Type</span>
            </div>
          }
          className="border-gray-200 dark:border-gray-700"
        >
          <ReactECharts
            option={distributionByTypeOption}
            style={{ height: '300px' }}
            opts={{ renderer: 'svg' }}
            notMerge={true}
            lazyUpdate={true}
          />
        </Card>

        {/* Distribution by Stage */}
        <Card
          title={
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-600 dark:text-green-400" />
              <span className="font-semibold">Distribution by Deal Stage</span>
            </div>
          }
          className="border-gray-200 dark:border-gray-700"
        >
          <ReactECharts
            option={distributionByStageOption}
            style={{ height: '300px' }}
            opts={{ renderer: 'svg' }}
            notMerge={true}
            lazyUpdate={true}
          />
        </Card>

        {/* Top Employees */}
        <Card
          title={
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              <span className="font-semibold">Employees by Deals</span>
            </div>
          }
          className="border-gray-200 dark:border-gray-700"
        >
          <ReactECharts
            option={topEmployeesOption}
            style={{ height: '300px' }}
            opts={{ renderer: 'svg' }}
            notMerge={true}
            lazyUpdate={true}
          />
        </Card>

        {/* User Deal Spans (Gantt Chart) - Full Width */}
        <Card
          title={
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <span className="font-semibold">User Deal Spans (Duration)</span>
              </div>
              <Segmented
                options={[
                  { label: 'Day', value: 'day' },
                  { label: 'Month', value: 'month' },
                  { label: 'Year', value: 'year' },
                ]}
                value={spanGranularity}
                onChange={(val) => onSpanGranularityChange(val as 'day' | 'month' | 'year')}
                size="small"
              />
            </div>
          }
          className="border-gray-200 dark:border-gray-700 lg:col-span-2"
        >
          <ReactECharts
            option={userDealSpansOption}
            style={{ height: '400px' }}
            opts={{ renderer: 'svg' }}
            notMerge={true}
            lazyUpdate={true}
          />
        </Card>
      </div>
    </div>
  );
};
