"use client";

import { ArrowRight, TrendingUp, TrendingDown, Star, Bomb, Puzzle, FlaskConical, BrickWall, AlertTriangle } from "lucide-react";
import type { TeamPerformanceRow, TeamTableFilter } from "@/lib/dashboard/entities/team/types";
import { DASHBOARD_COLORS, DASHBOARD_TEXT_CLASSES } from "@/lib/dashboard/shared/utils/colors";
import { hexToRgba } from "@/lib/dashboard/entities/team/utils/tableUtils";
import { BaseTeamsTable, type BaseTeamsTableColumn } from "@/components/dashboard/shared/BaseTeamsTable";
import { SegmentBar } from "@/components/dashboard/shared/SegmentBar";
import { TeamAvatar } from "@/components/shared/TeamAvatar";

const TEAM_FILTER_TABS: { key: TeamTableFilter; label: string }[] = [
  { key: "mostProductive", label: "Most Productive" },
  { key: "leastProductive", label: "Least Productive" },
  { key: "mostOptimal", label: "Most Optimal" },
  { key: "mostRisky", label: "Most Risky" },
];

const TYPE_DISTRIBUTION_SEGMENTS = [
  { key: "star" as const, label: "Star", icon: Star, style: { backgroundColor: hexToRgba(DASHBOARD_COLORS.excellent, 0.25), color: DASHBOARD_COLORS.excellent } },
  { key: "timeBomb" as const, label: "Time Bomb", icon: Bomb, style: { backgroundColor: hexToRgba(DASHBOARD_COLORS.danger, 0.25), color: DASHBOARD_COLORS.danger } },
  { key: "keyRole" as const, label: "Key Role", icon: Puzzle, style: { backgroundColor: hexToRgba(DASHBOARD_COLORS.warning, 0.25), color: DASHBOARD_COLORS.warning } },
  { key: "risky" as const, label: "Risky", icon: FlaskConical, borderClass: "border-l border-black/20", style: { backgroundColor: hexToRgba(DASHBOARD_COLORS.warning, 0.25), color: DASHBOARD_COLORS.warning } },
  { key: "bottleneck" as const, label: "Bottleneck", icon: AlertTriangle, style: { backgroundColor: hexToRgba(DASHBOARD_COLORS.caution, 0.25), color: DASHBOARD_COLORS.caution } },
  { key: "legacy" as const, label: "Legacy", icon: BrickWall, style: { backgroundColor: hexToRgba(DASHBOARD_COLORS.stable, 0.25), color: DASHBOARD_COLORS.stable } },
];

function teamSortFunction(rows: TeamPerformanceRow[], currentFilter: TeamTableFilter): TeamPerformanceRow[] {
  const copy = [...rows];
  if (currentFilter === "leastProductive") return copy.sort((a, b) => a.performanceValue - b.performanceValue);
  if (currentFilter === "mostProductive" || currentFilter === "mostOptimal") return copy.sort((a, b) => b.performanceValue - a.performanceValue);
  if (currentFilter === "mostRisky") {
    const riskyScore = (r: TeamPerformanceRow) => (r.typeDistribution.timeBomb ?? 0) + (r.typeDistribution.risky ?? 0);
    return copy.sort((a, b) => riskyScore(b) - riskyScore(a));
  }
  return copy;
}

const TEAM_COLUMNS: BaseTeamsTableColumn<TeamPerformanceRow, TeamTableFilter>[] = [
  {
    key: "rank",
    header: "Rank",
    className: "w-14",
    enableSorting: false,
    render: (_, index) => {
      const displayRank = index + 1;
      return (
        <span className={displayRank <= 3 ? "text-foreground font-bold" : DASHBOARD_TEXT_CLASSES.rankMuted}>
          {displayRank}
        </span>
      );
    },
  },
  {
    key: "team",
    header: "Team",
    accessorFn: (row) => row.teamName,
    render: (row) => (
      <div className="flex items-center gap-3">
        <TeamAvatar teamName={row.teamName} className="size-4" />
        <p className="font-medium text-gray-900">{row.teamName}</p>
      </div>
    ),
  },
  {
    key: "performance",
    header: "Effective Performance",
    accessorFn: (row) => row.performanceValue,
    render: (row) => {
      const TrendIcon = row.trend === "up" ? TrendingUp : row.trend === "down" ? TrendingDown : ArrowRight;
      return (
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 px-3 rounded-lg text-xs font-medium"
            style={{
              backgroundColor: hexToRgba(row.performanceBarColor, 0.25),
              color: row.performanceBarColor,
            }}
          >
            {row.performanceLabel}
            <span className="flex flex-row items-center justify-between gap-1 pl-2 py-1 border-l border-black/20 w-12">
              {row.performanceValue}
              <TrendIcon className="size-4 text-current shrink-0" aria-hidden />
            </span>
          </span>
        </div>
      );
    },
  },
  {
    key: "status",
    header: "Status",
    enableSorting: false,
    render: (row) => (
      <SegmentBar
        segments={TYPE_DISTRIBUTION_SEGMENTS}
        counts={TYPE_DISTRIBUTION_SEGMENTS.map((s) => row.typeDistribution[s.key] ?? 0)}
        alignment="start"
        showCounts
      />
    ),
  },
];

type TeamTableProps = {
  rows: TeamPerformanceRow[];
  activeFilter?: TeamTableFilter;
  onFilterChange?: (filter: TeamTableFilter) => void;
};

export function TeamTable({
  rows,
  activeFilter = "mostProductive",
  onFilterChange,
}: TeamTableProps) {
  return (
    <BaseTeamsTable<TeamPerformanceRow, TeamTableFilter>
      rows={rows}
      filterTabs={TEAM_FILTER_TABS}
      activeFilter={activeFilter}
      onFilterChange={onFilterChange}
      defaultFilter="mostProductive"
      sortFunction={teamSortFunction}
      columns={TEAM_COLUMNS}
      getRowKey={(row) => row.teamName}
    />
  );
}
