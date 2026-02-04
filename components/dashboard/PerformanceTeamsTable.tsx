"use client";

import { useCallback, type CSSProperties } from "react";
import { ArrowRight, TrendingUp, TrendingDown } from "lucide-react";
import type { TeamPerformanceRow, PerformanceTableFilter } from "@/lib/orgDashboard/types";
import { DASHBOARD_COLORS, DASHBOARD_TEXT_CLASSES } from "@/lib/orgDashboard/colors";
import { hexToRgba } from "@/lib/orgDashboard/tableUtils";
import { PERFORMANCE_ZONES } from "@/lib/orgDashboard/orgPerformanceChartData";
import { BaseTeamsTable, type BaseTeamsTableColumn } from "./BaseTeamsTable";
import { SegmentBar } from "./SegmentBar";
import { VisibilityToggleButton } from "./VisibilityToggleButton";

const PERFORMANCE_DISTRIBUTION_SEGMENTS: {
  getCount: (d: TeamPerformanceRow["typeDistribution"]) => number;
  style: CSSProperties;
}[] = [
  {
    getCount: (d) => d.star ?? 0,
    style: { backgroundColor: PERFORMANCE_ZONES.excellent.color, color: DASHBOARD_COLORS.excellent },
  },
  {
    getCount: (d) => d.legacy ?? 0,
    style: { backgroundColor: PERFORMANCE_ZONES.aboveAvg.color, color: DASHBOARD_COLORS.excellent },
  },
  {
    getCount: (d) => d.bottleneck ?? 0,
    style: { backgroundColor: hexToRgba("#2563eb", 0.25), color: "#2563eb" },
  },
  {
    getCount: (d) => (d.keyRole ?? 0) + (d.risky ?? 0),
    style: { backgroundColor: PERFORMANCE_ZONES.belowAvg.color, color: DASHBOARD_COLORS.danger },
  },
  {
    getCount: (d) => d.timeBomb ?? 0,
    style: { backgroundColor: PERFORMANCE_ZONES.concerning.color, color: DASHBOARD_COLORS.danger },
  },
];

const PERFORMANCE_FILTER_TABS: { key: PerformanceTableFilter; label: string }[] = [
  { key: "mostProductive", label: "Most Productive" },
  { key: "leastProductive", label: "Least Productive" },
  { key: "mostImproved", label: "Most Improved" },
  { key: "mostRegressed", label: "Most Regressed" },
];

function getTrendIconForCount(counts: number[], index: number) {
  const total = counts.reduce((sum, value) => sum + value, 0);
  const average = counts.length ? total / counts.length : 0;
  const value = counts[index] ?? 0;
  if (value > average) return TrendingUp;
  if (value < average) return TrendingDown;
  return ArrowRight;
}

function performanceSortFunction(rows: TeamPerformanceRow[], currentFilter: PerformanceTableFilter): TeamPerformanceRow[] {
  const copy = [...rows];
  if (currentFilter === "leastProductive") return copy.sort((a, b) => a.performanceValue - b.performanceValue);
  if (currentFilter === "mostProductive") return copy.sort((a, b) => b.performanceValue - a.performanceValue);
  const pts = (r: TeamPerformanceRow) => r.changePts ?? 0;
  if (currentFilter === "mostImproved") return copy.sort((a, b) => pts(b) - pts(a));
  if (currentFilter === "mostRegressed") return copy.sort((a, b) => pts(a) - pts(b));
  return copy;
}

/**
 * Create columns with visibility toggle support.
 * The toggle handler is injected via a factory function to maintain proper typing.
 */
function createPerformanceColumns(
  visibleTeams?: Record<string, boolean>,
  onVisibilityToggle?: (teamName: string) => void
): BaseTeamsTableColumn<TeamPerformanceRow, PerformanceTableFilter>[] {
  const columns: BaseTeamsTableColumn<TeamPerformanceRow, PerformanceTableFilter>[] = [];

  // Add visibility toggle column if handlers are provided
  if (visibleTeams && onVisibilityToggle) {
    columns.push({
      key: "visibility",
      header: "",
      className: "w-14",
      render: (row) => (
        <VisibilityToggleButton
          isVisible={visibleTeams[row.teamName] !== false}
          onToggle={() => onVisibilityToggle(row.teamName)}
          label={visibleTeams[row.teamName] !== false ? "Hide team from chart" : "Show team in chart"}
        />
      ),
    });
  }

  // Add standard columns
  columns.push(
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
      key: "change",
      header: "Change",
      className: "text-left",
      render: (row) => {
        const TrendIcon = row.trend === "up" ? TrendingUp : row.trend === "down" ? TrendingDown : ArrowRight;
        const changePts = row.changePts ?? 0;
        const changeLabel = changePts > 0 ? `${changePts} pts` : changePts < 0 ? `${Math.abs(changePts)} pts` : "0 pts";
        const changeColor =
          changePts > 0
            ? DASHBOARD_COLORS.excellent
            : changePts < 0
              ? DASHBOARD_COLORS.danger
              : "#737373";
        return (
          <div className="flex items-center justify-start">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium"
              style={{ backgroundColor: hexToRgba(changeColor, 0.25), color: changeColor }}
            >
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
      render: (row) => {
        const counts = PERFORMANCE_DISTRIBUTION_SEGMENTS.map((s) => s.getCount(row.typeDistribution));
        return (
          <SegmentBar
            segments={PERFORMANCE_DISTRIBUTION_SEGMENTS.map((s, index) => ({
              style: s.style,
              icon: getTrendIconForCount(counts, index),
            }))}
            counts={counts}
            alignment="end"
            showCounts
          />
        );
      },
    }
  );

  return columns;
}


type PerformanceTeamsTableProps = {
  rows: TeamPerformanceRow[];
  activeFilter?: PerformanceTableFilter;
  onFilterChange?: (filter: PerformanceTableFilter) => void;
  /** Optional visibility state for teams. When provided, shows visibility toggle icons. */
  visibleTeams?: Record<string, boolean>;
  /** Optional visibility change handler. Required when visibleTeams is provided. */
  onVisibilityChange?: (teamName: string, visible: boolean) => void;
};

export function PerformanceTeamsTable({
  rows,
  activeFilter = "mostProductive",
  onFilterChange,
  visibleTeams,
  onVisibilityChange,
}: PerformanceTeamsTableProps) {
  const handleToggle = useCallback(
    (teamName: string) => {
      if (!visibleTeams || !onVisibilityChange) return;
      const currentlyVisible = visibleTeams[teamName] !== false;
      onVisibilityChange(teamName, !currentlyVisible);
    },
    [visibleTeams, onVisibilityChange]
  );

  const columns = createPerformanceColumns(
    visibleTeams,
    visibleTeams && onVisibilityChange ? handleToggle : undefined
  );

  return (
    <BaseTeamsTable<TeamPerformanceRow, PerformanceTableFilter>
      rows={rows}
      filterTabs={PERFORMANCE_FILTER_TABS}
      activeFilter={activeFilter}
      onFilterChange={onFilterChange}
      defaultFilter="mostProductive"
      sortFunction={performanceSortFunction}
      columns={columns}
      getRowKey={(row) => row.teamName}
    />
  );
}
