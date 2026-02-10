"use client";
"use no memo";

import * as React from "react";
import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { SortableTableHeader } from "@/components/dashboard/shared/SortableTableHeader";
import type { SpofTeamRow } from "@/lib/orgDashboard/spofMockData";
import { FilterBadges } from "@/components/dashboard/shared/FilterBadges";
import {
  sortSpofTeams,
  SPOF_FILTER_TABS,
  type SpofTableFilter,
} from "@/lib/orgDashboard/spofTeamsTableUtils";
import { createSpofTeamsColumns } from "@/lib/orgDashboard/spofTeamsTableColumns";

type SpofTeamsTableProps = {
  rows: SpofTeamRow[];
  visibleTeams: Record<string, boolean>;
  onVisibilityChange: (teamName: string, visible: boolean) => void;
};

/** SPOF Teams Table - displays team risk distribution and repository health */
export function SpofTeamsTable({ rows, visibleTeams, onVisibilityChange }: SpofTeamsTableProps) {
  const [currentFilter, setCurrentFilter] = useState<SpofTableFilter>("highestRisk");
  const [sorting, setSorting] = useState<SortingState>([]);

  const sortedRows = useMemo(() => sortSpofTeams(rows, currentFilter), [rows, currentFilter]);

  const handleToggle = React.useCallback(
    (teamName: string) => {
      const currentlyVisible = visibleTeams[teamName] !== false;
      onVisibilityChange(teamName, !currentlyVisible);
    },
    [visibleTeams, onVisibilityChange]
  );

  const columns = useMemo(
    () => createSpofTeamsColumns(visibleTeams, handleToggle),
    [visibleTeams, handleToggle]
  );

  const table = useReactTable({
    data: sortedRows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
  });

  return (
    <div className="w-full">
      <FilterBadges
        filterTabs={SPOF_FILTER_TABS}
        currentFilter={currentFilter}
        onFilterChange={setCurrentFilter}
      />
      <div className="rounded-sm border-none overflow-hidden bg-white">
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
              <TableRow key={row.original.teamName} className="border-[#E5E5E5] hover:bg-gray-50/80">
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
