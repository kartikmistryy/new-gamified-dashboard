"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useTimeRange } from "@/lib/contexts/TimeRangeContext";
import { GaugeWithInsights } from "@/components/dashboard/GaugeWithInsights";
import { DashboardSection } from "@/components/dashboard/DashboardSection";
import { BaseTeamsTable } from "@/components/dashboard/BaseTeamsTable";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { ContributorMetricsChart } from "@/components/dashboard/ContributorMetricsChart";
import { ContributorCardsCarousel } from "@/components/dashboard/ContributorCardsCarousel";
import { generateRepoEvents, generateRepoAnnotations } from "@/lib/dashboard/performanceChart";
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

  // Filter cumulative data based on time range
  const filteredAggregateData = useMemo(() => {
    if (timeRange === "max") return aggregateCumulativeData;

    // Calculate the number of weeks to show based on time range
    const weeksToShow = {
      "1m": 4,
      "3m": 13,
      "1y": 52,
      "max": aggregateCumulativeData.length,
    }[timeRange];

    // Return the last N weeks
    return aggregateCumulativeData.slice(-weeksToShow);
  }, [aggregateCumulativeData, timeRange]);

  // Calculate median values for benchmark lines based on final cumulative values
  const medianValues = useMemo(() => {
    if (contributorMetrics.length === 0 || filteredAggregateData.length === 0) {
      return { orgMedian: undefined, teamMedian: undefined };
    }

    // Get final cumulative value for each contributor (last week's cumulative total)
    const contributorFinalValues = contributorMetrics.map(contributor => {
      const contributorCumulativeData = generateCumulativeData(
        contributor.additionsData,
        contributor.deletionsData
      );
      return contributorCumulativeData[contributorCumulativeData.length - 1]?.cumulative ?? 0;
    }).sort((a, b) => a - b);

    // Calculate team median (median of all contributors' final cumulative values)
    const midIndex = Math.floor(contributorFinalValues.length / 2);
    const teamMedian = contributorFinalValues.length % 2 === 0
      ? (contributorFinalValues[midIndex - 1] + contributorFinalValues[midIndex]) / 2
      : contributorFinalValues[midIndex];

    // Org median is set to a higher benchmark (75th percentile)
    const p75Index = Math.floor(contributorFinalValues.length * 0.75);
    const orgMedian = contributorFinalValues[p75Index] ?? teamMedian * 1.3;

    return {
      orgMedian: Math.round(orgMedian),
      teamMedian: Math.round(teamMedian)
    };
  }, [contributorMetrics, filteredAggregateData]);

  // Prepare carousel contributors with chart data
  const carouselContributors = useMemo(() => {
    // Sort contributors by performanceValue to assign ranks
    const sorted = [...contributors].sort((a, b) => b.performanceValue - a.performanceValue);

    return sorted.map((contributor, index) => {
      // Find contributor metrics to get chart data
      const metrics = contributorMetrics.find(m => m.contributorName === contributor.contributorName);

      // Generate cumulative chart data for this contributor
      const chartData = metrics
        ? generateCumulativeData(metrics.additionsData, metrics.deletionsData)
        : [];

      // Filter chart data based on time range
      const filteredChartData = timeRange === "max"
        ? chartData
        : (() => {
            const weeksToShow = {
              "1m": 4,
              "3m": 13,
              "1y": 52,
              "max": chartData.length,
            }[timeRange];
            return chartData.slice(-weeksToShow);
          })();

      // Calculate positive and penalty scores from filtered data
      const positiveScore = filteredChartData.reduce((sum, d) => sum + d.additions, 0);
      const penaltyScore = filteredChartData.reduce((sum, d) => sum + d.deletions, 0);

      return {
        id: contributor.contributorName,
        name: contributor.contributorName,
        rank: index + 1,
        score: contributor.performanceValue,
        chartData: filteredChartData,
        positiveScore: positiveScore,
        penaltyScore: penaltyScore,
      };
    });
  }, [contributors, contributorMetrics, timeRange]);

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

            {/* Contributors Section */}
            <DashboardSection title="Contributors" className="w-full overflow-hidden">
              <p className="text-sm text-gray-600 mb-6">
                Cumulative DiffDelta over time with additions and deletions
              </p>

              {/* Aggregate Chart */}
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
            {/* Contributor table section */}
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
