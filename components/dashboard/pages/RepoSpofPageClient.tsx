"use client";

import { useEffect, useMemo, useState } from "react";
import { Layers, Users } from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SankeyContributionChart } from "@/components/dashboard/shared/SankeyContributionChart";
import { RepoHealthBar, REPO_HEALTH_SEGMENTS, type RepoHealthSegment } from "@/components/dashboard/shared/RepoHealthBar";
import { DashboardSection } from "@/components/dashboard/shared/DashboardSection";
import { CollaborationNetworkGraph } from "@/components/dashboard/teamDashboard/CollaborationNetworkGraph";
import { ChartInsights } from "@/components/dashboard/shared/ChartInsights";
import { ModulesTable } from "@/components/dashboard/repoDashboard/ModulesTable";
import { useRouteParams } from "@/lib/dashboard/shared/contexts/RouteParamsProvider";
import type { ChartInsight } from "@/lib/dashboard/entities/team/types";
import type { SpofRiskLevel } from "@/lib/dashboard/entities/team/data/orgSpofDataLoader";
import type { ModuleSPOFData } from "@/lib/dashboard/entities/user/types";

// Real data loaders
import {
  getRepoSpofData,
  buildRepoSankeyData,
  buildCollaborationNetwork,
  getCollaborationModuleOptions,
  getModuleCapabilities,
  getModuleDescription,
  type RepoSpofData,
  type SankeyFlowData,
  type CollaborationNetworkData,
} from "@/lib/dashboard/entities/repo/data";

