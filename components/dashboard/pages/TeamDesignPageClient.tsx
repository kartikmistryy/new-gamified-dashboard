"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/shared/Badge";
import { TeamChaosMatrix } from "@/components/dashboard/TeamChaosMatrix";
import { BaseTeamsTable } from "@/components/dashboard/BaseTeamsTable";
import { DashboardSection } from "@/components/dashboard/DashboardSection";
import { TimeRangeFilter } from "@/components/dashboard/TimeRangeFilter";
import { TeamCollaborationNetwork } from "@/components/dashboard/TeamCollaborationNetwork";
import { ChartInsights } from "@/components/dashboard/ChartInsights";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  getMemberDesignData,
  transformToChaosMatrixData,
  type MemberDesignRow,
} from "@/lib/teamDashboard/designMockData";
import { getTeamCollaborationData } from "@/lib/teamDashboard/collaborationNetworkData";
import type { ChartInsight } from "@/lib/orgDashboard/types";
import {
  DESIGN_MEMBER_FILTER_TABS,
  designMemberSortFunction,
  type DesignMemberFilter,
} from "@/lib/teamDashboard/designHelpers";
import { DESIGN_MEMBER_COLUMNS } from "@/lib/teamDashboard/designTableColumns";
import { TIME_RANGE_OPTIONS, type TimeRangeKey } from "@/lib/orgDashboard/timeRangeTypes";
import { useRouteParams } from "@/lib/RouteParamsProvider";

export function TeamDesignPageClient() {
  const { teamId } = useRouteParams();

  // State
  const [collaborationRange, setCollaborationRange] = useState<TimeRangeKey>("3m");
  const [chaosRange, setChaosRange] = useState<TimeRangeKey>("max");
  const [designFilter, setDesignFilter] = useState<DesignMemberFilter>("mostImportant");
  const [collaborationInsights, setCollaborationInsights] = useState<ChartInsight[]>([]);

  // Data pipeline
  const members = useMemo(() => getMemberDesignData(teamId!, 6), [teamId]);

  const chaosMatrixData = useMemo(
    () => transformToChaosMatrixData(members, chaosRange),
    [members, chaosRange]
  );

  const memberNames = useMemo(() => members.map((m) => m.memberName), [members]);
  const collaborationData = useMemo(
    () => getTeamCollaborationData(teamId!, memberNames, collaborationRange),
    [teamId, memberNames, collaborationRange]
  );

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-8 px-6 pb-8 min-h-screen bg-white text-gray-900">
        <DashboardSection
          title="Collaboration Network"
          className="w-full"
          action={
            <TimeRangeFilter
              options={TIME_RANGE_OPTIONS}
              value={collaborationRange}
              onChange={setCollaborationRange}
            />
          }
        >
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

        <DashboardSection
          title="Engineering Chaos Index"
          className="w-full"
          action={
            <TimeRangeFilter
              options={TIME_RANGE_OPTIONS}
              value={chaosRange}
              onChange={setChaosRange}
            />
          }
        >
          <TeamChaosMatrix
            data={chaosMatrixData}
            range={chaosRange}
            teamNames={memberNames}
          />
        </DashboardSection>

        <DashboardSection
          title="Team Members"
          className="w-full"
          action={
            <div className="flex flex-row flex-wrap gap-2">
              {DESIGN_MEMBER_FILTER_TABS.map((tab) => (
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
