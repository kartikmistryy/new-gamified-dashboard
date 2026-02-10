/** Custom hook for Repo Performance data processing pipeline */

import { useMemo } from "react";
import type { TimeRangeKey } from "@/lib/shared/types/timeRangeTypes";
import { getContributorPerformanceRowsForRepo } from "./overviewMockData";
import { generateContributorPerformanceTimeSeries } from "./performanceMockData";
import {
  filterByTimeRange,
  smartSample,
  getPerformanceInsights,
  generateContributorTimeSeriesMetrics,
  aggregateContributorMetrics,
  generateCumulativeData,
} from "./performanceHelpers";
import {
  enrichContributorsWithMetrics,
  calculateCumulativeDiffDelta,
  buildTableRowsWithScaling,
  calculateMedianValues,
  prepareCarouselContributors,
  filterAggregateDataByTimeRange,
} from "./repoPerformanceUtils";

export function useRepoPerformanceData(repoId: string, timeRange: TimeRangeKey) {
  const contributors = useMemo(() => {
    const rows = getContributorPerformanceRowsForRepo(52, repoId, 6);
    return enrichContributorsWithMetrics(rows);
  }, [repoId]);

  const rawData = useMemo(() => generateContributorPerformanceTimeSeries(contributors), [contributors]);

  const timeFilteredData = useMemo(() => filterByTimeRange(rawData, timeRange), [rawData, timeRange]);

  const sampledData = useMemo(() => smartSample(timeFilteredData), [timeFilteredData]);

  const insights = useMemo(
    () => getPerformanceInsights(contributors, sampledData, timeRange),
    [contributors, sampledData, timeRange]
  );

  const cumulativeDiffDeltaByContributor = useMemo(
    () => calculateCumulativeDiffDelta(timeFilteredData, contributors),
    [timeFilteredData, contributors]
  );

  const tableRows = useMemo(
    () => buildTableRowsWithScaling(contributors, cumulativeDiffDeltaByContributor),
    [contributors, cumulativeDiffDeltaByContributor]
  );

  const repoPerformanceValue = useMemo(() => {
    if (contributors.length === 0) return 0;
    const total = contributors.reduce((sum, contributor) => sum + contributor.performanceValue, 0);
    return Math.round(total / contributors.length);
  }, [contributors]);

  const contributorTimeSeriesMetrics = useMemo(
    () => generateContributorTimeSeriesMetrics(contributors, 52),
    [contributors]
  );

  // Transform time series metrics to simple numeric arrays for calculations
  const contributorMetrics = useMemo(
    () => contributorTimeSeriesMetrics.map(metric => ({
      contributorName: metric.contributorName,
      additionsData: metric.additionsData.map(d => d.value),
      deletionsData: metric.deletionsData.map(d => d.value),
    })),
    [contributorTimeSeriesMetrics]
  );

  const aggregateMetrics = useMemo(() => aggregateContributorMetrics(contributorTimeSeriesMetrics), [contributorTimeSeriesMetrics]);

  const aggregateCumulativeData = useMemo(
    () => generateCumulativeData(aggregateMetrics.additionsData, aggregateMetrics.deletionsData),
    [aggregateMetrics]
  );

  const filteredAggregateData = useMemo(
    () => filterAggregateDataByTimeRange(aggregateCumulativeData, timeRange),
    [aggregateCumulativeData, timeRange]
  );

  // Create a wrapper for generateCumulativeData that accepts number arrays
  const generateCumulativeDataFromNumbers = useMemo(
    () => (additions: number[], deletions: number[]) => {
      const additionsData = additions.map((value, index) => ({ week: `W${index + 1}`, value }));
      const deletionsData = deletions.map((value, index) => ({ week: `W${index + 1}`, value }));
      return generateCumulativeData(additionsData, deletionsData);
    },
    []
  );

  const medianValues = useMemo(
    () => calculateMedianValues(contributorMetrics, generateCumulativeDataFromNumbers),
    [contributorMetrics, generateCumulativeDataFromNumbers]
  );

  const carouselContributors = useMemo(
    () => prepareCarouselContributors(contributors, contributorMetrics, generateCumulativeDataFromNumbers, timeRange),
    [contributors, contributorMetrics, generateCumulativeDataFromNumbers, timeRange]
  );

  return {
    contributors,
    timeFilteredData,
    insights,
    tableRows,
    repoPerformanceValue,
    filteredAggregateData,
    medianValues,
    carouselContributors,
  };
}
