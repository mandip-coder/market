"use client";

import { ProductSkeleton } from "@/components/Skeletons/ProductCardSkelton";
import { useDealStore } from "@/context/store/dealsStore";
import { useDealViewState } from "@/context/store/optimizedSelectors";
import { useDropdownDealStages, useHCOList } from "@/services/dropdowns/dropdowns.hooks";
import { Button, Input, Pagination, PaginationProps, Select } from "antd";
import { SelectProps } from "antd/lib";
import { AnimatePresence, motion } from "framer-motion";
import debounce from "lodash.debounce";
import { Activity, Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { memo, useCallback, useRef, useState } from "react";
import { useDeals } from "../services/deals.hooks";
import { Deal } from "../services/deals.types";
import { DealCard } from "./DealCard";
import { DealsTable } from "./DealsTable";
import AppErrorUI from "@/components/AppErrorUI/AppErrorUI";
import { ApiError } from "@/lib/apiClient/ApiError";


// Memoized Filter Controls Component
const FilterControls = memo(
  ({
    searchQuery,
    onSearchChange,
    stageFilter,
    setStageFilter,
    onClearFilters,
    healthcareFilter,
    onHealthcareChange,
    onHealthcareClear,
  }: {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    stageFilter: string;
    setStageFilter: (stage: string) => void;
    onClearFilters: () => void;
    healthcareFilter: string;
    onHealthcareChange: SelectProps["onSelect"];
    onHealthcareClear: () => void;
  }) => {
    const { data: hcoList = [] } = useHCOList();
    const { data: dealStages = [] } = useDropdownDealStages();

    const handleClear = useCallback(() => {
      onClearFilters();
    }, [onClearFilters]);

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
        <Select
          allowClear
          placeholder={hcoList.length === 0 ? "Loading..." : "Select Healthcare"}
          className="w-80"
          options={hcoList.map((hco) => ({
            label: hco.hcoName,
            value: hco.hcoUUID,
          }))}
          disabled={hcoList.length === 0}
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
          {dealStages.map((stage) => (
            <Button
              key={stage.dealStageUUID}
              onClick={() => setStageFilter(stage.dealStageUUID)}
              type={stageFilter === stage.dealStageUUID ? "primary" : "default"}
            >
              <span className="font-medium">{stage.dealStageName}</span>
            </Button>
          ))}
          <Button
            onClick={handleClear}
            type="default"
            disabled={
              searchQuery === "" &&
              stageFilter === "" &&
              healthcareFilter === ""
            }
          >
            Clear
          </Button>
        </div>
      </div>
    );
  }
);

FilterControls.displayName = "FilterControls";

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

// ==================== MAIN COMPONENT ====================

export default function DealsListing() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [healthcareFilter, setHealthcareFilter] = useState("");
  const { page, setPage, pageSize, setPageSize, viewMode } = useDealViewState();

  // Fetch deals using React Query
  const { data: dealsData, isLoading: loading,error } = useDeals({
    page,
    pageSize,
    searchQuery: debouncedSearchQuery,
    stageFilter,
    healthcareFilter,
  });

  const deals = dealsData?.data?.list || [];
  const totalCount = dealsData?.data?.totalCount || 0;

  const debouncedFetch = useRef(
    debounce((search: string) => {
      setDebouncedSearchQuery(search);
      setPage(1); // Reset to first page on search
    }, 500)
  ).current;

  // Handle search input change
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchQuery(value);
      debouncedFetch(value);
    },
    [debouncedFetch]
  );

  // Handle stage filter change
  const handleStageFilterChange = useCallback(
    (stage: string) => {
      setStageFilter(stage);
      setPage(1); // Reset to first page on filter change
      debouncedFetch.cancel();
    },
    [debouncedFetch, setPage]
  );

  // Handle healthcare filter change
  const handleHealthCareChange: SelectProps["onSelect"] = useCallback(
    (value: string) => {
      setHealthcareFilter(value);
      setPage(1); // Reset to first page on filter change
      debouncedFetch.cancel();
    },
    [debouncedFetch, setPage]
  );

  // Handle healthcare clear
  const handleHealthCareClear = useCallback(() => {
    setHealthcareFilter("");
    setPage(1);
    debouncedFetch.cancel();
  }, [debouncedFetch, setPage]);

  // Handle page change
  const handlePageChange: PaginationProps["onChange"] = useCallback(
    (newPage: number, newPageSize: number) => {
      setPage(newPage);
      if (newPageSize !== pageSize) {
        setPageSize(newPageSize);
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [setPage, setPageSize, pageSize]
  );

  // Handle table change (for table view pagination)
  const handleTableChange = useCallback(
    (pagination: any, filters: any, sorter: any) => {
      if (pagination.current !== page) {
        setPage(pagination.current);
      }
      if (pagination.pageSize !== pageSize) {
        setPageSize(pagination.pageSize);
        setPage(1); // Reset to first page when page size changes
      }
    },
    [page, pageSize, setPage, setPageSize]
  );

  const handleClearFilters = useCallback(() => {
    setSearchQuery("");
    setDebouncedSearchQuery("");
    setStageFilter("");
    setHealthcareFilter("");
    setPage(1);
    debouncedFetch.cancel();
  }, [debouncedFetch, setPage]);
  if(error){
    const statusCode = error instanceof ApiError ? error.statusCode : 500;
    return <AppErrorUI code={statusCode} message={error.message}/>
  }
  return (
    <>
      <FilterControls
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        stageFilter={stageFilter}
        setStageFilter={handleStageFilterChange}
        onClearFilters={handleClearFilters}
        healthcareFilter={healthcareFilter}
        onHealthcareChange={handleHealthCareChange}
        onHealthcareClear={handleHealthCareClear}
      />

      {viewMode === 'grid' && deals.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Showing {deals.length} of {totalCount} deals
          </p>

          <Pagination
            defaultCurrent={1}
            current={page}
            total={totalCount}
            pageSize={pageSize}
            onChange={handlePageChange}
            pageSizeOptions={["10", "20", "50", "100"]}
          />
        </div>
      )}
   
      {deals.length > 0 ? (
        viewMode === 'grid' ? (
          <AnimatePresence mode="wait">
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
              key={`${viewMode}-${debouncedSearchQuery}-${stageFilter}-${healthcareFilter}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {deals.map((deal) => (
                <DealCard key={deal.dealUUID} deal={deal} />
              ))}
            </motion.div>
          </AnimatePresence>
        ) : (
          <DealsTable
            data={deals}
            loading={loading}
            onTableChange={handleTableChange}
            page={page}
            pageSize={pageSize}
            totalCount={totalCount}
          />
        )
      ) : loading ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: pageSize }).map((_, index) => (
              <ProductSkeleton key={index} />
            ))}
          </div>
        ) : (
           <DealsTable
            data={deals}
            loading={loading}
            onTableChange={handleTableChange}
            page={page}
            pageSize={pageSize}
            totalCount={totalCount}
          />
        )
      ) : (
        <EmptyState />
      )}
    </>
  );
}
