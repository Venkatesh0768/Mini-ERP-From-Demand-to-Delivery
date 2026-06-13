"use client";

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface PaginationProps {
  page: number;           // 0-indexed
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
  className = "",
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : page * pageSize + 1;
  const end = Math.min((page + 1) * pageSize, total);

  // Build page window: always show first, last, current ±1, with ellipsis
  const getPageNumbers = (): (number | "…")[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i);
    const pages: (number | "…")[] = [];
    const addPage = (p: number) => { if (!pages.includes(p)) pages.push(p); };
    addPage(0);
    if (page > 2) pages.push("…");
    for (let i = Math.max(1, page - 1); i <= Math.min(totalPages - 2, page + 1); i++) addPage(i);
    if (page < totalPages - 3) pages.push("…");
    addPage(totalPages - 1);
    return pages;
  };

  const btn =
    "inline-flex items-center justify-center h-8 w-8 rounded-lg text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed";
  const btnIdle = `${btn} text-gray-500 hover:bg-gray-100 hover:text-gray-900`;
  const btnActive = `${btn} bg-indigo-600 text-white shadow-sm`;

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-gray-100 ${className}`}>
      {/* Left: rows info + page size */}
      <div className="flex items-center gap-3 text-xs text-gray-500">
        <span>
          {total === 0 ? "No results" : `${start}–${end} of ${total}`}
        </span>
        {onPageSizeChange && (
          <div className="flex items-center gap-1.5">
            <span>Rows</span>
            <select
              value={pageSize}
              onChange={(e) => {
                onPageSizeChange(Number(e.target.value));
                onPageChange(0);
              }}
              className="h-7 rounded-md border border-gray-200 bg-white px-1.5 text-xs outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
            >
              {pageSizeOptions.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right: page buttons */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(0)}
          disabled={page === 0}
          className={btnIdle}
          aria-label="First page"
        >
          <ChevronsLeft size={13} />
        </button>
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
          className={btnIdle}
          aria-label="Previous page"
        >
          <ChevronLeft size={13} />
        </button>

        {getPageNumbers().map((p, i) =>
          p === "…" ? (
            <span key={`ellipsis-${i}`} className="h-8 w-6 flex items-center justify-center text-xs text-gray-400">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              className={p === page ? btnActive : btnIdle}
            >
              {(p as number) + 1}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages - 1}
          className={btnIdle}
          aria-label="Next page"
        >
          <ChevronRight size={13} />
        </button>
        <button
          onClick={() => onPageChange(totalPages - 1)}
          disabled={page >= totalPages - 1}
          className={btnIdle}
          aria-label="Last page"
        >
          <ChevronsRight size={13} />
        </button>
      </div>
    </div>
  );
}
