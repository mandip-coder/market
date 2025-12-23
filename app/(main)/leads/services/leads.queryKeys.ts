import { LeadFilters } from './leads.types';

/**
 * Query keys factory for leads
 * Provides type-safe and hierarchical cache key management
 */
export const leadsKeys = {
  // Base key for all leads-related queries
  all: ['leads'] as const,

  // Keys for list queries
  lists: () => [...leadsKeys.all, 'list'] as const,
  list: (filters: LeadFilters) => [...leadsKeys.lists(), filters] as const,

  // Keys for detail queries
  details: () => [...leadsKeys.all, 'detail'] as const,
  detail: (id: string) => [...leadsKeys.details(), id] as const,

  // Keys for tab data
  tabs: (id: string) => [...leadsKeys.detail(id), 'tabs'] as const,
  followUps: (id: string) => [...leadsKeys.tabs(id), 'followUps'] as const,
  calls: (id: string) => [...leadsKeys.tabs(id), 'calls'] as const,
  emails: (id: string) => [...leadsKeys.tabs(id), 'emails'] as const,

  //keys for contacts
  contacts: () => [...leadsKeys.all, 'contactPersons'] as const,
  contact: (id: string) => [...leadsKeys.contacts(), id] as const,
} as const;
