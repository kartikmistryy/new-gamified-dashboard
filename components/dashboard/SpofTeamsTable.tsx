"use client";
"use no memo";

import * as React from "react";
import { useMemo, useState } from "react";
import { ArrowRight, TrendingDown, TrendingUp } from "lucide-react";
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
import { Badge } from "../shared/Badge";
import { DASHBOARD_TEXT_CLASSES } from "@/lib/orgDashboard/colors";
import { hexToRgba } from "@/lib/orgDashboard/tableUtils";
import { VisibilityToggleButton } from "./VisibilityToggleButton";
import { SortableTableHeader } from "./SortableTableHeader";
import type { SpofTeamRow } from "@/lib/orgDashboard/spofMockData";
import { createChartTooltip, type D3TooltipController } from "@/lib/chartTooltip";
import { REPO_HEALTH_SEGMENTS } from "./RepoHealthBar";
import { TeamAvatar } from "../shared/TeamAvatar";

type SpofTableFilter = "highestRisk" | "lowestRisk" | "mostMembers" | "leastMembers";

const SPOF_FILTER_TABS: { key: SpofTableFilter; label: string }[] = [
  { key: "lowestRisk", label: "Most Optimal" },
  { key: "highestRisk", label: "Most Risky" },
  { key: "mostMembers", label: "Healthiest" },
  { key: "leastMembers", label: "Most Critical" },
];

function getTrendIconForCount(counts: number[], index: number) {
  const total = counts.reduce((sum, value) => sum + value, 0);
  const average = counts.length ? total / counts.length : 0;
  const value = counts[index] ?? 0;
  if (value > average) return TrendingUp;
  if (value < average) return TrendingDown;
  return ArrowRight;
}

function sortSpofTeams(rows: SpofTeamRow[], filter: SpofTableFilter): SpofTeamRow[] {
  const copy = [...rows];
  switch (filter) {
    case "highestRisk":
      return copy.sort((a, b) => b.avgSpofScore - a.avgSpofScore);
    case "lowestRisk":
      return copy.sort((a, b) => a.avgSpofScore - b.avgSpofScore);
    case "mostMembers":
      return copy.sort((a, b) => b.memberCount - a.memberCount);
    case "leastMembers":
      return copy.sort((a, b) => a.memberCount - b.memberCount);
    default:
      return copy;
  }
}

type SpofTeamsTableProps = {
  rows: SpofTeamRow[];
  visibleTeams: Record<string, boolean>;
  onVisibilityChange: (teamName: string, visible: boolean) => void;
};

const SPOF_OWNER_SEGMENTS = [
  { key: "low", label: "Low", color: "#10b981" },
  { key: "medium", label: "Medium", color: "#3b82f6" },
  { key: "high", label: "High", color: "#f97316" },
];

function JoinedDistributionBar({
  segments,
  valueLabel,
}: {
  segments: { label: string; value: number; color: string }[];
  valueLabel: string;
}) {
  const counts = segments.map((segment) => segment.value);
  const total = counts.reduce((sum, value) => sum + value, 0);
  const tooltipId = React.useId().replace(/:/g, "");
  const tooltipRef = React.useRef<D3TooltipController | null>(null);

  React.useEffect(() => {
    tooltipRef.current = createChartTooltip(`joined-distribution-tooltip-${tooltipId}`);
    return () => tooltipRef.current?.destroy();
  }, [tooltipId]);

  return (
    <div className="flex h-6 w-full overflow-hidden rounded-full bg-gray-100">
      {segments.map((segment, index) => {
        const TrendIcon = getTrendIconForCount(counts, index);
        return (
          <div
            key={segment.label}
            className="flex items-center justify-center gap-1 text-xs font-semibold"
            style={{
              flex: total > 0 ? `${segment.value} 1 0` : "1 1 0",
              minWidth: 40,
              backgroundColor: hexToRgba(segment.color, 0.25),
              color: segment.color,
            }}
            onMouseEnter={(event) => {
              const tooltip = tooltipRef.current;
              if (!tooltip) return;
              tooltip.show(
                `<div style="font-weight:600; color:#0f172a;">${segment.label}</div>` +
                  `<div style="color:#6b7280;">${valueLabel}: ${segment.value}</div>`,
                event.clientX + 12,
                event.clientY + 12
              );
            }}
            onMouseMove={(event) => {
              tooltipRef.current?.move(event.clientX + 12, event.clientY + 12);
            }}
            onMouseLeave={() => tooltipRef.current?.hide()}
          >
            <TrendIcon className="size-3.5 shrink-0 text-current" aria-hidden />
            {segment.value}
          </div>
        );
      })}
    </div>
  );
}

