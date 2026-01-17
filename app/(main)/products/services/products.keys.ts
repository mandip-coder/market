export const productsKeys = {
  all: ['products'] as const,

  lists: () => [...productsKeys.all, 'list'] as const,
  details: () => [...productsKeys.all, 'detail'] as const,
  detail: (id: string) => [...productsKeys.details(), id] as const,

  tabs: (id: string) => [...productsKeys.detail(id), 'tabs'] as const,
  documents: (id: string) => [...productsKeys.tabs(id), 'documents'] as const,
  deals: (id: string) => [...productsKeys.tabs(id), 'deals'] as const,

  counts: (id: string) => [...productsKeys.detail(id), 'counts'] as const,
} as const;
