"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DashboardSection } from "@/components/dashboard/shared/DashboardSection";
import { GaugeSection } from "@/components/dashboard/shared/GaugeSection";
import { PerformanceChart } from "@/components/dashboard/shared/PerformanceChart";
import { OverviewOutliersSection } from "@/components/dashboard/shared/OverviewOutliersSection";
import { OverviewSpofSummary } from "@/components/dashboard/shared/OverviewSpofSummary";
import { OverviewSkillsSummary } from "@/components/dashboard/shared/OverviewSkillsSummary";
import { useRouteParams } from "@/lib/dashboard/shared/contexts/RouteParamsProvider";
import { loadSkillGraphFullData, type SkillGraphFullData } from "@/components/skillmap/skillGraphDataLoader";
import { transformToTableData } from "@/components/skillmap/skillGraphTableTransform";
import type { SkillsRoadmapProgressData } from "@/lib/dashboard/entities/roadmap/types";
import { getPerformanceGaugeLabel } from "@/lib/dashboard/entities/team/utils/utils";
import { useRepoPerformanceData } from "@/lib/dashboard/entities/contributor/hooks/useRepoPerformanceData";
import { getContributorOutliersData } from "@/lib/dashboard/entities/contributor/mocks/outliersMockData";
import { generateOutlierTrend } from "@/lib/dashboard/entities/team/mocks/outliersMockData";
import { getRepoSpofData, type RepoSpofData } from "@/lib/dashboard/entities/repo/data";
import { getRepoGaugeValue } from "@/lib/dashboard/entities/repo/data/repoPerformanceDataLoader";
import { REPO_HEALTH_SEGMENTS, type RepoHealthSegment } from "@/components/dashboard/shared/RepoHealthBar";
import type { SpofRiskLevel } from "@/lib/dashboard/entities/team/data/orgSpofDataLoader";
import {
  generateRepoEvents,
  generateRepoAnnotations,
} from "@/lib/dashboard/shared/charts/performanceChart/eventGenerators";

const CARD_CLASS = "rounded-lg border border-gray-200 bg-white p-5";

function ViewDetailsButton({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
    >
      View details <ArrowRight className="size-3.5" />
    </Link>
  );
}

function progressColor(progress: string) {
  if (progress === "healthy") return "text-green-600";
  return "text-amber-600";
}

function perfLabelColor(label: string) {
  if (label.startsWith("Extreme Outperforming")) return "text-emerald-600";
  if (label === "Outperforming") return "text-green-600";
  if (label === "Flat") return "text-slate-500";
  if (label === "Underperforming") return "text-amber-600";
  if (label.startsWith("Extreme Underperforming")) return "text-red-600";
  return "text-gray-900";
}

function riskColor(risk: string) {
  if (risk === "Low") return "text-green-600";
  if (risk === "Medium") return "text-amber-600";
  if (risk === "High") return "text-orange-500";
  return "text-red-600";
}

function dirColor(dir: string) {
  return dir === "down" ? "text-green-600" : "text-red-600";
}

function SectionTitle({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="hover:text-blue-600 transition-colors">
      {children}
    </Link>
  );
}

