import type { ContributorPerformanceRow } from "./types";
import type { ViewMode, PerformanceFilter, ContributorPerformanceDataPoint } from "./performanceTypes";
import type { TimeRangeKey } from "@/lib/orgDashboard/timeRangeTypes";
import type { ChartInsight } from "@/lib/orgDashboard/types";
import type { ContributorCodeMetrics } from "@/components/dashboard/ContributorPerformanceBarChart";

/**
 * Smart sampling: reduces data to target number of points while preserving first and last.
 * Always includes first and last point, distributes remaining points evenly.
 */
export function smartSample<T extends { date: string }>(
  data: T[],
  targetPoints = 40
): T[] {
  if (data.length <= targetPoints) {
    return data;
  }

  const sampled: T[] = [];
  const step = (data.length - 1) / (targetPoints - 1);

  for (let i = 0; i < targetPoints; i++) {
    const index = Math.round(i * step);
    sampled.push(data[index]);
  }

  return sampled;
}

/**
 * Filters data by time range relative to the last data point.
 * "max" returns all data, other ranges filter to the specified duration.
 */
export function filterByTimeRange<T extends { date: string }>(
  data: T[],
  timeRange: TimeRangeKey
): T[] {
  if (timeRange === "max" || data.length === 0) {
    return data;
  }

  const lastDate = new Date(data[data.length - 1].date);
  let monthsBack = 0;

  switch (timeRange) {
    case "1m":
      monthsBack = 1;
      break;
    case "3m":
      monthsBack = 3;
      break;
    case "1y":
      monthsBack = 12;
      break;
  }

  const startDate = new Date(lastDate);
  startDate.setMonth(startDate.getMonth() - monthsBack);

  return data.filter((point) => new Date(point.date) >= startDate);
}

/**
 * Checks if a time range has sufficient data (>= 2 points) to draw a line chart.
 */
export function isTimeRangeSufficient<T extends { date: string }>(
  data: T[],
  timeRange: TimeRangeKey
): boolean {
  const filtered = filterByTimeRange(data, timeRange);
  return filtered.length >= 2;
}

/**
 * Gets visible contributors for a filter in individual view mode.
 * Returns Set of contributor names to display.
 */
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
      // Sort by performanceValue desc, take top 3
      filtered = [...contributors]
        .sort((a, b) => b.performanceValue - a.performanceValue)
        .slice(0, 3);
      break;

    case "leastProductive":
      // Sort by performanceValue asc, take top 3
      filtered = [...contributors]
        .sort((a, b) => a.performanceValue - b.performanceValue)
        .slice(0, 3);
      break;

    case "mostImproved":
      // Filter where change > 0
      filtered = contributors.filter((c) => (c.change ?? 0) > 0);
      break;

    case "mostRegressed":
      // Filter where change < 0
      filtered = contributors.filter((c) => (c.change ?? 0) < 0);
      break;

    case "highestChurn":
      // Sort by churnRate desc, take top 3
      filtered = [...contributors]
        .sort((a, b) => (b.churnRate ?? 0) - (a.churnRate ?? 0))
        .slice(0, 3);
      break;

    case "lowestChurn":
      // Sort by churnRate asc, take top 3
      filtered = [...contributors]
        .sort((a, b) => (a.churnRate ?? 0) - (b.churnRate ?? 0))
        .slice(0, 3);
      break;
  }

  return new Set(filtered.map((c) => c.contributorName));
}

/**
 * Generates performance insights based on contributor data and time range.
 * Returns up to 4 insights personalized with contributor names.
 */
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

  // Time range label
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

  // Return up to 4 insights
  return insights.slice(0, 4);
}

/**
 * Simple deterministic noise function based on seed
 */
