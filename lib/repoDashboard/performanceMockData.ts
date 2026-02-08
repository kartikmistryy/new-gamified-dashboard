import type { ContributorPerformanceRow } from "./types";
import type { ContributorPerformanceDataPoint } from "./performanceTypes";

/** Simple deterministic noise function based on seed */
function noise(seed: number): number {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

/** Simple hash function to convert string to number seed */
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
 * Generates contributor performance time-series data with daily data points over ~90 days.
 * Each data point includes repository average value and individual contributor values.
 * Uses deterministic noise based on contributor name + day index for stable data across renders.
 */
export function generateContributorPerformanceTimeSeries(
  contributors: ContributorPerformanceRow[]
): ContributorPerformanceDataPoint[] {
  const dataPoints: ContributorPerformanceDataPoint[] = [];
  const days = 90; // ~3 months of data
  const today = new Date();

  for (let dayOffset = days - 1; dayOffset >= 0; dayOffset--) {
    const date = new Date(today);
    date.setDate(date.getDate() - dayOffset);
    const dateString = date.toISOString().split("T")[0]; // YYYY-MM-DD

    const contributorValues: Record<string, number> = {};

    // Calculate each contributor's value for this day
    for (const contributor of contributors) {
      const baseSeed = hashString(contributor.contributorName);
      const daySeed = baseSeed + dayOffset;

      // Random walk variation: ±5 points per day
      const variation = (noise(daySeed) - 0.5) * 10;

      // Use contributor's current performanceValue as baseline
      const contributorValue = Math.max(
        0,
        Math.min(100, contributor.performanceValue + variation)
      );

      contributorValues[contributor.contributorName] = Math.round(contributorValue);
    }

    // Calculate repository average (matches Overview gauge calculation pattern)
    const contributorValueArray = Object.values(contributorValues);
    const sum = contributorValueArray.reduce((acc, val) => acc + val, 0);
    const repoAverage = Math.round(sum / contributorValueArray.length);

    dataPoints.push({
      date: dateString,
      value: repoAverage,
      contributorValues,
    });
  }

  return dataPoints;
}
