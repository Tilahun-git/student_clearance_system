import { useState, useMemo } from "react";

export function usePagination<T>(items: T[], pageSize = 10) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  // Reset to page 1 whenever the item list changes length (e.g. after search/delete)
  const safePage = Math.min(page, totalPages);

  const paged = useMemo(
    () => items.slice((safePage - 1) * pageSize, safePage * pageSize),
    [items, safePage, pageSize],
  );

  function goTo(p: number) {
    setPage(Math.max(1, Math.min(p, totalPages)));
  }

  return {
    page: safePage,
    totalPages,
    totalItems: items.length,
    pageSize,
    paged,
    goTo,
    reset: () => setPage(1),
  };
}