function noise(seed: number): number {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

/**
 * Hash function to convert string to number seed
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Generates mock code metrics (additions and deletions) for contributors.
 * Higher performing contributors tend to have more additions and fewer deletions.
 */
export function generateContributorCodeMetrics(
  contributors: ContributorPerformanceRow[]
): ContributorCodeMetrics[] {
  return contributors.map((contributor, index) => {
    const seed = hashString(contributor.contributorName + contributor.repoId);
    const performanceRatio = contributor.performanceValue / 100; // 0-1

    // Higher performance = more additions
    // Base additions: 500-5000 lines, weighted by performance
    const baseAdditions = 500 + performanceRatio * 4500;
    const additionsVariation = (noise(seed) - 0.5) * 1000;
    const additions = Math.round(Math.max(200, baseAdditions + additionsVariation));

    // Higher performance = fewer deletions (better code quality, less rework)
    // Base deletions: 200-2000 lines, inversely weighted by performance
    const baseDeletions = 200 + (1 - performanceRatio) * 1800;
    const deletionsVariation = (noise(seed + 1000) - 0.5) * 500;
    const deletions = Math.round(Math.max(100, baseDeletions + deletionsVariation));

    return {
      contributorName: contributor.contributorName,
      additions,
      deletions,
    };
  });
}

/**
 * Calculates median code metrics for a team/org.
 * Returns median additions and deletions values.
 */
export function calculateMedianCodeMetrics(
  metrics: ContributorCodeMetrics[]
): { additions: number; deletions: number } {
  if (metrics.length === 0) {
    return { additions: 0, deletions: 0 };
  }

  const sortedAdditions = [...metrics].map((m) => m.additions).sort((a, b) => a - b);
  const sortedDeletions = [...metrics].map((m) => m.deletions).sort((a, b) => a - b);

  const medianIndex = Math.floor(metrics.length / 2);

  return {
    additions:
      metrics.length % 2 === 0
        ? Math.round((sortedAdditions[medianIndex - 1] + sortedAdditions[medianIndex]) / 2)
        : sortedAdditions[medianIndex],
    deletions:
      metrics.length % 2 === 0
        ? Math.round((sortedDeletions[medianIndex - 1] + sortedDeletions[medianIndex]) / 2)
        : sortedDeletions[medianIndex],
  };
}

export type ContributorTimeSeriesMetrics = {
  contributorName: string;
  contributorAvatar: string;
  rank: number;
  totalCommits: number;
  totalAdditions: number;
  totalDeletions: number;
  commitData: Array<{ week: string; value: number }>;
  additionsData: Array<{ week: string; value: number }>;
  deletionsData: Array<{ week: string; value: number }>;
};

/**
 * Generates weekly time-series data for commits, additions, and deletions.
 * Creates realistic patterns with variation based on contributor performance.
 */
export function generateContributorTimeSeriesMetrics(
  contributors: ContributorPerformanceRow[],
  weekCount: number = 52
): ContributorTimeSeriesMetrics[] {
  // Generate week labels
  const weeks: string[] = [];
  const today = new Date();
  for (let i = weekCount - 1; i >= 0; i--) {
    const weekDate = new Date(today);
    weekDate.setDate(weekDate.getDate() - i * 7);
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    weeks.push(`${monthNames[weekDate.getMonth()]} '${weekDate.getFullYear().toString().slice(2)}`);
  }

  return contributors.map((contributor, contributorIndex) => {
    const seed = hashString(contributor.contributorName + contributor.repoId);
    const performanceRatio = contributor.performanceValue / 100;

    // Base activity levels influenced by performance
    const baseCommitsPerWeek = 5 + performanceRatio * 15; // 5-20 commits/week
    const baseLinesPerCommit = 100 + performanceRatio * 300; // 100-400 lines/commit

    let totalCommits = 0;
    let totalAdditions = 0;
    let totalDeletions = 0;

    const commitData: Array<{ week: string; value: number }> = [];
    const additionsData: Array<{ week: string; value: number }> = [];
    const deletionsData: Array<{ week: string; value: number }> = [];

    for (let weekIndex = 0; weekIndex < weekCount; weekIndex++) {
      // Create realistic variation with some weekly patterns
      const weekSeed = seed + weekIndex * 1000;
      const weekVariation = noise(weekSeed);
      const seasonalFactor = 0.8 + 0.4 * Math.sin((weekIndex / 52) * Math.PI * 2); // Yearly cycle

      // Commits per week with variation
      const commits = Math.round(
        Math.max(0, baseCommitsPerWeek * seasonalFactor * (0.5 + weekVariation))
      );

      // Lines per commit with variation
      const additionsPerCommit = baseLinesPerCommit * (0.7 + noise(weekSeed + 100) * 0.6);
      const deletionsPerCommit = baseLinesPerCommit * (0.3 + noise(weekSeed + 200) * 0.4) * (1 - performanceRatio * 0.3);

      const additions = Math.round(commits * additionsPerCommit);
      const deletions = Math.round(commits * deletionsPerCommit);

      totalCommits += commits;
      totalAdditions += additions;
      totalDeletions += deletions;

      commitData.push({ week: weeks[weekIndex], value: commits });
      additionsData.push({ week: weeks[weekIndex], value: additions });
      deletionsData.push({ week: weeks[weekIndex], value: deletions });
    }

    return {
      contributorName: contributor.contributorName,
      contributorAvatar: contributor.contributorAvatar,
      rank: contributor.rank,
      totalCommits,
      totalAdditions,
      totalDeletions,
      commitData,
      additionsData,
      deletionsData,
    };
  });
}

/**
 * Aggregates individual contributor time-series data into repo-level aggregate.
 */
export function aggregateContributorMetrics(
  contributors: ContributorTimeSeriesMetrics[]
): {
  commitData: Array<{ week: string; value: number }>;
  additionsData: Array<{ week: string; value: number }>;
  deletionsData: Array<{ week: string; value: number }>;
} {
  if (contributors.length === 0) {
    return { commitData: [], additionsData: [], deletionsData: [] };
  }

  const weekCount = contributors[0].commitData.length;
  const commitData: Array<{ week: string; value: number }> = [];
  const additionsData: Array<{ week: string; value: number }> = [];
  const deletionsData: Array<{ week: string; value: number }> = [];

  for (let i = 0; i < weekCount; i++) {
    const week = contributors[0].commitData[i].week;
    let commits = 0;
    let additions = 0;
    let deletions = 0;

    contributors.forEach((contributor) => {
      commits += contributor.commitData[i].value;
      additions += contributor.additionsData[i].value;
      deletions += contributor.deletionsData[i].value;
    });

    commitData.push({ week, value: commits });
    additionsData.push({ week, value: additions });
    deletionsData.push({ week, value: deletions });
  }

  return { commitData, additionsData, deletionsData };
}

/**
 * Converts time-series data to cumulative format for comparison charts.
 * Returns data with cumulative, additions, and deletions for each week.
 */
export function generateCumulativeData(
  additionsData: Array<{ week: string; value: number }>,
  deletionsData: Array<{ week: string; value: number }>
): Array<{ week: string; cumulative: number; additions: number; deletions: number }> {
  const result: Array<{ week: string; cumulative: number; additions: number; deletions: number }> = [];
  let cumulative = 0;

  for (let i = 0; i < additionsData.length; i++) {
    const additions = additionsData[i]?.value ?? 0;
    const deletions = deletionsData[i]?.value ?? 0;
    cumulative += additions - deletions;

    result.push({
      week: additionsData[i]?.week ?? "",
      cumulative,
      additions,
      deletions,
    });
  }

  return result;
}
