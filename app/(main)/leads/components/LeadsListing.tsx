"use client"
import AsyncSearchSelect from '@/components/AsyncSearchSelect/AsyncSearchSelect';
import { useDealStore } from '@/context/store/dealsStore';
import { Button, Input, Pagination, PaginationProps } from "antd";
import { motion } from "framer-motion";
import { Activity, Plus, Search } from 'lucide-react';
import { use, useCallback, useEffect, useState, memo, useRef } from 'react';
import LeadCardReimagined from './LeadCard';
import { HCOContactPerson } from '@/components/AddNewContactModal/AddNewContactModal';
import { SelectProps } from 'antd/lib';
import { useLeadStore } from '@/context/store/leadsStore';
import { Healthcare } from '../../healthcares/lib/types';
import { useApi } from '@/hooks/useAPI';
import { APIPATH } from '@/shared/constants/url';
import debounce from 'lodash.debounce';
import { useLoading } from '@/hooks/useLoading';
import { ProductSkeleton } from '@/components/Skeletons/ProductCardSkelton';
import { useLeadViewState } from '@/context/store/optimizedSelectors';

export interface Lead {
  leadUUID: string;
  userUUID: string;
  hcoUUID: string;
  createdDate: string;
  summary: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  hcoName: string;
  leadName: string;
  leadStatus: "new" | "inProgress" | "cancelled";
  closeReason?: string;
  contactPersons: HCOContactPerson[];
}


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
  const { hcoList } = useLeadStore();
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
        placeholder="Search leads..."
        value={searchQuery}
        className="max-w-85"
        allowClear
        prefix={<Search className="h-4 w-4 text-slate-400" />}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <AsyncSearchSelect
        allowClear
        placeholder={hcoList.length === 0 ? "Loading..." : "Select Healthcare"}
        className="w-80"
        fetchUrl=""
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
      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">No leads found</h3>
      <p className="text-slate-600 dark:text-slate-400 max-w-md mb-6">
        Try adjusting your search or filters, or create a new lead to get started
      </p>
      <Button type="primary" icon={<Plus className="h-4 w-4" />} onClick={() => toggleLeadDrawer()}>
        Create New Lead
      </Button>
    </motion.div>
  );
});

EmptyState.displayName = "EmptyState";

// ==================== MAIN COMPONENT ====================
interface LeadsListingProps {
  leadPromise: Promise<{
    data: {
      list: Lead[];
      filterCount: number;
      totalCount: number;
    };
  }>;
  hcoListPromise: Promise<{
    data: Healthcare[];
  }>;
}

export default function LeadsLising({ leadPromise, hcoListPromise }: LeadsListingProps) {
  const leadsData = use(leadPromise);
  const hcoListData = use(hcoListPromise);
  const API = useApi();
  const [leads, setLeads] = useState<Lead[]>(leadsData.data.list);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [healthcareFilter, setHealthcareFilter] = useState("");
  const { page, setPage, pageSize, setPageSize, setHcoList } = useLeadViewState();
  const [loading, setLoading] = useLoading();

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

  // Fetch leads function
  const fetchLeads = useCallback(
    async (newPage: number, newPageSize: number, search: string, status: string, hcoUUID: string = "") => {
      setLoading(true);
      try {
        const response = await API.get(
          APIPATH.LEAD.GETLEAD +
          `?page=${newPage}&limit=${newPageSize}${search ? `&searchLead=${search}` : ""
          }${status ? `&searchLeadStatus=${status}` : ""}${hcoUUID ? `&searchHcoUUID=${hcoUUID}` : ""
          }`
        );

        // Update leads and pagination in a single state update to ensure consistency
        setLeads(response.data.list);
        setPage(newPage);
        setPageSize(newPageSize);

        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (error) {
        console.error("Error fetching leads:", error);
      } finally {
        setLoading(false);
      }
    },
    [API, setPage, setPageSize, setLoading]
  );

  const debouncedFetch = useRef(
    debounce((search: string, status: string, hcoUUID: string) => {
      setDebouncedSearchQuery(search);
      fetchLeads(1, pageSize, search, status, hcoUUID);
    }, 500)
  ).current;

  // Handle search input change
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchQuery(value);
      debouncedFetch(value, statusFilter, healthcareFilter);
    },
    [debouncedFetch, statusFilter, healthcareFilter]
  );

  // Handle status filter change
  const handleStatusFilterChange = useCallback(
    (status: string) => {
      setStatusFilter(status);
      // Cancel pending debounced search
      debouncedFetch.cancel();
      // Immediately fetch with new status filter
      fetchLeads(1, pageSize, searchQuery, status, healthcareFilter);
    },
    [fetchLeads, searchQuery, debouncedFetch, healthcareFilter, pageSize]
  );

  // Handle healthcare filter change
  const handleHealthCareChange: SelectProps["onSelect"] = useCallback(
    (value: string) => {
      setHealthcareFilter(value);
      debouncedFetch.cancel();
      fetchLeads(1, pageSize, searchQuery, statusFilter, value);
    },
    [fetchLeads, searchQuery, statusFilter, debouncedFetch, pageSize]
  );

  // Handle healthcare clear
  const handleHealthCareClear = useCallback(() => {
    setHealthcareFilter("");
    debouncedFetch.cancel();
    fetchLeads(1, pageSize, searchQuery, statusFilter, "");
  }, [fetchLeads, searchQuery, statusFilter, debouncedFetch, pageSize]);

  // Handle page change
  const handlePageChange: PaginationProps["onChange"] = useCallback(
    (newPage: number, newPageSize: number) => {
      const finalPageSize = newPageSize || pageSize;
      fetchLeads(newPage, finalPageSize, debouncedSearchQuery, statusFilter, healthcareFilter);
    },
    [fetchLeads, debouncedSearchQuery, statusFilter, healthcareFilter, pageSize]
  );

  // Handle clear filters
  const handleClearFilters = useCallback(() => {
    setSearchQuery("");
    setDebouncedSearchQuery("");
    setStatusFilter("");
    setHealthcareFilter("");
    debouncedFetch.cancel();
    fetchLeads(1, pageSize, "", "", "");
  }, [fetchLeads, debouncedFetch, pageSize]);

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
              Showing {leads.length} of {leadsData.data.totalCount} leads
            </p>

            <Pagination
              defaultCurrent={1}
              current={page}
              total={leadsData.data.totalCount}
              pageSize={pageSize}
              onChange={handlePageChange}
              showQuickJumper
              showSizeChanger
              pageSizeOptions={["10", "20", "50", "100"]}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {leads.map((lead) => (
              !loading ?
                <LeadCardReimagined key={lead.leadUUID} lead={lead} page={page} /> :
                <ProductSkeleton key={lead.leadUUID} />
            ))}
          </div>
        </>
      ) : (
        <EmptyState />
      )}
    </>
  );
}
