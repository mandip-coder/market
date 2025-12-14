'use client';
import { Button } from 'antd';
import { LucideIcon, Plus, Search } from 'lucide-react';
import { memo } from 'react';

interface EmptyStateProps {
  searchQuery: string;
  onClearSearch: () => void;
  onAction: () => void;
  icon: LucideIcon;
  emptyTitle: string;
  emptyDescription: string;
  searchTitle?: string;
  searchDescription?: string;
  actionLabel: string;
}

export const EmptyState = memo<EmptyStateProps>(({
  searchQuery,
  onClearSearch,
  onAction,
  icon: Icon,
  emptyTitle,
  emptyDescription,
  searchTitle = 'No Results Found',
  searchDescription,
  actionLabel
}) => {
  const isSearchState = Boolean(searchQuery);

  return (
    <div className="text-center py-16 bg-gray-50 dark:bg-gray-900 rounded-xl transition-all duration-300">
      <div className="flex flex-col items-center justify-center">
        <div className={`transition-all duration-300 ${isSearchState ? 'scale-90 opacity-70' : 'scale-100 opacity-100'}`}>
          {isSearchState ? (
            <div className="relative">
              <Search className="w-12 h-12 mx-auto text-gray-400" />
              <div className="absolute inset-0 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-xl opacity-30"></div>
            </div>
          ) : (
            <div className="relative">
              <Icon className="w-12 h-12 mx-auto text-gray-400" />
              <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 rounded-full blur-xl opacity-30"></div>
            </div>
          )}
        </div>

        <div className="mt-4 mb-6">
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            {isSearchState ? searchTitle : emptyTitle}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            {isSearchState
              ? searchDescription || `We couldn't find any items matching "${searchQuery}".`
              : emptyDescription
            }
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
          {isSearchState ? (
            <Button
              type="default"
              onClick={onClearSearch}
              className="h-10 px-5 rounded-md shadow-sm hover:shadow-md transition-all duration-200"
            >
              Clear Search
            </Button>
          ) : (
            <Button
              type="primary"
              icon={<Plus size={16} />}
              onClick={onAction}
              className="h-10 px-5 rounded-md shadow-sm hover:shadow-md transition-all duration-200"
            >
              {actionLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
});

EmptyState.displayName = 'EmptyState';
