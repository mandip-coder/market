export const recommendationsKeys = {
  all: ['recommendations'] as const,
  lists: () => [...recommendationsKeys.all, 'list'] as const,
  list: (filters: {
    regionalOfficeCode?: string;
    icbCode?: string;
    countryUUID?: string;
  }) => [...recommendationsKeys.lists(), filters] as const,
} as const;
