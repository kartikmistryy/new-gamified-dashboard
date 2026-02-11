/** Repo Performance Helpers - UI helpers and insights */

import type { ContributorPerformanceRow } from "../types";
import type { ViewMode, PerformanceFilter, ContributorPerformanceDataPoint } from "../types";
import type { TimeRangeKey } from "@/lib/shared/types/timeRangeTypes";
import type { ChartInsight } from "@/lib/dashboard/entities/team/types";
import { smartSample, filterByTimeRange, isTimeRangeSufficient } from "@/lib/shared/performanceUtils";

// Re-export shared utilities for backward compatibility
export { smartSample, filterByTimeRange, isTimeRangeSufficient };

// Re-export data generators
export {
  generateContributorCodeMetrics,
  calculateMedianCodeMetrics,
  generateContributorTimeSeriesMetrics,
  aggregateContributorMetrics,
  generateCumulativeData,
  type ContributorTimeSeriesMetrics,
} from "../mocks/repoTimeSeriesGenerators";

/** Gets visible contributors for a filter in individual view mode */
export function getVisibleContributorsForFilter(
  contributors: ContributorPerformanceRow[],
  filter: PerformanceFilter,
  viewMode: ViewMode
): Set<string> {
  if (viewMode === "aggregate") {
    return new Set();
  }

  let filtered: ContributorPerformanceRow[] = [];

  switch (filter) {
    case "mostProductive":
      filtered = [...contributors].sort((a, b) => b.performanceValue - a.performanceValue).slice(0, 3);
      break;

    case "leastProductive":
      filtered = [...contributors].sort((a, b) => a.performanceValue - b.performanceValue).slice(0, 3);
      break;

    case "mostImproved":
      filtered = contributors.filter((c) => (c.change ?? 0) > 0);
      break;

    case "mostRegressed":
      filtered = contributors.filter((c) => (c.change ?? 0) < 0);
      break;

    case "highestChurn":
      filtered = [...contributors].sort((a, b) => (b.churnRate ?? 0) - (a.churnRate ?? 0)).slice(0, 3);
      break;

    case "lowestChurn":
      filtered = [...contributors].sort((a, b) => (a.churnRate ?? 0) - (b.churnRate ?? 0)).slice(0, 3);
      break;
  }

  return new Set(filtered.map((c) => c.contributorName));
}

/** Generates performance insights based on contributor data and time range */
export function getPerformanceInsights(
  contributors: ContributorPerformanceRow[],
  data: ContributorPerformanceDataPoint[],
  timeRange: TimeRangeKey
): ChartInsight[] {
  const insights: ChartInsight[] = [];

  if (data.length < 2) {
    return insights;
  }

  const firstValue = data[0].value;
  const lastValue = data[data.length - 1].value;
  const change = lastValue - firstValue;

  const periodLabels: Record<TimeRangeKey, string> = {
    "1m": "past month",
    "3m": "past 3 months",
    "1y": "past year",
    "max": "entire period",
  };
  const period = periodLabels[timeRange];

  // Trend insight
  if (change > 5) {
    insights.push({
      id: "trend-positive",
      text: `Repository performance increased ${Math.round(change)} points over the ${period}`,
    });
  } else if (change < -5) {
    insights.push({
      id: "trend-negative",
      text: `Repository performance decreased ${Math.abs(Math.round(change))} points over the ${period}`,
    });
  } else {
    insights.push({
      id: "trend-stable",
      text: `Repository performance remained stable over the ${period}`,
    });
  }

  // Top performers insight (performanceValue >= 75)
  const topPerformers = contributors.filter((c) => c.performanceValue >= 75);
  if (topPerformers.length > 0) {
    const names = topPerformers.map((c) => c.contributorName).slice(0, 3).join(", ");
    insights.push({
      id: "top-performers",
      text: `${topPerformers.length} high performer${topPerformers.length > 1 ? "s" : ""}: ${names}`,
    });
  }

  // Improved contributors insight (change > 10)
  const improvedContributors = contributors.filter((c) => (c.change ?? 0) > 10);
  if (improvedContributors.length > 0) {
    const names = improvedContributors.map((c) => c.contributorName).slice(0, 3).join(", ");
    insights.push({
      id: "improved-contributors",
      text: `${improvedContributors.length} contributor${improvedContributors.length > 1 ? "s" : ""} improved significantly: ${names}`,
    });
  }

  // Low performers concern (performanceValue < 40)
  const lowPerformers = contributors.filter((c) => c.performanceValue < 40);
  if (lowPerformers.length > 0) {
    const names = lowPerformers.map((c) => c.contributorName).slice(0, 2).join(", ");
    insights.push({
      id: "low-performers",
      text: `${lowPerformers.length} contributor${lowPerformers.length > 1 ? "s need" : " needs"} attention: ${names}`,
    });
  }

  return insights.slice(0, 4);
}
