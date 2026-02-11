"use client";

import { useMemo } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GaugeWithInsights } from "@/components/dashboard/shared/GaugeWithInsights";
import { SankeyContributionChart } from "@/components/dashboard/shared/SankeyContributionChart";
import { RepoHealthBar, REPO_HEALTH_SEGMENTS, type RepoHealthSegment } from "@/components/dashboard/shared/RepoHealthBar";
import { DashboardSection } from "@/components/dashboard/shared/DashboardSection";
import { ModulesTable } from "@/components/dashboard/repoDashboard/ModulesTable";
import {
  getContributorSpofData,
  calculateRepoSpofGaugeValue,
} from "@/lib/dashboard/entities/contributor/mocks/spofMockData";
import { getSpofInsights } from "@/lib/dashboard/entities/contributor/utils/spofHelpers";
import { buildRepoContributionFlow } from "@/lib/dashboard/entities/contributor/mocks/spofContributionData";
import { CONTRIBUTOR_FALLBACK_COLORS } from "@/lib/dashboard/entities/contributor/utils/contributionFlowHelpers";
import { getGaugeColor, getPerformanceGaugeLabel } from "@/lib/dashboard/entities/team/utils/utils";
import { useRouteParams } from "@/lib/dashboard/shared/contexts/RouteParamsProvider";
import { getRepoModuleSPOFData } from "@/lib/dashboard/entities/repo/mocks/repoModuleMockData";

export function RepoSpofPageClient() {
  const { repoId } = useRouteParams();

  // Data pipeline
  const contributors = useMemo(() => getContributorSpofData(repoId!, 6), [repoId]);

  const modules = useMemo(() => getRepoModuleSPOFData(repoId!), [repoId]);

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

        <DashboardSection title="SPOF Owner Distribution">
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

        <DashboardSection title="Modules">
          <ModulesTable modules={modules} />
        </DashboardSection>
      </div>
    </TooltipProvider>
  );
}
