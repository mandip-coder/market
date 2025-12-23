'use client'

import { useQuery } from '@tanstack/react-query';
import { dropdownKeys } from './dropdowns.queryKeys';
import { dropdownsService } from './dropdowns.service';

/**
 * Hook to fetch HCO list
 * Cached with infinite stale time - data rarely changes
 */
export function useHCOList() {
  return useQuery({
    queryKey: dropdownKeys.hcoList(),
    queryFn: () => dropdownsService.fetchHCOList(),
    staleTime: Infinity, // Dropdown data rarely changes
    gcTime: Infinity, // Keep in cache indefinitely
  });
}

/**
 * Hook to fetch lead sources
 * Cached with infinite stale time - data rarely changes
 */
export function useLeadSources() {
  return useQuery({
    queryKey: dropdownKeys.leadSources(),
    queryFn: () => dropdownsService.fetchLeadSources(),
    staleTime: Infinity,
    gcTime: Infinity,
  });
}

/**
 * Hook to fetch personality traits
 * Cached with infinite stale time - data rarely changes
 */
export function usePersonalityTraits() {
  return useQuery({
    queryKey: dropdownKeys.personalityTraits(),
    queryFn: () => dropdownsService.fetchPersonalityTraits(),
    staleTime: Infinity,
    gcTime: Infinity,
  });
}

/**
 * Hook to fetch users list
 * Cached with infinite stale time - data rarely changes
 */
export function useUsers() {
  return useQuery({
    queryKey: dropdownKeys.users(),
    queryFn: () => dropdownsService.fetchUsers(),
    staleTime: Infinity,
    gcTime: Infinity,
  });
}

/**
 * Hook to fetch products list
 * Cached with infinite stale time - data rarely changes
 */
export function useProducts() {
  return useQuery({
    queryKey: dropdownKeys.products(),
    queryFn: () => dropdownsService.fetchProducts(),
    staleTime: Infinity,
    gcTime: Infinity,
  });
}

/**
 * Hook to fetch outcomes list
 * Cached with infinite stale time - data rarely changes
 */
export function useOutcomes() {
  return useQuery({
    queryKey: dropdownKeys.outcomes(),
    queryFn: () => dropdownsService.fetchOutcomes(),
    staleTime: Infinity,
    gcTime: Infinity,
  });
}


