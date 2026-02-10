"use client";
"use no memo";

import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/shared/Badge";
import { SortableTableHeader } from "./SortableTableHeader";
import { useTableFilter } from "@/lib/orgDashboard/useTableFilter";
import { FilterBadges } from "@/components/dashboard/shared/FilterBadges";

export type BaseTeamsTableColumn<T, F extends string> = {
  key: string;
  header: string;
  className?: string;
  render: (row: T, index: number) => React.ReactNode;
  /** Enable sorting for this column. Default: true */
  enableSorting?: boolean;
  /** Custom sort function for this column */
  sortingFn?: (rowA: T, rowB: T) => number;
  /** Accessor function to get sortable value from row */
  accessorFn?: (row: T) => any;
};

type BaseTeamsTableProps<T, F extends string> = {
  rows: T[];
  filterTabs: { key: F; label: string }[];
  activeFilter?: F;
  onFilterChange?: (filter: F) => void;
  defaultFilter: F;
  sortFunction: (rows: T[], currentFilter: F) => T[];
  columns: BaseTeamsTableColumn<T, F>[];
  getRowKey: (row: T) => string;
  showFilters?: boolean;
};

export function BaseTeamsTable<T, F extends string>({
  rows,
  filterTabs,
  activeFilter,
  onFilterChange,
  defaultFilter,
  sortFunction,
  columns,
  getRowKey,
  showFilters = true,
}: BaseTeamsTableProps<T, F>) {
  const { currentFilter, handleFilter, sortedRows } = useTableFilter({
    rows,
    activeFilter,
    onFilterChange,
    defaultFilter,
    sortFunction,
  });

  const [sorting, setSorting] = useState<SortingState>([]);

  // Convert BaseTeamsTableColumn to TanStack ColumnDef
  const tableColumns = useMemo<ColumnDef<T, unknown>[]>(() => {
    return columns.map((col) => ({
      id: col.key,
      header: col.header,
      // Use accessorFn if provided, otherwise create a default one
      accessorFn: col.accessorFn || ((row: T) => row),
      cell: ({ row }) => col.render(row.original, row.index),
      enableSorting: col.enableSorting === true,
      sortingFn: col.sortingFn ? (rowA, rowB) => col.sortingFn!(rowA.original, rowB.original) : "auto",
      meta: {
        className: col.className,
      },
    }));
  }, [columns]);

  const table = useReactTable({
    data: sortedRows,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  return (
    <div className="w-full min-w-0">
      {showFilters && (
        <FilterBadges
          filterTabs={filterTabs}
          currentFilter={currentFilter}
          onFilterChange={handleFilter}
        />
      )}
      <div className="rounded-sm border-none overflow-hidden bg-white min-w-0 max-w-full">
        <Table>
          <TableHeader className="border-0">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-none hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <SortableTableHeader key={header.id} header={header} />
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={getRowKey(row.original)}
                className="border-[#E5E5E5] hover:bg-gray-50/80"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={(cell.column.columnDef.meta as { className?: string })?.className}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
