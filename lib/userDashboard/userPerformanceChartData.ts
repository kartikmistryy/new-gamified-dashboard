import type { ChartEvent, ChartAnnotation } from "@/lib/orgDashboard/types";
import type { UserPerformanceComparisonDataPoint } from "@/components/dashboard/UserPerformanceComparisonChart";

/**
 * User Performance Chart Data
 * Data structure and mock data for individual user performance tracking over time.
 */

export type UserPerformanceDataPoint = {
  date: string;
  week: string;
  value: number;
};

/** User-specific events (e.g., PTO, training, milestones) */
export const USER_PERFORMANCE_EVENTS: ChartEvent[] = [
  { date: "2024-02-12", label: "Training Week", type: "milestone" },
  { date: "2024-05-20", label: "PTO", type: "holiday" },
  { date: "2024-08-05", label: "Conference", type: "milestone" },
  { date: "2024-11-25", label: "Thanksgiving", type: "holiday" },
  { date: "2024-12-23", label: "Winter Break", type: "holiday" },
];

/** User performance milestones/annotations */
export const USER_PERFORMANCE_ANNOTATIONS: ChartAnnotation[] = [
  { date: "2024-03-11", label: "Major Release", value: 82 },
  { date: "2024-06-17", label: "Project Lead", value: 75 },
  { date: "2024-09-23", label: "Mentorship", value: 68 },
];

/**
 * Generate weekly performance data for an individual user.
 * Values represent percentile performance normalized to rolling average.
 */
export function generateUserPerformanceData(
  userId: string,
  basePerformance?: number
): UserPerformanceDataPoint[] {
  const data: UserPerformanceDataPoint[] = [];
  const startDate = new Date("2024-01-01");
  const endDate = new Date("2025-01-06");

  // Base performance score (default to random value between 30-80)
  const baseScore = basePerformance ?? Math.floor(Math.random() * 50 + 30);

  // Create deterministic but realistic variations based on userId
  const seed = userId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const noise = () => (Math.sin(seed * data.length * 0.1) + 1) * 10 - 10;

  // Weekly performance values with realistic trends
  const current = new Date(startDate);
  let weekIndex = 0;

  while (current <= endDate) {
    const dateStr = current.toISOString().split("T")[0];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[current.getMonth()];
    const year = current.getFullYear();
    const week = `${month} ${year}`;

    // Generate performance value with:
    // - Base score
    // - Seasonal variation (slightly lower in summer/winter holidays)
    // - Random noise
    // - Growth trend (slight upward trend over time)
    const seasonalFactor = Math.sin((weekIndex / 52) * Math.PI * 2) * -5; // -5 to +5
    const growthTrend = weekIndex * 0.3; // Gradual improvement
    const randomNoise = noise();

    const value = Math.max(
      10,
      Math.min(
        95,
        Math.round(baseScore + seasonalFactor + growthTrend + randomNoise)
      )
    );

    data.push({
      date: dateStr,
      week,
      value,
    });

    // Move to next week
    current.setDate(current.getDate() + 7);
    weekIndex++;
  }

  return data;
}

/** Performance zones for user dashboard (matching org dashboard thresholds) */
export const USER_PERFORMANCE_ZONES = {
  excellent: { min: 70, max: 100, color: "rgba(85, 182, 133, 0.5)", label: "Above P70 (Excellent)" },
  aboveAvg: { min: 60, max: 70, color: "rgba(85, 182, 133, 0.3)", label: "P60-P70 (Above Avg)" },
  belowAvg: { min: 30, max: 40, color: "rgba(202, 58, 49, 0.25)", label: "P30-P40 (Below Avg)" },
  concerning: { min: 0, max: 30, color: "rgba(202, 58, 49, 0.4)", label: "Below P30 (Concerning)" },
} as const;

/** Baseline reference lines for user performance */
export const USER_PERFORMANCE_BASELINES = {
  p60: { value: 60, color: "#2E7D32", label: "Rolling Avg P60 (baseline)" },
  p40: { value: 40, color: "#E65100", label: "Rolling Avg P40 (baseline)" },
} as const;

/**
 * Generate team median performance data.
 * Team median typically represents the middle performance of the user's team.
 */
