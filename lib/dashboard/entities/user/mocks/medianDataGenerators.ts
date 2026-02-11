/** Median Performance Data Generators - team and org baselines */

import type { UserPerformanceDataPoint } from "../charts/performance/userPerformanceChartData";
import {
  createSeededRandom,
  formatWeekLabel,
  getSeasonalMultiplier,
  getSprintMultiplier,
} from "./dataGeneratorUtils";

/** Generate team median performance data */
export function generateTeamMedianData(): UserPerformanceDataPoint[] {
  const data: UserPerformanceDataPoint[] = [];
  const startDate = new Date("2024-01-01");
  const endDate = new Date("2025-01-06");
  const baseScore = 55;

  const current = new Date(startDate);
  let weekIndex = 0;

  while (current <= endDate) {
    const dateStr = current.toISOString().split("T")[0];
    const week = formatWeekLabel(current);

    const seasonalFactor = Math.sin((weekIndex / 52) * Math.PI * 2) * -3;
    const randomNoise = (Math.sin(weekIndex * 0.5) + 1) * 3 - 3;

    const value = Math.max(35, Math.min(75, Math.round(baseScore + seasonalFactor + randomNoise)));

    data.push({ date: dateStr, week, value });

    current.setDate(current.getDate() + 7);
    weekIndex++;
  }

  return data;
}

/** Generate organization median performance data */
export function generateOrgMedianData(): UserPerformanceDataPoint[] {
  const data: UserPerformanceDataPoint[] = [];
  const startDate = new Date("2024-01-01");
  const endDate = new Date("2025-01-06");
  const baseScore = 50;

  const current = new Date(startDate);
  let weekIndex = 0;

  while (current <= endDate) {
    const dateStr = current.toISOString().split("T")[0];
    const week = formatWeekLabel(current);

    const seasonalFactor = Math.sin((weekIndex / 52) * Math.PI * 2) * -2;
    const randomNoise = (Math.cos(weekIndex * 0.3) + 1) * 1.5 - 1.5;

    const value = Math.max(45, Math.min(55, Math.round(baseScore + seasonalFactor + randomNoise)));

    data.push({ date: dateStr, week, value });

    current.setDate(current.getDate() + 7);
    weekIndex++;
  }

  return data;
}

/** Generate team median cumulative performance for comparison */
export function generateTeamMedianCumulativeData(): { date: string; value: number }[] {
  const data: { date: string; value: number }[] = [];
  const startDate = new Date("2024-01-01");
  const endDate = new Date("2025-01-06");

  const random = createSeededRandom("team-median-cumulative");

  let cumulativeValue = 0;
  const current = new Date(startDate);
  let weekIndex = 0;

  while (current <= endDate) {
    const dateStr = current.toISOString().split("T")[0];
    const month = current.getMonth();

    const sprintMultiplier = getSprintMultiplier(weekIndex, 'medium');
    const seasonalMultiplier = getSeasonalMultiplier(month, 0.75, 0.85);

    const baseGrowth = 130;
    const weeklyGrowth = Math.round(
      baseGrowth * sprintMultiplier * seasonalMultiplier +
      Math.sin(weekIndex * 0.3) * 25 +
      (random() - 0.5) * 20
    );

    cumulativeValue += weeklyGrowth;

    data.push({ date: dateStr, value: Math.round(cumulativeValue) });

    current.setDate(current.getDate() + 7);
    weekIndex++;
  }

  return data;
}

/** Generate org median cumulative performance for comparison */
export function generateOrgMedianCumulativeData(): { date: string; value: number }[] {
  const data: { date: string; value: number }[] = [];
  const startDate = new Date("2024-01-01");
  const endDate = new Date("2025-01-06");

  const random = createSeededRandom("org-median-cumulative");

  let cumulativeValue = 0;
  const current = new Date(startDate);
  let weekIndex = 0;

  while (current <= endDate) {
    const dateStr = current.toISOString().split("T")[0];
    const month = current.getMonth();

    const sprintMultiplier = getSprintMultiplier(weekIndex, 'low');
    const seasonalMultiplier = getSeasonalMultiplier(month, 0.8, 0.9);

    const baseGrowth = 110;
    const weeklyGrowth = Math.round(
      baseGrowth * sprintMultiplier * seasonalMultiplier +
      Math.sin(weekIndex * 0.25) * 15 +
      (random() - 0.5) * 10
    );

    cumulativeValue += weeklyGrowth;

    data.push({ date: dateStr, value: Math.round(cumulativeValue) });

    current.setDate(current.getDate() + 7);
    weekIndex++;
  }

  return data;
}
