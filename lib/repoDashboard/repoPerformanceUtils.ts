/** Repo Performance Data Processing Utilities */

import type { ContributorPerformanceDataPoint } from "./performanceTypes";
import type { ContributorPerformanceRow } from "./types";
import type { ContributorPerformanceWithDelta } from "./performanceTableConfig";

/** Contributor metrics for chart generation */
export type ContributorMetrics = {
  contributorName: string;
  additionsData: number[];
  deletionsData: number[];
};

/** Cumulative data point for performance charts */
export type CumulativeDataPoint = {
  week: string;
  cumulative: number;
  additions: number;
  deletions: number;
};

export interface EnrichedContributor extends ContributorPerformanceRow {
  change: number;
  churnRate: number;
}

/** Enrich contributors with change and churn rate */
export function enrichContributorsWithMetrics(
  rows: ContributorPerformanceRow[]
): EnrichedContributor[] {
  return rows.map((row, index) => {
    const seed1 = row.contributorName.charCodeAt(0) + index * 100;
    const seed2 = row.contributorName.length + index * 50;
    const noise1 = Math.sin(seed1 * 9999) * 10000;
    const noise2 = Math.sin(seed2 * 9999) * 10000;
    const changeSeed = noise1 - Math.floor(noise1);
    const churnSeed = noise2 - Math.floor(noise2);

    return {
      ...row,
      change: (changeSeed - 0.5) * 30,
      churnRate: Math.round(churnSeed * 40),
    };
  });
}

/** Calculate cumulative diff delta by contributor */
export function calculateCumulativeDiffDelta(
  timeFilteredData: ContributorPerformanceDataPoint[],
  contributors: EnrichedContributor[]
): Map<string, number> {
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
}

/** Build table rows with scaled cumulative diff delta */
export function buildTableRowsWithScaling(
  contributors: EnrichedContributor[],
  cumulativeDiffDeltaByContributor: Map<string, number>
): ContributorPerformanceWithDelta[] {
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
}

/** Calculate median values for benchmark lines */
export function calculateMedianValues(
  contributorMetrics: ContributorMetrics[],
  generateCumulativeData: (additions: number[], deletions: number[]) => CumulativeDataPoint[]
): { orgMedian: number | undefined; teamMedian: number | undefined } {
  if (contributorMetrics.length === 0) {
    return { orgMedian: undefined, teamMedian: undefined };
  }

  const contributorFinalValues = contributorMetrics
    .map((contributor) => {
      const contributorCumulativeData = generateCumulativeData(
        contributor.additionsData,
        contributor.deletionsData
      );
      return contributorCumulativeData[contributorCumulativeData.length - 1]?.cumulative ?? 0;
    })
    .sort((a, b) => a - b);

  const midIndex = Math.floor(contributorFinalValues.length / 2);
  const teamMedian =
    contributorFinalValues.length % 2 === 0
      ? (contributorFinalValues[midIndex - 1] + contributorFinalValues[midIndex]) / 2
      : contributorFinalValues[midIndex];

  const p75Index = Math.floor(contributorFinalValues.length * 0.75);
  const orgMedian = contributorFinalValues[p75Index] ?? teamMedian * 1.3;

  return {
    orgMedian: Math.round(orgMedian),
    teamMedian: Math.round(teamMedian),
  };
}

/** Prepare carousel contributors with chart data */
export function prepareCarouselContributors(
  contributors: EnrichedContributor[],
  contributorMetrics: ContributorMetrics[],
  generateCumulativeData: (additions: number[], deletions: number[]) => CumulativeDataPoint[],
  timeRange: string
) {
  const sorted = [...contributors].sort((a, b) => b.performanceValue - a.performanceValue);

  return sorted.map((contributor, index) => {
    const metrics = contributorMetrics.find((m) => m.contributorName === contributor.contributorName);
    const chartData = metrics ? generateCumulativeData(metrics.additionsData, metrics.deletionsData) : [];

    const filteredChartData =
      timeRange === "max"
        ? chartData
        : (() => {
            const weeksToShow: Record<string, number> = {
              "1m": 4,
              "3m": 13,
              "1y": 52,
              max: chartData.length,
            };
            const weeks = weeksToShow[timeRange] ?? chartData.length;
            return chartData.slice(-weeks);
          })();

    const positiveScore = filteredChartData.reduce((sum, d) => sum + d.additions, 0);
    const penaltyScore = filteredChartData.reduce((sum, d) => sum + d.deletions, 0);

    return {
      id: contributor.contributorName,
      name: contributor.contributorName,
      rank: index + 1,
      score: contributor.performanceValue,
      chartData: filteredChartData,
      positiveScore,
      penaltyScore,
    };
  });
}

/** Filter aggregate data by time range */
export function filterAggregateDataByTimeRange(
  aggregateCumulativeData: CumulativeDataPoint[],
  timeRange: string
): CumulativeDataPoint[] {
  if (timeRange === "max") return aggregateCumulativeData;

  const weeksToShow: Record<string, number> = {
    "1m": 4,
    "3m": 13,
    "1y": 52,
    max: aggregateCumulativeData.length,
  };
  const weeks = weeksToShow[timeRange] ?? aggregateCumulativeData.length;

  return aggregateCumulativeData.slice(-weeks);
}
