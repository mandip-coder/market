"use client";

import AsyncSearchSelect from "@/components/AsyncSearchSelect/AsyncSearchSelect";
import { useDealStore } from "@/context/store/dealsStore";
import { useApi } from "@/hooks/useAPI";
import { useTableScroll } from "@/hooks/useTableScroll";
import { APIPATH } from "@/shared/constants/url";
import { GlobalDate } from "@/Utils/helpers";
import type { ProColumns } from "@ant-design/pro-table";
import ProTable from "@ant-design/pro-table";
import { Button, Input, Pagination, PaginationProps, Tag } from "antd";
import { SelectProps } from "antd/lib";
import { motion } from "framer-motion";
import { Activity, Building2, Eye, Plus, Search, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useCallback, useMemo, useRef, useState, memo, useEffect } from "react";

import { Deal, Stage, STAGE_LABELS, stages } from "../../../../lib/types";
import { DealCard } from "./DealCard";
import debounce from "lodash.debounce";
import { useLoading } from "@/hooks/useLoading";
import { ProductSkeleton } from "@/components/Skeletons/ProductCardSkelton";
import { Healthcare } from "../../healthcares/lib/types";
import { useDealViewState } from "@/context/store/optimizedSelectors";

// Constants
const STAGES: stages[] = [Stage.DISCUSSION, Stage.NEGOTIATION, Stage.CLOSED_WON, Stage.CLOSED_LOST];
const STAGE_COLORS: Record<stages, string> = {
  [Stage.DISCUSSION]: "gold",
  [Stage.NEGOTIATION]: "green",
  [Stage.CLOSED_LOST]: "red",
  [Stage.CLOSED_WON]: "green",
} as const;

const getStageColor = (stage: string): string => STAGE_COLORS[stage as stages] || "default";

export const useViewMode = () => {
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  return { viewMode, setViewMode };
};

// Memoized Filter Controls Component
const FilterControls = memo(({
  searchQuery,
  onSearchChange,
  stageFilter,
  setStageFilter,
  stageCounts,
  onClearFilters,
  healthcareFilter,
  onHealthcareChange,
  onHealthcareClear,
}: {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  stageFilter: string;
  setStageFilter: (stage: string) => void;
  stageCounts: Record<string, number>;
  onClearFilters: () => void;
  healthcareFilter: string;
  onHealthcareChange: SelectProps["onSelect"];
  onHealthcareClear: () => void;
}) => {
  const handleClear = useCallback(() => {
    onClearFilters();
  }, [onClearFilters]);
  const { hcoList } = useDealViewState();

  return (
    <div className="flex flex-col sm:flex-row gap-4 flex-wrap mb-4">
      <Input
        type="text"
        placeholder="Search deals..."
        value={searchQuery}
        className="max-w-85"
        allowClear
        prefix={<Search className="h-4 w-4 text-slate-400" />}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <AsyncSearchSelect
        allowClear
        placeholder="Select Healthcare"
        className="w-80"
        fetchUrl=""
        options={hcoList.map((org: Healthcare) => ({
          label: org.hcoName,
          value: org.hcoUUID,
        }))}
        loading={hcoList.length === 0}
        showSearch={{
          optionFilterProp: "label",
        }}
        value={healthcareFilter || undefined}
        onSelect={onHealthcareChange}
        onClear={onHealthcareClear}
      />

      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => setStageFilter("")}
          type={stageFilter === "" ? "primary" : "default"}
        >
          All
        </Button>
        {STAGES.map((stage) => (
          <Button
            key={stage}
            onClick={() => setStageFilter(stage)}
            type={stageFilter === stage ? "primary" : "default"}
          >
            <span className="font-medium">{STAGE_LABELS[stage]}</span>
          </Button>
        ))}
        <Button onClick={handleClear} type="default" disabled={searchQuery === "" && stageFilter === "" && healthcareFilter === ""}>
          Clear
        </Button>
      </div>
    </div>
  );
});

FilterControls.displayName = "FilterControls";

// Memoized Grid View Component
const GridView = memo(({
  currentDeals,
  page,
  totalDeals,
  pageSize,
  handlePageChange,
  loading,
}: {
  currentDeals: Deal[];
  page: number;
  totalDeals: number;
  pageSize: number;
  handlePageChange: (page: number, pageSize: number) => void;
  loading: boolean;
}) => {
  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
          Showing {currentDeals.length} of {totalDeals} deals
        </p>

        <Pagination
          defaultCurrent={1}
          current={page}
          total={totalDeals}
          pageSize={pageSize}
          onChange={handlePageChange}
          pageSizeOptions={["10", "20", "50", "100"]}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {currentDeals.map((deal) => (
          !loading ?
            <DealCard key={deal.dealUUID} deal={deal} page={page} /> :
            <ProductSkeleton key={deal.dealUUID} />
        ))}
      </div>
    </>
  );
});

GridView.displayName = "GridView";

