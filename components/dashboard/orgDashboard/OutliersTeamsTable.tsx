"use client";

import { useCallback, useState } from "react";
import type { OutliersTeamRow, OutliersTeamsTableFilter } from "@/lib/dashboard/entities/team/types";
import { BaseTeamsTable } from "@/components/dashboard/shared/BaseTeamsTable";
import { OUTLIERS_FILTER_TABS, outliersSortFunction } from "@/lib/dashboard/entities/team/tables/outliersTeamsTableConfig";
import { createOutliersColumns } from "@/lib/dashboard/entities/team/tables/outliersTeamsTableColumns";

type OutliersTeamsTableProps = {
  rows: OutliersTeamRow[];
  activeFilter?: OutliersTeamsTableFilter;
  onFilterChange?: (filter: OutliersTeamsTableFilter) => void;
  showFilters?: boolean;
  visibleTeams?: Record<string, boolean>;
  onToggleTeamVisibility?: (teamName: string) => void;
};

/** Outliers Teams Table - displays ownership health and engineering chaos metrics */
export function OutliersTeamsTable({
  rows,
  activeFilter = "mostOutliers",
  onFilterChange,
  showFilters = true,
  visibleTeams,
  onToggleTeamVisibility,
}: OutliersTeamsTableProps) {
  const [internalVisible, setInternalVisible] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    rows.forEach((r, i) => {
      init[r.teamName] = i !== 1;
    });
    return init;
  });

  const toggleView = useCallback(
    (teamName: string) => {
      if (onToggleTeamVisibility) {
        onToggleTeamVisibility(teamName);
        return;
      }
      setInternalVisible((prev) => ({ ...prev, [teamName]: !prev[teamName] }));
    },
    [onToggleTeamVisibility]
  );

  const effectiveVisible = visibleTeams ?? internalVisible;
  const columns = createOutliersColumns(effectiveVisible, toggleView);

  return (
    <BaseTeamsTable<OutliersTeamRow, OutliersTeamsTableFilter>
      rows={rows}
      filterTabs={OUTLIERS_FILTER_TABS}
      activeFilter={activeFilter}
      onFilterChange={onFilterChange}
      defaultFilter="mostOutliers"
      sortFunction={outliersSortFunction}
      columns={columns}
      getRowKey={(row) => row.teamName}
      showFilters={showFilters}
    />
  );
}
