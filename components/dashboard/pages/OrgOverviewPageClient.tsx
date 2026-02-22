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
import {
  generateOrgPerformanceData,
} from "@/lib/dashboard/entities/team/charts/performanceChart/orgPerformanceChartData";
import { ORG_TIMESERIES_DATA, ORG_TIMESERIES_READY } from "@/lib/dashboard/entities/team/data/orgTimeseriesDataLoader";
import {
  loadSkillGraphFullData,
  type SkillGraphFullData,
} from "@/components/skillmap/skillGraphDataLoader";
import { transformToTableData } from "@/components/skillmap/skillGraphTableTransform";
import type { SkillsRoadmapProgressData } from "@/lib/dashboard/entities/roadmap/types";
import { getPerformanceGaugeLabel } from "@/lib/dashboard/entities/team/utils/utils";
import { ORG_PERFORMANCE_GAUGE_VALUE } from "@/lib/dashboard/entities/team/data/orgPerformanceDataLoader";
import { ORG_SPOF_RISK_LEVEL, ORG_SPOF_TOTALS, ORG_HEALTH_SEGMENTS } from "@/lib/dashboard/entities/team/data/orgSpofDataLoader";
import { getDevelopersByOwnership, generateOutlierTrend } from "@/lib/dashboard/entities/team/mocks/outliersMockData";

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
  return "text-red-600"; // Severe
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

export function OrgOverviewPageClient() {
  const { getOrgUrl } = useRouteParams();
  const [skillData, setSkillData] = useState<SkillsRoadmapProgressData[] | null>(null);

  useEffect(() => {
    loadSkillGraphFullData()
      .then((full: SkillGraphFullData) => {
        const table = transformToTableData(full.raw);
        setSkillData(table.skillBased);
      })
      .catch(console.error);
  }, []);

  const snapshot = useMemo(() => {
    const perfLabel = getPerformanceGaugeLabel(ORG_PERFORMANCE_GAUGE_VALUE);
    const progress = ORG_PERFORMANCE_GAUGE_VALUE >= 45 ? "healthy" : "needs improvement";
    const criticalCount = getDevelopersByOwnership("lower").length;
    const { healthy, needsAttention, critical } = ORG_SPOF_TOTALS.healthDistribution;
    const total = healthy + needsAttention + critical;
    const atRiskPct = Math.round(((needsAttention + critical) / total) * 100);
    const riskDelta = 5; // mock delta vs last month
    const riskDir = riskDelta > 0 ? "down" : "up";
    return { perfLabel, progress, criticalCount, atRiskPct, riskDir, riskDelta, risk: ORG_SPOF_RISK_LEVEL };
  }, []);

  // Outliers data for OverviewOutliersSection
  const orgCritical = useMemo(() => getDevelopersByOwnership("lower"), []);
  const orgNeedsAttention = useMemo(() => getDevelopersByOwnership("higher"), []);
  const orgOutliersTrend = useMemo(
    () => generateOutlierTrend(orgCritical.length, orgNeedsAttention.length),
    [orgCritical.length, orgNeedsAttention.length]
  );

  // SPOF data for OverviewSpofSummary
  const orgSpofAtRiskPercent = useMemo(() => {
    const { healthy, needsAttention, critical } = ORG_SPOF_TOTALS.healthDistribution;
    const total = healthy + needsAttention + critical;
    return Math.round(((needsAttention + critical) / total) * 100);
  }, []);

  return (
    <div className="flex flex-col gap-8 px-6 pb-8 min-h-screen bg-white text-gray-900">
      {/* Status Snapshot Banner */}
      <div className="rounded-lg border border-gray-200 bg-white px-5 py-3.5">
        <p className="text-2xl font-semibold text-foreground mb-1">Status Snapshot</p>
        <p className="text-sm leading-relaxed text-gray-600">
          Project progress{" "}
          <span className={`font-semibold ${progressColor(snapshot.progress)}`}>{snapshot.progress}</span>{" "}
          (<span className={`font-medium ${perfLabelColor(snapshot.perfLabel)}`}>{snapshot.perfLabel}</span>), SPOF risk{" "}
          <span className={`font-semibold ${riskColor(snapshot.risk)}`}>{snapshot.risk}</span>{" "}
          — <span className={`font-semibold ${dirColor(snapshot.riskDir)}`}>{snapshot.riskDir} {snapshot.riskDelta}%</span> from last month ({snapshot.atRiskPct}% at-risk),{" "}
          <span className="font-semibold text-red-600">{snapshot.criticalCount} critical outliers</span> detected.
        </p>
      </div>

      {/* Performance Section */}
      <DashboardSection
        className={CARD_CLASS}
        title={<SectionTitle href={getOrgUrl("performance")}>Performance</SectionTitle>}
        action={<ViewDetailsButton href={getOrgUrl("performance")} />}
        actionLayout="row"
      >
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="shrink-0 lg:w-1/3 flex flex-col items-center justify-center">
            <GaugeSection gaugeValue={ORG_PERFORMANCE_GAUGE_VALUE} labelVariant="performance" />
          </div>
          <div className="flex-1 min-w-0">
            <PerformanceChart
              dataSource={{
                type: "org",
                data: ORG_TIMESERIES_READY ? ORG_TIMESERIES_DATA : [],
                generator: ORG_TIMESERIES_READY ? undefined : generateOrgPerformanceData,
              }}
              eventStrategy={{ mode: "none" }}
              annotationStrategy={{ mode: "none" }}
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
          title={<SectionTitle href={getOrgUrl("design")}>Outliers</SectionTitle>}
          action={<ViewDetailsButton href={getOrgUrl("design")} />}
          actionLayout="row"
        >
          <OverviewOutliersSection
            criticalCount={orgCritical.length}
            needsAttentionCount={orgNeedsAttention.length}
            trend={orgOutliersTrend}
          />
        </DashboardSection>

        <DashboardSection
          className={`${CARD_CLASS} h-full flex flex-col`}
          title={<SectionTitle href={getOrgUrl("spof")}>SPOF</SectionTitle>}
          action={<ViewDetailsButton href={getOrgUrl("spof")} />}
          actionLayout="row"
        >
          <OverviewSpofSummary
            riskLevel={ORG_SPOF_RISK_LEVEL}
            atRiskPercent={orgSpofAtRiskPercent}
            spofModuleCount={ORG_SPOF_TOTALS.spofModuleCount}
            uniqueSpofOwnerCount={ORG_SPOF_TOTALS.uniqueSpofOwnerCount}
            healthSegments={ORG_HEALTH_SEGMENTS}
          />
        </DashboardSection>
      </div>

      {/* Skills Graph — half width, left-aligned */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <DashboardSection
          className={CARD_CLASS}
          title={<SectionTitle href={getOrgUrl("skillgraph")}>Skills Graph</SectionTitle>}
          action={<ViewDetailsButton href={getOrgUrl("skillgraph")} />}
          actionLayout="row"
        >
          <OverviewSkillsSummary skillData={skillData} />
        </DashboardSection>
      </div>
    </div>
  );
}
