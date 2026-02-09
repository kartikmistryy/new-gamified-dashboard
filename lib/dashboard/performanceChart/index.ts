/**
 * Unified Performance Chart Library
 *
 * Central export point for all types, transformers, and generators
 * used by the unified performance chart component.
 */

// Export all types
export type {
  NormalizedPerformanceDataPoint,
  OrgPerformanceDataPoint,
  MemberPerformanceDataPoint,
  ContributorPerformanceDataPoint,
  PerformanceDataSource,
  EventGenerationStrategy,
  AnnotationGenerationStrategy,
  EntityVisibilityConfig,
  UnifiedPerformanceChartConfig,
  UnifiedPerformanceChartProps,
} from "./types";

// Export builder
export { PerformanceChartConfigBuilder } from "./types";

// Export type guards
export {
  isOrgDataSource,
  isTeamDataSource,
  isRepoDataSource,
  isUserDataSource,
  isStaticEventStrategy,
  isDynamicEventStrategy,
  isStaticAnnotationStrategy,
  isDynamicAnnotationStrategy,
} from "./types";

// Export transformers
export {
  formatWeekLabel,
  transformOrgData,
  transformMemberData,
  transformContributorData,
  transformUserData,
  transformDataSource,
  filterByEntityVisibility,
  normalizedToOrgFormat,
  normalizedToMemberFormat,
} from "./transformers";

// Export event generators
export {
  generateRatioBasedEvents,
  generateAlternatingTypeEvents,
  generateRatioBasedAnnotations,
  generateChangePointAnnotations,
  generateTeamEvents,
  generateTeamAnnotations,
  generateRepoEvents,
  generateRepoAnnotations,
  generatePerformanceInsightAnnotations,
} from "./eventGenerators";
