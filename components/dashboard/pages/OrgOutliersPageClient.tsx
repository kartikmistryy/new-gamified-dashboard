"use client";

import { useMemo, useState } from "react";
import { Info } from "lucide-react";
import { ChaosMatrixChart } from "@/components/dashboard/orgDashboard/ChaosMatrixChart";
import { DashboardSection } from "@/components/dashboard/shared/DashboardSection";
import { OwnershipScatter } from "@/components/dashboard/orgDashboard/OwnershipScatter";
import { MotivationPanel } from "@/components/dashboard/shared/MotivationPanel";
import {
  OwnershipTogglePanel,
  ChaosTogglePanel,
} from "@/components/dashboard/shared/CategoryTogglePanel";
import { OutliersTable } from "@/components/dashboard/orgDashboard/OutliersTable";
import { OverviewOutliersSection } from "@/components/dashboard/orgDashboard/OverviewOutliersSection";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { OUTLIERS_TEAM_ROWS, getOutliersTeamRowsForRange } from "@/lib/dashboard/entities/team/mocks/outliersTeamsMockData";
import {
  MOCK_OUTLIER_DEVELOPERS,
  OWNERSHIP_MOTIVATION,
  CHAOS_MATRIX_MOTIVATION,
} from "@/lib/dashboard/entities/team/mocks/outliersMockData";
import type {
  OwnershipCategory,
  ChaosCategory,
} from "@/lib/dashboard/entities/team/types";

// Using fixed time range since time filter is temporarily disabled
const FIXED_TIME_RANGE = "max" as const;

export function OrgOutliersPageClient() {
  // State for teams visibility (used by ChaosMatrixChart)
  const [visibleTeams] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    OUTLIERS_TEAM_ROWS.forEach((row, index) => {
      init[row.teamName] = index !== 1;
    });
    return init;
  });

  // State for category toggle panels
  const [selectedOwnershipCategory, setSelectedOwnershipCategory] =
    useState<OwnershipCategory>("lower");
  const [selectedChaosCategory, setSelectedChaosCategory] =
    useState<ChaosCategory>("Low-Skill Developer");

  const outliersTeamRows = useMemo(
    () => getOutliersTeamRowsForRange(FIXED_TIME_RANGE),
    []
  );

  const outliersTeamNames = useMemo(
    () => outliersTeamRows.map((row) => row.teamName),
    [outliersTeamRows]
  );

  return (
    <div className="flex flex-col gap-8 px-6 pb-8 min-h-screen bg-white text-gray-900">
      {/* Header: visualization left (70%), motivation right (30%) */}
      <div className="flex flex-row flex-wrap items-stretch gap-6">
        {/* Left column: visualization card */}
        <div className="flex-7 min-w-[300px] rounded-[10px] p-6 flex flex-col">
          <p className="text-sm text-gray-500 mb-3">Developer Outliers at a Glance</p>
          <OverviewOutliersSection />
        </div>

        {/* Right column: motivation card */}
        <div className="flex-3 min-w-[200px] rounded-[10px] p-6 flex flex-col justify-center">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Why It Matters
          </p>
          <p className="text-sm text-gray-700 mb-4">
            Surfaces developers whose contribution patterns diverge from team norms — revealing hidden bottlenecks, overburdened owners, or misaligned effort before they become costly.
          </p>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            How It&apos;s Calculated
          </p>
          <p className="text-sm text-gray-700">
            Cross-references Share of Ownership (KarmaPoints vs ownership %), Developer Performance Matrix (KP vs churn rate), and SPOF risk to rank and prioritize individuals who need attention.
          </p>
        </div>
      </div>

      {/* Row 2: Expected Share of Ownership */}
      <DashboardSection title="Expected Share of Ownership %">
        <div className="flex flex-row flex-wrap items-stretch gap-4">
          {/* Column 1: Chart */}
          <div className="flex-2 min-w-[400px]">
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
          <div className="flex-2 min-w-[400px] overflow-hidden">
            <ChaosMatrixChart
              range={FIXED_TIME_RANGE}
              visibleTeams={visibleTeams}
              teamNames={outliersTeamNames}
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
    </div>
  );
}
