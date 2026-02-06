"use client";

import { Fragment, useCallback, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import type { SkillgraphSkillRow, SkillgraphSkillFilter } from "@/lib/orgDashboard/types";
import { DASHBOARD_TEXT_CLASSES } from "@/lib/orgDashboard/colors";
import { SkillgraphProgressBar } from "./SkillgraphProgressBar";
import { VisibilityToggleButton } from "./VisibilityToggleButton";
import { getColorForDomain } from "@/components/skillmap/skillGraphUtils";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { hexToRgba } from "@/lib/orgDashboard/tableUtils";
import { Badge } from "../shared/Badge";
import { TeamAvatar } from "../shared/TeamAvatar";

const USAGE_FORMATTER = new Intl.NumberFormat("en-US");

const FILTER_TABS: { key: SkillgraphSkillFilter; label: string }[] = [
  { key: "mostUsage", label: "Most Usage" },
  { key: "leastUsage", label: "Least Usage" },
  { key: "mostAvgUsage", label: "Highest Completion" },
  { key: "leastAvgUsage", label: "Lowest Completion" },
  { key: "mostContributors", label: "Most Contributors" },
  { key: "leastContributors", label: "Least Contributors" },
];

function getTotalSkillCompletionValue(row: SkillgraphSkillRow) {
  const rawValue = row.totalSkillCompletion;
  const fallbackValue =
    row.details?.length
      ? row.details.reduce((sum, detail) => sum + detail.progress, 0) / row.details.length
      : 0;
  const safeValue = Number.isFinite(rawValue) ? rawValue : fallbackValue;
  return Math.round(Math.max(0, Math.min(100, safeValue)));
}

function createOpacityScale(values: number[]) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  return (value: number) => {
    if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) return 0.75;
    const t = (value - min) / (max - min);
    return 0.35 + t * 0.6;
  };
}