export function RepoOverviewPageClient() {
  const { repoId, getRepoUrl } = useRouteParams();
  const [skillData, setSkillData] = useState<SkillsRoadmapProgressData[] | null>(null);

  useEffect(() => {
    loadSkillGraphFullData()
      .then((full: SkillGraphFullData) => {
        const table = transformToTableData(full.raw);
        setSkillData(table.skillBased);
      })
      .catch(console.error);
  }, []);

  // Performance data — chart stays mock (no time-series), gauge overridden with real churn value
  const { timeFilteredData, repoPerformanceValue: mockGauge } = useRepoPerformanceData(repoId!, "max");
  const repoPerformanceValue = getRepoGaugeValue(repoId!) ?? mockGauge;

  // Outliers data — classify by ownership percentage
  const contributorOutliers = useMemo(() => getContributorOutliersData(repoId!, 6), [repoId]);

  const criticalContributors = useMemo(
    () => contributorOutliers.filter((c) => c.ownershipPct < 8),
    [contributorOutliers]
  );

  const needsAttentionContributors = useMemo(
    () => contributorOutliers.filter((c) => c.ownershipPct > 20),
    [contributorOutliers]
  );

  const outliersTrend = useMemo(
    () => generateOutlierTrend(criticalContributors.length, needsAttentionContributors.length),
    [criticalContributors.length, needsAttentionContributors.length]
  );

  // SPOF data — loaded from real git_analysis.json
  const [spofData, setSpofData] = useState<RepoSpofData | null>(null);

  useEffect(() => {
    let cancelled = false;
    getRepoSpofData(repoId!).then((data) => {
      if (!cancelled) setSpofData(data);
    });
    return () => { cancelled = true; };
  }, [repoId]);

  const repoHealthSegments = useMemo((): RepoHealthSegment[] => {
    const dist = spofData?.totals.healthDistribution;
    return [
      { label: REPO_HEALTH_SEGMENTS[0].label, count: dist?.healthy ?? 0, color: REPO_HEALTH_SEGMENTS[0].color },
      { label: REPO_HEALTH_SEGMENTS[1].label, count: dist?.needsAttention ?? 0, color: REPO_HEALTH_SEGMENTS[1].color },
      { label: REPO_HEALTH_SEGMENTS[2].label, count: dist?.critical ?? 0, color: REPO_HEALTH_SEGMENTS[2].color },
    ];
  }, [spofData]);

  const spofRiskLevel: SpofRiskLevel = spofData?.riskLevel ?? "Low";
  const spofAtRiskPercent = spofData?.atRiskPercent ?? 0;
  const spofModuleCount = spofData?.totals.spofModuleCount ?? 0;
  const uniqueSpofOwnerCount = spofData?.totals.uniqueSpofOwnerCount ?? 0;

  // Status snapshot
  const snapshot = useMemo(() => {
    const perfLabel = getPerformanceGaugeLabel(repoPerformanceValue);
    const progress = repoPerformanceValue >= 45 ? "healthy" : "needs improvement";
    const riskDelta = 5;
    const riskDir = riskDelta > 0 ? "down" : "up";
    return { perfLabel, progress, riskDir, riskDelta };
  }, [repoPerformanceValue]);

  return (
    <div className="flex flex-col gap-8 px-6 pb-8 min-h-screen bg-white text-gray-900">
      {/* Status Snapshot Banner */}
      <div className="rounded-lg border border-gray-200 bg-white px-5 py-3.5">
        <p className="text-2xl font-semibold text-foreground mb-1">Status Snapshot</p>
        <p className="text-sm leading-relaxed text-gray-600">
          Repository performance{" "}
          <span className={`font-semibold ${progressColor(snapshot.progress)}`}>{snapshot.progress}</span>{" "}
          (<span className={`font-medium ${perfLabelColor(snapshot.perfLabel)}`}>{snapshot.perfLabel}</span>), SPOF risk{" "}
          <span className={`font-semibold ${riskColor(spofRiskLevel)}`}>{spofRiskLevel}</span>{" "}
          — <span className={`font-semibold ${dirColor(snapshot.riskDir)}`}>{snapshot.riskDir} {snapshot.riskDelta}%</span>{" "}
          from last month ({spofAtRiskPercent}% at-risk),{" "}
          <span className="font-semibold text-red-600">{criticalContributors.length} critical outliers</span> detected.
        </p>
      </div>

      {/* Performance Section */}
      <DashboardSection
        className={CARD_CLASS}
        title={<SectionTitle href={getRepoUrl(repoId!, "performance")}>Performance</SectionTitle>}
        action={<ViewDetailsButton href={getRepoUrl(repoId!, "performance")} />}
        actionLayout="row"
      >
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="shrink-0 lg:w-1/3 flex flex-col items-center justify-center">
            <GaugeSection gaugeValue={repoPerformanceValue} labelVariant="performance" />
          </div>
          <div className="flex-1 min-w-0">
            <PerformanceChart
              dataSource={{ type: "repo", data: timeFilteredData, repoId: repoId! }}
              eventStrategy={{ mode: "dynamic", generator: generateRepoEvents }}
              annotationStrategy={{ mode: "dynamic", generator: generateRepoAnnotations }}
              timeRange="max"
              showLegend={false}
              height={280}
            />
          </div>
        </div>
      </DashboardSection>

      {/* 2-column grid: Outliers | SPOF */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <DashboardSection
          className={`${CARD_CLASS} h-full flex flex-col`}
          title={<SectionTitle href={getRepoUrl(repoId!, "outliers")}>Outliers</SectionTitle>}
          action={<ViewDetailsButton href={getRepoUrl(repoId!, "outliers")} />}
          actionLayout="row"
        >
          <OverviewOutliersSection
            criticalCount={criticalContributors.length}
            needsAttentionCount={needsAttentionContributors.length}
            criticalLabel="Ownership lower than expected"
            needsAttentionLabel="Ownership higher than expected"
            trend={outliersTrend}
          />
        </DashboardSection>

        <DashboardSection
          className={`${CARD_CLASS} h-full flex flex-col`}
          title={<SectionTitle href={getRepoUrl(repoId!, "spof")}>SPOF</SectionTitle>}
          action={<ViewDetailsButton href={getRepoUrl(repoId!, "spof")} />}
          actionLayout="row"
        >
          <OverviewSpofSummary
            riskLevel={spofRiskLevel}
            atRiskPercent={spofAtRiskPercent}
            spofModuleCount={spofModuleCount}
            uniqueSpofOwnerCount={uniqueSpofOwnerCount}
            healthSegments={repoHealthSegments}
          />
        </DashboardSection>
      </div>

      {/* Skills Graph — half width, left-aligned */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <DashboardSection
          className={CARD_CLASS}
          title={<SectionTitle href={getRepoUrl(repoId!, "skillgraph")}>Skills Graph</SectionTitle>}
          action={<ViewDetailsButton href={getRepoUrl(repoId!, "skillgraph")} />}
          actionLayout="row"
        >
          <OverviewSkillsSummary skillData={skillData} />
        </DashboardSection>
      </div>
    </div>
  );
}
