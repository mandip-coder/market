/**
 * Query keys factory for dropdowns
 * Provides type-safe and hierarchical cache key management
 */
export const dropdownKeys = {
  // Base key for all dropdown-related queries
  all: ['dropdowns'] as const,

  // Individual dropdown keys
  hcoList: () => [...dropdownKeys.all, 'hcoList'] as const,
  leadSources: () => [...dropdownKeys.all, 'leadSources'] as const,
  personalityTraits: () => [...dropdownKeys.all, 'personalityTraits'] as const,
  users: () => [...dropdownKeys.all, 'users'] as const,
  products: () => [...dropdownKeys.all, 'products'] as const,
  outcomes: () => [...dropdownKeys.all, 'outcomes'] as const,
} as const;
