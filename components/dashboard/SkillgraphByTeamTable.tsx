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
import type { SkillgraphTeamRow, SkillgraphTableFilter } from "@/lib/orgDashboard/types";
import { DASHBOARD_TEXT_CLASSES } from "@/lib/orgDashboard/colors";
import { DomainDistributionBar } from "./DomainDistributionBar";
import { VisibilityToggleButton } from "./VisibilityToggleButton";
import { getColorForDomain } from "@/components/skillmap/skillGraphUtils";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "../shared/Badge";
import { TeamAvatar } from "../shared/TeamAvatar";
import { SkillgraphProgressBar } from "./SkillgraphProgressBar";

const USAGE_FORMATTER = new Intl.NumberFormat("en-US");

const FILTER_TABS: { key: SkillgraphTableFilter; label: string }[] = [
  { key: "mostUsage", label: "Most Usage" },
  { key: "leastUsage", label: "Least Usage" },
  { key: "mostPercentOfChart", label: "Highest % of Chart" },
  { key: "leastPercentOfChart", label: "Lowest % of Chart" },
];

function getTeamSkillUsageValue(row: SkillgraphTeamRow) {
  if (row.domainDistribution?.length) {
    return row.domainDistribution.reduce((sum, item) => sum + item.value, 0);
  }
  return row.skillCount;
}

function getSortingForFilter(filter: SkillgraphTableFilter): SortingState {
  if (filter === "mostUsage") return [{ id: "totalSkillUsage", desc: true }];
  if (filter === "leastUsage") return [{ id: "totalSkillUsage", desc: false }];
  if (filter === "mostPercentOfChart") return [{ id: "percentOfChart", desc: true }];
  if (filter === "leastPercentOfChart") return [{ id: "percentOfChart", desc: false }];
  return [{ id: "totalSkillUsage", desc: true }];
}

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

  const visibleTeams = externalVisibleTeams ?? internalVisible;

  const toggleVisibility = useCallback((teamName: string) => {
    if (onVisibilityChange) {
      onVisibilityChange(teamName, visibleTeams[teamName] === false);
    } else {
      setInternalVisible((prev) => ({ ...prev, [teamName]: !prev[teamName] }));
    }
  }, [visibleTeams, onVisibilityChange]);

  const [internalFilter, setInternalFilter] = useState<SkillgraphTableFilter>(activeFilter);
  const currentFilter = onFilterChange ? activeFilter : internalFilter;
  const [sorting, setSorting] = useState<SortingState>(() => getSortingForFilter(currentFilter));
  const [detailSorting, setDetailSorting] = useState<Record<string, { key: "domain" | "skill" | "usage" | "progress"; dir: "asc" | "desc" }>>({});

  const totalUsageSum = useMemo(
    () => rows.reduce((sum, row) => sum + getTeamSkillUsageValue(row), 0),
    [rows],
  );

  const columns = useMemo<ColumnDef<SkillgraphTeamRow>[]>(() => [
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
              ? `Collapse details for ${row.original.teamName}`
              : `Expand details for ${row.original.teamName}`
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
          isVisible={visibleTeams[row.original.teamName] !== false}
          onToggle={() => toggleVisibility(row.original.teamName)}
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
      header: "Team",
      accessorKey: "teamName",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <TeamAvatar teamName={row.original.teamName} className="size-4" />
          <p className="font-medium text-gray-900">{row.original.teamName}</p>
        </div>
      ),
    },
    // {
    //   header: "Domain",
    //   accessorKey: "domainCount",
    //   cell: ({ row }) => <span className="text-gray-900">{row.original.domainCount}</span>,
    // },
    {
      header: "Total Skill Usage",
      id: "totalSkillUsage",
      accessorFn: (row) => getTeamSkillUsageValue(row),
      meta: { className: "text-right" },
      cell: ({ row }) => (
        <span className="text-gray-900 block text-right">
          {USAGE_FORMATTER.format(getTeamSkillUsageValue(row.original))}
        </span>
      ),
    },
    {
      id: "percentOfChart",
      header: "% of chart",
      accessorFn: (row) => {
        if (!totalUsageSum) return 0;
        return (getTeamSkillUsageValue(row) / totalUsageSum) * 100;
      },
      meta: { className: "text-right" },
      cell: ({ row }) => {
        const usageShare = totalUsageSum
          ? (getTeamSkillUsageValue(row.original) / totalUsageSum) * 100
          : 0;
        const percentText = `${Math.round(usageShare)}%`;
        return <span className="text-gray-900 block text-right">{percentText}</span>;
      },
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
  ], [toggleVisibility, visibleTeams, totalUsageSum]);

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
                              {(["domain", "skill", "usage", "progress"] as const).map((key) => {
                                const sortState = detailSorting[row.id];
                                const isSorted = sortState?.key === key;
                                const label = key === "domain"
                                  ? "Domain"
                                  : key === "skill"
                                    ? "Skill"
                                    : key === "usage"
                                      ? "Skill Usage"
                                      : "Skill Completion";
                                return (
                                  <TableHead key={key} className="w-1/4">
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
                              <TableRow key={`${detail.skill}-${index}`} className="border-0 hover:bg-gray-50/70">
                                <TableCell className="text-gray-700 w-1/4">{detail.domain}</TableCell>
                                <TableCell className="font-medium text-gray-900 w-1/4">
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="size-3.5 rounded-sm shrink-0"
                                      style={{ backgroundColor: getColorForDomain(detail.domain) }}
                                      aria-hidden
                                    />
                                    <span>{detail.skill}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-gray-700 w-1/4">{detail.usage}</TableCell>
                                <TableCell className="w-1/4">
                                  <SkillgraphProgressBar value={detail.progress} />
                                </TableCell>
                              </TableRow>
                              ));
                            })()}
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
