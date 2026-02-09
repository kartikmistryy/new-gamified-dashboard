"use client";

import { useCallback, useMemo, useState } from "react";
import { ChartInsights } from "@/components/dashboard/ChartInsights";
import { ChaosMatrix } from "@/components/dashboard/ChaosMatrix";
import { DashboardSection } from "@/components/dashboard/DashboardSection";
import { DesignTeamsTable, DESIGN_FILTER_TABS } from "@/components/dashboard/DesignTeamsTable";
import { Badge } from "@/components/shared/Badge";
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

      {/* Global Time Range Filter */}
      <GlobalTimeRangeFilter showLabel />

      <DashboardSection title="Engineering Chaos Matrix" className="w-full">
        <ChaosMatrix range={timeRange} visibleTeams={visibleTeams} teamNames={designTeamNames} />
      </DashboardSection>

      <DashboardSection
        title="Teams"
        className="w-full"
        action={
          <div className="flex flex-row flex-wrap gap-2">
            {DESIGN_FILTER_TABS.map((tab) => (
              <Badge
                key={tab.key}
                onClick={() => setDesignFilter(tab.key)}
                className={`px-3 py-2 rounded-lg cursor-pointer text-xs font-medium transition-colors ${
                  designFilter === tab.key
                    ? "bg-gray-100 text-gray-700 hover:bg-gray-100"
                    : "bg-transparent text-gray-700 border border-gray-200 hover:bg-gray-100"
                }`}
              >
                {tab.label}
              </Badge>
            ))}
          </div>
        }
      >
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
