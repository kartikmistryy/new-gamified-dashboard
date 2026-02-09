"use client";

import { useMemo } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GaugeWithInsights } from "@/components/dashboard/GaugeWithInsights";
import { SankeyContributionChart } from "@/components/dashboard/SankeyContributionChart";
import { RepoHealthBar, REPO_HEALTH_SEGMENTS, type RepoHealthSegment } from "@/components/dashboard/RepoHealthBar";
import { BaseTeamsTable, type BaseTeamsTableColumn } from "@/components/dashboard/BaseTeamsTable";
import { DashboardSection } from "@/components/dashboard/DashboardSection";
import { UserAvatar } from "@/components/shared/UserAvatar";
import {
  getContributorSpofData,
  calculateRepoSpofGaugeValue,
  type ContributorSpofRow,
} from "@/lib/repoDashboard/spofMockData";
import {
  SPOF_CONTRIBUTOR_FILTER_TABS,
  spofContributorSortFunction,
  getSpofInsights,
  type SpofContributorFilter,
} from "@/lib/repoDashboard/spofHelpers";
import { buildRepoContributionFlow } from "@/lib/repoDashboard/spofContributionData";
import { CONTRIBUTOR_FALLBACK_COLORS } from "@/lib/repoDashboard/contributionFlowHelpers";
import { getGaugeColor, getPerformanceGaugeLabel } from "@/lib/orgDashboard/utils";
import { DASHBOARD_TEXT_CLASSES } from "@/lib/orgDashboard/colors";
import { useRouteParams } from "@/lib/RouteParamsProvider";

// SPOF contributor table columns
const SPOF_CONTRIBUTOR_COLUMNS: BaseTeamsTableColumn<ContributorSpofRow, SpofContributorFilter>[] = [
  {
    key: "rank",
    header: "Rank",
    className: "w-14",
    enableSorting: false,
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
    key: "contributor",
    header: "Contributor",
    enableSorting: false,
    render: (row) => (
      <div className="flex items-center gap-3">
        <UserAvatar userName={row.contributorName} className="size-4" size={16} />
        <p className="font-medium text-gray-900">{row.contributorName}</p>
      </div>
    ),
  },
  {
    key: "ownershipPct",
    header: "% of Ownership",
    className: "text-right",
    enableSorting: true,
    accessorFn: (row) => row.ownershipPct,
    render: (row) => <span className="text-gray-700">{Math.round(row.ownershipPct)}%</span>,
  },
  {
    key: "ownedModules",
    header: "Owned Modules",
    className: "text-right",
    enableSorting: true,
    accessorFn: (row) => row.ownedModules,
    render: (row) => <span className="text-gray-700">{row.ownedModules}</span>,
  },
];

export function RepoSpofPageClient() {
  const { repoId } = useRouteParams();

  // Data pipeline
  const contributors = useMemo(() => getContributorSpofData(repoId!, 6), [repoId]);

  const gaugeValue = useMemo(() => calculateRepoSpofGaugeValue(contributors), [contributors]);

  const insights = useMemo(() => getSpofInsights(contributors), [contributors]);

  // Build contribution flow data
  const contributionFlow = useMemo(
    () => buildRepoContributionFlow(contributors, 5),
    [contributors]
  );

  const contributorColorMap = useMemo(() => {
    return new Map(
      contributors.map((contributor, index) => [
        contributor.contributorName,
        contributor.contributorColor ?? CONTRIBUTOR_FALLBACK_COLORS[index % CONTRIBUTOR_FALLBACK_COLORS.length],
      ])
    );
  }, [contributors]);

  // Calculate repo health segments for RepoHealthBar
  const repoHealthSegments = useMemo((): RepoHealthSegment[] => {
    const totalHealthy = contributors.reduce((sum, c) => sum + c.repoHealthHealthy, 0);
    const totalNeedsAttention = contributors.reduce((sum, c) => sum + c.repoHealthNeedsAttention, 0);
    const totalCritical = contributors.reduce((sum, c) => sum + c.repoHealthCritical, 0);

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
  }, [contributors]);

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

        <DashboardSection title="Repository Contribution Flow">
          <SankeyContributionChart
            flow={contributionFlow}
            colorMap={contributorColorMap}
            sourceLabel="Contributor"
            targetLabel="Module"
          />
        </DashboardSection>

        <DashboardSection title="Repository Health Distribution">
          <RepoHealthBar segments={repoHealthSegments} />
        </DashboardSection>

        <DashboardSection title="Repository Contributors">
          <BaseTeamsTable<ContributorSpofRow, SpofContributorFilter>
            rows={contributors}
            filterTabs={SPOF_CONTRIBUTOR_FILTER_TABS}
            defaultFilter="highestRisk"
            sortFunction={spofContributorSortFunction}
            columns={SPOF_CONTRIBUTOR_COLUMNS}
            getRowKey={(row) => row.contributorName}
          />
        </DashboardSection>
      </div>
    </TooltipProvider>
  );
}
