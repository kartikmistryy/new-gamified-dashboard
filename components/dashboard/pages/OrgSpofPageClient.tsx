"use client";

import { useState, useCallback, useMemo } from "react";
import { DashboardSection } from "@/components/dashboard/DashboardSection";
import { SpofTeamsTable } from "@/components/dashboard/SpofTeamsTable";
import { SpofDistributionChart } from "@/components/dashboard/SpofDistributionChart";
import { RepoHealthBar } from "@/components/dashboard/RepoHealthBar";
import { GaugeWithInsights } from "@/components/dashboard/GaugeWithInsights";
import {
  SPOF_DATA,
  SPOF_TEAM_ROWS,
  SPOF_TEAM_CONFIG,
} from "@/lib/orgDashboard/spofMockData";
import { getChartInsightsMock } from "@/lib/orgDashboard/overviewMockData";
import { getGaugeColor, getPerformanceGaugeLabel } from "@/lib/orgDashboard/utils";

const DEFAULT_SPOF_GAUGE_VALUE = 28;

export function OrgSpofPageClient() {
  const chartInsights = useMemo(() => getChartInsightsMock(), []);
  // Initialize visibility state - all teams visible by default
  const [visibleTeams, setVisibleTeams] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const team of SPOF_TEAM_CONFIG) {
      init[team.name] = true;
    }
    return init;
  });

  const handleVisibilityChange = useCallback((teamName: string, visible: boolean) => {
    setVisibleTeams((prev) => ({ ...prev, [teamName]: visible }));
  }, []);

  return (
    <div className="flex flex-col gap-8 px-6 pb-8 bg-white text-gray-900 min-h-screen">
      <DashboardSection title="SPOF Owner Distribution">
        <GaugeWithInsights
          value={DEFAULT_SPOF_GAUGE_VALUE}
          label={getPerformanceGaugeLabel(DEFAULT_SPOF_GAUGE_VALUE)}
          labelColor={getGaugeColor(DEFAULT_SPOF_GAUGE_VALUE)}
          valueDisplay={`${DEFAULT_SPOF_GAUGE_VALUE}/100`}
          insights={chartInsights}
          className="mb-6"
        />
        <div className="bg-white rounded-lg">
          <SpofDistributionChart
            data={SPOF_DATA}
            visibleTeams={visibleTeams}
            showNormalFit
          />
        </div>
      </DashboardSection>

      <DashboardSection title="Repository Health Distribution">
        <RepoHealthBar />
      </DashboardSection>

      <DashboardSection title="Teams">
        <SpofTeamsTable
          rows={SPOF_TEAM_ROWS}
          visibleTeams={visibleTeams}
          onVisibilityChange={handleVisibilityChange}
        />
      </DashboardSection>
    </div>
  );
}
