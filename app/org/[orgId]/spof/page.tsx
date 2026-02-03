"use client";

import { useState, useCallback } from "react";
import { DashboardSection } from "@/components/dashboard/DashboardSection";
import { SpofTeamsTable } from "@/components/dashboard/SpofTeamsTable";
import { SpofDistributionChart } from "@/components/dashboard/SpofDistributionChart";
import {
  SPOF_DATA,
  SPOF_TEAM_ROWS,
  SPOF_TEAM_CONFIG,
} from "@/lib/orgDashboard/spofMockData";

export default function OrgSpofPage() {
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
    <div className="flex flex-col gap-8 px-6 bg-white text-gray-900 min-h-screen">
      <DashboardSection title="SPOF Owner Distribution">
        <div className="bg-white rounded-lg">
          <SpofDistributionChart
            data={SPOF_DATA}
            visibleTeams={visibleTeams}
            showNormalFit
          />
        </div>
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
