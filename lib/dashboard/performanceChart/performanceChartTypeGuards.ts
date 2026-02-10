/** Performance Chart Type Guards */

import type {
  PerformanceDataSource,
  EventGenerationStrategy,
  AnnotationGenerationStrategy,
} from "./types";

/** Type guard for org data source */
export function isOrgDataSource(
  source: PerformanceDataSource
): source is Extract<PerformanceDataSource, { type: "org" }> {
  return source.type === "org";
}

/** Type guard for team data source */
export function isTeamDataSource(
  source: PerformanceDataSource
): source is Extract<PerformanceDataSource, { type: "team" }> {
  return source.type === "team";
}

/** Type guard for repo data source */
export function isRepoDataSource(
  source: PerformanceDataSource
): source is Extract<PerformanceDataSource, { type: "repo" }> {
  return source.type === "repo";
}

/** Type guard for user data source */
export function isUserDataSource(
  source: PerformanceDataSource
): source is Extract<PerformanceDataSource, { type: "user" }> {
  return source.type === "user";
}

/** Type guard for static event strategy */
export function isStaticEventStrategy(
  strategy: EventGenerationStrategy
): strategy is Extract<EventGenerationStrategy, { mode: "static" }> {
  return strategy.mode === "static";
}

/** Type guard for dynamic event strategy */
export function isDynamicEventStrategy(
  strategy: EventGenerationStrategy
): strategy is Extract<EventGenerationStrategy, { mode: "dynamic" }> {
  return strategy.mode === "dynamic";
}

/** Type guard for static annotation strategy */
export function isStaticAnnotationStrategy(
  strategy: AnnotationGenerationStrategy
): strategy is Extract<AnnotationGenerationStrategy, { mode: "static" }> {
  return strategy.mode === "static";
}

/** Type guard for dynamic annotation strategy */
export function isDynamicAnnotationStrategy(
  strategy: AnnotationGenerationStrategy
): strategy is Extract<AnnotationGenerationStrategy, { mode: "dynamic" }> {
  return strategy.mode === "dynamic";
}
