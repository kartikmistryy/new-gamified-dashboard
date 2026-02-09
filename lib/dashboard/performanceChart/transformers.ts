/**
 * Data Transformers for Unified Performance Chart
 *
 * Pure functions for transforming various data formats into the normalized
 * structure expected by the chart rendering logic.
 *
 * All transformers are:
 * - Pure functions (no side effects)
 * - Immutable (return new objects)
 * - Type-safe (full TypeScript support)
 * - Testable (no dependencies on external state)
 */

import type {
  NormalizedPerformanceDataPoint,
  OrgPerformanceDataPoint,
  MemberPerformanceDataPoint,
  ContributorPerformanceDataPoint,
  PerformanceDataSource,
} from "./types";
import {
  isOrgDataSource,
  isTeamDataSource,
  isRepoDataSource,
  isUserDataSource,
} from "./types";

// ============================================================================
// Week Label Formatter
// ============================================================================

/**
 * Format a date string into a week label (Mon YYYY format)
 * @param dateStr - ISO date string (YYYY-MM-DD)
 * @returns Formatted week label (e.g., "Jan 2024")
 */
export function formatWeekLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
}

// ============================================================================
// Individual Data Type Transformers
// ============================================================================

/**
 * Transform org performance data to normalized format
 * (Already in correct format, just maps to normalized type)
 */
export function transformOrgData(
  data: OrgPerformanceDataPoint[]
): NormalizedPerformanceDataPoint[] {
  return data.map((point) => ({
    date: point.date,
    value: point.value,
    week: point.week,
    entityValues: point.teamValues,
  }));
}

/**
 * Transform member performance data to normalized format
 * Converts memberValues to entityValues
 */
export function transformMemberData(
  data: MemberPerformanceDataPoint[]
): NormalizedPerformanceDataPoint[] {
  return data.map((point) => ({
    date: point.date,
    value: point.value,
    week: formatWeekLabel(point.date),
    entityValues: point.memberValues,
  }));
}

/**
 * Transform contributor performance data to normalized format
 * Converts contributorValues to entityValues
 */
export function transformContributorData(
  data: ContributorPerformanceDataPoint[]
): NormalizedPerformanceDataPoint[] {
  return data.map((point) => ({
    date: point.date,
    value: point.value,
    week: formatWeekLabel(point.date),
    entityValues: point.contributorValues,
  }));
}

/**
 * Transform user performance data to normalized format
 * User data is already in OrgPerformanceDataPoint format
 */
export function transformUserData(
  data: OrgPerformanceDataPoint[]
): NormalizedPerformanceDataPoint[] {
  return data.map((point) => ({
    date: point.date,
    value: point.value,
    week: point.week,
    // User data doesn't have entity filtering
    entityValues: undefined,
  }));
}

// ============================================================================
// Unified Transformer with Type Discrimination
// ============================================================================

/**
 * Transform any data source to normalized format
 * Uses type guards to determine the correct transformation strategy
 *
 * @param dataSource - Discriminated union of all supported data sources
 * @returns Normalized data points ready for chart rendering
 *
 * @example
 * ```typescript
 * const normalized = transformDataSource({
 *   type: "team",
 *   data: memberPerformanceData
 * });
 * ```
 */
export function transformDataSource(
  dataSource: PerformanceDataSource
): NormalizedPerformanceDataPoint[] {
  // Handle org data source with optional generator fallback
  if (isOrgDataSource(dataSource)) {
    const data = dataSource.data.length > 0
      ? dataSource.data
      : (dataSource.generator ? dataSource.generator() : []);
    return transformOrgData(data);
  }

  // Handle team data source (member performance data)
  if (isTeamDataSource(dataSource)) {
    return transformMemberData(dataSource.data);
  }

  // Handle repo data source (contributor performance data)
  if (isRepoDataSource(dataSource)) {
    return transformContributorData(dataSource.data);
  }

  // Handle user data source
  if (isUserDataSource(dataSource)) {
    return transformUserData(dataSource.data);
  }

  // TypeScript exhaustiveness check - should never reach here
  const _exhaustive: never = dataSource;
  throw new Error(`Unhandled data source type: ${(_exhaustive as any).type}`);
}

// ============================================================================
// Entity Filtering
// ============================================================================

/**
 * Filter normalized data based on entity visibility
 * Recalculates aggregated values based on visible entities only
 *
 * @param data - Normalized performance data points
 * @param visibleEntities - Map of entity names to visibility state
 * @returns Filtered data with recalculated aggregated values
 *
 * @example
 * ```typescript
 * const filtered = filterByEntityVisibility(data, {
 *   "Team A": true,
 *   "Team B": false,
 *   "Team C": true
 * });
 * ```
 */
export function filterByEntityVisibility(
  data: NormalizedPerformanceDataPoint[],
  visibleEntities?: Record<string, boolean>
): NormalizedPerformanceDataPoint[] {
  // If no visibility filter is provided, return data as-is
  if (!visibleEntities) {
    return data;
  }

  // Get list of visible entity names
  const visibleEntityNames = Object.entries(visibleEntities)
    .filter(([_, visible]) => visible !== false)
    .map(([name]) => name);

  // If no entities are visible, return empty data
  if (visibleEntityNames.length === 0) {
    return [];
  }

  // Recalculate aggregated values based on visible entities
  return data.map((dataPoint) => {
    // If this data point doesn't have entity values, return it as-is
    if (!dataPoint.entityValues) {
      return dataPoint;
    }

    // Calculate the average value of visible entities
    let sum = 0;
    let count = 0;

    for (const entityName of visibleEntityNames) {
      const entityValue = dataPoint.entityValues[entityName];
      if (entityValue !== undefined) {
        sum += entityValue;
        count++;
      }
    }

    // Calculate the new aggregated value (average of visible entities)
    const newValue = count > 0 ? Math.round(sum / count) : dataPoint.value;

    return {
      ...dataPoint,
      value: newValue,
    };
  });
}

// ============================================================================
// Compatibility Transformers for Legacy Code
// ============================================================================

/**
 * Transform normalized data back to OrgPerformanceDataPoint format
 * Useful for compatibility with existing chart rendering components
 */
export function normalizedToOrgFormat(
  data: NormalizedPerformanceDataPoint[]
): OrgPerformanceDataPoint[] {
  return data.map((point) => ({
    date: point.date,
    week: point.week ?? formatWeekLabel(point.date),
    value: point.value,
    teamValues: point.entityValues,
  }));
}

/**
 * Transform normalized data back to MemberPerformanceDataPoint format
 * Useful for compatibility with existing chart rendering components
 */
export function normalizedToMemberFormat(
  data: NormalizedPerformanceDataPoint[]
): MemberPerformanceDataPoint[] {
  return data.map((point) => ({
    date: point.date,
    value: point.value,
    memberValues: point.entityValues ?? {},
  }));
}
