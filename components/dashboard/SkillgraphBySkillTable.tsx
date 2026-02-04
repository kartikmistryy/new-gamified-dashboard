"use client";

import { Fragment, useCallback, useMemo, useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { SkillgraphSkillRow, SkillgraphSkillFilter } from "@/lib/orgDashboard/types";
import { DASHBOARD_TEXT_CLASSES } from "@/lib/orgDashboard/colors";
import { useTableFilter } from "@/lib/orgDashboard/useTableFilter";
import { Badge } from "../shared/Badge";
import { DomainDistributionBar } from "./DomainDistributionBar";
import { SkillgraphProgressBar } from "./SkillgraphProgressBar";
import { VisibilityToggleButton } from "./VisibilityToggleButton";
import { getColorForDomain } from "@/components/skillmap/skillGraphUtils";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const FILTER_TABS: { key: SkillgraphSkillFilter; label: string }[] = [
  { key: "mostCommon", label: "Most Common" },
  { key: "leastCommon", label: "Least Common" },
  { key: "mostProficient", label: "Most Proficient" },
  { key: "leastProficient", label: "Least Proficient" },
];

function sortFunction(rows: SkillgraphSkillRow[], filter: SkillgraphSkillFilter): SkillgraphSkillRow[] {
  const copy = [...rows];
  if (filter === "mostCommon") return copy.sort((a, b) => b.skillCount - a.skillCount);
  if (filter === "leastCommon") return copy.sort((a, b) => a.skillCount - b.skillCount);
  if (filter === "mostProficient") return copy.sort((a, b) => b.domainCount - a.domainCount);
  if (filter === "leastProficient") return copy.sort((a, b) => a.domainCount - b.domainCount);
  return copy;
}

type SkillgraphBySkillTableProps = {
  rows: SkillgraphSkillRow[];
  activeFilter?: SkillgraphSkillFilter;
  onFilterChange?: (filter: SkillgraphSkillFilter) => void;
  visibleDomains?: Record<string, boolean>;
  onVisibilityChange?: (domainName: string, visible: boolean) => void;
};

export function SkillgraphBySkillTable({
  rows,
  activeFilter = "mostCommon",
  onFilterChange,
  visibleDomains: externalVisibleDomains,
  onVisibilityChange,
}: SkillgraphBySkillTableProps) {
  const [internalVisible, setInternalVisible] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    rows.forEach((r) => { init[r.domainName] = true; });
    return init;
  });

  const visibleDomains = externalVisibleDomains ?? internalVisible;

  const toggleVisibility = useCallback((domainName: string) => {
    if (onVisibilityChange) {
      onVisibilityChange(domainName, visibleDomains[domainName] === false);
    } else {
      setInternalVisible((prev) => ({ ...prev, [domainName]: !prev[domainName] }));
    }
  }, [visibleDomains, onVisibilityChange]);

  const { currentFilter, handleFilter, sortedRows } = useTableFilter({
    rows,
    activeFilter,
    onFilterChange,
    defaultFilter: "mostCommon",
    sortFunction,
  });

  const columns = useMemo<ColumnDef<SkillgraphSkillRow>[]>(() => [
    {
      id: "expander",
      header: () => null,
      cell: ({ row }) => (
        <Button
          className="size-7 text-muted-foreground"
          onClick={row.getToggleExpandedHandler()}
          aria-expanded={row.getIsExpanded()}
          aria-label={
            row.getIsExpanded()
              ? `Collapse details for ${row.original.domainName}`
              : `Expand details for ${row.original.domainName}`
          }
          size="icon"
          variant="ghost"
        >
          {row.getIsExpanded() ? (
            <ChevronUpIcon className="opacity-60" aria-hidden="true" />
          ) : (
            <ChevronDownIcon className="opacity-60" aria-hidden="true" />
          )}
        </Button>
      ),
    },
    {
      id: "view",
      header: "",
      cell: ({ row }) => (
        <VisibilityToggleButton
          isVisible={visibleDomains[row.original.domainName] !== false}
          onToggle={() => toggleVisibility(row.original.domainName)}
        />
      ),
    },
    {
      id: "rank",
      header: "Rank",
      cell: ({ row }) => {
        const rank = row.index + 1;
        return (
          <span className={rank <= 3 ? "text-foreground font-bold" : DASHBOARD_TEXT_CLASSES.rankMuted}>
            {rank}
          </span>
        );
      },
    },
    {
      header: "Domain",
      accessorKey: "domainName",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div
            className="size-4 rounded shrink-0"
            style={{ backgroundColor: getColorForDomain(row.original.domainName) }}
            aria-hidden
          />
          <p className="font-medium text-gray-900">{row.original.domainName}</p>
        </div>
      ),
    },
    {
      header: "Skill",
      accessorKey: "skillCount",
      cell: ({ row }) => <span className="text-gray-900">{row.original.skillCount}</span>,
    },
    {
      header: "Domain",
      accessorKey: "domainCount",
      cell: ({ row }) => <span className="text-gray-900">{row.original.domainCount}</span>,
    },
    {
      id: "distribution",
      header: "Domain Distribution",
      meta: { className: "text-right min-w-[260px]" },
      cell: ({ row }) =>
        row.original.domainDistribution ? (
          <DomainDistributionBar segments={row.original.domainDistribution} getColor={getColorForDomain} />
        ) : null,
    },
  ], [toggleVisibility, visibleDomains]);

  const table = useReactTable({
    data: sortedRows,
    columns,
    getRowCanExpand: () => true,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2 mb-4">
        {FILTER_TABS.map((tab) => (
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
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-none hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={`text-foreground font-medium ${
                      (header.column.columnDef.meta as { className?: string })?.className ?? ""
                    }`}
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
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
                        <Table className="table-fixed">
                          <TableHeader>
                            <TableRow className="hover:bg-transparent">
                              <TableHead className="w-1/4">Team</TableHead>
                              <TableHead className="w-1/4">Usage</TableHead>
                              <TableHead className="w-1/4">Ownership</TableHead>
                              <TableHead className="w-1/4">Progress</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {(row.original.details ?? []).map((detail, index) => (
                              <TableRow key={`${detail.team}-${index}`} className="border-0 hover:bg-gray-50/70">
                                <TableCell className="font-medium text-gray-900 w-1/4">{detail.team}</TableCell>
                                <TableCell className="text-gray-700 w-1/4">{detail.usage}</TableCell>
                                <TableCell className="text-gray-700 w-1/4">{detail.ownership}%</TableCell>
                                <TableCell className="w-1/4">
                                  <SkillgraphProgressBar value={detail.progress} />
                                </TableCell>
                              </TableRow>
                            ))}
                            {!row.original.details?.length ? (
                              <TableRow className="border-0 hover:bg-transparent">
                                <TableCell colSpan={4} className="h-14 text-center text-sm text-gray-500">
                                  No details available.
                                </TableCell>
                              </TableRow>
                            ) : null}
                          </TableBody>
                        </Table>
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
