"use client";

import { ArrowRight, TrendingUp, TrendingDown, Star, Bomb, Puzzle, FlaskConical, BrickWall, AlertTriangle } from "lucide-react";
import type { TeamPerformanceRow, TeamTableFilter } from "@/lib/orgDashboard/types";
import { DASHBOARD_BG_CLASSES, DASHBOARD_TEXT_CLASSES } from "@/lib/orgDashboard/colors";
import { BaseTeamsTable, type BaseTeamsTableColumn } from "./BaseTeamsTable";
import { SegmentBar } from "./SegmentBar";

const TEAM_FILTER_TABS: { key: TeamTableFilter; label: string }[] = [
  { key: "mostProductive", label: "Most Productive" },
  { key: "leastProductive", label: "Least Productive" },
  { key: "mostOptimal", label: "Most Optimal" },
  { key: "mostRisky", label: "Most Risky" },
];

const TYPE_DISTRIBUTION_SEGMENTS = [
  { key: "star" as const, bg: DASHBOARD_BG_CLASSES.excellent, icon: Star },
  { key: "timeBomb" as const, bg: DASHBOARD_BG_CLASSES.danger, icon: Bomb },
  { key: "keyRole" as const, bg: DASHBOARD_BG_CLASSES.warning, icon: Puzzle },
  { key: "risky" as const, bg: DASHBOARD_BG_CLASSES.warning, icon: FlaskConical, borderClass: "border-l border-black/20" },
  { key: "bottleneck" as const, bg: DASHBOARD_BG_CLASSES.caution, icon: AlertTriangle },
  { key: "legacy" as const, bg: DASHBOARD_BG_CLASSES.stable, icon: BrickWall },
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
    render: (row) => (
      <div className="flex items-center gap-3">
        <div className={`size-4 rounded shrink-0 ${row.teamColor}`} aria-hidden />
        <p className="font-medium text-gray-900">{row.teamName}</p>
      </div>
    ),
  },
  {
    key: "performance",
    header: "Real Productivity",
    className: "text-right",
    render: (row) => {
      const TrendIcon = row.trend === "up" ? TrendingUp : row.trend === "down" ? TrendingDown : ArrowRight;
      return (
        <div className="flex items-center justify-end gap-2">
          <span className={`inline-flex items-center gap-1.5 px-3 rounded-lg text-xs font-medium text-white ${row.performanceBarColor}`}>
            {row.performanceLabel}
            <span className="flex flex-row items-center justify-between gap-1 pl-2 py-1 border-l border-black/20 w-12">
              {row.performanceValue}
              <TrendIcon className="size-4 text-white shrink-0" aria-hidden />
            </span>
          </span>
        </div>
      );
    },
  },
  {
    key: "status",
    header: "Status",
    className: "text-right",
    render: (row) => (
      <SegmentBar
        segments={TYPE_DISTRIBUTION_SEGMENTS}
        counts={TYPE_DISTRIBUTION_SEGMENTS.map((s) => row.typeDistribution[s.key] ?? 0)}
        alignment="end"
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
