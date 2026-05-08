import { useCallback, useMemo, useState } from "react";

interface UsePaginationOptions {
  pageSize: number;
  initialPage?: number;
}

export function usePagination<T>(items: T[], options: UsePaginationOptions) {
  const { pageSize, initialPage = 1 } = options;
  const [page, setPage] = useState(initialPage);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(items.length / pageSize)),
    [items.length, pageSize],
  );

  const currentPage = Math.min(Math.max(1, page), totalPages);

  const pagedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, currentPage, pageSize]);

  const goPrev = useCallback(() => {
    setPage((prev) => {
      const safePrev = Math.min(Math.max(1, prev), totalPages);
      return Math.max(1, safePrev - 1);
    });
  }, [totalPages]);
  const goNext = useCallback(() => {
    setPage((prev) => {
      const safePrev = Math.min(Math.max(1, prev), totalPages);
      return Math.min(totalPages, safePrev + 1);
    });
  }, [totalPages]);
  const resetPage = useCallback(() => {
    setPage(1);
  }, []);

  return {
    currentPage,
    totalPages,
    pagedItems,
    goPrev,
    goNext,
    setPage,
    resetPage,
  };
}
