"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "../shared/Badge";
import { useTableFilter } from "@/lib/orgDashboard/useTableFilter";

export type BaseTeamsTableColumn<T, F extends string> = {
  key: string;
  header: string;
  className?: string;
  render: (row: T, index: number) => React.ReactNode;
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
}: BaseTeamsTableProps<T, F>) {
  const { currentFilter, handleFilter, sortedRows } = useTableFilter({
    rows,
    activeFilter,
    onFilterChange,
    defaultFilter,
    sortFunction,
  });

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2 mb-4">
        {filterTabs.map((tab) => (
          <Badge
            key={tab.key}
            onClick={() => handleFilter(tab.key)}
            className={`px-3 py-2 rounded-lg cursor-pointer text-xs font-medium transition-colors ${
              currentFilter === tab.key
                ? "bg-gray-100 text-gray-700 hover:bg-gray-100"
                : "bg-transparent text-gray-700 border border-gray-200 hover:bg-gray-100"
            }`}
          >
            {tab.label}
          </Badge>
        ))}
      </div>
      <div className="rounded-sm border-none overflow-hidden bg-white">
        <Table>
          <TableHeader className="border-0">
            <TableRow className="border-none hover:bg-transparent">
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  className={`text-foreground font-medium ${col.className ?? ""}`}
                >
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedRows.map((row, index) => (
              <TableRow
                key={getRowKey(row)}
                className="border-[#E5E5E5] hover:bg-gray-50/80"
              >
                {columns.map((col) => (
                  <TableCell key={col.key} className={col.className}>
                    {col.render(row, index)}
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
