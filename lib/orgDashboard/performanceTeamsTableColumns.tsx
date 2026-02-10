/** Performance Teams Table Column Definitions */

import { TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import type { TeamPerformanceRow, PerformanceTableFilter } from "./types";
import { DASHBOARD_COLORS, DASHBOARD_TEXT_CLASSES } from "./colors";
import { hexToRgba } from "./tableUtils";
import type { BaseTeamsTableColumn } from "@/components/dashboard/shared/BaseTeamsTable";
import { SegmentBar } from "@/components/dashboard/shared/SegmentBar";
import { VisibilityToggleButton } from "@/components/dashboard/shared/VisibilityToggleButton";
import { TeamAvatar } from "@/components/shared/TeamAvatar";
import { PERFORMANCE_DISTRIBUTION_SEGMENTS, getTrendIconForCount } from "./performanceTeamsTableConfig";

/** Create performance table columns with optional visibility toggle */
export function createPerformanceColumns(
  visibleTeams?: Record<string, boolean>,
  onVisibilityToggle?: (teamName: string) => void
): BaseTeamsTableColumn<TeamPerformanceRow, PerformanceTableFilter>[] {
  const columns: BaseTeamsTableColumn<TeamPerformanceRow, PerformanceTableFilter>[] = [];

  if (visibleTeams && onVisibilityToggle) {
    columns.push({
      key: "visibility",
      header: "",
      className: "w-14",
      enableSorting: false,
      render: (row) => (
        <VisibilityToggleButton
          isVisible={visibleTeams[row.teamName] !== false}
          onToggle={() => onVisibilityToggle(row.teamName)}
          label={visibleTeams[row.teamName] !== false ? "Hide team from chart" : "Show team in chart"}
        />
      ),
    });
  }

  columns.push(
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
      enableSorting: false,
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
      enableSorting: true,
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
      key: "change",
      header: "Change",
      enableSorting: true,
      accessorFn: (row) => row.changePts ?? 0,
      render: (row) => {
        const TrendIcon = row.trend === "up" ? TrendingUp : row.trend === "down" ? TrendingDown : ArrowRight;
        const changePts = row.changePts ?? 0;
        const changeLabel = changePts > 0 ? `${changePts} pts` : changePts < 0 ? `${Math.abs(changePts)} pts` : "0 pts";
        const changeColor =
          changePts > 0 ? DASHBOARD_COLORS.excellent : changePts < 0 ? DASHBOARD_COLORS.danger : "#737373";
        return (
          <div className="flex items-center">
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
      header: "Performance Breakdown",
      enableSorting: false,
      render: (row) => {
        const counts = PERFORMANCE_DISTRIBUTION_SEGMENTS.map((s) => s.getCount(row.typeDistribution));
        return (
          <SegmentBar
            segments={PERFORMANCE_DISTRIBUTION_SEGMENTS.map((s, index) => ({
              label: s.label,
              style: s.style,
              icon: getTrendIconForCount(counts, index),
            }))}
            counts={counts}
            alignment="start"
            showCounts
          />
        );
      },
    }
  );

  return columns;
}