export function generateTeamMedianData(): UserPerformanceDataPoint[] {
  const data: UserPerformanceDataPoint[] = [];
  const startDate = new Date("2024-01-01");
  const endDate = new Date("2025-01-06");

  // Team median typically hovers around 50-60 percentile with moderate variations
  const baseScore = 55;

  const current = new Date(startDate);
  let weekIndex = 0;

  while (current <= endDate) {
    const dateStr = current.toISOString().split("T")[0];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[current.getMonth()];
    const year = current.getFullYear();
    const week = `${month} ${year}`;

    // Generate stable median with small variations
    const seasonalFactor = Math.sin((weekIndex / 52) * Math.PI * 2) * -3;
    const randomNoise = (Math.sin(weekIndex * 0.5) + 1) * 3 - 3;

    const value = Math.max(
      35,
      Math.min(
        75,
        Math.round(baseScore + seasonalFactor + randomNoise)
      )
    );

    data.push({
      date: dateStr,
      week,
      value,
    });

    current.setDate(current.getDate() + 7);
    weekIndex++;
  }

  return data;
}

/**
 * Generate organization median performance data.
 * Org median represents the overall company performance baseline.
 */
export function generateOrgMedianData(): UserPerformanceDataPoint[] {
  const data: UserPerformanceDataPoint[] = [];
  const startDate = new Date("2024-01-01");
  const endDate = new Date("2025-01-06");

  // Org median is typically stable around 50 percentile (by definition)
  const baseScore = 50;

  const current = new Date(startDate);
  let weekIndex = 0;

  while (current <= endDate) {
    const dateStr = current.toISOString().split("T")[0];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[current.getMonth()];
    const year = current.getFullYear();
    const week = `${month} ${year}`;

    // Generate very stable org median with minimal variations
    const seasonalFactor = Math.sin((weekIndex / 52) * Math.PI * 2) * -2;
    const randomNoise = (Math.cos(weekIndex * 0.3) + 1) * 1.5 - 1.5;

    const value = Math.max(
      45,
      Math.min(
        55,
        Math.round(baseScore + seasonalFactor + randomNoise)
      )
    );

    data.push({
      date: dateStr,
      week,
      value,
    });

    current.setDate(current.getDate() + 7);
    weekIndex++;
  }

  return data;
}

/**
 * Generate user cumulative performance comparison data (for Plotly chart).
 * Includes cumulative DiffDelta, add, and self-delete values.
 * Features realistic variations including:
 * - Sprint cycles (high activity followed by cooldown)
 * - Random productivity spikes and dips
 * - Seasonal variations (holidays, vacations)
 * - Refactoring periods (higher delete ratio)
 */
export function generateUserCumulativePerformanceData(
  userId: string,
  basePerformance?: number
): UserPerformanceComparisonDataPoint[] {
  const data: UserPerformanceComparisonDataPoint[] = [];
  const startDate = new Date("2024-01-01");
  const endDate = new Date("2025-01-06");

  // Base performance influences the growth rate and add/delete ratio
  const performanceScore = basePerformance ?? Math.floor(Math.random() * 50 + 30);
  const seed = userId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);

  let cumulativeValue = 0;
  const current = new Date(startDate);
  let weekIndex = 0;

  // Track sprint cycles (2-week sprints with varying intensity)
  let sprintPhase = 0;

  while (current <= endDate) {
    const dateStr = current.toISOString().split("T")[0];
    const month = current.getMonth();

    // Sprint cycle variations (0-3 representing sprint phases)
    sprintPhase = weekIndex % 4;
    const sprintMultiplier =
      sprintPhase === 0 ? 1.3 :  // Sprint start - high activity
      sprintPhase === 1 ? 1.5 :  // Sprint peak - highest activity
      sprintPhase === 2 ? 0.9 :  // Sprint end - lower activity
      0.7;                        // Sprint planning - lowest activity

    // Seasonal variations (lower activity during holidays)
    const isHolidaySeason = month === 11 || month === 0; // December, January
    const isSummerSlump = month === 6 || month === 7;     // July, August
    const seasonalMultiplier =
      isHolidaySeason ? 0.6 :
      isSummerSlump ? 0.8 :
      1.0;

    // Random productivity spikes and dips (simulates good/bad weeks)
    const randomFactor = 0.7 + Math.random() * 0.6; // 0.7 to 1.3

    // Occasional major refactoring weeks (every ~8 weeks)
    const isRefactoringWeek = weekIndex % 8 === 5;
    const refactoringMultiplier = isRefactoringWeek ? 1.8 : 1.0;

    // Base weekly contribution
    const baseAdd = performanceScore * 3 + 80;

    // Apply all multipliers with more pronounced variations
    const weeklyAdd = Math.max(
      15,
      Math.round(
        baseAdd *
        sprintMultiplier *
        seasonalMultiplier *
        randomFactor *
        refactoringMultiplier +
        Math.sin((seed + weekIndex) * 0.4) * 50 // Additional wave variation
      )
    );

    // Dynamic churn rate based on activity type
    let churnRate = Math.max(0.1, Math.min(0.5, (100 - performanceScore) / 180));

    // Refactoring weeks have much higher delete ratio
    if (isRefactoringWeek) {
      churnRate *= 2.5;
    }

    // Sprint planning weeks have lower delete (more planning, less coding)
    if (sprintPhase === 3) {
      churnRate *= 0.5;
    }

    const weeklySelfDelete = Math.max(
      8,
      Math.round(
        weeklyAdd * churnRate +
        Math.cos((seed + weekIndex) * 0.5) * 25 + // Variation in deletes
        (Math.random() - 0.5) * 30 // Random delete spikes
      )
    );

    // Calculate cumulative value
    cumulativeValue += weeklyAdd - weeklySelfDelete;

    data.push({
      date: dateStr,
      cumulative: Math.round(cumulativeValue),
      add: weeklyAdd,
      selfDelete: weeklySelfDelete,
    });

    current.setDate(current.getDate() + 7);
    weekIndex++;
  }

  return data;
}

