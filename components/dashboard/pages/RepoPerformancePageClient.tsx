"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GlobalTimeRangeFilter } from "@/components/dashboard/GlobalTimeRangeFilter";
import { useTimeRange } from "@/lib/contexts/TimeRangeContext";
import { GaugeWithInsights } from "@/components/dashboard/GaugeWithInsights";
import { DashboardSection } from "@/components/dashboard/DashboardSection";
import { BaseTeamsTable } from "@/components/dashboard/BaseTeamsTable";
import { TeamPerformanceChart } from "@/components/dashboard/TeamPerformanceChart";
import { ContributorMetricsChart } from "@/components/dashboard/ContributorMetricsChart";
import { getContributorPerformanceRowsForRepo } from "@/lib/repoDashboard/overviewMockData";
import { generateContributorPerformanceTimeSeries } from "@/lib/repoDashboard/performanceMockData";
import {
  filterByTimeRange,
  smartSample,
  getPerformanceInsights,
  generateContributorTimeSeriesMetrics,
  aggregateContributorMetrics,
  generateCumulativeData,
} from "@/lib/repoDashboard/performanceHelpers";
import { PerformanceFilter } from "@/lib/repoDashboard/performanceTypes";
import { getGaugeColor, getPerformanceGaugeLabel } from "@/lib/orgDashboard/utils";
import {
  PERFORMANCE_FILTER_TABS,
  performanceSortFunction,
  type ContributorPerformanceWithDelta,
} from "@/lib/repoDashboard/performanceTableConfig";
import { PERFORMANCE_CONTRIBUTOR_COLUMNS } from "@/lib/repoDashboard/performanceTableColumns";
import { useRouteParams } from "@/lib/RouteParamsProvider";

export function RepoPerformancePageClient() {
  const { repoId } = useRouteParams();
  const { timeRange } = useTimeRange();

  // State
  const [activeFilter, setActiveFilter] = useState<PerformanceFilter>("mostProductive");

  // Data pipeline
  const contributors = useMemo(
    () => {
      const rows = getContributorPerformanceRowsForRepo(52, repoId!, 6);
      // Add change and churnRate for performance tab (deterministic based on contributor data)
      return rows.map((row, index) => {
        // Use contributor name and index as seed for deterministic values
        const seed1 = row.contributorName.charCodeAt(0) + index * 100;
        const seed2 = row.contributorName.length + index * 50;
        const noise1 = Math.sin(seed1 * 9999) * 10000;
        const noise2 = Math.sin(seed2 * 9999) * 10000;
        const changeSeed = noise1 - Math.floor(noise1);
        const churnSeed = noise2 - Math.floor(noise2);

        return {
          ...row,
          change: (changeSeed - 0.5) * 30, // -15 to +15 points
          churnRate: Math.round(churnSeed * 40), // 0-40%
        };
      });
    },
    [repoId]
  );

  const rawData = useMemo(() => generateContributorPerformanceTimeSeries(contributors), [contributors]);

  const timeFilteredData = useMemo(
    () => filterByTimeRange(rawData, timeRange),
    [rawData, timeRange]
  );

  const sampledData = useMemo(() => smartSample(timeFilteredData), [timeFilteredData]);

  // Transform contributor data to member data format for TeamPerformanceChart
  const chartData = useMemo(() => {
    return timeFilteredData.map(point => ({
      date: point.date,
      value: point.value,
      memberValues: point.contributorValues, // Rename contributorValues to memberValues
    }));
  }, [timeFilteredData]);

  const insights = useMemo(
    () => getPerformanceInsights(contributors, sampledData, timeRange),
    [contributors, sampledData, timeRange]
  );

  const cumulativeDiffDeltaByContributor = useMemo(() => {
    const totals = new Map<string, number>();
    if (timeFilteredData.length < 2) return totals;

    for (let i = 1; i < timeFilteredData.length; i++) {
      const prev = timeFilteredData[i - 1];
      const curr = timeFilteredData[i];
      for (const contributor of contributors) {
        const prevValue = prev.contributorValues[contributor.contributorName] ?? 0;
        const currValue = curr.contributorValues[contributor.contributorName] ?? 0;
        const delta = currValue - prevValue;
        totals.set(contributor.contributorName, (totals.get(contributor.contributorName) ?? 0) + delta);
      }
    }

    return totals;
  }, [timeFilteredData, contributors]);

  const tableRows = useMemo<ContributorPerformanceWithDelta[]>(
    () => {
      const rawValues = contributors.map((contributor) =>
        Math.abs(cumulativeDiffDeltaByContributor.get(contributor.contributorName) ?? 0)
      );
      const min = Math.min(...rawValues, 0);
      const max = Math.max(...rawValues, 0);
      const minOutput = 20;
      const maxOutput = 50;
      const scaleValue = (value: number) => {
        if (max === min) return Math.round((minOutput + maxOutput) / 2);
        const ratio = (value - min) / (max - min);
        return Math.round(minOutput + ratio * (maxOutput - minOutput));
      };

      return contributors.map((contributor) => ({
        ...contributor,
        cumulativeDiffDelta: scaleValue(
          Math.abs(cumulativeDiffDeltaByContributor.get(contributor.contributorName) ?? 0)
        ),
      }));
    },
    [contributors, cumulativeDiffDeltaByContributor]
  );

  const repoPerformanceValue = useMemo(() => {
    if (contributors.length === 0) return 0;
    const total = contributors.reduce((sum, contributor) => sum + contributor.performanceValue, 0);
    return Math.round(total / contributors.length);
  }, [contributors]);

  // Generate time-series metrics for each contributor
  const contributorMetrics = useMemo(
    () => generateContributorTimeSeriesMetrics(contributors, 52),
    [contributors]
  );

  // Aggregate metrics for the repo
  const aggregateMetrics = useMemo(
    () => aggregateContributorMetrics(contributorMetrics),
    [contributorMetrics]
  );

  // Generate cumulative data for the aggregate chart
  const aggregateCumulativeData = useMemo(
    () => generateCumulativeData(aggregateMetrics.additionsData, aggregateMetrics.deletionsData),
    [aggregateMetrics]
  );

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

            {/* Global Time Range Filter */}
            <GlobalTimeRangeFilter showLabel />

            <section className="w-full" aria-label="Repository performance chart">
              <div className="bg-white rounded-lg">
                <TeamPerformanceChart data={chartData} />
              </div>
            </section>

            {/* Contributors Section */}
            <section className="w-full overflow-hidden" aria-labelledby="contributors-metrics-heading">
              <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 id="contributors-metrics-heading" className="text-2xl font-semibold text-gray-900">
                    Contributors
                  </h2>
                  <p className="text-sm text-gray-600">
                    Cumulative DiffDelta over time with additions and deletions
                  </p>
                </div>
              </div>

              {/* Aggregate Chart */}
              <div className="mb-6 rounded-xl bg-white overflow-hidden">
                  <div className="min-w-full pb-2">
                    <ContributorMetricsChart
                      data={aggregateCumulativeData}
                      contributorName="Repository"
                      contributorColor="#3b82f6"
                    />
                  </div>
              </div>

            </section>

            {/* Contributor table section */}
            <section className="w-full" aria-labelledby="contributors-heading">
              <h2 id="contributors-heading" className="mb-4 text-2xl font-semibold text-foreground">
                Repository Contributors
              </h2>
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
            </section>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
