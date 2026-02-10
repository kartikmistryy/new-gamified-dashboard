"use client";

import { useMemo, useCallback, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChartInsights } from "@/components/dashboard/ChartInsights";
import { DashboardSection } from "@/components/dashboard/DashboardSection";
import { GaugeSection } from "@/components/dashboard/GaugeSection";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { PerformanceTeamsTable } from "@/components/dashboard/PerformanceTeamsTable";
import { useTimeRange } from "@/lib/dashboard/TimeRangeContext";
import {
  TEAM_PERFORMANCE_ROWS,
  getChartInsightsMock,
} from "@/lib/orgDashboard/overviewMockData";
import {
  ORG_PERFORMANCE_HOLIDAYS,
  ORG_PERFORMANCE_ANNOTATIONS,
  generateOrgPerformanceData,
} from "@/lib/orgDashboard/orgPerformanceChartData";

/** Default performance gauge value for the Performance Tracking section (0–100). */
const DEFAULT_PERFORMANCE_GAUGE_VALUE = Math.floor(Math.random() * 100);

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
