"use client";

import { useCallback, useMemo, useState } from "react";
import { ChartInsights } from "@/components/dashboard/ChartInsights";
import { ChaosMatrix } from "@/components/dashboard/ChaosMatrix";
import { DashboardSection } from "@/components/dashboard/DashboardSection";
import { DesignTeamsTable, DESIGN_FILTER_TABS } from "@/components/dashboard/DesignTeamsTable";
import { Badge } from "@/components/shared/Badge";
import { OwnershipScatter } from "@/components/dashboard/OwnershipScatter";
import { TimeRangeFilter } from "@/components/dashboard/TimeRangeFilter";
import { getChartInsightsMock } from "@/lib/orgDashboard/overviewMockData";
import { DESIGN_TEAM_ROWS, getDesignTeamRowsForRange } from "@/lib/orgDashboard/designMockData";
import { TIME_RANGE_OPTIONS, type TimeRangeKey } from "@/lib/orgDashboard/timeRangeTypes";
import type { DesignTableFilter } from "@/lib/orgDashboard/types";

export default function OrgDesignPage() {
  const chartInsights = useMemo(() => getChartInsightsMock(), []);
  const [ownershipRange, setOwnershipRange] = useState<TimeRangeKey>("3m");
  const [chaosRange, setChaosRange] = useState<TimeRangeKey>("max");
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
    () => getDesignTeamRowsForRange(chaosRange),
    [chaosRange],
  );

  const designTeamNames = useMemo(
    () => designTeamRows.map((row) => row.teamName),
    [designTeamRows],
  );

  return (
    <div className="flex flex-col gap-8 px-6 pb-8 min-h-screen bg-white text-gray-900">
      <DashboardSection
        title="Ownership Misallocation Detector"
        action={
          <TimeRangeFilter
            options={TIME_RANGE_OPTIONS}
            value={ownershipRange}
            onChange={setOwnershipRange}
          />
        }
      >
        <div className="flex flex-row gap-5">
          <div className="w-[65%] shrink-0">
            <OwnershipScatter range={ownershipRange} />
          </div>
          <div className="w-[35%] min-w-0 shrink">
            <ChartInsights insights={chartInsights} />
          </div>
        </div>
      </DashboardSection>

      <DashboardSection
        title="Engineering Chaos Matrix"
        className="w-full"
        action={
          <TimeRangeFilter
            options={TIME_RANGE_OPTIONS}
            value={chaosRange}
            onChange={setChaosRange}
          />
        }
      >
        <ChaosMatrix range={chaosRange} visibleTeams={visibleTeams} teamNames={designTeamNames} />
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
