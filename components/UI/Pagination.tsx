"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
};

export default function Pagination({
  page, totalPages, totalItems, pageSize, onPageChange,
}: Props) {
  if (totalItems === 0) return null;

  const from = (page - 1) * pageSize + 1;
  const to   = Math.min(page * pageSize, totalItems);

  // Build page number buttons — show at most 5 around current page
  function getPages(): (number | "…")[] {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "…")[] = [];
    pages.push(1);
    if (page > 3) pages.push("…");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i);
    }
    if (page < totalPages - 2) pages.push("…");
    pages.push(totalPages);
    return pages;
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 pt-4">
      {/* Left — range info */}
      <p className="text-xs text-slate-500 shrink-0">
        Showing <span className="font-semibold text-slate-700">{from}–{to}</span> of{" "}
        <span className="font-semibold text-slate-700">{totalItems}</span> results
      </p>

      {/* Right — controls */}
      <div className="flex items-center gap-1">
        {/* Previous */}
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <ChevronLeft size={13} />
          Prev
        </button>

        {/* Page numbers — only show when more than 1 page */}
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            {getPages().map((p, i) =>
              p === "…" ? (
                <span key={`ellipsis-${i}`} className="px-2 text-xs text-slate-400 select-none">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => onPageChange(p as number)}
                  className={`min-w-[32px] h-8 px-2 text-xs font-medium rounded-lg transition ${
                    p === page
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {p}
                </button>
              )
            )}
          </div>
        )}

        {/* Next */}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          Next
          <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
}
