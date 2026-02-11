/** User Performance Data Generators */

import type { UserPerformanceDataPoint, UserPerformanceComparisonDataPoint } from "../charts/performance/userPerformanceChartData";
import {
  createSeededRandom,
  formatWeekLabel,
  getSeasonalMultiplier,
  getSprintMultiplier,
  isRefactoringWeek,
  generateNoise,
} from "./dataGeneratorUtils";

/** Generate weekly performance data for an individual user */
export function generateUserPerformanceData(
  userId: string,
  basePerformance?: number
): UserPerformanceDataPoint[] {
  const data: UserPerformanceDataPoint[] = [];
  const startDate = new Date("2024-01-01");
  const endDate = new Date("2025-01-06");

  const random = createSeededRandom(userId);
  const baseScore = basePerformance ?? Math.floor(random() * 50 + 30);
  const seed = userId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const current = new Date(startDate);
  let weekIndex = 0;

  while (current <= endDate) {
    const dateStr = current.toISOString().split("T")[0];
    const week = formatWeekLabel(current);

    const seasonalFactor = Math.sin((weekIndex / 52) * Math.PI * 2) * -5;
    const growthTrend = weekIndex * 0.3;
    const randomNoise = generateNoise(seed, weekIndex);

    const value = Math.max(10, Math.min(95, Math.round(baseScore + seasonalFactor + growthTrend + randomNoise)));

    data.push({ date: dateStr, week, value });

    current.setDate(current.getDate() + 7);
    weekIndex++;
  }

  return data;
}

/** Generate user cumulative performance comparison data */
export function generateUserCumulativePerformanceData(
  userId: string,
  basePerformance?: number
): UserPerformanceComparisonDataPoint[] {
  const data: UserPerformanceComparisonDataPoint[] = [];
  const startDate = new Date("2024-01-01");
  const endDate = new Date("2025-01-06");

  const random = createSeededRandom(userId);
  const performanceScore = basePerformance ?? Math.floor(random() * 50 + 30);
  const seed = userId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);

  let cumulativeValue = 0;
  const current = new Date(startDate);
  let weekIndex = 0;

  while (current <= endDate) {
    const dateStr = current.toISOString().split("T")[0];
    const month = current.getMonth();

    const sprintMultiplier = getSprintMultiplier(weekIndex, 'high');
    const seasonalMultiplier = getSeasonalMultiplier(month);
    const randomFactor = 0.7 + random() * 0.6;
    const refactoringMultiplier = isRefactoringWeek(weekIndex) ? 1.8 : 1.0;

    const baseAdd = performanceScore * 3 + 80;
    const weeklyAdd = Math.max(
      15,
      Math.round(
        baseAdd * sprintMultiplier * seasonalMultiplier * randomFactor * refactoringMultiplier +
        Math.sin((seed + weekIndex) * 0.4) * 50
      )
    );

    let churnRate = Math.max(0.1, Math.min(0.5, (100 - performanceScore) / 180));
    if (isRefactoringWeek(weekIndex)) churnRate *= 2.5;
    if (weekIndex % 4 === 3) churnRate *= 0.5;

    const weeklySelfDelete = Math.max(
      8,
      Math.round(
        weeklyAdd * churnRate +
        Math.cos((seed + weekIndex) * 0.5) * 25 +
        (random() - 0.5) * 30
      )
    );

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
