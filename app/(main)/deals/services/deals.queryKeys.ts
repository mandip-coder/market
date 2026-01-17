import { DealFilters } from "./deals.types";

/**
 * Query keys factory for deals
 * Provides type-safe and hierarchical cache key management
 */
export const dealsKeys = {
  // Base key for all deals-related queries
  all: ['deals'] as const,

  // Keys for list queries
  lists: () => [...dealsKeys.all, 'list'] as const,
  list: (filters: DealFilters) => [...dealsKeys.lists(), filters] as const,

  // Keys for detail queries
  details: () => [...dealsKeys.all, 'detail'] as const,
  detail: (id: string) => [...dealsKeys.details(), id] as const,

  // Keys for tab data
  tabs: (id: string) => [...dealsKeys.detail(id), 'tabs'] as const,
  followUps: (id: string) => [...dealsKeys.tabs(id), 'followUps'] as const,
  calls: (id: string) => [...dealsKeys.tabs(id), 'calls'] as const,
  emails: (id: string) => [...dealsKeys.tabs(id), 'emails'] as const,
  notes: (id: string) => [...dealsKeys.tabs(id), 'notes'] as const,
  meetings: (id: string) => [...dealsKeys.tabs(id), 'meetings'] as const,
  products: (id: string) => [...dealsKeys.tabs(id), 'products'] as const,
  attachments: (id: string) => [...dealsKeys.tabs(id), 'attachments'] as const,
  timeline: (id: string) => [...dealsKeys.tabs(id), 'timeline'] as const,
  timelineCounts: (id: string) => [...dealsKeys.tabs(id), 'timelineCounts'] as const,
} as const;
