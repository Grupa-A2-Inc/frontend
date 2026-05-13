import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CoursePaginationMeta } from "@/lib/student-courses/types";

type Props = {
  pagination: CoursePaginationMeta;
  loading: boolean;
  onPageChange: (page: number) => void;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
};

const PAGE_SIZES = [10, 20, 50];

export default function PaginationControls({
  pagination,
  loading,
  onPageChange,
  pageSize,
  onPageSizeChange,
}: Props) {
  const currentPage = pagination.number;
  const totalPages = Math.max(pagination.totalPages, 1);
  const start = pagination.totalElements === 0 ? 0 : currentPage * pagination.size + 1;
  const end = currentPage * pagination.size + pagination.numberOfElements;

  return (
    <div className="mt-6 flex flex-col gap-3 border-t border-brand-border pt-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3 text-sm text-brand-muted">
        <span>
          {start}-{end} of {pagination.totalElements}
        </span>
        <select
          value={pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
          disabled={loading}
          className="bg-brand-card border border-brand-border rounded-lg px-2 py-1.5 text-sm text-brand-text focus:outline-none focus:border-brand-primary/60 disabled:opacity-50"
        >
          {PAGE_SIZES.map((size) => (
            <option key={size} value={size}>
              {size} / page
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2 sm:mr-18">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={loading || pagination.first || pagination.totalElements === 0}
          className="inline-flex items-center gap-2 rounded-lg border border-brand-border bg-brand-card px-3 py-2 text-sm font-medium text-brand-text transition hover:border-brand-primary/50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={16} />
          Previous
        </button>
        <span className="min-w-24 text-center text-sm text-brand-muted">
          Page {pagination.totalElements === 0 ? 0 : currentPage + 1} / {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={loading || pagination.last || pagination.totalElements === 0}
          className="inline-flex items-center gap-2 rounded-lg border border-brand-border bg-brand-card px-3 py-2 text-sm font-medium text-brand-text transition hover:border-brand-primary/50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
