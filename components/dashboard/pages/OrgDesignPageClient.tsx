"use client";

import { useCallback, useMemo, useState } from "react";
import { Info } from "lucide-react";
import { ChaosMatrixChart } from "@/components/dashboard/orgDashboard/ChaosMatrixChart";
import { DashboardSection } from "@/components/dashboard/shared/DashboardSection";
import { DesignTeamsTable } from "@/components/dashboard/orgDashboard/DesignTeamsTable";
import { OwnershipScatter } from "@/components/dashboard/orgDashboard/OwnershipScatter";
import { MotivationPanel } from "@/components/dashboard/shared/MotivationPanel";
import {
  OwnershipTogglePanel,
  ChaosTogglePanel,
} from "@/components/dashboard/shared/CategoryTogglePanel";
import { OutliersTable } from "@/components/dashboard/orgDashboard/OutliersTable";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { DESIGN_TEAM_ROWS, getDesignTeamRowsForRange } from "@/lib/dashboard/entities/team/mocks/designMockData";
import {
  MOCK_OUTLIER_DEVELOPERS,
  OWNERSHIP_MOTIVATION,
  CHAOS_MATRIX_MOTIVATION,
} from "@/lib/dashboard/entities/team/mocks/outliersMockData";
import type {
  DesignTableFilter,
  OwnershipCategory,
  ChaosCategory,
} from "@/lib/dashboard/entities/team/types";

// Using fixed time range since time filter is temporarily disabled
const FIXED_TIME_RANGE = "max" as const;

export function OrgDesignPageClient() {
  // State for design teams table
  const [designFilter, setDesignFilter] = useState<DesignTableFilter>("mostOutliers");
  const [visibleTeams, setVisibleTeams] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    DESIGN_TEAM_ROWS.forEach((row, index) => {
      init[row.teamName] = index !== 1;
    });
    return init;
  });

  // State for category toggle panels
  const [selectedOwnershipCategory, setSelectedOwnershipCategory] =
    useState<OwnershipCategory>("lower");
  const [selectedChaosCategory, setSelectedChaosCategory] =
    useState<ChaosCategory>("Low-Skill Developer");

  const handleToggleTeamVisibility = useCallback((teamName: string) => {
    setVisibleTeams((prev) => ({ ...prev, [teamName]: !prev[teamName] }));
  }, []);

  const designTeamRows = useMemo(
    () => getDesignTeamRowsForRange(FIXED_TIME_RANGE),
    []
  );

  const designTeamNames = useMemo(
    () => designTeamRows.map((row) => row.teamName),
    [designTeamRows]
  );

  return (
    <div className="flex flex-col gap-8 px-6 pb-8 min-h-screen bg-white text-gray-900">
      {/* Row 1: Outliers Table */}
      <DashboardSection
        title={
          <span className="inline-flex items-center gap-2">
            Developer Outliers
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-gray-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs text-sm">
                Developers whose ownership or productivity patterns deviate from expected norms. Review these individuals to identify potential bottlenecks, underutilized talent, or knowledge silos.
              </TooltipContent>
            </Tooltip>
          </span>
        }
      >
        <OutliersTable developers={MOCK_OUTLIER_DEVELOPERS} />
      </DashboardSection>

      {/* Row 2: Expected Share of Ownership */}
      <DashboardSection title="Expected Share of Ownership %">
        <div className="flex flex-row flex-wrap items-stretch gap-4">
          {/* Column 1: Chart */}
          <div className="flex-[2] min-w-[400px]">
            <OwnershipScatter range={FIXED_TIME_RANGE} />
          </div>
          {/* Column 2: Motivation Panel */}
          <div className="flex-1 min-w-[240px]">
            <MotivationPanel
              title="Expected Share of Ownership %"
              motivation={OWNERSHIP_MOTIVATION}
              className="h-full"
            />
          </div>
          {/* Column 3: Toggle + Contributor List */}
          <div className="flex-1 min-w-[200px]">
            <OwnershipTogglePanel
              selectedCategory={selectedOwnershipCategory}
              onCategoryChange={setSelectedOwnershipCategory}
              developers={MOCK_OUTLIER_DEVELOPERS}
              className="h-full"
            />
          </div>
        </div>
      </DashboardSection>

      {/* Row 3: Developer Performance Matrix */}
      <DashboardSection title="Developer Performance Matrix">
        <div className="flex flex-row flex-wrap items-stretch gap-4">
          {/* Column 1: Chart */}
          <div className="flex-[2] min-w-[300px] max-w-[700px] overflow-hidden">
            <ChaosMatrixChart
              range={FIXED_TIME_RANGE}
              visibleTeams={visibleTeams}
              teamNames={designTeamNames}
              renderMode="circles"
            />
          </div>
          {/* Column 2: Motivation Panel */}
          <div className="flex-1 min-w-[240px]">
            <MotivationPanel
              title="Developer Performance Matrix"
              motivation={CHAOS_MATRIX_MOTIVATION}
              className="h-full"
            />
          </div>
          {/* Column 3: Toggle + Contributor List */}
          <div className="flex-1 min-w-[200px]">
            <ChaosTogglePanel
              selectedCategory={selectedChaosCategory}
              onCategoryChange={setSelectedChaosCategory}
              developers={MOCK_OUTLIER_DEVELOPERS}
              className="h-full"
            />
          </div>
        </div>
      </DashboardSection>

      {/* Row 4: Teams Table */}
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
