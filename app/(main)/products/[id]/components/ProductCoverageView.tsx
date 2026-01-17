"use client";

import { useDropdownDealStages } from "@/services/dropdowns/dropdowns.hooks";
import { Card, Divider, Empty } from "antd";
import { Loader2, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import {
  CoverageSnapshot,
  GroupedHealthcares,
  HealthcareWithDeals,
} from "../types/coverage.types";
import { ExecutiveSnapshot } from "./ExecutiveSnapshot";
import {
  MOCK_HEALTHCARES_WITH_DEALS,
  MOCK_PRODUCT_DEALS,
} from "./mockCoverageData";
import { useProductCounts } from "../../services/products.hooks";
import AppErrorUI from "@/components/AppErrorUI/AppErrorUI";
import { ApiError } from "@/lib/apiClient/ApiError";

interface ProductCoverageViewProps {
  productId: string;
}

export const ProductCoverageView = ({
  productId,
}: ProductCoverageViewProps) => {
  const deals = MOCK_PRODUCT_DEALS;



  const { data: productCounts, isLoading, error } = useProductCounts(productId)


  // Process data
  const processedData = useMemo(() => {
    if (!deals || deals.length === 0) {
      return {
        snapshot: productCounts || {
          totalDeals: 0,
          activeDeals: 0,
          closedWon: 0,
          closedLost: 0,
          followups: 0,
          meetings: 0,
          emails: 0,
          hcos: 0,
          icbs: 0,
          callLogs: 0,
          contactPersons: 0,
        },
        grouped: { NHS: [], ICB: [], PCN: [] },
        chartData: {
          dealsOverTime: [],
          distributionByType: [],
          distributionByStage: [],
          topEmployees: [],
        },
      };
    }

    // Use mock healthcares with deals for demo - NO DATE FILTERING
    const healthcaresWithDeals = MOCK_HEALTHCARES_WITH_DEALS;

    // Group by healthcare type
    const grouped: GroupedHealthcares = {
      NHS: healthcaresWithDeals.filter((h) => h.hcoType === "NHS"),
      ICB: healthcaresWithDeals.filter((h) => h.hcoType === "ICB"),
      PCN: healthcaresWithDeals.filter((h) => h.hcoType === "PCN"),
    };

    return { snapshot: productCounts, grouped };
  }, [productCounts, deals]);





  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
      </div>
    );
  }
  if (error) {
    const statusCode = error instanceof ApiError ? error.statusCode : 500;
    return (
      <AppErrorUI
        code={statusCode}
        message={error.message}
        backLink="/leads"
        buttonName="Back to Leads"
      />
    );
  }

  if (!deals || deals.length === 0) {
    return (
      <Card className="border-gray-200 dark:border-gray-700">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                No Coverage Data Available
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                This product doesn't have any deals with healthcare
                organizations yet.
              </p>
            </div>
          }
        />
      </Card>
    );
  }

  const defaultSnapshot: CoverageSnapshot = {
    totalDeals: 0,
    activeDeals: 0,
    closedWon: 0,
    closedLost: 0,
    followups: 0,
    meetings: 0,
    emails: 0,
    hcos: 0,
    icbs: 0,
    callLogs: 0,
    contactPersons: 0,
  };

  return <ExecutiveSnapshot snapshot={processedData.snapshot || defaultSnapshot} />;
};