// Memoized Table View Component
const TableView = memo(({
  deals,
  tableParams,
  handlePageChange,
  onTableChange,
}: {
  deals: Deal[];
  tableParams: any;
  handlePageChange: (page: number, pageSize: number) => void;
  onTableChange: (pagination: any, filters: any, sorter: any) => void;
}) => {
  const { tableWrapperRef, scrollY } = useTableScroll();
  const router = useRouter();

  const columns: ProColumns<Deal>[] = useMemo(
    () => [
      {
        title: "Name",
        dataIndex: "dealName",
        key: "dealName",
        width: 150,
        sorter: true,

        render: (text) => (
          <div className="flex items-center gap-2">
            <div className="p-1 bg-indigo-100 dark:bg-indigo-900/30 rounded-md">
              <Activity className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <span className="font-medium text-sm truncate max-w-60">{text}</span>
          </div>
        ),
      },
      {
        title: "Created Date",
        dataIndex: "createdAt",
        key: "createdAt",
        width: 120,
        sorter: true,
        render: (text) => (
          <div>
            <div className="text-sm">{GlobalDate(text as string)}</div>
          </div>
        ),
      },
      {
        title: "Healthcare",
        dataIndex: "hcoUUID",
        key: "hcoUUID",
        width: 120,
        sorter: true,
        render: (text, record) => (
          <div className="flex items-center gap-1">
            <Building2 className="h-3.5 w-3.5 text-slate-400" />
            <span>{record.hcoName || `#${text}`}</span>
          </div>
        ),
      },
      {
        title: "User",
        dataIndex: "createdBy",
        key: "createdAt",
        width: 100,
        sorter: true,
        render: (text, record) => (
          <div className="flex items-center gap-1">
            <User className="h-3.5 w-3.5 text-slate-400" />
            <span>{record.createdBy || `#${text}`}</span>
          </div>
        ),
      },
      {
        title: "Stage",
        dataIndex: "dealStage",
        key: "dealStage",
        width: 120,
        render: (text) =>
          text ? (
            <Tag color={getStageColor(text as string)}>
              {STAGE_LABELS[text as stages]}
            </Tag>
          ) : (
            <span className="text-xs text-slate-400">Not set</span>
          ),
      },
      {
        title: "Actions",
        key: "actions",
        width: 80,
        render: (_, record) => (
          <Button
            type="text"
            icon={<Eye className="h-3.5 w-3.5" />}
            onClick={() => router.push(`/deals/${record.dealUUID}`)}
          />
        ),
      },
    ],
    [router]
  );

  return (
    <div ref={tableWrapperRef}>
      <ProTable<Deal>
        columns={columns}
        locale={{
          triggerDesc: "Sort descending",
          triggerAsc: "Sort ascending",
          cancelSort: "Clear sorting",
          emptyText: (
            <div className="py-10 text-center text-gray-500">
              <p className="text-lg font-medium">No deals found</p>
              <p className="text-sm">
                Try adjusting your filters or search query.
              </p>
            </div>
          ),
        }}
        dataSource={deals}
        rowKey="dealUUID"
        tableStyle={{
          paddingTop: 20,
        }}
        pagination={{
          current: tableParams.pagination.current,
          pageSize: tableParams.pagination.pageSize,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50", "100"],
          showQuickJumper: true,
          total: tableParams.pagination.total,
          onChange: (page, pageSize) => handlePageChange(page, pageSize),
        }}
        onChange={onTableChange}
        search={false}
        options={{
          density: false,
          fullScreen: false,
          reload: false,
          setting: false,
        }}
        scroll={{ x: 800, y: scrollY }}
        dateFormatter="string"
      />
    </div>
  );
});

TableView.displayName = "TableView";

// Memoized Empty State Component
const EmptyState = memo(() => {
  const { setDealDrawer } = useDealStore();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="p-4 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-full mb-6">
        <Activity className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
      </div>
      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
        No deals found
      </h3>
      <p className="text-slate-600 dark:text-slate-400 max-w-md mb-6">
        Try adjusting your search or filters, or create a new deal to get
        started
      </p>
      <Button
        type="primary"
        icon={<Plus className="h-4 w-4" />}
        onClick={() => setDealDrawer(true)}
      >
        Create New Deal
      </Button>
    </motion.div>
  );
});

EmptyState.displayName = "EmptyState";

// Main Component
interface DealsListingProps {
  dealPromise: Promise<{
    data: {
      list: Deal[];
      filterCount: number;
      totalCount: number;
      stageCounts: Record<string, number>;
    };
  }>;
  hcoListPromise: Promise<{
    data: Healthcare[];
  }>;
}

