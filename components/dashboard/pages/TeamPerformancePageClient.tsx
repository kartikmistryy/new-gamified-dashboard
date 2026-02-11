"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useTimeRange } from "@/lib/dashboard/shared/TimeRangeContext";
import { GaugeWithInsights } from "@/components/dashboard/shared/GaugeWithInsights";
import { DashboardSection } from "@/components/dashboard/shared/DashboardSection";
import { BaseTeamsTable } from "@/components/dashboard/shared/BaseTeamsTable";
import { PerformanceChart } from "@/components/dashboard/shared/PerformanceChart";
import { ContributorMetricsChart } from "@/components/dashboard/repoDashboard/ContributorMetricsChart";
import { generateTeamEvents, generateTeamAnnotations } from "@/lib/dashboard/shared/performanceChart/eventGenerators";
import { useTeamPerformanceData } from "@/lib/teamDashboard/hooks/useTeamPerformanceData";
import { PerformanceFilter } from "@/lib/teamDashboard/performanceTypes";
import { getGaugeColor, getPerformanceGaugeLabel } from "@/lib/orgDashboard/utils";
import {
  PERFORMANCE_FILTER_TABS,
  performanceSortFunction,
  type MemberPerformanceWithDelta,
} from "@/lib/teamDashboard/performanceTableConfig";
import { PERFORMANCE_MEMBER_COLUMNS } from "@/lib/teamDashboard/performanceTableColumns";
import { useRouteParams } from "@/lib/RouteParamsProvider";
import { filterByTimeRange } from "@/lib/teamDashboard/performanceHelpers";
import {
  calculateCumulativeDiffDeltaByMember,
  buildTableRowsWithScaling,
  calculateTeamPerformanceValue,
  generateAggregateTeamData,
  calculateTeamBenchmarks,
} from "@/lib/teamDashboard/teamPerformanceUtils";

export function TeamPerformancePageClient() {
  const { teamId } = useRouteParams();
  const { timeRange } = useTimeRange();
  const [activeFilter, setActiveFilter] = useState<PerformanceFilter>("mostProductive");

  const { members, rawData, insights } = useTeamPerformanceData(teamId!, timeRange);

  const timeFilteredData = useMemo(() => filterByTimeRange(rawData, timeRange), [rawData, timeRange]);

  const cumulativeDiffDeltaByMember = useMemo(
    () => calculateCumulativeDiffDeltaByMember(timeFilteredData, members),
    [timeFilteredData, members]
  );

  const tableRows = useMemo(
    () => buildTableRowsWithScaling(members, cumulativeDiffDeltaByMember),
    [members, cumulativeDiffDeltaByMember]
  );

  const teamPerformanceValue = useMemo(() => calculateTeamPerformanceValue(members), [members]);

  const aggregateTeamData = useMemo(
    () => generateAggregateTeamData(timeFilteredData, members, teamId!),
    [timeFilteredData, members, teamId]
  );

  const teamBenchmarks = useMemo(
    () => calculateTeamBenchmarks(members, aggregateTeamData),
    [members, aggregateTeamData]
  );

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-8 px-6 pb-8 min-h-screen bg-white text-gray-900">
        <Card className="w-full border-none bg-white p-0 shadow-none">
          <CardContent className="flex w-full flex-col items-stretch space-y-8 px-0">
            <DashboardSection title="Performance Tracking">
              <GaugeWithInsights
                value={teamPerformanceValue}
                label={getPerformanceGaugeLabel(teamPerformanceValue)}
                labelColor={getGaugeColor(teamPerformanceValue)}
                valueDisplay={`${teamPerformanceValue}/100`}
                insights={insights}
              />
            </DashboardSection>

            <section className="w-full" aria-label="Team performance chart">
              <div className="bg-white rounded-lg">
                <PerformanceChart
                  dataSource={{
                    type: "team",
                    data: timeFilteredData,
                    teamId: teamId!,
                  }}
                  eventStrategy={{
                    mode: "dynamic",
                    generator: generateTeamEvents,
                  }}
                  annotationStrategy={{
                    mode: "dynamic",
                    generator: generateTeamAnnotations,
                  }}
                  timeRange={timeRange}
                  ariaLabel="Team performance normalized to rolling average over time"
                />
              </div>
            </section>

            <DashboardSection title="Performance Comparison">
              <p className="text-sm text-gray-600 mb-4">
                Team aggregate cumulative DiffDelta compared to organization and industry benchmarks
              </p>
              <ContributorMetricsChart
                data={aggregateTeamData}
                contributorName="Team Performance"
                contributorColor="#2563eb"
                orgMedian={teamBenchmarks.orgBenchmark}
                teamMedian={teamBenchmarks.industryBenchmark}
                height={500}
              />
            </DashboardSection>

            <DashboardSection title="Team Members" className="w-full">
              <BaseTeamsTable<MemberPerformanceWithDelta, PerformanceFilter>
                rows={tableRows}
                filterTabs={PERFORMANCE_FILTER_TABS}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                defaultFilter="mostProductive"
                sortFunction={performanceSortFunction}
                columns={PERFORMANCE_MEMBER_COLUMNS}
                getRowKey={(row) => row.memberName}
              />
            </DashboardSection>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
