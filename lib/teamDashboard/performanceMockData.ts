import type { MemberPerformanceRow } from "./types";
import type { MemberPerformanceDataPoint } from "./performanceTypes";

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
 * Generates member performance time-series data with daily data points over ~90 days.
 * Each data point includes team average value and individual member values.
 * Uses deterministic noise based on member name + day index for stable data across renders.
 */
export function generateMemberPerformanceTimeSeries(
  members: MemberPerformanceRow[]
): MemberPerformanceDataPoint[] {
  const dataPoints: MemberPerformanceDataPoint[] = [];
  const days = 90; // ~3 months of data
  const today = new Date();

  for (let dayOffset = days - 1; dayOffset >= 0; dayOffset--) {
    const date = new Date(today);
    date.setDate(date.getDate() - dayOffset);
    const dateString = date.toISOString().split("T")[0]; // YYYY-MM-DD

    const memberValues: Record<string, number> = {};

    // Calculate each member's value for this day
    for (const member of members) {
      const baseSeed = hashString(member.memberName);
      const daySeed = baseSeed + dayOffset;

      // Random walk variation: ±5 points per day
      const variation = (noise(daySeed) - 0.5) * 10;

      // Use member's current performanceValue as baseline
      const memberValue = Math.max(
        0,
        Math.min(100, member.performanceValue + variation)
      );

      memberValues[member.memberName] = Math.round(memberValue);
    }

    // Calculate team average (matches Overview gauge calculation pattern)
    const memberValueArray = Object.values(memberValues);
    const sum = memberValueArray.reduce((acc, val) => acc + val, 0);
    const teamAverage = Math.round(sum / memberValueArray.length);

    dataPoints.push({
      date: dateString,
      value: teamAverage,
      memberValues,
    });
  }

  return dataPoints;
}