export function SpofTeamsTable({
  rows,
  visibleTeams,
  onVisibilityChange,
}: SpofTeamsTableProps) {
  const [currentFilter, setCurrentFilter] = useState<SpofTableFilter>("highestRisk");
  const [sorting, setSorting] = useState<SortingState>([]);

  const sortedRows = useMemo(
    () => sortSpofTeams(rows, currentFilter),
    [rows, currentFilter]
  );

  const handleToggle = React.useCallback(
    (teamName: string) => {
      const currentlyVisible = visibleTeams[teamName] !== false;
      onVisibilityChange(teamName, !currentlyVisible);
    },
    [visibleTeams, onVisibilityChange]
  );

  const columns = useMemo<ColumnDef<SpofTeamRow, any>[]>(() => [
    {
      id: "visibility",
      header: "",
      cell: ({ row }) => (
        <VisibilityToggleButton
          isVisible={visibleTeams[row.original.teamName] !== false}
          onToggle={() => handleToggle(row.original.teamName)}
          label={visibleTeams[row.original.teamName] !== false ? "Hide team from chart" : "Show team in chart"}
        />
      ),
      enableSorting: false,
      meta: { className: "w-14" },
    },
    {
      id: "rank",
      header: "Rank",
      cell: ({ row }) => {
        const displayRank = row.index + 1;
        return (
          <span
            className={
              displayRank <= 3
                ? "text-foreground font-bold"
                : DASHBOARD_TEXT_CLASSES.rankMuted
            }
          >
            {displayRank}
          </span>
        );
      },
      enableSorting: false,
      meta: { className: "w-14" },
    },
    {
      id: "team",
      header: "Team",
      accessorFn: (row) => row.teamName,
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <TeamAvatar teamName={row.original.teamName} className="size-4" />
          <p className="font-medium text-gray-900">{row.original.teamName}</p>
        </div>
      ),
    },
    {
      id: "spofOwnerDistribution",
      header: "SPOF Owner Distribution",
      accessorFn: (row) => row.avgSpofScore,
      cell: ({ row }) => {
        const mediumCount = Math.max(0, row.original.memberCount - row.original.highRiskCount - row.original.lowRiskCount);
        const ownerSegments = [
          { label: SPOF_OWNER_SEGMENTS[0].label, value: row.original.lowRiskCount, color: SPOF_OWNER_SEGMENTS[0].color },
          { label: SPOF_OWNER_SEGMENTS[1].label, value: mediumCount, color: SPOF_OWNER_SEGMENTS[1].color },
          { label: SPOF_OWNER_SEGMENTS[2].label, value: row.original.highRiskCount, color: SPOF_OWNER_SEGMENTS[2].color },
        ];
        return <JoinedDistributionBar segments={ownerSegments} valueLabel="Owners" />;
      },
      meta: { className: "min-w-[260px]" },
    },
    {
      id: "repoHealthDistribution",
      header: "Repository Health Distribution",
      accessorFn: (row) => row.repoHealthCriticalCount, // Sort by critical count
      cell: ({ row }) => {
        const repoHealthSegments = [
          {
            label: REPO_HEALTH_SEGMENTS[0].label,
            value: row.original.repoHealthHealthyCount,
            color: REPO_HEALTH_SEGMENTS[0].color,
          },
          {
            label: REPO_HEALTH_SEGMENTS[1].label,
            value: row.original.repoHealthNeedsAttentionCount,
            color: REPO_HEALTH_SEGMENTS[1].color,
          },
          {
            label: REPO_HEALTH_SEGMENTS[2].label,
            value: row.original.repoHealthCriticalCount,
            color: REPO_HEALTH_SEGMENTS[2].color,
          },
        ];
        return <JoinedDistributionBar segments={repoHealthSegments} valueLabel="Repos" />;
      },
      meta: { className: "min-w-[280px]" },
    },
  ], [visibleTeams, handleToggle]);

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
              <TableRow
                key={row.original.teamName}
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
