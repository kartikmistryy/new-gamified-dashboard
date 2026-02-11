"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useTimeRange } from "@/lib/dashboard/shared/TimeRangeContext";
import { GaugeWithInsights } from "@/components/dashboard/shared/GaugeWithInsights";
import { DashboardSection } from "@/components/dashboard/shared/DashboardSection";
import { BaseTeamsTable } from "@/components/dashboard/shared/BaseTeamsTable";
import { PerformanceChart } from "@/components/dashboard/shared/PerformanceChart";
import { ContributorMetricsChart } from "@/components/dashboard/repoDashboard/ContributorMetricsChart";
import { ContributorCardsCarousel } from "@/components/dashboard/repoDashboard/ContributorCardsCarousel";
import { generateRepoEvents, generateRepoAnnotations } from "@/lib/dashboard/shared/performanceChart/eventGenerators";
import { getGaugeColor, getPerformanceGaugeLabel } from "@/lib/orgDashboard/utils";
import {
  PERFORMANCE_FILTER_TABS,
  performanceSortFunction,
  type ContributorPerformanceWithDelta,
} from "@/lib/repoDashboard/performanceTableConfig";
import { PERFORMANCE_CONTRIBUTOR_COLUMNS } from "@/lib/repoDashboard/performanceTableColumns";
import { useRouteParams } from "@/lib/RouteParamsProvider";
import { PerformanceFilter } from "@/lib/repoDashboard/performanceTypes";
import { useRepoPerformanceData } from "@/lib/repoDashboard/useRepoPerformanceData";

export function RepoPerformancePageClient() {
  const { repoId } = useRouteParams();
  const { timeRange } = useTimeRange();
  const [activeFilter, setActiveFilter] = useState<PerformanceFilter>("mostProductive");

  const {
    timeFilteredData,
    insights,
    tableRows,
    repoPerformanceValue,
    filteredAggregateData,
    medianValues,
    carouselContributors,
  } = useRepoPerformanceData(repoId!, timeRange);

  return (
    <TooltipProvider>
      <div className="flex min-w-0 max-w-full flex-col gap-8 overflow-x-hidden px-6 pb-8 text-gray-900 min-h-screen bg-white">
        <Card className="w-full min-w-0 max-w-full border-none bg-white p-0 shadow-none">
          <CardContent className="flex w-full min-w-0 max-w-full flex-col items-stretch space-y-8 px-0">
            <DashboardSection title="Performance Tracking">
              <GaugeWithInsights
                value={repoPerformanceValue}
                label={getPerformanceGaugeLabel(repoPerformanceValue)}
                labelColor={getGaugeColor(repoPerformanceValue)}
                valueDisplay={`${repoPerformanceValue}/100`}
                insights={insights}
              />
            </DashboardSection>

            <section className="w-full" aria-label="Repository performance chart">
              <PerformanceChart
                dataSource={{
                  type: "repo",
                  data: timeFilteredData,
                  repoId: repoId!,
                }}
                eventStrategy={{
                  mode: "dynamic",
                  generator: generateRepoEvents,
                }}
                annotationStrategy={{
                  mode: "dynamic",
                  generator: generateRepoAnnotations,
                }}
                timeRange={timeRange}
                ariaLabel="Repository contributor performance over time"
              />
            </section>

            <DashboardSection title="Contributors" className="w-full overflow-hidden">
              <p className="text-sm text-gray-600 mb-6">
                Cumulative DiffDelta over time with additions and deletions
              </p>

              <div className="mb-6 rounded-xl bg-white overflow-hidden">
                <div className="min-w-full pb-2">
                  <ContributorMetricsChart
                    data={filteredAggregateData}
                    contributorName="Repository"
                    contributorColor="#3b82f6"
                    orgMedian={medianValues.orgMedian}
                    teamMedian={medianValues.teamMedian}
                  />
                </div>
              </div>

              <ContributorCardsCarousel contributors={carouselContributors} />
            </DashboardSection>

            <DashboardSection title="Repository Contributors" className="w-full">
              <BaseTeamsTable<ContributorPerformanceWithDelta, PerformanceFilter>
                rows={tableRows}
                filterTabs={PERFORMANCE_FILTER_TABS}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                defaultFilter="mostProductive"
                sortFunction={performanceSortFunction}
                columns={PERFORMANCE_CONTRIBUTOR_COLUMNS}
                getRowKey={(row) => row.contributorName}
              />
            </DashboardSection>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
