/**
 * Shared chart-related types with discriminated unions.
 *
 * Uses the "level" discriminator to create type-safe unions that
 * enable exhaustive checking and proper type narrowing.
 */

import type { TeamId, MemberId } from "./entityTypes";

/** Base chart data point with date */
type BaseChartDataPoint = {
  readonly date: string; // ISO date string (YYYY-MM-DD)
};

/**
 * Organization-level aggregated data point
 * Represents org-wide metrics, optionally broken down by team
 */
export type OrgChartDataPoint = BaseChartDataPoint & {
  readonly level: "org";
  readonly value: number;
  /** Optional breakdown by team */
  readonly teamValues?: Readonly<Record<string, number>>;
};

/**
 * Team-level aggregated data point
 * Represents team metrics, optionally broken down by member
 */
export type TeamChartDataPoint = BaseChartDataPoint & {
  readonly level: "team";
  readonly teamId: TeamId;
  readonly teamName: string;
  readonly value: number;
  /** Optional breakdown by member */
  readonly memberValues?: Readonly<Record<string, number>>;
};

/**
 * Member-level individual data point
 * Represents individual contributor metrics
 */
export type MemberChartDataPoint = BaseChartDataPoint & {
  readonly level: "member";
  readonly memberId: MemberId;
  readonly memberName: string;
  readonly teamId: TeamId;
  readonly value: number;
};

/**
 * Discriminated union of all chart data point types.
 * Use type guards to narrow to specific type.
 */
export type ChartDataPoint =
  | OrgChartDataPoint
  | TeamChartDataPoint
  | MemberChartDataPoint;

/**
 * Chart annotation for marking special events or thresholds
 */
export type ChartAnnotation = {
  readonly date: string;
  readonly label: string;
  readonly color?: string;
  readonly type: "vertical-line" | "horizontal-line" | "area" | "range";
};

/**
 * Chart event (e.g., holidays, releases, incidents)
 */
export type ChartEvent = {
  readonly date: string;
  readonly label: string;
  readonly description?: string;
  readonly icon?: string; // Icon name or emoji
  readonly color?: string;
};

/**
 * Chart insight data for displaying analysis
 */
export type ChartInsight = {
  readonly type: "info" | "warning" | "success" | "error";
  readonly title: string;
  readonly message: string;
  readonly metric?: {
    readonly label: string;
    readonly value: string | number;
  };
};

/**
 * Type guards for chart data points
 * Enable exhaustive type checking and proper narrowing
 */

export function isOrgDataPoint(
  point: ChartDataPoint
): point is OrgChartDataPoint {
  return point.level === "org";
}

export function isTeamDataPoint(
  point: ChartDataPoint
): point is TeamChartDataPoint {
  return point.level === "team";
}

export function isMemberDataPoint(
  point: ChartDataPoint
): point is MemberChartDataPoint {
  return point.level === "member";
}

/**
 * Exhaustive check helper for discriminated unions
 * Ensures all cases are handled at compile time
 *
 * @example
 * ```typescript
 * function processDataPoint(point: ChartDataPoint) {
 *   switch (point.level) {
 *     case "org": return handleOrg(point);
 *     case "team": return handleTeam(point);
 *     case "member": return handleMember(point);
 *     default: return assertNever(point); // ✅ Compile error if case missed
 *   }
 * }
 * ```
 */
export function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${JSON.stringify(value)}`);
}
