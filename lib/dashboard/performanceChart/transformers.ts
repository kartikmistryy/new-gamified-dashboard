/** Data Transformers for Unified Performance Chart */

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

/** Format a date string into a week label (Mon YYYY format) */
export function formatWeekLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
}

/** Transform org performance data to normalized format */
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

/** Transform member performance data to normalized format */
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

/** Transform contributor performance data to normalized format */
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

/** Transform user performance data to normalized format */
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

/** Transform any data source to normalized format using type guards */
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

/** Filter normalized data based on entity visibility, recalculating aggregated values */
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

/** Transform normalized data back to OrgPerformanceDataPoint format */
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

/** Transform normalized data back to MemberPerformanceDataPoint format */
export function normalizedToMemberFormat(
  data: NormalizedPerformanceDataPoint[]
): MemberPerformanceDataPoint[] {
  return data.map((point) => ({
    date: point.date,
    value: point.value,
    memberValues: point.entityValues ?? {},
  }));
}
