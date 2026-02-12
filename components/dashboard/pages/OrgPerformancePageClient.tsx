"use client";

import { useMemo, useCallback, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChartInsights } from "@/components/dashboard/shared/ChartInsights";
import { DashboardSection } from "@/components/dashboard/shared/DashboardSection";
import { GaugeSection } from "@/components/dashboard/shared/GaugeSection";
import { PerformanceChart } from "@/components/dashboard/shared/PerformanceChart";
import { PerformanceStatisticCard } from "@/components/dashboard/PerformanceStatisticCard";
import { PerformanceTeamsTable } from "@/components/dashboard/orgDashboard/PerformanceTeamsTable";
import { useTimeRange } from "@/lib/dashboard/shared/contexts/TimeRangeContext";
import {
  TEAM_PERFORMANCE_ROWS,
  getChartInsightsMock,
} from "@/lib/dashboard/entities/team/mocks/overviewMockData";
import {
  ORG_PERFORMANCE_HOLIDAYS,
  ORG_PERFORMANCE_ANNOTATIONS,
  generateOrgPerformanceData,
} from "@/lib/dashboard/entities/team/charts/performanceChart/orgPerformanceChartData";
import { PERFORMANCE_METRICS, OPERATION_BREAKDOWN_DATA } from "@/lib/dashboard/entities/team/mocks/performanceMetricsMockData";
import { OperationBreakdownCard } from "@/components/dashboard/OperationBreakdownCard";

/** Default performance gauge value for the Performance Tracking section (0–100). */
const DEFAULT_PERFORMANCE_GAUGE_VALUE = Math.floor(Math.random() * 100);

import type { PerformanceMetricConfig } from "@/lib/dashboard/entities/team/types";

function MetricSectionRow({ metric }: { metric: PerformanceMetricConfig }) {
  return (
    <DashboardSection title={metric.sectionTitle} titleSize="small">
      <div className="flex flex-col lg:flex-row items-stretch gap-[10px]">
        {/* Column 1: Chart */}
        <PerformanceStatisticCard
          title={metric.title}
          severity={metric.severity}
          severityColor={metric.severityColor}
          bgColor={metric.bgColor}
          iconColor={metric.iconColor}
          icon={metric.icon}
          primaryValue={metric.primaryValue}
          primaryLabel={metric.primaryLabel}
          visualizationType={metric.visualizationType}
          breakdown={metric.breakdown}
          thresholds={metric.thresholds}
          currentValue={metric.currentValue}
          trend={metric.trend}
        />
        {/* Columns 2 & 3: Motivation and Insights in a grid for equal height */}
        <div className="flex-[3] min-w-0 grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-[10px]">
          {/* Motivation (narrower) */}
          {metric.motivation && (
            <div className="rounded-[10px] border border-border p-4 space-y-3">
              {/* Impact on score badge */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground">Impact on score:</span>
                <span
                  className="px-2 py-0.5 text-xs font-semibold rounded-lg text-white"
                  style={{ backgroundColor: metric.severityColor }}
                >
                  {metric.severity}
                </span>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide mb-1">Why it matters</h4>
                <p className="text-sm text-muted-foreground">{metric.motivation.why}</p>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide mb-1">How it's calculated</h4>
                <p className="text-sm text-muted-foreground">{metric.motivation.how}</p>
              </div>
            </div>
          )}
          {/* Insights (wider) */}
          <ChartInsights
            insights={metric.insights}
            variant="topicWithBullets"
            showTitle={false}
            showIcon={false}
            status={metric.status}
            className=""
          />
        </div>
      </div>
    </DashboardSection>
  );
}

export function OrgPerformancePageClient() {
  const { timeRange } = useTimeRange();
  const chartInsights = useMemo(() => getChartInsightsMock(), []);

  // Initialize visibility state - all teams visible by default
  const [visibleTeams, setVisibleTeams] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const row of TEAM_PERFORMANCE_ROWS) {
      init[row.teamName] = true;
    }
    return init;
  });

  const handleVisibilityChange = useCallback(
    (teamName: string, visible: boolean) => {
      setVisibleTeams((prev) => ({
        ...prev,
        [teamName]: visible,
      }));
    },
    []
  );

  return (
    <div className="flex flex-col gap-8 px-6 pb-8 min-h-screen bg-white text-gray-900">
      <Card className="w-full border-none bg-white p-0 shadow-none">
        <CardContent className="flex w-full flex-col items-stretch space-y-8 px-0">
          {/* Top section: Performance Tracking + Percentile Chart side by side */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left column: Gauge + Insights stacked vertically */}
            <DashboardSection title="Performance Tracking" className="lg:w-1/3">
              <div className="flex flex-col gap-4">
                <GaugeSection
                  gaugeValue={DEFAULT_PERFORMANCE_GAUGE_VALUE}
                  labelVariant="performance"
                />
                <ChartInsights insights={chartInsights} />
              </div>
            </DashboardSection>

            {/* Right column: Percentile Chart */}
            <DashboardSection title="Percentile (Normalized to Rolling Avg)" className="lg:flex-1">
              <PerformanceChart
                dataSource={{
                  type: "org",
                  data: [],
                  generator: generateOrgPerformanceData,
                }}
                eventStrategy={{
                  mode: "static",
                  events: ORG_PERFORMANCE_HOLIDAYS,
                }}
                annotationStrategy={{
                  mode: "static",
                  annotations: ORG_PERFORMANCE_ANNOTATIONS,
                }}
                timeRange={timeRange}
                entityVisibility={{
                  visibleEntities: visibleTeams,
                }}
              />
            </DashboardSection>
          </div>

          {/* Core Metrics */}
          <DashboardSection title="Core Metrics">
            <div className="flex flex-col gap-8">
              {PERFORMANCE_METRICS.map((metric) => (
                <MetricSectionRow key={metric.id} metric={metric} />
              ))}
            </div>
          </DashboardSection>

          {/* Detailed Breakdowns: nLoC by operation type */}
          <DashboardSection title="Detailed Breakdowns">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {OPERATION_BREAKDOWN_DATA.map((op) => (
                <OperationBreakdownCard key={op.operation} {...op} />
              ))}
            </div>
          </DashboardSection>

          <DashboardSection title="Teams" className="w-full">
            <PerformanceTeamsTable
              rows={TEAM_PERFORMANCE_ROWS}
              visibleTeams={visibleTeams}
              onVisibilityChange={handleVisibilityChange}
            />
          </DashboardSection>
        </CardContent>
      </Card>
    </div>
  );
}
