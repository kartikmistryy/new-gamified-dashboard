"use client";

import { useMemo, useState } from "react";
import { ChaosMatrixChart } from "@/components/dashboard/orgDashboard/ChaosMatrixChart";
import { BaseTeamsTable } from "@/components/dashboard/shared/BaseTeamsTable";
import { DashboardSection } from "@/components/dashboard/shared/DashboardSection";
import { useTimeRange } from "@/lib/dashboard/shared/contexts/TimeRangeContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  getContributorDesignData,
  transformToChaosMatrixData,
  type ContributorDesignRow,
} from "@/lib/dashboard/entities/contributor/mocks/designMockData";
import {
  DESIGN_CONTRIBUTOR_FILTER_TABS,
  designContributorSortFunction,
  type DesignContributorFilter,
} from "@/lib/dashboard/entities/contributor/utils/designHelpers";
import { DESIGN_CONTRIBUTOR_COLUMNS } from "@/lib/dashboard/entities/contributor/tables/designTableColumns";
import { useRouteParams } from "@/lib/dashboard/shared/contexts/RouteParamsProvider";

export function RepoDesignPageClient() {
  const { repoId } = useRouteParams();
  const { timeRange } = useTimeRange();

  // State
  const [designFilter, setDesignFilter] = useState<DesignContributorFilter>("mostImportant");

  // Data pipeline
  const contributors = useMemo(() => getContributorDesignData(repoId!, 6), [repoId]);

  const chaosMatrixData = useMemo(
    () => transformToChaosMatrixData(contributors, timeRange),
    [contributors, timeRange]
  );

  const contributorNames = useMemo(() => contributors.map((c) => c.contributorName), [contributors]);

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-8 px-6 pb-8 min-h-screen bg-white text-gray-900">
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
