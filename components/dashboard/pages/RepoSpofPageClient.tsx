"use client";

import { useMemo, useState } from "react";
import { Layers, Users } from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SankeyContributionChart } from "@/components/dashboard/shared/SankeyContributionChart";
import { RepoHealthBar, REPO_HEALTH_SEGMENTS, type RepoHealthSegment } from "@/components/dashboard/shared/RepoHealthBar";
import { DashboardSection } from "@/components/dashboard/shared/DashboardSection";
import { CollaborationNetworkGraph } from "@/components/dashboard/teamDashboard/CollaborationNetworkGraph";
import { ChartInsights } from "@/components/dashboard/shared/ChartInsights";
import { ModulesTable } from "@/components/dashboard/repoDashboard/ModulesTable";
import {
  getContributorSpofData,
} from "@/lib/dashboard/entities/contributor/mocks/spofMockData";
import { buildRepoContributionFlow } from "@/lib/dashboard/entities/contributor/mocks/spofContributionData";
import { CONTRIBUTOR_FALLBACK_COLORS } from "@/lib/dashboard/entities/contributor/utils/contributionFlowHelpers";
import { useRouteParams } from "@/lib/dashboard/shared/contexts/RouteParamsProvider";
import { useTimeRange } from "@/lib/dashboard/shared/contexts/TimeRangeContext";
import { getRepoModuleSPOFData } from "@/lib/dashboard/entities/repo/mocks/repoModuleMockData";
import { getRepoCollaborationData } from "@/lib/dashboard/entities/contributor/charts/collaborationNetwork/collaborationNetworkData";
import type { ChartInsight } from "@/lib/dashboard/entities/team/types";
import type { SpofRiskLevel } from "@/lib/dashboard/entities/team/data/orgSpofDataLoader";

// ---------------------------------------------------------------------------
// SPOF Risk Level Colors (same as Org SPOF page)
// ---------------------------------------------------------------------------

const RISK_LEVEL_COLORS: Record<SpofRiskLevel, string> = {
  Severe: "text-red-600",
  High: "text-orange-500",
  Medium: "text-amber-500",
  Low: "text-green-600",
};

const RISK_LEVELS: SpofRiskLevel[] = ["Severe", "High", "Medium", "Low"];

export function RepoSpofPageClient() {
  const { repoId } = useRouteParams();
  const { timeRange } = useTimeRange();

  // State
  const [collaborationInsights, setCollaborationInsights] = useState<ChartInsight[]>([]);

  // Data pipeline
  const contributors = useMemo(() => getContributorSpofData(repoId!, 6), [repoId]);

  const modules = useMemo(() => getRepoModuleSPOFData(repoId!), [repoId]);

  const contributorNames = useMemo(() => contributors.map((c) => c.contributorName), [contributors]);
  const collaborationData = useMemo(
    () => getRepoCollaborationData(repoId!, contributorNames, timeRange),
    [repoId, contributorNames, timeRange]
  );

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

  // Derive SPOF risk level from health segments
  const spofRiskLevel = useMemo((): SpofRiskLevel => {
    const total = repoHealthSegments.reduce((s, seg) => s + seg.count, 0);
    if (total === 0) return "Low";
    const atRiskPercent = ((repoHealthSegments[1].count + repoHealthSegments[2].count) / total) * 100;
    if (atRiskPercent > 50) return "Severe";
    if (atRiskPercent >= 30) return "High";
    if (atRiskPercent >= 15) return "Medium";
    return "Low";
  }, [repoHealthSegments]);

  // Derive at-risk percentage for display
  const atRiskPercent = useMemo(() => {
    const total = repoHealthSegments.reduce((s, seg) => s + seg.count, 0);
    if (total === 0) return 0;
    return Math.round(((repoHealthSegments[1].count + repoHealthSegments[2].count) / total) * 100);
  }, [repoHealthSegments]);

  // Derive SPOF module count and unique SPOF owner count
  const spofModuleCount = useMemo(
    () => contributors.reduce((sum, c) => sum + c.highRiskCount, 0),
    [contributors]
  );
  const uniqueSpofOwnerCount = useMemo(
    () => contributors.filter(c => c.highRiskCount > 0).length,
    [contributors]
  );

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-8 px-6 pb-8 bg-white text-gray-900 min-h-screen">
        {/* 3-column layout: Risk Indicator → Motivation → Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* SPOF Risk Indicator Card */}
          <div className="rounded-[10px] bg-[#F6F5FA] p-6 flex flex-col justify-center">
            <p className="text-sm text-gray-500 mb-3">SPOF Risk is:</p>

            {/* Large risk level display */}
            <div className="flex items-baseline gap-2 mb-4">
              <span className={`text-4xl font-bold ${RISK_LEVEL_COLORS[spofRiskLevel]}`}>
                {spofRiskLevel}
              </span>
              <span className="text-sm text-gray-500">
                ({atRiskPercent}% at-risk)
              </span>
            </div>

            {/* Risk spectrum bar */}
            <div className="flex h-2 w-full rounded-full overflow-hidden mb-2">
              <div className="h-full bg-red-500" style={{ width: "25%" }} />
              <div className="h-full bg-orange-400" style={{ width: "25%" }} />
              <div className="h-full bg-amber-400" style={{ width: "25%" }} />
              <div className="h-full bg-green-500" style={{ width: "25%" }} />
            </div>

            {/* Risk level labels */}
            <div className="flex justify-between text-xs">
              {RISK_LEVELS.map((level) => (
                <span
                  key={level}
                  className={level === spofRiskLevel ? "font-bold text-gray-700" : "text-gray-400"}
                >
                  {level}
                </span>
              ))}
            </div>
          </div>

          {/* Motivation Card */}
          <div className="rounded-[10px] p-6 flex flex-col justify-center">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Why It Matters
            </p>
            <p className="text-sm text-gray-700 mb-4">
              Identifies irreplaceable developers whose departure would put critical code at risk.
            </p>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              How It&apos;s Calculated
            </p>
            <p className="text-sm text-gray-700">
              Analyzes file creation (First Authorship), commit history (Deliveries), and knowledge
              distribution (Acceptances). Modules where 1-2 developers hold dominant ownership are
              flagged as at-risk.
            </p>
          </div>

          {/* Stats Card */}
          <div className="rounded-[10px] bg-[#F6F5FA] p-6 flex flex-col justify-center">
            {/* Stat cards — left aligned */}
            <div className="flex items-center gap-6 mb-4">
              {/* SPOF by Module */}
              <div className="flex items-center gap-3">
                <Layers className="size-5 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">SPOF by Module</p>
                  <p className="text-xl font-bold text-gray-900">
                    {spofModuleCount}
                  </p>
                </div>
              </div>

              {/* Vertical separator */}
              <div className="h-12 w-px bg-gray-300" />

              {/* Unique SPOF Owner */}
              <div className="flex items-center gap-3">
                <Users className="size-5 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Unique SPOF Owner</p>
                  <p className="text-xl font-bold text-gray-900">
                    {uniqueSpofOwnerCount}
                  </p>
                </div>
              </div>
            </div>

            {/* Repo health bar */}
            <RepoHealthBar segments={repoHealthSegments} />
          </div>
        </div>

        <DashboardSection title="SPOF Owner Distribution">
          <SankeyContributionChart
            flow={contributionFlow}
            colorMap={contributorColorMap}
            sourceLabel="Contributor"
            targetLabel="Module"
          />
        </DashboardSection>

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

        <DashboardSection title="Modules">
          <ModulesTable modules={modules} />
        </DashboardSection>
      </div>
    </TooltipProvider>
  );
}
