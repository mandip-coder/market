'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { healthcaresKeys } from './healthcares.queryKeys';
import { healthcaresService } from './healthcares.service';
import { HealthcareFilters, CreateHealthcareData, UpdateHealthcareData, Healthcare, HealthcaresResponse } from './types';
import { dropdownKeys } from '@/services/dropdowns/dropdowns.queryKeys';

// ==================== HEALTHCARE HOOKS ====================

/**
 * Hook to fetch paginated healthcares with filters
 * Automatically caches data with filter-specific keys
 */
export function useHealthcares(filters: HealthcareFilters) {
  return useQuery({
    queryKey: healthcaresKeys.list(filters),
    queryFn: () => healthcaresService.fetchHealthcares(filters),
    staleTime: 60 * 60000, // 1 hour
    gcTime: 60 * 60000, // 1 hour
  });
}

/**
 * Hook to fetch individual healthcare by ID
 * Caches each healthcare separately for optimal performance
 */
export function useHealthcare(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: healthcaresKeys.detail(id),
    queryFn: () => healthcaresService.fetchHealthcareById(id),
    staleTime: 60 * 60000, // 1 hour
    gcTime: 60 * 60000, // 1 hour
    enabled: enabled && !!id,
    retry: 1,
  });
}

/**
 * Hook to create a new healthcare
 * Automatically updates healthcares list cache and HCO dropdown on success
 */
export function useCreateHealthcare() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateHealthcareData) => healthcaresService.createHealthcare(data),
    onSuccess: (data: Healthcare) => {
      // Update all list queries (with different filters) by adding the new healthcare
      queryClient.setQueriesData({ queryKey: healthcaresKeys.lists() }, (old: HealthcaresResponse | undefined) => {
        if (!old) return old;
        return {
          ...old,
          data: {
            ...old.data,
            list: [data, ...old.data.list],
            totalCount: old.data.totalCount + 1,
            filterCount: old.data.filterCount + 1,
          },
        };
      });
      // Update HCO dropdown list cache
      queryClient.setQueryData(dropdownKeys.hcoList(), (old: HealthcaresResponse[] = []) => {
        const newHCO = {
          label: data.hcoName,
          value: data.hcoUUID,
          ...data
        };
        return [...old, newHCO];
      });
      toast.success('Healthcare created successfully');
    },
    onError: (error: Error) => {
      console.error('Error creating healthcare:', error);
      toast.error(error.message || 'Failed to create healthcare');
    },
  });
}

/**
 * Hook to update a healthcare
 * Invalidates both the specific healthcare and all healthcares lists
 */
export function useUpdateHealthcare() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateHealthcareData) => healthcaresService.updateHealthcare(data),
    onSuccess: (updatedHealthcare: Healthcare, variables: UpdateHealthcareData) => {
      // Update all list queries (with different filters) by updating the healthcare
      queryClient.setQueriesData({ queryKey: healthcaresKeys.lists() }, (old: HealthcaresResponse | undefined) => {
        if (!old) return old;
        return {
          ...old,
          data: {
            ...old.data,
            list: old.data.list.map((healthcare) =>
              healthcare.hcoUUID === variables.hcoUUID ? updatedHealthcare : healthcare
            ),
          },
        };
      });
      // Update the specific healthcare detail cache
      queryClient.setQueryData(healthcaresKeys.detail(variables.hcoUUID), updatedHealthcare);
      toast.success('Healthcare updated successfully');
    },
    onError: (error: Error) => {
      console.error('Error updating healthcare:', error);
      toast.error(error.message || 'Failed to update healthcare');
    },
  });
}

/**
 * Hook to delete a healthcare
 * Removes from cache optimistically on success
 */
export function useDeleteHealthcare() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (hcoUUID: string) => healthcaresService.deleteHealthcare(hcoUUID),
    onSuccess: (_, hcoUUID: string) => {
      // Update all list queries (with different filters) by removing the deleted healthcare
      queryClient.setQueriesData({ queryKey: healthcaresKeys.lists() }, (old: HealthcaresResponse | undefined) => {
        if (!old) return old;
        return {
          ...old,
          data: {
            ...old.data,
            list: old.data.list.filter((healthcare) => healthcare.hcoUUID !== hcoUUID),
            totalCount: old.data.totalCount - 1,
            filterCount: old.data.filterCount - 1,
          },
        };
      });
      // Remove the specific healthcare detail from cache
      queryClient.removeQueries({ queryKey: healthcaresKeys.detail(hcoUUID) });
      toast.success('Healthcare deleted successfully');
    },
    onError: (error: Error) => {
      console.error('Error deleting healthcare:', error);
      toast.error(error.message || 'Failed to delete healthcare');
    },
  });
}

/**
 * Hook to update healthcare status
 * Updates cache optimistically on success
 */
export function useUpdateHealthcareStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ hcoUUID, status }: { hcoUUID: string; status: string }) =>
      healthcaresService.updateHealthcareStatus(hcoUUID, status),
    onSuccess: (updatedHealthcare: Healthcare, variables) => {
      // Update all list queries (with different filters) by updating the healthcare
      queryClient.setQueriesData({ queryKey: healthcaresKeys.lists() }, (old: HealthcaresResponse | undefined) => {
        if (!old) return old;
        return {
          ...old,
          data: {
            ...old.data,
            list: old.data.list.map((healthcare) =>
              healthcare.hcoUUID === variables.hcoUUID ? updatedHealthcare : healthcare
            ),
          },
        };
      });
      // Update the specific healthcare detail cache
      queryClient.setQueryData(healthcaresKeys.detail(variables.hcoUUID), updatedHealthcare);
      toast.success('Healthcare status updated successfully');
    },
    onError: (error: Error) => {
      console.error('Error updating healthcare status:', error);
      toast.error(error.message || 'Failed to update healthcare status');
    },
  });
}

export function useFetchHCODeals(hcoUUID: string, enabled: boolean = true) {
  return useQuery({
    queryKey: healthcaresKeys.deals(hcoUUID),
    queryFn: () => healthcaresService.fetchHCODeals(hcoUUID),
    staleTime: 60 * 60000, // 1 hour
    gcTime: 60 * 60000, // 1 hour
    enabled: enabled && !!hcoUUID,
  });
}
export function usefetchHCOsByICBCode(icbCode: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['recommendation-hcos', icbCode],
    queryFn: () => healthcaresService.fetchHCOsByICBCode(icbCode),
    gcTime: 60 * 60000, // 1 hour
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    enabled: enabled && !!icbCode,
  });
}