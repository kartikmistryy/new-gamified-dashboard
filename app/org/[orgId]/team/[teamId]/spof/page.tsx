"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { TooltipProvider } from "@/components/ui/tooltip";
import { D3Gauge } from "@/components/dashboard/D3Gauge";
import { SpofDistributionChart } from "@/components/dashboard/SpofDistributionChart";
import { RepoHealthBar, REPO_HEALTH_SEGMENTS, type RepoHealthSegment } from "@/components/dashboard/RepoHealthBar";
import { BaseTeamsTable, type BaseTeamsTableColumn } from "@/components/dashboard/BaseTeamsTable";
import { DashboardSection } from "@/components/dashboard/DashboardSection";
import { ChartInsights } from "@/components/dashboard/ChartInsights";
import { TeamAvatar } from "@/components/shared/TeamAvatar";
import {
  getMemberSpofData,
  getMemberSpofDataPoints,
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
        <div className="relative">
          <TeamAvatar teamName={row.memberName} className="size-4" />
          {/* Color indicator dot */}
          <div
            className="absolute -bottom-0.5 -right-0.5 size-2 rounded-full border border-white"
            style={{ backgroundColor: row.memberColor }}
          />
        </div>
        <p className="font-medium text-gray-900">{row.memberName}</p>
      </div>
    ),
  },
  {
    key: "spofScore",
    header: "SPOF Score",
    className: "text-right",
    render: (row) => {
      const score = row.avgSpofScore;
      const color =
        score < 1.5 ? "#55B685" : score < 3.0 ? "#E9A23B" : "#CA3A31";
      return (
        <span className="font-medium" style={{ color }}>
          {score.toFixed(1)}
        </span>
      );
    },
  },
  {
    key: "repos",
    header: "Repos",
    className: "text-right",
    render: (row) => <span className="text-gray-700">{row.repoCount}</span>,
  },
  {
    key: "highRisk",
    header: "High Risk",
    className: "text-right",
    render: (row) => (
      <span className="font-medium text-[#CA3A31]">{row.highRiskCount}</span>
    ),
  },
  {
    key: "repoHealth",
    header: "Repo Health",
    className: "w-48",
    render: (row) => {
      const total = row.repoCount;
      const segments = [
        {
          width: (row.repoHealthHealthy / total) * 100,
          color: "#22c55e",
        },
        {
          width: (row.repoHealthNeedsAttention / total) * 100,
          color: "#f59e0b",
        },
        {
          width: (row.repoHealthCritical / total) * 100,
          color: "#ef4444",
        },
      ];

      return (
        <div className="flex h-2 w-full overflow-hidden rounded-full bg-gray-100">
          {segments.map((segment, index) => (
            <div
              key={index}
              className="h-full"
              style={{
                width: `${segment.width}%`,
                backgroundColor: segment.color,
              }}
            />
          ))}
        </div>
      );
    },
  },
];

export default function TeamSpofPage() {
  const params = useParams();
  const teamId = params.teamId as string;

  // Data pipeline
  const members = useMemo(() => getMemberSpofData(teamId, 6), [teamId]);

  const spofDataPoints = useMemo(() => getMemberSpofDataPoints(members), [members]);

  const gaugeValue = useMemo(() => calculateTeamSpofGaugeValue(members), [members]);

  const insights = useMemo(() => getSpofInsights(members), [members]);

  // Derive visible members - all visible by default
  const visibleMembers = useMemo(() => {
    const init: Record<string, boolean> = {};
    for (const member of members) {
      init[member.memberName] = true;
    }
    return init;
  }, [members]);

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
          <div className="flex flex-row flex-wrap items-stretch gap-8 mb-6">
            <div className="flex shrink-0 min-w-[280px] max-w-[50%]">
              <D3Gauge
                value={gaugeValue}
                label={getPerformanceGaugeLabel(gaugeValue)}
                labelColor={getGaugeColor(gaugeValue)}
                valueDisplay={`${gaugeValue}/100`}
              />
            </div>
            <div className="flex-1 min-w-[280px]">
              <ChartInsights insights={insights} />
            </div>
          </div>
          <div className="bg-white rounded-lg">
            <SpofDistributionChart
              data={spofDataPoints}
              visibleTeams={visibleMembers}
              showNormalFit
            />
          </div>
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
