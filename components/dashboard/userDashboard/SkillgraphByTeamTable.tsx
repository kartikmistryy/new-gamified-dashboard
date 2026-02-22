"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import type { SkillgraphTeamRow, SkillgraphTableFilter } from "@/lib/dashboard/entities/team/types";
import { createSkillgraphTeamColumns } from "@/lib/dashboard/entities/user/charts/skillgraph/skillgraphTeamColumns";
import {
  getTeamSkillUsageValue,
  getSortingForFilter,
} from "@/lib/dashboard/entities/user/charts/skillgraph/skillgraphTeamTableUtils";
import { SkillgraphTeamDetailTable } from "./SkillgraphTeamDetailTable";
import { SortableTableHeader } from "@/components/dashboard/shared/SortableTableHeader";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { FilterBadges } from "@/components/dashboard/shared/FilterBadges";
import { DASHBOARD_BG_CLASSES } from "@/lib/dashboard/shared/utils/colors";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const SKILLGRAPH_TEAM_FILTER_TABS: { key: SkillgraphTableFilter; label: string }[] = [
  { key: "mostUsage", label: "Most Usage" },
  { key: "leastUsage", label: "Least Usage" },
  { key: "mostPercentOfChart", label: "Most Diverse" },
  { key: "leastPercentOfChart", label: "Most Focused" },
];

type SkillgraphByTeamTableProps = {
  rows: SkillgraphTeamRow[];
  activeFilter?: SkillgraphTableFilter;
  onFilterChange?: (filter: SkillgraphTableFilter) => void;
  visibleTeams?: Record<string, boolean>;
  onVisibilityChange?: (teamName: string, visible: boolean) => void;
};

export function SkillgraphByTeamTable({
  rows,
  activeFilter = "mostUsage",
  onFilterChange,
  visibleTeams: externalVisibleTeams,
  onVisibilityChange,
}: SkillgraphByTeamTableProps) {
  const [internalVisible, setInternalVisible] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    rows.forEach((r) => { init[r.teamName] = true; });
    return init;
  });
  const [internalFilter, setInternalFilter] = useState<SkillgraphTableFilter>("mostUsage");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const visibleTeams = externalVisibleTeams ?? internalVisible;
  // Use activeFilter if onFilterChange is provided (controlled), otherwise use internal state (uncontrolled)
  const currentFilter = onFilterChange ? activeFilter : internalFilter;

  const handleFilterChange = useCallback((filter: SkillgraphTableFilter) => {
    if (onFilterChange) {
      onFilterChange(filter);
    } else {
      setInternalFilter(filter);
    }
    setPage(1);
  }, [onFilterChange]);

  const toggleVisibility = useCallback((teamName: string) => {
    if (onVisibilityChange) {
      onVisibilityChange(teamName, visibleTeams[teamName] === false);
    } else {
      setInternalVisible((prev) => ({ ...prev, [teamName]: !prev[teamName] }));
    }
  }, [visibleTeams, onVisibilityChange]);

  const [sorting, setSorting] = useState<SortingState>(() => getSortingForFilter(activeFilter));

  useEffect(() => {
    setSorting(getSortingForFilter(currentFilter));
  }, [currentFilter]);

  const totalUsageSum = useMemo(
    () => rows.reduce((sum, row) => sum + getTeamSkillUsageValue(row), 0),
    [rows],
  );

  const columns = useMemo(
    () =>
      createSkillgraphTeamColumns({
        toggleVisibility,
        visibleTeams,
        totalUsageSum,
      }),
    [toggleVisibility, visibleTeams, totalUsageSum]
  );

  const table = useReactTable({
    data: rows,
    columns,
    getRowCanExpand: () => true,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
  });

  return (
    <div className="w-full">
      <FilterBadges
        filterTabs={SKILLGRAPH_TEAM_FILTER_TABS}
        currentFilter={currentFilter}
        onFilterChange={handleFilterChange}
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
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((row) => (
                <Fragment key={row.id}>
                  <TableRow
                    className={`${DASHBOARD_BG_CLASSES.borderLight} hover:bg-gray-50/80 ${row.getIsExpanded() ? "bg-muted" : ""}`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={`align-middle [&:has([aria-expanded])]:w-px [&:has([aria-expanded])]:py-0 ${
                          (cell.column.columnDef.meta as { className?: string })?.className ?? ""
                        }`}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                  {row.getIsExpanded() ? (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={row.getVisibleCells().length} className="p-0">
                        <SkillgraphTeamDetailTable
                          details={row.original.details}
                          rowId={row.id}
                        />
                      </TableCell>
                    </TableRow>
                  ) : null}
                </Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {(() => {
        const totalRows = table.getRowModel().rows.length;
        const totalPages = Math.ceil(totalRows / PAGE_SIZE);
        if (totalPages <= 1) return <p className="mt-4 text-center text-sm text-gray-400">All Loaded</p>;
        return (
          <div className="mt-4 flex flex-col gap-4 items-center justify-between">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => { e.preventDefault(); setPage((p) => Math.max(1, p - 1)); }}
                    aria-disabled={page === 1}
                    className={page === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                  const showPage = p === 1 || p === totalPages || Math.abs(p - page) <= 1;
                  const showEllipsisBefore = p === page - 2 && page > 3;
                  const showEllipsisAfter = p === page + 2 && page < totalPages - 2;
                  if (showEllipsisBefore || showEllipsisAfter) {
                    return <PaginationItem key={`e-${p}`}><PaginationEllipsis /></PaginationItem>;
                  }
                  if (!showPage) return null;
                  return (
                    <PaginationItem key={p}>
                      <PaginationLink href="#" isActive={p === page} onClick={(e) => { e.preventDefault(); setPage(p); }}>{p}</PaginationLink>
                    </PaginationItem>
                  );
                })}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => { e.preventDefault(); setPage((p) => Math.min(totalPages, p + 1)); }}
                    aria-disabled={page === totalPages}
                    className={page === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
            <p className="text-sm text-gray-400 w-fit mx-auto shrink-0">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, totalRows)} of {totalRows} rows
            </p>
          </div>
        );
      })()}
    </div>
  );
}
