"use client"
import { ProductSkeleton } from '@/components/Skeletons/ProductCardSkelton';
import { useLeadStore } from '@/context/store/leadsStore';
import { useLeadViewState } from '@/context/store/optimizedSelectors';
import { useHCOList } from '@/services/dropdowns/dropdowns.hooks';
import { Button, Input, Pagination, PaginationProps, Select } from "antd";
import { SelectProps } from 'antd/lib';
import { motion } from "framer-motion";
import debounce from 'lodash.debounce';
import { Activity, Plus, Search } from 'lucide-react';
import { memo, useCallback, useRef, useState } from 'react';
import LeadCardReimagined from './LeadCard';
import { useLeads } from '../services/leads.hooks';
import { Lead } from '../services/leads.types';
import AppErrorUI from '@/components/AppErrorUI/AppErrorUI';
import { ApiError } from '@/lib/apiClient/ApiError';




// Memoized Filter Controls Component
const FilterControls = memo(({
  searchQuery,
  onSearchChange,
  statusFilter,
  setStatusFilter,
  onClearFilters,
  healthcareFilter,
  onHealthcareChange,
  onHealthcareClear,
}: {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  onClearFilters: () => void;
  healthcareFilter: string;
  onHealthcareChange: SelectProps["onSelect"];
  onHealthcareClear: () => void;
}) => {
  const { data: hcoList = [], } = useHCOList()
  const handleClear = useCallback(() => {
    onClearFilters();
  }, [onClearFilters]);

  const STATUSES = ['new', 'inProgress', 'cancelled'] as const;
  const STATUS_LABELS: Record<Lead["leadStatus"], string> = {
    new: 'New',
    inProgress: 'In Progress',
    cancelled: 'Cancelled',
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 flex-wrap mb-4">
      <Input
        type="text"
        placeholder="Search prospects..."
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
          onClick={() => setStatusFilter("")}
          type={statusFilter === "" ? "primary" : "default"}
        >
          All
        </Button>
        {STATUSES.map((status) => (
          <Button
            key={status}
            onClick={() => setStatusFilter(status)}
            type={statusFilter === status ? "primary" : "default"}
          >
            <span className="font-medium">{STATUS_LABELS[status]}</span>
          </Button>
        ))}
        <Button
          onClick={handleClear}
          type="default"
          disabled={searchQuery === "" && statusFilter === "" && healthcareFilter === ""}
        >
          Clear
        </Button>
      </div>
    </div>
  );
});

FilterControls.displayName = "FilterControls";

// Memoized Empty State Component
const EmptyState = memo(() => {
  const { toggleLeadDrawer } = useLeadStore()
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
      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">No prospects found</h3>
      <p className="text-slate-600 dark:text-slate-400 max-w-md mb-6">
        Try adjusting your search or filters, or create a new prospect to get started
      </p>
      <Button type="primary" icon={<Plus className="h-4 w-4" />} onClick={() => toggleLeadDrawer()}>
        Create New Prospect
      </Button>
    </motion.div>
  );
});

EmptyState.displayName = "EmptyState";

// ==================== MAIN COMPONENT ====================

export default function LeadsLising() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [healthcareFilter, setHealthcareFilter] = useState("");
  const { page, setPage, pageSize, setPageSize } = useLeadViewState();

  // Fetch leads using React Query
  const { data: leadsData, isLoading: loading, error } = useLeads({
    page,
    pageSize,
    searchQuery: debouncedSearchQuery,
    statusFilter,
    healthcareFilter,
  });

  const leads = leadsData?.data?.list || [];
  const totalCount = leadsData?.data?.totalCount || 0;

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

  // Handle status filter change
  const handleStatusFilterChange = useCallback(
    (status: string) => {
      setStatusFilter(status);
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

  // Handle clear filters
  const handleClearFilters = useCallback(() => {
    setSearchQuery("");
    setDebouncedSearchQuery("");
    setStatusFilter("");
    setHealthcareFilter("");
    setPage(1);
    debouncedFetch.cancel();
  }, [debouncedFetch, setPage]);
  if (error) {
    const statusCode = error instanceof ApiError ? error.statusCode : 500;
    return <AppErrorUI code={statusCode} message={error.message} />
  }
  return (
    <>
      <FilterControls
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        statusFilter={statusFilter}
        setStatusFilter={handleStatusFilterChange}
        onClearFilters={handleClearFilters}
        healthcareFilter={healthcareFilter}
        onHealthcareChange={handleHealthCareChange}
        onHealthcareClear={handleHealthCareClear}
      />

      {leads.length > 0 ? (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Showing {leads.length} of {totalCount} Prospects
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {leads.map((lead) => (
              <LeadCardReimagined key={lead.leadUUID} lead={lead} page={page} />
            ))}
          </div>
        </>
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: pageSize }).map((_, index) => (
            <ProductSkeleton key={index} />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </>
  );
}
