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
import { PERFORMANCE_METRICS } from "@/lib/dashboard/entities/team/mocks/performanceMetricsMockData";

/** Default performance gauge value for the Performance Tracking section (0–100). */
const DEFAULT_PERFORMANCE_GAUGE_VALUE = Math.floor(Math.random() * 100);

import type { PerformanceMetricConfig } from "@/lib/orgDashboard/types";

function MetricSectionRow({ metric }: { metric: PerformanceMetricConfig }) {
  return (
    <DashboardSection title={metric.title}>
      <div className="flex flex-col lg:flex-row items-stretch gap-[10px]">
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
        />
        <ChartInsights
          insights={metric.insights}
          variant="topicWithBullets"
          iconStyle="button"
          className="flex-1 min-w-0"
        />
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
          <DashboardSection title="Performance Tracking">
            <div className="flex flex-row flex-wrap items-stretch gap-8">
              <div className="flex shrink-0 min-w-[280px] max-w-[50%]">
                <GaugeSection
                  gaugeValue={DEFAULT_PERFORMANCE_GAUGE_VALUE}
                  labelVariant="performance"
                />
              </div>
              <div className="flex-1 min-w-[280px]">
                <ChartInsights insights={chartInsights} />
              </div>
            </div>
          </DashboardSection>

          {/* Four performance metric sections - between Performance Tracking and Percentile */}
          {PERFORMANCE_METRICS.map((metric) => (
            <MetricSectionRow key={metric.id} metric={metric} />
          ))}

          <DashboardSection title="Percentile (Normalized to Rolling Avg)">
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
