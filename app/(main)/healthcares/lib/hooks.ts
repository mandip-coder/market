import { useState, useEffect, useMemo } from 'react';
import { Healthcare, HealthcareFilters, PaginationState } from './types';

export const useHealthcareFilters = (
  initialData: Healthcare[],
  itemsPerPage: number = 20
) => {
  const [filters, setFilters] = useState<HealthcareFilters>({
    searchQuery: '',
    typeFilter: ''
  });
  
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    itemsPerPage
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Simulate loading delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  const filteredData = useMemo(() => {
    let result = [...initialData];
    
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(org =>
        org.hcoName.toLowerCase().includes(query) ||
        org.hcoType.toLowerCase().includes(query) ||
        (org.address && org.address.toLowerCase().includes(query)) ||
        (org.phone1 && org.phone1.includes(query))
      );
    }
    
    if (filters.typeFilter) {
      result = result.filter(org => org.hcoType === filters.typeFilter);
    }
    

    
    return result;
  }, [initialData, filters]);

  const { totalPages, paginatedData } = useMemo(() => {
    const totalPages = Math.ceil(filteredData.length / pagination.itemsPerPage);
    const startIndex = (pagination.page - 1) * pagination.itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, startIndex + pagination.itemsPerPage);
    
    return { totalPages, paginatedData };
  }, [filteredData, pagination]);

  const updateFilter = (key: keyof HealthcareFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const goToPage = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  return {
    filters,
    pagination,
    loading,
    filteredData,
    paginatedData,
    totalPages,
    updateFilter,
    goToPage
  };
};
