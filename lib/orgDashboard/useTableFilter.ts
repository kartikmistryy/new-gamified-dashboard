"use client";

import { useMemo, useState } from "react";

type UseTableFilterParams<T, F extends string> = {
  rows: T[];
  activeFilter?: F;
  onFilterChange?: (filter: F) => void;
  defaultFilter: F;
  sortFunction: (rows: T[], currentFilter: F) => T[];
};

export function useTableFilter<T, F extends string>({
  rows,
  activeFilter,
  onFilterChange,
  defaultFilter,
  sortFunction,
}: UseTableFilterParams<T, F>): {
  currentFilter: F;
  handleFilter: (filter: F) => void;
  sortedRows: T[];
} {
  const [filter, setFilter] = useState<F>(defaultFilter);
  const currentFilter = (onFilterChange ? activeFilter : filter) ?? defaultFilter;
  const handleFilter = onFilterChange ?? setFilter;

  const sortedRows = useMemo(
    () => sortFunction(rows, currentFilter as F),
    [rows, currentFilter, sortFunction]
  );

  return { currentFilter: currentFilter as F, handleFilter, sortedRows };
}
