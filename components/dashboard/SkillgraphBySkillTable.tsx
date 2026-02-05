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
import { SkillgraphProgressBar } from "./SkillgraphProgressBar";
import { VisibilityToggleButton } from "./VisibilityToggleButton";
import { getColorForDomain } from "@/components/skillmap/skillGraphUtils";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const USAGE_FORMATTER = new Intl.NumberFormat("en-US");

const FILTER_TABS: { key: SkillgraphSkillFilter; label: string }[] = [
  { key: "mostUsage", label: "Most Usage" },
  { key: "leastUsage", label: "Least Usage" },
  { key: "mostAvgUsage", label: "Highest Avg Usage" },
  { key: "leastAvgUsage", label: "Lowest Avg Usage" },
  { key: "mostContributors", label: "Most Contributors" },
  { key: "leastContributors", label: "Least Contributors" },
];

function sortFunction(rows: SkillgraphSkillRow[], filter: SkillgraphSkillFilter): SkillgraphSkillRow[] {
  const copy = [...rows];
  if (filter === "mostUsage") return copy.sort((a, b) => b.totalUsage - a.totalUsage);
  if (filter === "leastUsage") return copy.sort((a, b) => a.totalUsage - b.totalUsage);
  if (filter === "mostAvgUsage") return copy.sort((a, b) => b.avgUsage - a.avgUsage);
  if (filter === "leastAvgUsage") return copy.sort((a, b) => a.avgUsage - b.avgUsage);
  if (filter === "mostContributors") return copy.sort((a, b) => b.contributors - a.contributors);
  if (filter === "leastContributors") return copy.sort((a, b) => a.contributors - b.contributors);
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
  activeFilter = "mostUsage",
  onFilterChange,
  visibleDomains: externalVisibleDomains,
  onVisibilityChange,
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

  const { currentFilter, handleFilter, sortedRows } = useTableFilter({
    rows,
    activeFilter,
    onFilterChange,
    defaultFilter: "mostUsage",
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
              ? `Collapse details for ${row.original.skillName}`
              : `Expand details for ${row.original.skillName}`
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
          isVisible={visibleDomains[row.original.skillName] !== false}
          onToggle={() => toggleVisibility(row.original.skillName)}
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
      header: "Skill",
      accessorKey: "skillName",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div
            className="size-4 rounded shrink-0"
            style={{ backgroundColor: getColorForDomain(row.original.domainName) }}
            aria-hidden
          />
          <p className="font-medium text-gray-900">{row.original.skillName}</p>
        </div>
      ),
    },
    {
      header: "Domain",
      accessorKey: "domainName",
      cell: ({ row }) => <span className="text-gray-900">{row.original.domainName}</span>,
    },
    {
      header: "Total Usage",
      accessorKey: "totalUsage",
      cell: ({ row }) => <span className="text-gray-900">{USAGE_FORMATTER.format(row.original.totalUsage)}</span>,
    },
    {
      header: "Avg Usage",
      accessorKey: "avgUsage",
      cell: ({ row }) => <span className="text-gray-900">{USAGE_FORMATTER.format(row.original.avgUsage)}</span>,
    },
    {
      header: "Contributors",
      accessorKey: "contributors",
      cell: ({ row }) => (
        <span className="text-gray-900">{USAGE_FORMATTER.format(row.original.contributors)} people</span>
      ),
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
