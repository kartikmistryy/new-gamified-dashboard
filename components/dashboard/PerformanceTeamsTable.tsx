"use client";

import { useCallback } from "react";
import type { TeamPerformanceRow, PerformanceTableFilter } from "@/lib/orgDashboard/types";
import { BaseTeamsTable } from "./BaseTeamsTable";
import { PERFORMANCE_FILTER_TABS, performanceSortFunction } from "@/lib/orgDashboard/performanceTeamsTableConfig";
import { createPerformanceColumns } from "@/lib/orgDashboard/performanceTeamsTableColumns";

type PerformanceTeamsTableProps = {
  rows: TeamPerformanceRow[];
  activeFilter?: PerformanceTableFilter;
  onFilterChange?: (filter: PerformanceTableFilter) => void;
  visibleTeams?: Record<string, boolean>;
  onVisibilityChange?: (teamName: string, visible: boolean) => void;
};

/** Performance Teams Table - displays team performance metrics with optional visibility controls */
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

  const columns = createPerformanceColumns(visibleTeams, visibleTeams && onVisibilityChange ? handleToggle : undefined);

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
