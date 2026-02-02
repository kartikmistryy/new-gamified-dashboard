"use client";

import { ArrowRight, TrendingUp, TrendingDown } from "lucide-react";
import type { TeamPerformanceRow, PerformanceTableFilter } from "@/lib/orgDashboard/types";
import { DASHBOARD_BG_CLASSES, DASHBOARD_CHANGE_CLASSES, DASHBOARD_TEXT_CLASSES } from "@/lib/orgDashboard/colors";
import { BaseTeamsTable, type BaseTeamsTableColumn } from "./BaseTeamsTable";
import { SegmentBar } from "./SegmentBar";

const PERFORMANCE_DISTRIBUTION_SEGMENTS: { getCount: (d: TeamPerformanceRow["typeDistribution"]) => number; bg: string }[] = [
  { getCount: (d) => d.timeBomb ?? 0, bg: DASHBOARD_BG_CLASSES.danger90 },
  { getCount: (d) => (d.keyRole ?? 0) + (d.risky ?? 0), bg: DASHBOARD_BG_CLASSES.danger60 },
  { getCount: (d) => d.bottleneck ?? 0, bg: DASHBOARD_BG_CLASSES.blue60 },
  { getCount: (d) => d.legacy ?? 0, bg: DASHBOARD_BG_CLASSES.excellent60 },
  { getCount: (d) => d.star ?? 0, bg: DASHBOARD_BG_CLASSES.excellent90 },
];

const PERFORMANCE_FILTER_TABS: { key: PerformanceTableFilter; label: string }[] = [
  { key: "mostProductive", label: "Most Productive" },
  { key: "leastProductive", label: "Least Productive" },
  { key: "mostImproved", label: "Most Improved" },
  { key: "mostRegressed", label: "Most Regressed" },
];

function performanceSortFunction(rows: TeamPerformanceRow[], currentFilter: PerformanceTableFilter): TeamPerformanceRow[] {
  const copy = [...rows];
  if (currentFilter === "leastProductive") return copy.sort((a, b) => a.performanceValue - b.performanceValue);
  if (currentFilter === "mostProductive") return copy.sort((a, b) => b.performanceValue - a.performanceValue);
  const pts = (r: TeamPerformanceRow) => r.changePts ?? 0;
  if (currentFilter === "mostImproved") return copy.sort((a, b) => pts(b) - pts(a));
  if (currentFilter === "mostRegressed") return copy.sort((a, b) => pts(a) - pts(b));
  return copy;
}

const PERF_COLUMNS: BaseTeamsTableColumn<TeamPerformanceRow, PerformanceTableFilter>[] = [
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
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium text-white ${row.performanceBarColor}`}>
            {row.performanceLabel}
            <span className="flex flex-row gap-1 pl-2 border-l border-white/50">
              {row.performanceValue}
              <TrendIcon className="size-4 text-white shrink-0" aria-hidden />
            </span>
          </span>
        </div>
      );
    },
  },
  {
    key: "change",
    header: "Change",
    className: "text-right",
    render: (row) => {
      const TrendIcon = row.trend === "up" ? TrendingUp : row.trend === "down" ? TrendingDown : ArrowRight;
      const changePts = row.changePts ?? 0;
      const changeLabel = changePts > 0 ? `${changePts} pts` : changePts < 0 ? `${Math.abs(changePts)} pts` : "0 pts";
      const changeBadgeClass =
        changePts > 0
          ? `${DASHBOARD_CHANGE_CLASSES.successBg} ${DASHBOARD_CHANGE_CLASSES.successText}`
          : changePts < 0
            ? `${DASHBOARD_CHANGE_CLASSES.dangerBg} ${DASHBOARD_CHANGE_CLASSES.dangerText}`
            : `${DASHBOARD_CHANGE_CLASSES.neutralBg} ${DASHBOARD_CHANGE_CLASSES.neutralText}`;
      return (
        <div className="flex items-center justify-start">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium ${changeBadgeClass}`}>
            <TrendIcon className="size-4 shrink-0" aria-hidden />
            {changeLabel}
          </span>
        </div>
      );
    },
  },
  {
    key: "distribution",
    header: "Performance Distribution",
    className: "text-right",
    render: (row) => (
      <SegmentBar
        segments={PERFORMANCE_DISTRIBUTION_SEGMENTS.map((s) => ({ bg: s.bg }))}
        counts={PERFORMANCE_DISTRIBUTION_SEGMENTS.map((s) => s.getCount(row.typeDistribution))}
        alignment="end"
      />
    ),
  },
];

type PerformanceTeamsTableProps = {
  rows: TeamPerformanceRow[];
  activeFilter?: PerformanceTableFilter;
  onFilterChange?: (filter: PerformanceTableFilter) => void;
};

export function PerformanceTeamsTable({
  rows,
  activeFilter = "mostProductive",
  onFilterChange,
}: PerformanceTeamsTableProps) {
  return (
    <BaseTeamsTable<TeamPerformanceRow, PerformanceTableFilter>
      rows={rows}
      filterTabs={PERFORMANCE_FILTER_TABS}
      activeFilter={activeFilter}
      onFilterChange={onFilterChange}
      defaultFilter="mostProductive"
      sortFunction={performanceSortFunction}
      columns={PERF_COLUMNS}
      getRowKey={(row) => row.teamName}
    />
  );
}
