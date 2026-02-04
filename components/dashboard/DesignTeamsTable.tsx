"use client";

import { useCallback, useMemo, useState } from "react";
import { ArrowRight, TrendingDown, TrendingUp } from "lucide-react";
import type { DesignTeamRow, DesignTableFilter } from "@/lib/orgDashboard/types";
import { DASHBOARD_TEXT_CLASSES } from "@/lib/orgDashboard/colors";
import { hexToRgba } from "@/lib/orgDashboard/tableUtils";
import { CATEGORY_COLORS } from "@/lib/orgDashboard/chaosMatrixData";
import { BaseTeamsTable, type BaseTeamsTableColumn } from "./BaseTeamsTable";
import { SegmentBar } from "./SegmentBar";
import { VisibilityToggleButton } from "./VisibilityToggleButton";

const OWNERSHIP_SEGMENTS = [
  { style: { backgroundColor: hexToRgba("#22c55e", 0.25), color: "#22c55e" } },
  { style: { backgroundColor: hexToRgba("#4285f4", 0.25), color: "#4285f4" } },
  { style: { backgroundColor: hexToRgba("#ef4444", 0.25), color: "#ef4444" } },
];

const CHAOS_SEGMENTS = [
  {
    style: {
      backgroundColor: hexToRgba(CATEGORY_COLORS["Skilled AI User"], 0.25),
      color: CATEGORY_COLORS["Skilled AI User"],
    },
  },
  {
    style: {
      backgroundColor: hexToRgba(CATEGORY_COLORS["Traditional Developer"], 0.25),
      color: CATEGORY_COLORS["Traditional Developer"],
    },
  },
  {
    style: {
      backgroundColor: hexToRgba(CATEGORY_COLORS["Unskilled AI User"], 0.25),
      color: CATEGORY_COLORS["Unskilled AI User"],
    },
  },
  {
    style: {
      backgroundColor: hexToRgba(CATEGORY_COLORS["Low-Skill Developer"], 0.25),
      color: CATEGORY_COLORS["Low-Skill Developer"],
    },
  },
];

const DESIGN_FILTER_TABS: { key: DesignTableFilter; label: string }[] = [
  { key: "mostOutliers", label: "Most Outliers" },
  { key: "mostSkilledAIBuilders", label: "Most Skilled AI Builders" },
  { key: "mostUnskilledVibeCoders", label: "Most Unskilled Vibe Coders" },
  { key: "mostLegacyDevs", label: "Most Legacy Devs" },
];

function getTrendIconForCount(counts: number[], index: number) {
  const total = counts.reduce((sum, value) => sum + value, 0);
  const average = counts.length ? total / counts.length : 0;
  const value = counts[index] ?? 0;
  if (value > average) return TrendingUp;
  if (value < average) return TrendingDown;
  return ArrowRight;
}

function designSortFunction(rows: DesignTeamRow[], currentFilter: DesignTableFilter): DesignTeamRow[] {
  const copy = [...rows];
  if (currentFilter === "mostOutliers") return copy.sort((a, b) => b.outlierScore - a.outlierScore);
  if (currentFilter === "mostSkilledAIBuilders") return copy.sort((a, b) => b.skilledAIScore - a.skilledAIScore);
  if (currentFilter === "mostUnskilledVibeCoders") return copy.sort((a, b) => b.unskilledScore - a.unskilledScore);
  if (currentFilter === "mostLegacyDevs") return copy.sort((a, b) => b.legacyScore - a.legacyScore);
  return copy;
}

type DesignTeamsTableProps = {
  rows: DesignTeamRow[];
  activeFilter?: DesignTableFilter;
  onFilterChange?: (filter: DesignTableFilter) => void;
  /** Optional external visibility map keyed by team name. When provided, the table becomes controlled. */
  visibleTeams?: Record<string, boolean>;
  /** Optional external toggle handler; used when `visibleTeams` is provided. */
  onToggleTeamVisibility?: (teamName: string) => void;
};

export function DesignTeamsTable({
  rows,
  activeFilter = "mostOutliers",
  onFilterChange,
  visibleTeams,
  onToggleTeamVisibility,
}: DesignTeamsTableProps) {
  const [internalVisible, setInternalVisible] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    rows.forEach((r, i) => {
      init[r.teamName] = i !== 1;
    });
    return init;
  });

  const toggleView = useCallback((teamName: string) => {
    if (onToggleTeamVisibility) {
      onToggleTeamVisibility(teamName);
      return;
    }
    setInternalVisible((prev) => ({ ...prev, [teamName]: !prev[teamName] }));
  }, [onToggleTeamVisibility]);

  const effectiveVisible = visibleTeams ?? internalVisible;

  const columns = useMemo<BaseTeamsTableColumn<DesignTeamRow, DesignTableFilter>[]>(
    () => [
      {
        key: "view",
        header: "View",
        className: "w-14",
        render: (row) => (
          <VisibilityToggleButton
            isVisible={effectiveVisible[row.teamName] !== false}
            onToggle={() => toggleView(row.teamName)}
          />
        ),
      },
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
        key: "ownership",
        header: "Ownership Allocation",
        className: "text-right",
        render: (row) => {
          const counts = [
            row.ownershipAllocation[2],
            row.ownershipAllocation[1],
            row.ownershipAllocation[0],
          ];
          return (
            <SegmentBar
              segments={OWNERSHIP_SEGMENTS.map((segment, index) => ({
                ...segment,
                icon: getTrendIconForCount(counts, index),
              }))}
              counts={counts}
              alignment="end"
              showCounts
            />
          );
        },
      },
      {
        key: "chaos",
        header: "Engineering Chaos",
        className: "text-right",
        render: (row) => {
          const counts = [
            row.engineeringChaos[3],
            row.engineeringChaos[2],
            row.engineeringChaos[1],
            row.engineeringChaos[0],
          ];
          return (
            <SegmentBar
              segments={CHAOS_SEGMENTS.map((segment, index) => ({
                ...segment,
                icon: getTrendIconForCount(counts, index),
              }))}
              counts={counts}
              alignment="end"
              showCounts
            />
          );
        },
      },
    ],
    [effectiveVisible, toggleView]
  );

  return (
    <BaseTeamsTable<DesignTeamRow, DesignTableFilter>
      rows={rows}
      filterTabs={DESIGN_FILTER_TABS}
      activeFilter={activeFilter}
      onFilterChange={onFilterChange}
      defaultFilter="mostOutliers"
      sortFunction={designSortFunction}
      columns={columns}
      getRowKey={(row) => row.teamName}
    />
  );
}