function getSortingForFilter(filter: SkillgraphSkillFilter): SortingState {
  switch (filter) {
    case "mostUsage":
      return [{ id: "totalUsage", desc: true }];
    case "leastUsage":
      return [{ id: "totalUsage", desc: false }];
    case "mostAvgUsage":
      return [{ id: "totalSkillCompletion", desc: true }];
    case "leastAvgUsage":
      return [{ id: "totalSkillCompletion", desc: false }];
    case "mostContributors":
      return [{ id: "contributors", desc: true }];
    case "leastContributors":
      return [{ id: "contributors", desc: false }];
    default:
      return [];
  }
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

  const [internalFilter, setInternalFilter] = useState<SkillgraphSkillFilter>(activeFilter);
  const currentFilter = onFilterChange ? activeFilter : internalFilter;
  const [sorting, setSorting] = useState<SortingState>(() => getSortingForFilter(currentFilter));
  const [detailSorting, setDetailSorting] = useState<Record<string, { key: "team" | "usage" | "progress"; dir: "asc" | "desc" }>>({});
  const opacityScale = useMemo(
    () => createOpacityScale(rows.map((row) => row.totalUsage)),
    [rows]
  );

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
      accessorFn: (_row, index) => index + 1,
      enableSorting: true,
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
            style={{
              backgroundColor: hexToRgba(
                getColorForDomain(row.original.domainName),
                opacityScale(row.original.totalUsage)
              ),
            }}
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
      header: "Total Skill Usage",
      accessorKey: "totalUsage",
      meta: { className: "text-right" },
      cell: ({ row }) => (
        <span className="text-gray-900 block text-right">
          {USAGE_FORMATTER.format(row.original.totalUsage)}
        </span>
      ),
    },
    {
      header: "Total Skill Completion",
      accessorKey: "totalSkillCompletion",
      sortingFn: (rowA, rowB) => {
        const a = getTotalSkillCompletionValue(rowA.original);
        const b = getTotalSkillCompletionValue(rowB.original);
        return a === b ? 0 : a > b ? 1 : -1;
      },
      meta: { className: "text-right" },
      cell: ({ row }) => {
        const value = getTotalSkillCompletionValue(row.original);
        const color = getColorForDomain(row.original.domainName);
        return (
          <div className="flex items-center justify-end gap-3">
            <div className="h-2 w-[140px] rounded-full" style={{ backgroundColor: hexToRgba(color, 0.2) }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${value}%`, backgroundColor: color }}
                aria-hidden
              />
            </div>
            <span className="text-sm font-medium text-gray-900">
              {value}/100
            </span>
          </div>
        );
      },
    },
    {
      header: "Contributors",
      accessorKey: "contributors",
      meta: { className: "text-right" },
      cell: ({ row }) => (
        <span className="text-gray-900 block text-right">
          {USAGE_FORMATTER.format(row.original.contributors)} people
        </span>
      ),
    },
  ], [toggleVisibility, visibleDomains]);

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
        {FILTER_TABS.map((tab) => (
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
                  <TableHead
                    key={header.id}
                    className={`text-foreground font-medium ${
                      (header.column.columnDef.meta as { className?: string })?.className ?? ""
                    }`}
                  >
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-left"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() === "asc" ? (
                          <ArrowUp className="size-3.5 text-muted-foreground" aria-hidden />
                        ) : header.column.getIsSorted() === "desc" ? (
                          <ArrowDown className="size-3.5 text-muted-foreground" aria-hidden />
                        ) : (
                          <ArrowUpDown className="size-3.5 text-muted-foreground opacity-60" aria-hidden />
                        )}
                      </button>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
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
                              {(["team", "usage", "progress"] as const).map((key) => {
                                const sortState = detailSorting[row.id];
                                const isSorted = sortState?.key === key;
                                const label = key === "team" ? "Team" : key === "usage" ? "Skill Usage" : "Skill Completion";
                                return (
                                  <TableHead key={key} className="w-1/3">
                                    <button
                                      type="button"
                                      className="inline-flex items-center gap-1 text-left"
                                      onClick={() =>
                                        setDetailSorting((prev) => {
                                          const current = prev[row.id];
                                          if (current?.key === key) {
                                            return {
                                              ...prev,
                                              [row.id]: { key, dir: current.dir === "asc" ? "desc" : "asc" },
                                            };
                                          }
                                          return { ...prev, [row.id]: { key, dir: "asc" } };
                                        })
                                      }
                                    >
                                      {label}
                                      {isSorted ? (
                                        sortState?.dir === "asc" ? (
                                          <ArrowUp className="size-3.5 text-muted-foreground" aria-hidden />
                                        ) : (
                                          <ArrowDown className="size-3.5 text-muted-foreground" aria-hidden />
                                        )
                                      ) : (
                                        <ArrowUpDown className="size-3.5 text-muted-foreground opacity-60" aria-hidden />
                                      )}
                                    </button>
                                  </TableHead>
                                );
                              })}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {(() => {
                              const sortState = detailSorting[row.id];
                              const sortedDetails = [...(row.original.details ?? [])].sort((a, b) => {
                                if (!sortState) return 0;
                                const { key, dir } = sortState;
                                const aVal = a[key];
                                const bVal = b[key];
                                if (aVal === bVal) return 0;
                                const order = aVal > bVal ? 1 : -1;
                                return dir === "asc" ? order : -order;
                              });

                              return sortedDetails.map((detail, index) => (
                              <TableRow key={`${detail.team}-${index}`} className="border-0 hover:bg-gray-50/70">
                                <TableCell className="font-medium text-gray-900 w-1/3">
                                  <div className="flex items-center gap-2">
                                    <TeamAvatar teamName={detail.team} className="size-4" />
                                    <span>{detail.team}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-gray-700 w-1/3">{detail.usage}</TableCell>
                                <TableCell className="w-1/3">
                                  <SkillgraphProgressBar value={detail.progress} />
                                </TableCell>
                              </TableRow>
                              ));
                            })()}
                            {!row.original.details?.length ? (
                              <TableRow className="border-0 hover:bg-transparent">
                                <TableCell colSpan={3} className="h-14 text-center text-sm text-gray-500">
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
