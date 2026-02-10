/** Custom hook for Repo Performance data processing pipeline */

import { useMemo } from "react";
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

export function useRepoPerformanceData(repoId: string, timeRange: string) {
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

  const contributorMetrics = useMemo(
    () => generateContributorTimeSeriesMetrics(contributors, 52),
    [contributors]
  );

  const aggregateMetrics = useMemo(() => aggregateContributorMetrics(contributorMetrics), [contributorMetrics]);

  const aggregateCumulativeData = useMemo(
    () => generateCumulativeData(aggregateMetrics.additionsData, aggregateMetrics.deletionsData),
    [aggregateMetrics]
  );

  const filteredAggregateData = useMemo(
    () => filterAggregateDataByTimeRange(aggregateCumulativeData, timeRange),
    [aggregateCumulativeData, timeRange]
  );

  const medianValues = useMemo(
    () => calculateMedianValues(contributorMetrics, generateCumulativeData),
    [contributorMetrics]
  );

  const carouselContributors = useMemo(
    () => prepareCarouselContributors(contributors, contributorMetrics, generateCumulativeData, timeRange),
    [contributors, contributorMetrics, timeRange]
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
