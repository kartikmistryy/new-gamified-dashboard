"use client";

import { useCallback, useMemo, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import type { DesignTeamRow, DesignTableFilter } from "@/lib/orgDashboard/types";
import { DASHBOARD_BG_CLASSES, DASHBOARD_TEXT_CLASSES } from "@/lib/orgDashboard/colors";
import { BaseTeamsTable, type BaseTeamsTableColumn } from "./BaseTeamsTable";
import { SegmentBar } from "./SegmentBar";

const OWNERSHIP_SEGMENTS = [
  { bg: DASHBOARD_BG_CLASSES.danger90 },
  { bg: DASHBOARD_BG_CLASSES.blue60 },
  { bg: DASHBOARD_BG_CLASSES.excellent90 },
];

const CHAOS_SEGMENTS = [
  { bg: DASHBOARD_BG_CLASSES.danger90 },
  { bg: DASHBOARD_BG_CLASSES.danger60 },
  { bg: DASHBOARD_BG_CLASSES.blue60 },
  { bg: DASHBOARD_BG_CLASSES.excellent90 },
];

const DESIGN_FILTER_TABS: { key: DesignTableFilter; label: string }[] = [
  { key: "mostOutliers", label: "Most Outliers" },
  { key: "mostSkilledAIBuilders", label: "Most Skilled AI Builders" },
  { key: "mostUnskilledVibeCoders", label: "Most Unskilled Vibe Coders" },
  { key: "mostLegacyDevs", label: "Most Legacy Devs" },
];

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
        render: (row) => {
          const isVisible = effectiveVisible[row.teamName] !== false;
          return (
            <button
              type="button"
              onClick={() => toggleView(row.teamName)}
              className="inline-flex items-center justify-center size-8 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
              aria-label={isVisible ? "Hide" : "Show"}
            >
              {isVisible ? <Eye className="size-5 shrink-0" aria-hidden /> : <EyeOff className="size-5 shrink-0" aria-hidden />}
            </button>
          );
        },
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
        render: (row) => (
          <SegmentBar segments={OWNERSHIP_SEGMENTS} counts={row.ownershipAllocation} alignment="end" />
        ),
      },
      {
        key: "chaos",
        header: "Engineering Chaos",
        className: "text-right",
        render: (row) => (
          <SegmentBar segments={CHAOS_SEGMENTS} counts={row.engineeringChaos} alignment="end" />
        ),
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