/**
 * Generate team median cumulative performance for comparison.
 * Shows more realistic team-level variations.
 */
export function generateTeamMedianCumulativeData(): { date: string; value: number }[] {
  const data: { date: string; value: number }[] = [];
  const startDate = new Date("2024-01-01");
  const endDate = new Date("2025-01-06");

  // Team median grows at a moderate rate with realistic variations
  let cumulativeValue = 0;
  const current = new Date(startDate);
  let weekIndex = 0;

  while (current <= endDate) {
    const dateStr = current.toISOString().split("T")[0];
    const month = current.getMonth();

    // Team sprint cycles (less pronounced than individual)
    const sprintPhase = weekIndex % 4;
    const sprintMultiplier =
      sprintPhase === 0 ? 1.1 :
      sprintPhase === 1 ? 1.2 :
      sprintPhase === 2 ? 0.95 :
      0.85;

    // Seasonal variations (team level)
    const isHolidaySeason = month === 11 || month === 0;
    const isSummerSlump = month === 6 || month === 7;
    const seasonalMultiplier =
      isHolidaySeason ? 0.75 :
      isSummerSlump ? 0.85 :
      1.0;

    // Base weekly growth
    const baseGrowth = 130;
    const weeklyGrowth = Math.round(
      baseGrowth *
      sprintMultiplier *
      seasonalMultiplier +
      Math.sin(weekIndex * 0.3) * 25 + // Wave variation
      (Math.random() - 0.5) * 20        // Random noise
    );

    cumulativeValue += weeklyGrowth;

    data.push({
      date: dateStr,
      value: Math.round(cumulativeValue),
    });

    current.setDate(current.getDate() + 7);
    weekIndex++;
  }

  return data;
}

/**
 * Generate org median cumulative performance for comparison.
 * Shows organization-wide baseline with subtle variations.
 */
export function generateOrgMedianCumulativeData(): { date: string; value: number }[] {
  const data: { date: string; value: number }[] = [];
  const startDate = new Date("2024-01-01");
  const endDate = new Date("2025-01-06");

  // Org median grows at baseline rate (more stable than team/individual)
  let cumulativeValue = 0;
  const current = new Date(startDate);
  let weekIndex = 0;

  while (current <= endDate) {
    const dateStr = current.toISOString().split("T")[0];
    const month = current.getMonth();

    // Minimal sprint variations at org level
    const sprintPhase = weekIndex % 4;
    const sprintMultiplier =
      sprintPhase === 1 ? 1.08 :  // Slight peak
      sprintPhase === 3 ? 0.92 :  // Slight dip
      1.0;

    // Seasonal variations (org-wide trends)
    const isHolidaySeason = month === 11 || month === 0;
    const isSummerSlump = month === 6 || month === 7;
    const seasonalMultiplier =
      isHolidaySeason ? 0.8 :
      isSummerSlump ? 0.9 :
      1.0;

    // Base weekly growth (lower than team median)
    const baseGrowth = 110;
    const weeklyGrowth = Math.round(
      baseGrowth *
      sprintMultiplier *
      seasonalMultiplier +
      Math.sin(weekIndex * 0.25) * 15 + // Gentle wave
      (Math.random() - 0.5) * 10         // Minimal noise
    );

    cumulativeValue += weeklyGrowth;

    data.push({
      date: dateStr,
      value: Math.round(cumulativeValue),
    });

    current.setDate(current.getDate() + 7);
    weekIndex++;
  }

  return data;
}
