"use client";

import { useMemo, useState } from "react";
import { ChaosMatrixChart } from "@/components/dashboard/ChaosMatrixChart";
import { BaseTeamsTable } from "@/components/dashboard/BaseTeamsTable";
import { DashboardSection } from "@/components/dashboard/DashboardSection";
import { GlobalTimeRangeFilter } from "@/components/dashboard/GlobalTimeRangeFilter";
import { useTimeRange } from "@/lib/contexts/TimeRangeContext";
import { CollaborationNetworkGraph } from "@/components/dashboard/CollaborationNetworkGraph";
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
        <GlobalTimeRangeFilter showLabel />
        
        <DashboardSection title="Collaboration Network" className="w-full">
          <div className="flex flex-row flex-wrap items-stretch gap-8">
            <div className="flex-[1.5] min-w-[400px]">
              <CollaborationNetworkGraph
                data={collaborationData}
                onInsightsChange={setCollaborationInsights}
              />
            </div>
            <div className="flex-1 min-w-[280px]">
              <ChartInsights insights={collaborationInsights} />
            </div>
          </div>
        </DashboardSection>

        <DashboardSection title="Engineering Chaos Index" className="w-full">
          <ChaosMatrixChart
            data={chaosMatrixData}
            range={timeRange}
            teamNames={contributorNames}
            tooltipTeamLabel="Person"
            renderMode="avatars"
          />
        </DashboardSection>

        <DashboardSection title="Repository Contributors" className="w-full">
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
