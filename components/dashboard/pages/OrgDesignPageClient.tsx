"use client";

import { useCallback, useMemo, useState } from "react";
import { ChartInsights } from "@/components/dashboard/ChartInsights";
import { ChaosMatrixChart } from "@/components/dashboard/ChaosMatrixChart";
import { DashboardSection } from "@/components/dashboard/DashboardSection";
import { DesignTeamsTable } from "@/components/dashboard/DesignTeamsTable";
import { OwnershipScatter } from "@/components/dashboard/OwnershipScatter";
import { GlobalTimeRangeFilter } from "@/components/dashboard/GlobalTimeRangeFilter";
import { useTimeRange } from "@/lib/contexts/TimeRangeContext";
import { getChartInsightsMock } from "@/lib/orgDashboard/overviewMockData";
import { DESIGN_TEAM_ROWS, getDesignTeamRowsForRange } from "@/lib/orgDashboard/designMockData";
import type { DesignTableFilter } from "@/lib/orgDashboard/types";

export function OrgDesignPageClient() {
  const { timeRange } = useTimeRange();
  const chartInsights = useMemo(() => getChartInsightsMock(), []);
  const [designFilter, setDesignFilter] = useState<DesignTableFilter>("mostOutliers");
  const [visibleTeams, setVisibleTeams] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    DESIGN_TEAM_ROWS.forEach((row, index) => {
      init[row.teamName] = index !== 1;
    });
    return init;
  });

  const handleToggleTeamVisibility = useCallback((teamName: string) => {
    setVisibleTeams((prev) => ({ ...prev, [teamName]: !prev[teamName] }));
  }, []);

  const designTeamRows = useMemo(
    () => getDesignTeamRowsForRange(timeRange),
    [timeRange],
  );

  const designTeamNames = useMemo(
    () => designTeamRows.map((row) => row.teamName),
    [designTeamRows],
  );

  return (
    <div className="flex flex-col gap-8 px-6 pb-8 min-h-screen bg-white text-gray-900">
      <GlobalTimeRangeFilter showLabel />
      
      <DashboardSection title="Ownership Misallocation Detector">
        <div className="flex flex-row flex-wrap items-stretch gap-8">
          <div className="flex-[1.5] min-w-[400px]">
            <OwnershipScatter range={timeRange} />
          </div>
          <div className="flex-1 min-w-[280px]">
            <ChartInsights insights={chartInsights} />
          </div>
        </div>
      </DashboardSection>

      <DashboardSection title="Engineering Chaos Matrix" className="w-full">
        <ChaosMatrixChart
          range={timeRange}
          visibleTeams={visibleTeams}
          teamNames={designTeamNames}
          renderMode="circles"
        />
      </DashboardSection>

      <DashboardSection title="Teams" className="w-full">
        <DesignTeamsTable
          rows={designTeamRows}
          activeFilter={designFilter}
          onFilterChange={setDesignFilter}
          showFilters={false}
          visibleTeams={visibleTeams}
          onToggleTeamVisibility={handleToggleTeamVisibility}
        />
      </DashboardSection>
    </div>
  );
}
