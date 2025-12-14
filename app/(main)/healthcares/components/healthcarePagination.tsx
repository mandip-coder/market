import { Button } from "antd";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface HealthcarePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemCount: number;
  totalItems: number;
  loading: boolean;
}

export const HealthcarePagination = ({
  currentPage,
  totalPages,
  onPageChange,
  itemCount,
  totalItems,
  loading
}: HealthcarePaginationProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
        {loading ? "Loading..." : `Showing ${itemCount} of ${totalItems} healthcares`}
      </p>

      {!loading && totalPages > 1 && (
        <div className="flex items-center gap-2">
          <Button
            icon={<ChevronLeft className="h-4 w-4" />}
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          />
          <span className="text-sm text-slate-600 dark:text-slate-400">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            icon={<ChevronRight className="h-4 w-4" />}
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          />
        </div>
      )}
    </div>
  );
};