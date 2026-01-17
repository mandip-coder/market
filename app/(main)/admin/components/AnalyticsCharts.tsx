"use client";

import React from "react";
import ReactECharts from "echarts-for-react";
import { Card, Row, Col, Skeleton } from "antd";
import { DealsByStage, LeadsVsDealsData } from "../services/types";
import { color } from "echarts";
import AppErrorUI from "@/components/AppErrorUI/AppErrorUI";
import { ApiError } from "@/lib/apiClient/ApiError";

interface AnalyticsChartsProps {
  dealSummaryData?: DealsByStage[];
  dealSummaryLoading: boolean;
  dealSummaryError?: Error | null;
  leadsVsDealsData?: LeadsVsDealsData[];
  leadsVsDealsLoading: boolean;
  leadsVsDealsError?: Error | null;
}

const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ 
  dealSummaryData,
  dealSummaryLoading,
  dealSummaryError,
  leadsVsDealsData,
  leadsVsDealsLoading,
  leadsVsDealsError
}) => {
  const lineChartOption = {
    tooltip: {
      trigger: "axis",
    },
    legend: {
      data: ["Leads", "Deals"],
      bottom: 0,
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "10%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: leadsVsDealsData?.map((item) => item.date) || [],
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        name: "Leads",
        type: "line",
        smooth: true,
        data: leadsVsDealsData?.map((item) => item.leads) || [],
        itemStyle: { color: "#3b82f6" },
        areaStyle: { opacity: 0.1, color: "#3b82f6" },
      },
      {
        name: "Deals",
        type: "line",
        smooth: true,
        data: leadsVsDealsData?.map((item) => item.deals) || [],
        itemStyle: { color: "#10b981" },
        areaStyle: { opacity: 0.1, color: "#10b981" },
      },
    ],
  };

  const barChartOption = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
    },
    grid: {
      left: "3%",
      right: "8%",
      bottom: "3%",
      top: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "value",
      axisLabel: {
        formatter: "{value}",
      },
    },
    yAxis: {
      type: "category",
      data: dealSummaryData?.map((item) => item.stage) || [],
      axisLabel: {
        fontSize: 12,
      },
    },
    series: [
      {
        type: "bar",
        data: dealSummaryData?.map((item, index) => ({
          value: item.total,
          itemStyle: {
            color: ["#3b82f6", "#8b5cf6", "#10b981", "#ef4444"][index % 4],
            borderRadius: [0, 8, 8, 0],
          },
        })) || [],
        label: {
          show: true,
          position: "right",
          formatter: "{c}",
          fontSize: 14,
          fontWeight: "bold",
          color: "#374151",
        },
        barWidth: "60%",
      },
    ],
  };

  return (
    <div className="mb-6">
        <Row gutter={[16, 16]}>
            <Col xs={24} lg={16}>
                <Card title="Leads vs Deals Trend" loading={leadsVsDealsLoading} variant={"outlined"}>
                    {leadsVsDealsError ? (
                      <AppErrorUI 
                        code={leadsVsDealsError instanceof ApiError ? leadsVsDealsError.statusCode : 500} 
                        message={leadsVsDealsError.message} 
                      />
                    ) : (
                      <ReactECharts option={lineChartOption} style={{ height: 350 }} opts={{ renderer: 'svg' }} />
                    )}
                </Card>
            </Col>
             <Col xs={24} lg={8}>
                <Card title="Deals by Stage" loading={dealSummaryLoading} variant={"outlined"}>
                    {dealSummaryError ? (
                      <AppErrorUI 
                        code={dealSummaryError instanceof ApiError ? dealSummaryError.statusCode : 500} 
                        message={dealSummaryError.message} 
                      />
                    ) : (
                      <ReactECharts option={barChartOption} style={{ height: 350 }} opts={{ renderer: 'svg' }} />
                    )}
                </Card>
            </Col>
        </Row>
     
    </div>
  );
};

export default AnalyticsCharts;