export default function DealsListing({ dealPromise, hcoListPromise }: DealsListingProps) {
  const dealsData = use(dealPromise);
  const hcoListData = use(hcoListPromise);
  const API = useApi();
  const [deals, setDeals] = useState<Deal[]>(dealsData.data.list);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [healthcareFilter, setHealthcareFilter] = useState("");
  const { viewMode, page, setPage, setHcoList, pageSize, setPageSize } = useDealViewState();
  const [loading, setLoading] = useLoading();
  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 10,
      total: dealsData.data.totalCount,
    },
    filters: {},
    sorter: {},
  });

  // Initialize store with initial data
  useEffect(() => {
    if (hcoListData?.data) {
      setHcoList(hcoListData.data);
    }
    // Set initial page size if not already set
    if (pageSize === 10) {
      setPageSize(10);
    }
  }, [hcoListData, setHcoList, pageSize, setPageSize]);

  // Fetch deals function
  const fetchDeals = useCallback(
    async (newPage: number, newPageSize: number, search: string, stage: string, hcoUUID: string = "") => {
      setLoading(true);
      const response = await API.get(
        APIPATH.DEAL.GETDEAL +
        `?page=${newPage}&limit=${newPageSize}${search ? `&searchDeal=${search}` : ""
        }${stage ? `&searchDealStage=${stage}` : ""}${hcoUUID ? `&searchHcoUUID=${hcoUUID}` : ""
        }`
      );
      if (response) {
        setDeals(response.data.list);
        setPage(newPage);
        setPageSize(newPageSize);
        setTableParams((prev) => ({
          ...prev,
          pagination: {
            ...prev.pagination,
            current: newPage,
            pageSize: newPageSize,
            total: response.data.totalCount,
          },
        }));

        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      setLoading(false);
    },
    [API, setPage, setPageSize, setLoading]
  );


  const debouncedFetch = useRef(
    debounce((search: string, stage: string, hcoUUID: string) => {
      setDebouncedSearchQuery(search);
      fetchDeals(1, pageSize, search, stage, hcoUUID);
    }, 500)
  ).current;

  // Handle search input change
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchQuery(value);
      debouncedFetch(value, stageFilter, healthcareFilter);
    },
    [debouncedFetch, stageFilter, healthcareFilter]
  );

  // Handle stage filter change
  const handleStageFilterChange = useCallback(
    (stage: string) => {
      setStageFilter(stage);
      // Cancel pending debounced search
      debouncedFetch.cancel();
      // Immediately fetch with new stage filter
      fetchDeals(1, pageSize, searchQuery, stage, healthcareFilter);
    },
    [fetchDeals, searchQuery, debouncedFetch, healthcareFilter, pageSize]
  );

  // Handle healthcare filter change
  const handleHealthCareChange: SelectProps["onSelect"] = useCallback(
    (value: string, option: any) => {
      setHealthcareFilter(value);
      debouncedFetch.cancel();
      fetchDeals(1, pageSize, searchQuery, stageFilter, value);
    },
    [fetchDeals, searchQuery, stageFilter, debouncedFetch, pageSize]
  );

  // Handle healthcare clear
  const handleHealthCareClear = useCallback(() => {
    setHealthcareFilter("");
    debouncedFetch.cancel();
    fetchDeals(1, pageSize, searchQuery, stageFilter, "");
  }, [fetchDeals, searchQuery, stageFilter, debouncedFetch, pageSize]);

  // Handle page change - synchronized for both views
  const handlePageChange: PaginationProps["onChange"] = useCallback(
    (newPage: number, newPageSize: number) => {
      const finalPageSize = newPageSize || pageSize;
      fetchDeals(newPage, finalPageSize, debouncedSearchQuery, stageFilter, healthcareFilter);
    },
    [fetchDeals, debouncedSearchQuery, stageFilter, healthcareFilter, pageSize]
  );

  // Handle clear filters
  const handleClearFilters = useCallback(() => {
    setSearchQuery("");
    setDebouncedSearchQuery("");
    setStageFilter("");
    setHealthcareFilter("");
    debouncedFetch.cancel();
    fetchDeals(1, pageSize, "", "", "");
  }, [fetchDeals, debouncedFetch, pageSize]);

  // Handle table change
  const handleTableChange = useCallback(
    (pagination: any, filters: any, sorter: any) => {
      const newPage = pagination.current;
      const newPageSize = pagination.pageSize;
      handlePageChange(newPage, newPageSize);
      setTableParams((prev) => ({
        ...prev,
        pagination,
        filters,
        sorter,
      }));
    },
    [handlePageChange]
  );

  return (
    <>
      <FilterControls
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        stageFilter={stageFilter}
        setStageFilter={handleStageFilterChange}
        stageCounts={dealsData.data.stageCounts}
        onClearFilters={handleClearFilters}
        healthcareFilter={healthcareFilter}
        onHealthcareChange={handleHealthCareChange}
        onHealthcareClear={handleHealthCareClear}
      />

      {viewMode === "grid" ? (
        deals.length > 0 ? (
          <GridView
            currentDeals={deals}
            page={page}
            totalDeals={tableParams.pagination.total}
            pageSize={pageSize}
            handlePageChange={handlePageChange}
            loading={loading}
          />
        ) : (
          <EmptyState />
        )
      ) : (
        <TableView
          deals={deals}
          tableParams={tableParams}
          handlePageChange={handlePageChange}
          onTableChange={handleTableChange}
        />
      )}
    </>
  );
}
