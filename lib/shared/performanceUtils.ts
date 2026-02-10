/**
 * Shared Performance Utilities
 *
 * Common utilities for performance data processing across all dashboards.
 * Eliminates duplication between team and repo dashboard helpers.
 *
 * @module lib/shared/performanceUtils
 */

import type { TimeRangeKey } from "./types/timeRangeTypes";

/**
 * Smart sampling: reduces data to target number of points while preserving first and last.
 * Always includes first and last point, distributes remaining points evenly.
 *
 * @param data - Array of data points with a date property
 * @param targetPoints - Target number of points to sample (default: 40)
 * @returns Sampled array of data points
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
 *
 * @param data - Array of data points with a date property
 * @param timeRange - Time range to filter by
 * @returns Filtered array of data points
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
 *
 * @param data - Array of data points with a date property
 * @param timeRange - Time range to check
 * @returns True if there are at least 2 data points in the range
 */
export function isTimeRangeSufficient<T extends { date: string }>(
  data: T[],
  timeRange: TimeRangeKey
): boolean {
  const filtered = filterByTimeRange(data, timeRange);
  return filtered.length >= 2;
}
