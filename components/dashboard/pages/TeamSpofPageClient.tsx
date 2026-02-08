"use client";

import { useMemo } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GaugeWithInsights } from "@/components/dashboard/GaugeWithInsights";
import { TeamContributionChart } from "@/components/dashboard/TeamContributionChart";
import { RepoHealthBar, REPO_HEALTH_SEGMENTS, type RepoHealthSegment } from "@/components/dashboard/RepoHealthBar";
import { BaseTeamsTable, type BaseTeamsTableColumn } from "@/components/dashboard/BaseTeamsTable";
import { DashboardSection } from "@/components/dashboard/DashboardSection";
import { TeamAvatar } from "@/components/shared/TeamAvatar";
import {
  getMemberSpofData,
  calculateTeamSpofGaugeValue,
  type MemberSpofRow,
} from "@/lib/teamDashboard/spofMockData";
import {
  SPOF_MEMBER_FILTER_TABS,
  spofMemberSortFunction,
  getSpofInsights,
  type SpofMemberFilter,
} from "@/lib/teamDashboard/spofHelpers";
import { getGaugeColor, getPerformanceGaugeLabel } from "@/lib/orgDashboard/utils";
import { DASHBOARD_TEXT_CLASSES } from "@/lib/orgDashboard/colors";
import { useRouteParams } from "@/lib/RouteParamsProvider";

// SPOF member table columns
const SPOF_MEMBER_COLUMNS: BaseTeamsTableColumn<MemberSpofRow, SpofMemberFilter>[] = [
  {
    key: "rank",
    header: "Rank",
    className: "w-14",
    render: (_, index) => {
      const displayRank = index + 1;
      return (
        <span
          className={
            displayRank <= 3 ? "text-foreground font-bold" : DASHBOARD_TEXT_CLASSES.rankMuted
          }
        >
          {displayRank}
        </span>
      );
    },
  },
  {
    key: "member",
    header: "Member",
    render: (row) => (
      <div className="flex items-center gap-3">
        <TeamAvatar teamName={row.memberName} className="size-4" />
        <p className="font-medium text-gray-900">{row.memberName}</p>
      </div>
    ),
  },
  {
    key: "ownershipPct",
    header: "% of Ownership",
    className: "text-right",
    render: (row) => <span className="text-gray-700">{Math.round(row.ownershipPct)}%</span>,
  },
  {
    key: "ownedModules",
    header: "Owned Modules",
    className: "text-right",
    render: (row) => <span className="text-gray-700">{row.ownedModules}</span>,
  },
];

export function TeamSpofPageClient() {
  const { teamId } = useRouteParams();

  // Data pipeline
  const members = useMemo(() => getMemberSpofData(teamId!, 6), [teamId]);

  const gaugeValue = useMemo(() => calculateTeamSpofGaugeValue(members), [members]);

  const insights = useMemo(() => getSpofInsights(members), [members]);

  // Calculate repo health segments for RepoHealthBar
  const repoHealthSegments = useMemo((): RepoHealthSegment[] => {
    const totalHealthy = members.reduce((sum, m) => sum + m.repoHealthHealthy, 0);
    const totalNeedsAttention = members.reduce((sum, m) => sum + m.repoHealthNeedsAttention, 0);
    const totalCritical = members.reduce((sum, m) => sum + m.repoHealthCritical, 0);

    return [
      {
        label: REPO_HEALTH_SEGMENTS[0].label,
        count: totalHealthy,
        color: REPO_HEALTH_SEGMENTS[0].color,
      },
      {
        label: REPO_HEALTH_SEGMENTS[1].label,
        count: totalNeedsAttention,
        color: REPO_HEALTH_SEGMENTS[1].color,
      },
      {
        label: REPO_HEALTH_SEGMENTS[2].label,
        count: totalCritical,
        color: REPO_HEALTH_SEGMENTS[2].color,
      },
    ];
  }, [members]);

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-8 px-6 pb-8 bg-white text-gray-900 min-h-screen">
        <DashboardSection title="SPOF Owner Distribution">
          <GaugeWithInsights
            value={gaugeValue}
            label={getPerformanceGaugeLabel(gaugeValue)}
            labelColor={getGaugeColor(gaugeValue)}
            valueDisplay={`${gaugeValue}/100`}
            insights={insights}
            className="mb-6"
          />
        </DashboardSection>

        <DashboardSection title="Team Contribution Flow">
          <TeamContributionChart members={members} minPercentage={5} />
        </DashboardSection>

        <DashboardSection title="Repository Health Distribution">
          <RepoHealthBar segments={repoHealthSegments} />
        </DashboardSection>

        <DashboardSection title="Team Members">
          <BaseTeamsTable<MemberSpofRow, SpofMemberFilter>
            rows={members}
            filterTabs={SPOF_MEMBER_FILTER_TABS}
            defaultFilter="highestRisk"
            sortFunction={spofMemberSortFunction}
            columns={SPOF_MEMBER_COLUMNS}
            getRowKey={(row) => row.memberName}
          />
        </DashboardSection>
      </div>
    </TooltipProvider>
  );
}
