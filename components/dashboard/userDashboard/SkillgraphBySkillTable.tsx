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
import type { SkillgraphSkillRow, SkillgraphSkillFilter } from "@/lib/orgDashboard/types";
import { createSkillgraphSkillColumns } from "@/lib/dashboard/skillgraphColumns";
import {
  createOpacityScale,
  getSortingForFilter,
} from "@/lib/dashboard/skillgraphTableUtils";
import { SkillgraphDetailTable } from "./SkillgraphDetailTable";
import { SortableTableHeader } from "@/components/dashboard/shared/SortableTableHeader";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { FilterBadges } from "@/components/dashboard/shared/FilterBadges";

const SKILLGRAPH_SKILL_FILTER_TABS: { key: SkillgraphSkillFilter; label: string }[] = [
  { key: "mostUsage", label: "Most Popular" },
  { key: "mostAvgUsage", label: "Most Focused" },
  { key: "mostContributors", label: "Broadest Adoption" },
  { key: "leastContributors", label: "Niche Skill" },
];

type SkillgraphBySkillTableProps = {
  rows: SkillgraphSkillRow[];
  activeFilter?: SkillgraphSkillFilter;
  onFilterChange?: (filter: SkillgraphSkillFilter) => void;
  visibleDomains?: Record<string, boolean>;
  onVisibilityChange?: (domainName: string, visible: boolean) => void;
  detailHeaderLabel?: string;
};

export function SkillgraphBySkillTable({
  rows,
  activeFilter = "mostUsage",
  onFilterChange,
  visibleDomains: externalVisibleDomains,
  onVisibilityChange,
  detailHeaderLabel = "Team",
}: SkillgraphBySkillTableProps) {
  const [internalVisible, setInternalVisible] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    rows.forEach((r) => { init[r.skillName] = true; });
    return init;
  });
  const [internalFilter, setInternalFilter] = useState<SkillgraphSkillFilter>("mostUsage");

  const visibleDomains = externalVisibleDomains ?? internalVisible;
  // Use activeFilter if onFilterChange is provided (controlled), otherwise use internal state (uncontrolled)
  const currentFilter = onFilterChange ? activeFilter : internalFilter;

  const handleFilterChange = useCallback((filter: SkillgraphSkillFilter) => {
    if (onFilterChange) {
      onFilterChange(filter);
    } else {
      setInternalFilter(filter);
    }
  }, [onFilterChange]);


  const toggleVisibility = useCallback((skillName: string) => {
    if (onVisibilityChange) {
      onVisibilityChange(skillName, visibleDomains[skillName] === false);
    } else {
      setInternalVisible((prev) => ({ ...prev, [skillName]: !prev[skillName] }));
    }
  }, [visibleDomains, onVisibilityChange]);

  const [sorting, setSorting] = useState<SortingState>(() => getSortingForFilter(activeFilter));

  useEffect(() => {
    setSorting(getSortingForFilter(currentFilter));
  }, [currentFilter]);

  const opacityScale = useMemo(
    () => createOpacityScale(rows.map((row) => row.totalUsage)),
    [rows]
  );

  const columns = useMemo(
    () =>
      createSkillgraphSkillColumns({
        toggleVisibility,
        visibleDomains,
        opacityScale,
      }),
    [toggleVisibility, visibleDomains, opacityScale]
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
        filterTabs={SKILLGRAPH_SKILL_FILTER_TABS}
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
              table.getRowModel().rows.map((row) => (
                <Fragment key={row.id}>
                  <TableRow
                    className={`border-[#E5E5E5] hover:bg-gray-50/80 ${row.getIsExpanded() ? "bg-muted" : ""}`}
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
                        <SkillgraphDetailTable
                          details={row.original.details}
                          rowId={row.id}
                          detailHeaderLabel={detailHeaderLabel}
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
    </div>
  );
}