// Fallback mock data imports (used when real data not available)
import { getContributorSpofData } from "@/lib/dashboard/entities/contributor/mocks/spofMockData";
import { buildRepoContributionFlow } from "@/lib/dashboard/entities/contributor/mocks/spofContributionData";
import { CONTRIBUTOR_FALLBACK_COLORS } from "@/lib/dashboard/entities/contributor/utils/contributionFlowHelpers";
import { getRepoModuleSPOFData } from "@/lib/dashboard/entities/repo/mocks/repoModuleMockData";
import { getRepoCollaborationData } from "@/lib/dashboard/entities/contributor/charts/collaborationNetwork/collaborationNetworkData";
import { useTimeRange } from "@/lib/dashboard/shared/contexts/TimeRangeContext";

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

  // State for real data
  const [repoData, setRepoData] = useState<RepoSpofData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [useRealData, setUseRealData] = useState(false);

  // State for collaboration network module filter
  const [collaborationModuleFilter, setCollaborationModuleFilter] = useState<string>("");
  const [collaborationInsights, setCollaborationInsights] = useState<ChartInsight[]>([]);

  // State for chart sliders (filter controls)
  const [sankeyMinOwnership, setSankeyMinOwnership] = useState(5); // Default 5%
  const [collaborationThreshold, setCollaborationThreshold] = useState(0.5); // Default 0.5 DOA

  // Load real data on mount
  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setIsLoading(true);
      try {
        const data = await getRepoSpofData(repoId!);
        if (!cancelled && data) {
          // Enrich modules with capabilities from project_map.json
          const enrichedModules = await Promise.all(
            data.modules.map(async (mod) => {
              const [capabilities, description] = await Promise.all([
                getModuleCapabilities(repoId!, mod.name),
                getModuleDescription(repoId!, mod.name),
              ]);
              return {
                ...mod,
                capabilities: capabilities.length > 0 ? capabilities : undefined,
                description: description || mod.description,
              };
            })
          );

          setRepoData({
            ...data,
            modules: enrichedModules,
          });
          setUseRealData(true);
        } else if (!cancelled) {
          setRepoData(data);
          setUseRealData(data !== null);
        }
      } catch (error) {
        console.warn("Failed to load real SPOF data, falling back to mock:", error);
        if (!cancelled) {
          setUseRealData(false);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [repoId]);

  // ---------------------------------------------------------------------------
  // Real Data Path
  // ---------------------------------------------------------------------------

  // Sankey flow data from real data
  const realSankeyData = useMemo((): SankeyFlowData | null => {
    if (!repoData) return null;
    return buildRepoSankeyData(repoData.moduleStats, repoData.busFactorResults, sankeyMinOwnership);
  }, [repoData, sankeyMinOwnership]);

  // Collaboration network data from real data
  // The collaborationThreshold filters which file-contributor relationships are included
  // (a contributor is only counted on a file if their normalizedDOA >= threshold)
  const realCollaborationData = useMemo((): CollaborationNetworkData | null => {
    if (!repoData) return null;
    return buildCollaborationNetwork(
      repoData.busFactorResults,
      collaborationModuleFilter || undefined,
      collaborationThreshold, // DOA threshold for file-contributor relationships
      1
    );
  }, [repoData, collaborationModuleFilter, collaborationThreshold]);

  // Module filter options for collaboration network
  const collaborationModuleOptions = useMemo(() => {
    if (!repoData) return [];
    return getCollaborationModuleOptions(repoData.busFactorResults);
  }, [repoData]);

  // Memoized collaboration data for the graph component (prevents infinite re-renders)
  const collaborationGraphData = useMemo(() => {
    if (!realCollaborationData) return undefined;
    return {
      id: `${repoId}-collab`,
      name: collaborationModuleFilter || "Repository",
      nodes: realCollaborationData.nodes.map((n) => ({
        id: n.id,
        label: n.name,
        doaNormalized: n.normalizedTotalDOA,
      })),
      edges: realCollaborationData.edges.map((e) => ({
        source: e.source,
        target: e.target,
        spofScore: e.normalizedWeight,
        collaborationStrength: e.weight,
      })),
    };
  }, [repoId, collaborationModuleFilter, realCollaborationData]);

  // ---------------------------------------------------------------------------
  // Fallback Mock Data Path (used when real data not available)
  // ---------------------------------------------------------------------------

  const contributors = useMemo(
    () => (useRealData ? [] : getContributorSpofData(repoId!, 6)),
    [repoId, useRealData]
  );

  const mockModules = useMemo(
    () => (useRealData ? [] : getRepoModuleSPOFData(repoId!)),
    [repoId, useRealData]
  );

  const contributorNames = useMemo(
    () => contributors.map((c) => c.contributorName),
    [contributors]
  );

  const mockCollaborationData = useMemo(
    () => (useRealData ? null : getRepoCollaborationData(repoId!, contributorNames, timeRange)),
    [repoId, contributorNames, timeRange, useRealData]
  );

  const mockContributionFlow = useMemo(
    () => (useRealData ? { nodes: [], links: [] } : buildRepoContributionFlow(contributors, 5)),
    [contributors, useRealData]
  );

  const mockContributorColorMap = useMemo(() => {
    return new Map(
      contributors.map((contributor, index) => [
        contributor.contributorName,
        contributor.contributorColor ?? CONTRIBUTOR_FALLBACK_COLORS[index % CONTRIBUTOR_FALLBACK_COLORS.length],
      ])
    );
  }, [contributors]);

  // ---------------------------------------------------------------------------
  // Derived Values (works for both real and mock data)
  // ---------------------------------------------------------------------------

  // Health segments
  const repoHealthSegments = useMemo((): RepoHealthSegment[] => {
    if (useRealData && repoData) {
      const { healthy, needsAttention, critical } = repoData.totals.healthDistribution;
      return [
        { label: REPO_HEALTH_SEGMENTS[0].label, count: healthy, color: REPO_HEALTH_SEGMENTS[0].color },
        { label: REPO_HEALTH_SEGMENTS[1].label, count: needsAttention, color: REPO_HEALTH_SEGMENTS[1].color },
        { label: REPO_HEALTH_SEGMENTS[2].label, count: critical, color: REPO_HEALTH_SEGMENTS[2].color },
      ];
    }

    // Mock data fallback
    const totalHealthy = contributors.reduce((sum, c) => sum + c.repoHealthHealthy, 0);
    const totalNeedsAttention = contributors.reduce((sum, c) => sum + c.repoHealthNeedsAttention, 0);
    const totalCritical = contributors.reduce((sum, c) => sum + c.repoHealthCritical, 0);

    return [
      { label: REPO_HEALTH_SEGMENTS[0].label, count: totalHealthy, color: REPO_HEALTH_SEGMENTS[0].color },
      { label: REPO_HEALTH_SEGMENTS[1].label, count: totalNeedsAttention, color: REPO_HEALTH_SEGMENTS[1].color },
      { label: REPO_HEALTH_SEGMENTS[2].label, count: totalCritical, color: REPO_HEALTH_SEGMENTS[2].color },
    ];
  }, [useRealData, repoData, contributors]);

  // SPOF risk level
  const spofRiskLevel = useMemo((): SpofRiskLevel => {
    if (useRealData && repoData) {
      return repoData.riskLevel;
    }
    const total = repoHealthSegments.reduce((s, seg) => s + seg.count, 0);
    if (total === 0) return "Low";
    const atRisk = ((repoHealthSegments[1].count + repoHealthSegments[2].count) / total) * 100;
    if (atRisk > 50) return "Severe";
    if (atRisk >= 30) return "High";
    if (atRisk >= 15) return "Medium";
    return "Low";
  }, [useRealData, repoData, repoHealthSegments]);

  // At-risk percentage
  const atRiskPercent = useMemo(() => {
    if (useRealData && repoData) {
      return repoData.atRiskPercent;
    }
    const total = repoHealthSegments.reduce((s, seg) => s + seg.count, 0);
    if (total === 0) return 0;
    return Math.round(((repoHealthSegments[1].count + repoHealthSegments[2].count) / total) * 100);
  }, [useRealData, repoData, repoHealthSegments]);

  // SPOF module count
  const spofModuleCount = useMemo(() => {
    if (useRealData && repoData) {
      return repoData.totals.spofModuleCount;
    }
    return contributors.reduce((sum, c) => sum + c.highRiskCount, 0);
  }, [useRealData, repoData, contributors]);

  // Unique SPOF owner count
  const uniqueSpofOwnerCount = useMemo(() => {
    if (useRealData && repoData) {
      return repoData.totals.uniqueSpofOwnerCount;
    }
    return contributors.filter((c) => c.highRiskCount > 0).length;
  }, [useRealData, repoData, contributors]);

  // Modules for the table
  const modules: ModuleSPOFData[] = useMemo(() => {
    if (useRealData && repoData) {
      return repoData.modules;
    }
    return mockModules;
  }, [useRealData, repoData, mockModules]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-8 px-6 pb-8 bg-white text-gray-900 min-h-screen">
        {/* 3-column layout: Risk Indicator → Motivation → Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* SPOF Risk Indicator Card */}
          <div className="rounded-[10px] p-6 flex flex-col justify-center">
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

          {/* Stats Card */}
          <div className="rounded-[10px] p-6 flex flex-col justify-center">
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
        </div>

        <DashboardSection title="SPOF Owner Distribution">
          {/* Min ownership slider for real data */}
          {useRealData && (
            <div className="mb-4 flex items-center gap-4">
              <label className="text-sm text-gray-600 whitespace-nowrap">
                Min Ownership:
              </label>
              <input
                type="range"
                min={0}
                max={20}
                step={1}
                value={sankeyMinOwnership}
                onChange={(e) => setSankeyMinOwnership(Number(e.target.value))}
                className="w-48 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <span className="text-sm font-medium text-gray-700 w-12">
                {sankeyMinOwnership}%
              </span>
            </div>
          )}
          {useRealData && realSankeyData ? (
            <SankeyContributionChart
              flow={{
                nodes: realSankeyData.nodes.map((n) => ({
                  id: n.id,
                  label: n.label,
                  side: n.side,
                  value: n.value,
                  health: n.health,
                })),
                links: realSankeyData.links.map((l) => ({
                  source: l.source,
                  target: l.target,
                  value: l.value,
                  percentage: l.percentage,
                })),
              }}
              colorMap={new Map()}
              sourceLabel="Contributor"
              targetLabel="Module"
            />
          ) : (
            <SankeyContributionChart
              flow={mockContributionFlow}
              colorMap={mockContributorColorMap}
              sourceLabel="Contributor"
              targetLabel="Module"
            />
          )}
        </DashboardSection>

        <DashboardSection title="Collaboration Network" className="w-full">
          {/* Controls row: module filter + SPOF score slider */}
          {useRealData && (
            <div className="mb-4 flex flex-wrap items-center gap-6">
              {/* Module filter dropdown */}
              {collaborationModuleOptions.length > 1 && (
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Module:</label>
                  <select
                    value={collaborationModuleFilter}
                    onChange={(e) => setCollaborationModuleFilter(e.target.value)}
                    className="text-sm border border-gray-300 rounded-md px-3 py-1.5 bg-white"
                  >
                    {collaborationModuleOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {/* SPOF score threshold slider */}
              <div className="flex items-center gap-4">
                <label className="text-sm text-gray-600 whitespace-nowrap">
                  SPOF Score:
                </label>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={collaborationThreshold}
                  onChange={(e) => setCollaborationThreshold(Number(e.target.value))}
                  className="w-48 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <span className="text-sm font-medium text-gray-700 w-12">
                  {collaborationThreshold.toFixed(2)}
                </span>
              </div>
            </div>
          )}
          <div className="flex flex-row flex-wrap items-stretch gap-8">
            <div className="flex-[1.5] min-w-[400px]">
              {useRealData && collaborationGraphData ? (
                <CollaborationNetworkGraph
                  data={collaborationGraphData}
                  onInsightsChange={setCollaborationInsights}
                  threshold={0} // Filtering already done at build time via collaborationThreshold
                  layout="spring"
                />
              ) : (
                <CollaborationNetworkGraph
                  data={mockCollaborationData ?? undefined}
                  onInsightsChange={setCollaborationInsights}
                  threshold={collaborationThreshold}
                  layout="spring"
                />
              )}
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
