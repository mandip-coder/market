"use client"

import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useRouter } from 'next/navigation';
import { use, useCallback, useState } from "react";
import { useHealthcareFilters } from "../lib/hooks";
import { Healthcare } from "../lib/types";
import { HealthcareEmptyState } from "./emptyState";
import { HealthcareCard } from "./healthcareCard";
import { HealthcareFilters } from "./healthcareFilters";
import { HealthcarePagination } from "./healthcarePagination";
import { HealthcareTable } from "./healthCareTable";
import { useHealthCareStore } from "@/context/store/healthCareStore";


const HealthcareListing = ({ dataPromise }: { dataPromise: Promise<Healthcare[]> }) => {
  const initialData = use(dataPromise) as Healthcare[];
  const { viewMode } = useHealthCareStore();
  const router = useRouter();
  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 10,
    },
    filters: {},
    sorter: {},
  });

  const {
    filters,
    loading,
    paginatedData,
    filteredData,
    totalPages,
    updateFilter,
    pagination,
    goToPage
  } = useHealthcareFilters(initialData, viewMode === 'grid' ? 20 : 10);

  const handleViewDetails = useCallback((healthcare: Healthcare) => {
    router.push(`/healthcares/${healthcare.hcoUUID}`);
  }, [router]);



  const handleTableChange = useCallback((pagination: any, filters: any, sorter: any) => {
    setTableParams({
      pagination,
      filters,
      sorter,
    });
  }, []);

  return (
    <>
      <HealthcareFilters
        filters={filters}
        onFilterChange={updateFilter}
      />

      {viewMode === 'grid' && (
        <HealthcarePagination
          currentPage={pagination.page}
          totalPages={totalPages}
          onPageChange={goToPage}
          itemCount={paginatedData.length}
          totalItems={filteredData.length}
          loading={loading}
        />
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      ) : filteredData.length > 0 ? (
        viewMode === 'grid' ? (
          <AnimatePresence mode="wait">
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
              key={`${viewMode}-${filters.searchQuery}-${filters.typeFilter}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {paginatedData.map((healthcare, index) => (
                <HealthcareCard
                  key={healthcare.hcoUUID}
                  healthcare={healthcare}
                  onViewDetails={handleViewDetails}
                  index={index}
                  page={pagination.page}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        ) : (
          <HealthcareTable
            data={filteredData}
            loading={loading}
            onViewDetails={handleViewDetails}
            onTableChange={handleTableChange}
            tableParams={tableParams}
          />
        )
      ) : (
        <HealthcareEmptyState />
      )}

    </>
  );
};

export default HealthcareListing;