"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChartInsights } from "@/components/dashboard/shared/ChartInsights";
import { DashboardSection } from "@/components/dashboard/shared/DashboardSection";
import { GaugeSection } from "@/components/dashboard/shared/GaugeSection";
import { PerformanceChart } from "@/components/dashboard/shared/PerformanceChart";
import { PerformanceStatisticCard } from "@/components/dashboard/PerformanceStatisticCard";
import { useTimeRange } from "@/lib/dashboard/shared/contexts/TimeRangeContext";
import {
  getChartInsightsMock,
} from "@/lib/dashboard/entities/team/mocks/overviewMockData";
import { getTimeRangeComparisonLabel } from "@/lib/shared/types/timeRangeTypes";
import {
  generateOrgPerformanceData,
} from "@/lib/dashboard/entities/team/charts/performanceChart/orgPerformanceChartData";
import { ORG_TIMESERIES_DATA, ORG_TIMESERIES_READY } from "@/lib/dashboard/entities/team/data/orgTimeseriesDataLoader";
import { PERFORMANCE_METRICS } from "@/lib/dashboard/entities/team/mocks/performanceMetricsMockData";
import { OperationBreakdownCard } from "@/components/dashboard/OperationBreakdownCard";
import {
  ORG_PERFORMANCE_GAUGE_VALUE,
  buildNLocMetricConfig,
  buildChurnMetricConfig,
  buildOperationBreakdownCards,
} from "@/lib/dashboard/entities/team/data/orgPerformanceDataLoader";

import type { PerformanceMetricConfig } from "@/lib/dashboard/entities/team/types";

// Module-level array: first 2 real, last 2 mock (data unavailable)
const COMBINED_METRICS = [
  buildNLocMetricConfig(),
  buildChurnMetricConfig(),
  // Avg Age Code Deleted — per-line age data not available, keep mock
  PERFORMANCE_METRICS[1],
  // Legacy Code Updated — git blame data not available, keep mock
  PERFORMANCE_METRICS[3],
];

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
                <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide mb-1">How it&apos;s calculated</h4>
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
  const comparisonLabel = getTimeRangeComparisonLabel(timeRange);

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
                  gaugeValue={ORG_PERFORMANCE_GAUGE_VALUE}
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
                  data: ORG_TIMESERIES_READY ? ORG_TIMESERIES_DATA : [],
                  generator: ORG_TIMESERIES_READY ? undefined : generateOrgPerformanceData,
                }}
                eventStrategy={{ mode: "none" }}
                annotationStrategy={{ mode: "none" }}
                timeRange={timeRange}
              />
            </DashboardSection>
          </div>

          {/* Core Metrics */}
          <DashboardSection title="Core Metrics" subtitle={<>Trends compared <span className="font-semibold">{comparisonLabel}</span></>}>
            <div className="flex flex-col gap-8">
              {COMBINED_METRICS.map((metric) => (
                <MetricSectionRow key={metric.id} metric={metric} />
              ))}
            </div>
          </DashboardSection>

          {/* Detailed Breakdowns: nLoC by operation type */}
          <DashboardSection title="Detailed Breakdowns" subtitle={<>Normalized Lines of Code (nLoC) by operation types · Trends compared <span className="font-semibold">{comparisonLabel}</span></>}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {buildOperationBreakdownCards().map((op) => (
                <OperationBreakdownCard key={op.operation} {...op} />
              ))}
            </div>
          </DashboardSection>
        </CardContent>
      </Card>
    </div>
  );
}
