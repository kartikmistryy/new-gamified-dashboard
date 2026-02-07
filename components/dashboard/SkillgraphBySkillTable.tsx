"use client";

import { Fragment, useCallback, useMemo, useState } from "react";
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
  SKILLGRAPH_SKILL_FILTER_TABS,
  createOpacityScale,
  getSortingForFilter,
} from "@/lib/dashboard/skillgraphTableUtils";
import { SkillgraphDetailTable } from "./SkillgraphDetailTable";
import { SortableTableHeader } from "./SortableTableHeader";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "../shared/Badge";

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

  const visibleDomains = externalVisibleDomains ?? internalVisible;


  const toggleVisibility = useCallback((skillName: string) => {
    if (onVisibilityChange) {
      onVisibilityChange(skillName, visibleDomains[skillName] === false);
    } else {
      setInternalVisible((prev) => ({ ...prev, [skillName]: !prev[skillName] }));
    }
  }, [visibleDomains, onVisibilityChange]);

  const [internalFilter, setInternalFilter] = useState<SkillgraphSkillFilter>(activeFilter);
  const currentFilter = onFilterChange ? activeFilter : internalFilter;
  const [sorting, setSorting] = useState<SortingState>(() => getSortingForFilter(currentFilter));

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
      <div className="flex flex-row flex-wrap gap-2 mb-4">
        {SKILLGRAPH_SKILL_FILTER_TABS.map((tab) => (
          <Badge
            key={tab.key}
            onClick={() => {
              if (onFilterChange) {
                onFilterChange(tab.key);
              } else {
                setInternalFilter(tab.key);
              }
              setSorting(getSortingForFilter(tab.key));
            }}
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
