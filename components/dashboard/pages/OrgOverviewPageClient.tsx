"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DashboardSection } from "@/components/dashboard/shared/DashboardSection";
import { GaugeSection } from "@/components/dashboard/shared/GaugeSection";
import { PerformanceChart } from "@/components/dashboard/shared/PerformanceChart";
import { OverviewOutliersSection } from "@/components/dashboard/orgDashboard/OverviewOutliersSection";
import { OverviewSpofSummary } from "@/components/dashboard/orgDashboard/OverviewSpofSummary";
import { OverviewSkillsSummary } from "@/components/dashboard/orgDashboard/OverviewSkillsSummary";
import { useRouteParams } from "@/lib/dashboard/shared/contexts/RouteParamsProvider";
import {
  generateOrgPerformanceData,
  ORG_PERFORMANCE_HOLIDAYS,
  ORG_PERFORMANCE_ANNOTATIONS,
} from "@/lib/dashboard/entities/team/charts/performanceChart/orgPerformanceChartData";
import {
  loadSkillGraphFullData,
  type SkillGraphFullData,
} from "@/components/skillmap/skillGraphDataLoader";
import { transformToTableData } from "@/components/skillmap/skillGraphTableTransform";
import type { SkillsRoadmapProgressData } from "@/lib/dashboard/entities/roadmap/types";
import { getPerformanceGaugeLabel } from "@/lib/dashboard/entities/team/utils/utils";
import { ORG_SPOF_RISK_LEVEL, ORG_SPOF_TOTALS } from "@/lib/dashboard/entities/team/data/orgSpofDataLoader";
import { getDevelopersByOwnership } from "@/lib/dashboard/entities/team/mocks/outliersMockData";

