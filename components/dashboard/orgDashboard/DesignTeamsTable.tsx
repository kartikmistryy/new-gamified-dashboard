"use client";

import { useCallback, useState } from "react";
import type { DesignTeamRow, DesignTableFilter } from "@/lib/dashboard/entities/team/types";
import { BaseTeamsTable } from "@/components/dashboard/shared/BaseTeamsTable";
import { DESIGN_FILTER_TABS, designSortFunction } from "@/lib/dashboard/entities/team/tables/designTeamsTableConfig";
import { createDesignColumns } from "@/lib/dashboard/entities/team/tables/designTeamsTableColumns";

type DesignTeamsTableProps = {
  rows: DesignTeamRow[];
  activeFilter?: DesignTableFilter;
  onFilterChange?: (filter: DesignTableFilter) => void;
  showFilters?: boolean;
  visibleTeams?: Record<string, boolean>;
  onToggleTeamVisibility?: (teamName: string) => void;
};

/** Design Teams Table - displays ownership health and engineering chaos metrics */
export function DesignTeamsTable({
  rows,
  activeFilter = "mostOutliers",
  onFilterChange,
  showFilters = true,
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
  const columns = createDesignColumns(effectiveVisible, toggleView);

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
      showFilters={showFilters}
    />
  );
}
