import { HealthcareFilters } from './types';

/**
 * Query keys factory for healthcares
 * Provides type-safe and hierarchical cache key management
 */
export const healthcaresKeys = {
  // Base key for all healthcares-related queries
  all: ['healthcares'] as const,

  // Keys for list queries
  lists: () => [...healthcaresKeys.all, 'list'] as const,
  list: (filters: HealthcareFilters) => [...healthcaresKeys.lists(), filters] as const,

  // Keys for detail queries
  details: () => [...healthcaresKeys.all, 'detail'] as const,
  detail: (id: string) => [...healthcaresKeys.details(), id] as const,

  // Keys for tab data
  tabs: (id: string) => [...healthcaresKeys.detail(id), 'tabs'] as const,
  contacts: (id: string) => [...healthcaresKeys.tabs(id), 'contacts'] as const,
  deals: (id: string) => [...healthcaresKeys.tabs(id), 'deals'] as const,
} as const;