const GAUGE_VALUE = Math.floor(Math.random() * 100);
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
    const perfLabel = getPerformanceGaugeLabel(GAUGE_VALUE);
    const progress = GAUGE_VALUE >= 45 ? "healthy" : "needs improvement";
    const criticalCount = getDevelopersByOwnership("lower").length;
    const { healthy, needsAttention, critical } = ORG_SPOF_TOTALS.healthDistribution;
    const total = healthy + needsAttention + critical;
    const atRiskPct = Math.round(((needsAttention + critical) / total) * 100);
    const riskDelta = 5; // mock delta vs last month
    const riskDir = riskDelta > 0 ? "down" : "up";
    return { perfLabel, progress, criticalCount, atRiskPct, riskDir, riskDelta, risk: ORG_SPOF_RISK_LEVEL };
  }, []);

  // #region agent log — measure card heights
  const perfCardRef = useRef<HTMLDivElement>(null);
  const outliersCardRef = useRef<HTMLDivElement>(null);
  const spofCardRef = useRef<HTMLDivElement>(null);
  const skillsCardRef = useRef<HTMLDivElement>(null);
  const measureHeights = useCallback(() => {
    const perfEl = perfCardRef.current;
    const outEl = outliersCardRef.current;
    const spofEl = spofCardRef.current;
    const skillEl = skillsCardRef.current;
    if (!perfEl || !outEl || !spofEl) return;

    const perfRect = perfEl.getBoundingClientRect();
    const outRect = outEl.getBoundingClientRect();
    const spofRect = spofEl.getBoundingClientRect();
    const skillRect = skillEl?.getBoundingClientRect();

    const gaugeEl = perfEl.querySelector('[aria-label="Performance gauge"]')?.closest('div.shrink-0');
    const chartEl = perfEl.querySelector('.overflow-visible');
    const headerEl = perfEl.querySelector('h2')?.parentElement?.parentElement;

    fetch('http://127.0.0.1:7250/ingest/c99c9929-282f-4a47-ae6f-49d19f9124ed',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'909e10'},body:JSON.stringify({sessionId:'909e10',location:'OrgOverviewPageClient.tsx:measure',message:'Card heights comparison',data:{perfCard:{height:perfRect.height,width:perfRect.width},outliersCard:{height:outRect.height,width:outRect.width},spofCard:{height:spofRect.height,width:spofRect.width},skillsCard:{height:skillRect?.height,width:skillRect?.width},perfInternals:{gaugeHeight:gaugeEl?.getBoundingClientRect().height,chartHeight:chartEl?.getBoundingClientRect().height,headerHeight:headerEl?.getBoundingClientRect().height},hypothesisId:'H1-H5'},timestamp:Date.now()})}).catch(()=>{});
  }, []);

  useEffect(() => {
    const timer = setTimeout(measureHeights, 2000);
    return () => clearTimeout(timer);
  }, [measureHeights]);
  // #endregion

  return (
    <div className="flex flex-col gap-8 px-6 pb-8 min-h-screen bg-white text-gray-900">
      {/* Status Snapshot Banner */}
      <div className="rounded-lg border border-gray-200 bg-white px-5 py-3.5">
        <p className="text-2xl font-semibold text-foreground mb-1">Status Snapshot</p>
        <p className="text-sm leading-relaxed text-gray-600">
          Project progress <span className="font-semibold text-gray-900">{snapshot.progress}</span>{" "}
          ({snapshot.perfLabel}), SPOF risk{" "}
          <span className="font-semibold text-gray-900">{snapshot.risk}</span>{" "}
          — {snapshot.riskDir} {snapshot.riskDelta}% from last month ({snapshot.atRiskPct}% at-risk),{" "}
          <span className="font-semibold text-gray-900">{snapshot.criticalCount} critical outliers</span> detected.
        </p>
      </div>

      {/* Performance Section */}
      {/* #region agent log ref */}
      <div ref={perfCardRef}>
      {/* #endregion */}
      <DashboardSection
        className={CARD_CLASS}
        title={<SectionTitle href={getOrgUrl("performance")}>Performance</SectionTitle>}
        action={<ViewDetailsButton href={getOrgUrl("performance")} />}
        actionLayout="row"
      >
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="shrink-0 lg:w-1/3 flex flex-col items-center justify-center">
            <GaugeSection gaugeValue={GAUGE_VALUE} labelVariant="performance" />
          </div>
          <div className="flex-1 min-w-0">
            <PerformanceChart
              dataSource={{ type: "org", data: [], generator: generateOrgPerformanceData }}
              eventStrategy={{ mode: "static", events: ORG_PERFORMANCE_HOLIDAYS }}
              annotationStrategy={{ mode: "static", annotations: ORG_PERFORMANCE_ANNOTATIONS }}
              timeRange="max"
              showLegend={false}
              height={280}
            />
          </div>
        </div>
      </DashboardSection>
      {/* #region agent log ref */}
      </div>
      {/* #endregion */}

      {/* 2-column grid: Outliers | SPOF */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* #region agent log ref */}
        <div ref={outliersCardRef}>
        {/* #endregion */}
        <DashboardSection
          className={CARD_CLASS}
          title={<SectionTitle href={getOrgUrl("design")}>Outliers</SectionTitle>}
          action={<ViewDetailsButton href={getOrgUrl("design")} />}
          actionLayout="row"
        >
          <OverviewOutliersSection />
        </DashboardSection>
        {/* #region agent log ref */}
        </div>
        {/* #endregion */}

        {/* #region agent log ref */}
        <div ref={spofCardRef}>
        {/* #endregion */}
        <DashboardSection
          className={CARD_CLASS}
          title={<SectionTitle href={getOrgUrl("spof")}>SPOF</SectionTitle>}
          action={<ViewDetailsButton href={getOrgUrl("spof")} />}
          actionLayout="row"
        >
          <OverviewSpofSummary />
        </DashboardSection>
        {/* #region agent log ref */}
        </div>
        {/* #endregion */}
      </div>

      {/* Skills Graph — full width */}
      {/* #region agent log ref */}
      <div ref={skillsCardRef}>
      {/* #endregion */}
      <DashboardSection
        className={CARD_CLASS}
        title={<SectionTitle href={getOrgUrl("skillgraph")}>Skills Graph</SectionTitle>}
        action={<ViewDetailsButton href={getOrgUrl("skillgraph")} />}
        actionLayout="row"
      >
        <OverviewSkillsSummary skillData={skillData} />
      </DashboardSection>
      {/* #region agent log ref */}
      </div>
      {/* #endregion */}
    </div>
  );
}
