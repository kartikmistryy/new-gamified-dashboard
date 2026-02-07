/**
 * Shared type system for org and team dashboards.
 *
 * This module provides a centralized, type-safe foundation for:
 * - Entity identification (branded IDs)
 * - Chart data structures (discriminated unions)
 * - Performance metrics (common interfaces)
 * - Time range operations (type-safe utilities)
 * - Utility types (reusable type helpers)
 *
 * Benefits:
 * - Eliminates 15+ duplicate type definitions
 * - Provides compile-time safety for IDs (prevents mixing)
 * - Enables exhaustive type checking with discriminated unions
 * - Centralizes common patterns for consistency
 *
 * @example
 * ```typescript
 * import { TeamId, createTeamId, ChartDataPoint, isTeamDataPoint } from "@/lib/shared/types";
 *
 * const teamId = createTeamId("team-123");
 * function processDataPoint(point: ChartDataPoint) {
 *   if (isTeamDataPoint(point)) {
 *     // TypeScript knows point is TeamChartDataPoint here
 *     console.log(point.teamId, point.teamName);
 *   }
 * }
 * ```
 */

// Entity Types (Branded IDs)
export type {
  MemberId,
  TeamId,
  OrgId,
  RepoId,
  SkillId,
  DomainId,
} from "./entityTypes";

export {
  createMemberId,
  createTeamId,
  createOrgId,
  createRepoId,
  createSkillId,
  createDomainId,
  unwrapId,
  isBrandedId,
} from "./entityTypes";

// Chart Types (Discriminated Unions)
export type {
  ChartDataPoint,
  OrgChartDataPoint,
  TeamChartDataPoint,
  MemberChartDataPoint,
  ChartAnnotation,
  ChartEvent,
  ChartInsight,
} from "./chartTypes";

export {
  isOrgDataPoint,
  isTeamDataPoint,
  isMemberDataPoint,
  assertNever,
} from "./chartTypes";

// Performance Types
export type {
  DeveloperTypeDistribution,
  DeveloperTypeKey,
  TrendDirection,
  PerformanceLevel,
  BasePerformanceEntity,
  PerformanceMetric,
  PerformanceComparison,
  PerformanceThresholds,
} from "./performanceTypes";

export {
  getPerformanceLevel,
  getTrendFromChange,
} from "./performanceTypes";

// Time Range Types
export type {
  TimeRangeKey,
  TimeRangeConfig,
} from "./timeRangeTypes";

export {
  TIME_RANGE_CONFIGS,
  getTimeRangeConfig,
  getStartDateForRange,
  isDateInRange,
  getTimeRangeLabel,
  isTimeRangeKey,
} from "./timeRangeTypes";

// Utility Types
export type {
  DeepReadonly,
  KeysOfType,
  RequireKeys,
  OptionalKeys,
  ParamsOf,
  ReturnTypeOf,
  ExclusiveOr,
  Nullable,
  NonNullable,
  Prettify,
  ObjectPath,
  ValueAtPath,
} from "./utilityTypes";
