"use client";

import { useMemo, useState } from "react";
import { ChaosMatrixChart } from "@/components/dashboard/orgDashboard/ChaosMatrixChart";
import { BaseTeamsTable } from "@/components/dashboard/shared/BaseTeamsTable";
import { DashboardSection } from "@/components/dashboard/shared/DashboardSection";
import { useTimeRange } from "@/lib/dashboard/shared/contexts/TimeRangeContext";
import { CollaborationNetworkGraph } from "@/components/dashboard/teamDashboard/CollaborationNetworkGraph";
import { ChartInsights } from "@/components/dashboard/shared/ChartInsights";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  getMemberDesignData,
  transformToChaosMatrixData,
  type MemberDesignRow,
} from "@/lib/dashboard/entities/member/mocks/designMockData";
import { getTeamCollaborationData } from "@/lib/dashboard/entities/member/charts/collaborationNetwork/collaborationNetworkData";
import type { ChartInsight } from "@/lib/dashboard/entities/team/types";
import {
  DESIGN_MEMBER_FILTER_TABS,
  designMemberSortFunction,
  type DesignMemberFilter,
} from "@/lib/dashboard/entities/member/utils/designHelpers";
import { DESIGN_MEMBER_COLUMNS } from "@/lib/dashboard/entities/member/tables/designTableColumns";
import { useRouteParams } from "@/lib/dashboard/shared/contexts/RouteParamsProvider";

export function TeamDesignPageClient() {
  const { teamId } = useRouteParams();
  const { timeRange } = useTimeRange();

  // State
  const [designFilter, setDesignFilter] = useState<DesignMemberFilter>("mostImportant");
  const [collaborationInsights, setCollaborationInsights] = useState<ChartInsight[]>([]);

  // Data pipeline
  const members = useMemo(() => getMemberDesignData(teamId!, 6), [teamId]);

  const chaosMatrixData = useMemo(
    () => transformToChaosMatrixData(members, timeRange),
    [members, timeRange]
  );

  const memberNames = useMemo(() => members.map((m) => m.memberName), [members]);
  const collaborationData = useMemo(
    () => getTeamCollaborationData(teamId!, memberNames, timeRange),
    [teamId, memberNames, timeRange]
  );

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-8 px-6 pb-8 min-h-screen bg-white text-gray-900">
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
            teamNames={memberNames}
            tooltipTeamLabel="Person"
            renderMode="avatars"
          />
        </DashboardSection>

        <DashboardSection title="Team Members" className="w-full">
          <BaseTeamsTable<MemberDesignRow, DesignMemberFilter>
            rows={members}
            filterTabs={DESIGN_MEMBER_FILTER_TABS}
            activeFilter={designFilter}
            onFilterChange={setDesignFilter}
            defaultFilter="mostImportant"
            sortFunction={designMemberSortFunction}
            columns={DESIGN_MEMBER_COLUMNS}
            getRowKey={(row) => row.memberName}
            showFilters={false}
          />
        </DashboardSection>
      </div>
    </TooltipProvider>
  );
}
