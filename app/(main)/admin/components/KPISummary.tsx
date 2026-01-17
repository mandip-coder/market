"use client";

import AppErrorUI from "@/components/AppErrorUI/AppErrorUI";
import { ProductSkeleton } from "@/components/Skeletons/ProductCardSkelton";
import { ApiError } from "@/lib/apiClient/ApiError";
import { Col, Row } from "antd";
import React from "react";
import { KpiCard } from "../../dashboard/components/KpiCard";
import { AnalyticsKPI } from "../services/types";

interface KPISummaryProps {
  data?: AnalyticsKPI;
  loading: boolean;
  error?: Error | null;
}

const KPISummary: React.FC<KPISummaryProps> = ({ data, loading, error }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ProductSkeleton />
        <ProductSkeleton />
        <ProductSkeleton />
        <ProductSkeleton />
      </div>
    );
  }
  
  if (error) {
    const statusCode = error instanceof ApiError ? error.statusCode : 500;
    return <AppErrorUI code={statusCode} message={error.message} />;
  }
  
  if (!data) {
    return <AppErrorUI code={404} message="No data available" />;
  }
  return (
    <div className="mb-6">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={4}>
          <KpiCard
            title="Total Leads"
            value={data.totalLeads}
            color="green"
          />
        </Col>
        <Col xs={24} sm={12} md={5}>
          <KpiCard
            title="Total Deals"
            value={data.totalDeals}
            color="blue"
          />
        </Col>
        <Col xs={24} sm={12} md={5}>
          <KpiCard
            title="Win Rate"
            value={data.winRate + "%"}
            color="green"
          />
        </Col>
        <Col xs={24} sm={12} md={5}>
          <KpiCard
            title="Avg Deal Close Time"
            value={data.avgDealCloseTime + " days"}
            color="orange"
          />
        </Col>
        <Col xs={24} sm={12} md={5}>
          <KpiCard
            title="Active Users"
            value={data.activeUsers}
            color="purple"
          />
        </Col>
      </Row>
    </div>
  );
};

export default KPISummary;
