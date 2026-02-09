"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/shared/Badge";
import { TeamChaosMatrix } from "@/components/dashboard/TeamChaosMatrix";
import { BaseTeamsTable } from "@/components/dashboard/BaseTeamsTable";
import { DashboardSection } from "@/components/dashboard/DashboardSection";
import { GlobalTimeRangeFilter } from "@/components/dashboard/GlobalTimeRangeFilter";
import { useTimeRange } from "@/lib/contexts/TimeRangeContext";
import { TeamCollaborationNetwork } from "@/components/dashboard/TeamCollaborationNetwork";
import { ChartInsights } from "@/components/dashboard/ChartInsights";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  getContributorDesignData,
  transformToChaosMatrixData,
  type ContributorDesignRow,
} from "@/lib/repoDashboard/designMockData";
import { getRepoCollaborationData } from "@/lib/repoDashboard/collaborationNetworkData";
import type { ChartInsight } from "@/lib/orgDashboard/types";
import {
  DESIGN_CONTRIBUTOR_FILTER_TABS,
  designContributorSortFunction,
  type DesignContributorFilter,
} from "@/lib/repoDashboard/designHelpers";
import { DESIGN_CONTRIBUTOR_COLUMNS } from "@/lib/repoDashboard/designTableColumns";
import { useRouteParams } from "@/lib/RouteParamsProvider";

export function RepoDesignPageClient() {
  const { repoId } = useRouteParams();
  const { timeRange } = useTimeRange();

  // State
  const [designFilter, setDesignFilter] = useState<DesignContributorFilter>("mostImportant");
  const [collaborationInsights, setCollaborationInsights] = useState<ChartInsight[]>([]);

  // Data pipeline
  const contributors = useMemo(() => getContributorDesignData(repoId!, 6), [repoId]);

  const chaosMatrixData = useMemo(
    () => transformToChaosMatrixData(contributors, timeRange),
    [contributors, timeRange]
  );

  const contributorNames = useMemo(() => contributors.map((c) => c.contributorName), [contributors]);
  const collaborationData = useMemo(
    () => getRepoCollaborationData(repoId!, contributorNames, timeRange),
    [repoId, contributorNames, timeRange]
  );

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-8 px-6 pb-8 min-h-screen bg-white text-gray-900">
        <DashboardSection title="Collaboration Network" className="w-full">
          <div className="flex flex-col items-stretch gap-8 xl:flex-row">
            <div className="min-w-0 xl:w-[60%]">
              <TeamCollaborationNetwork
                data={collaborationData}
                onInsightsChange={setCollaborationInsights}
              />
            </div>
            <div className="min-w-[280px] xl:w-[40%]">
              <ChartInsights insights={collaborationInsights} />
            </div>
          </div>
        </DashboardSection>

        {/* Global Time Range Filter */}
        <GlobalTimeRangeFilter showLabel />

        <DashboardSection title="Engineering Chaos Index" className="w-full">
          <TeamChaosMatrix
            data={chaosMatrixData}
            range={timeRange}
            teamNames={contributorNames}
          />
        </DashboardSection>

        <DashboardSection
          title="Repository Contributors"
          className="w-full"
          action={
            <div className="flex flex-row flex-wrap gap-2">
              {DESIGN_CONTRIBUTOR_FILTER_TABS.map((tab) => (
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
          <BaseTeamsTable<ContributorDesignRow, DesignContributorFilter>
            rows={contributors}
            filterTabs={DESIGN_CONTRIBUTOR_FILTER_TABS}
            activeFilter={designFilter}
            onFilterChange={setDesignFilter}
            defaultFilter="mostImportant"
            sortFunction={designContributorSortFunction}
            columns={DESIGN_CONTRIBUTOR_COLUMNS}
            getRowKey={(row) => row.contributorName}
            showFilters={false}
          />
        </DashboardSection>
      </div>
    </TooltipProvider>
  );
}
