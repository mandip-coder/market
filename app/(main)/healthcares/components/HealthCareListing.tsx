"use client";

import { ProductSkeleton } from "@/components/Skeletons/ProductCardSkelton";
import { useHealthCareStore } from "@/context/store/healthCareStore";
import { Pagination, PaginationProps } from "antd";
import { AnimatePresence, motion } from "framer-motion";
import debounce from "lodash.debounce";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { useHealthcares } from "../services/healthcares.hooks";
import { Healthcare } from "../services/types";
import { HealthcareEmptyState } from "./emptyState";
import { HealthcareCard } from "./healthcareCard";
import { HealthcareTable } from "./healthCareTable";
import AppErrorUI from "@/components/AppErrorUI/AppErrorUI";
import { ApiError } from "@/lib/apiClient/ApiError";
import HealthcareFilters from "./HealthcareFilters";



// ==================== MAIN COMPONENT ====================

const HealthcareListing = () => {
  const { viewMode, page, pageSize, setPage, setPageSize } =
    useHealthCareStore();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string | undefined>();
  const [countryUUID, setCountryUUID] = useState<string | undefined>();
  const [regionalOfficeCode, setRegionalOfficeCode] = useState<string | undefined>();
  const [icbCode, setICBCode] = useState<string | undefined>();

  // Fetch healthcares using React Query
  const { data: healthcaresData, isLoading: loading, error, refetch,isRefetching } = useHealthcares({
    page,
    pageSize,
    searchQuery: debouncedSearchQuery,
    typeFilter,
    countryUUID,
    regionalOfficeCode,
    icbCode,
    
  });

  const healthcares = healthcaresData?.data?.list || [];
  const totalCount = healthcaresData?.data?.totalCount || 0;

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

  // Handle type filter change
  const handleTypeFilterChange = useCallback(
    (type: string | undefined) => {
      setTypeFilter(type);
      setPage(1); // Reset to first page on filter change
      debouncedFetch.cancel();
    },
    [debouncedFetch, setPage]
  );

  // Handle country filter change
  const handleCountryChange = useCallback(
    (country: string | undefined) => {
      setCountryUUID(country);
      setPage(1);
      debouncedFetch.cancel();
    },
    [debouncedFetch, setPage]
  );

  // Handle regional office filter change
  const handleRegionalOfficeChange = useCallback(
    (region: string | undefined) => {
      setRegionalOfficeCode(region);
      setPage(1);
      debouncedFetch.cancel();
    },
    [debouncedFetch, setPage]
  );

  // Handle ICB filter change
  const handleICBChange = useCallback(
    (icb: string | undefined) => {
      setICBCode(icb);
      setPage(1);
      debouncedFetch.cancel();
    },
    [debouncedFetch, setPage]
  );

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
    setTypeFilter(undefined);
    setCountryUUID(undefined);
    setRegionalOfficeCode(undefined);
    setICBCode(undefined);
    setPage(1);
    debouncedFetch.cancel();
  }, [debouncedFetch, setPage]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleViewDetails = useCallback(
    (healthcare: Healthcare) => {
      router.push(`/healthcares/${healthcare.hcoUUID}`);
    },
    [router]
  );

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
   if(error){
     const statusCode = error instanceof ApiError ? error.statusCode : 500;
     return <AppErrorUI code={statusCode} message={error.message}/>
   }
  return (
    <>
      <HealthcareFilters
        searchQuery={searchQuery}
        countryUUID={countryUUID}
        regionalOfficeCode={regionalOfficeCode}
        icbCode={icbCode}
        typeFilter={typeFilter}
        onSearchChange={handleSearchChange}
        onCountryChange={handleCountryChange}
        onRegionalOfficeChange={handleRegionalOfficeChange}
        onICBChange={handleICBChange}
        onTypeChange={handleTypeFilterChange}
        onClear={handleClearFilters}
        onRefresh={handleRefresh}
        isRefetching={isRefetching}
      />

      {viewMode === "grid" && healthcares.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Showing {healthcares.length} of {totalCount} healthcares
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

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: pageSize }).map((_, index) => (
            <ProductSkeleton key={index} />
          ))}
        </div>
      ) : healthcares.length > 0 ? (
        viewMode === "grid" ? (
          <AnimatePresence mode="wait">
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
              key={`${viewMode}-${debouncedSearchQuery}-${typeFilter}-${countryUUID}-${regionalOfficeCode}-${icbCode}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {healthcares.map((healthcare, index) => (
                <HealthcareCard
                  key={healthcare.hcoUUID}
                  healthcare={healthcare}
                  onViewDetails={handleViewDetails}
                  index={index}
                  page={page}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        ) : (
          <HealthcareTable
            data={healthcares}
            loading={loading}
            onViewDetails={handleViewDetails}
            onTableChange={handleTableChange}
            page={page}
            pageSize={pageSize}
            totalCount={totalCount}
          />
        )
      ) : (
        <HealthcareEmptyState />
      )}
    </>
  );
};

export default HealthcareListing;
