/**
 * Unified Performance Chart Type System
 *
 * Comprehensive type definitions for a reusable performance chart component
 * that supports org, team, repo, and user dashboard contexts.
 *
 * Design Patterns:
 * - Discriminated unions for type-safe data sources
 * - Strategy pattern for event/annotation generation
 * - Generic parameters for entity filtering
 * - Builder pattern for fluent configuration
 */

import type { TimeRangeKey } from "@/lib/orgDashboard/timeRangeTypes";
import type { ChartEvent, ChartAnnotation } from "@/lib/orgDashboard/types";

// ============================================================================
// Core Data Types
// ============================================================================

/**
 * Base data point structure - normalized format used internally by the chart
 */
export type NormalizedPerformanceDataPoint = {
  /** ISO date string (YYYY-MM-DD) */
  date: string;
  /** Primary performance value (0-100) */
  value: number;
  /** Optional formatted week label for display */
  week?: string;
  /** Entity-specific values for filtering (team names, member names, etc.) */
  entityValues?: Record<string, number>;
};

/**
 * Org-level performance data point (already in normalized format)
 */
export type OrgPerformanceDataPoint = {
  date: string;
  week: string;
  value: number;
  teamValues?: Record<string, number>;
};

/**
 * Member/Contributor-level performance data point (requires transformation)
 */
export type MemberPerformanceDataPoint = {
  date: string;
  value: number;
  memberValues: Record<string, number>;
};

/**
 * Contributor-level performance data point (requires transformation)
 */
export type ContributorPerformanceDataPoint = {
  date: string;
  value: number;
  contributorValues: Record<string, number>;
};

// ============================================================================
// Data Source Discriminated Union
// ============================================================================

/**
 * Discriminated union for all supported data source types
 * Each variant includes the data format and context-specific metadata
 */
export type PerformanceDataSource =
  | {
      type: "org";
      data: OrgPerformanceDataPoint[];
      /** Optional mock data generator for fallback */
      generator?: () => OrgPerformanceDataPoint[];
    }
  | {
      type: "team";
      data: MemberPerformanceDataPoint[];
      /** Team metadata for context */
      teamId?: string;
    }
  | {
      type: "repo";
      data: ContributorPerformanceDataPoint[];
      /** Repository metadata for context */
      repoId?: string;
    }
  | {
      type: "user";
      data: OrgPerformanceDataPoint[];
      /** User metadata for context */
      userId?: string;
      userName?: string;
    };

// ============================================================================
// Event and Annotation Strategy
// ============================================================================

/**
 * Strategy for generating events (holidays, milestones, etc.)
 */
export type EventGenerationStrategy =
  | {
      mode: "static";
      /** Pre-defined events */
      events: ChartEvent[];
    }
  | {
      mode: "dynamic";
      /** Generate events based on data points */
      generator: (data: NormalizedPerformanceDataPoint[]) => ChartEvent[];
    }
  | {
      mode: "none";
    };

/**
 * Strategy for generating annotations (callouts on the chart)
 */
export type AnnotationGenerationStrategy =
  | {
      mode: "static";
      /** Pre-defined annotations */
      annotations: ChartAnnotation[];
    }
  | {
      mode: "dynamic";
      /** Generate annotations based on data points */
      generator: (data: NormalizedPerformanceDataPoint[]) => ChartAnnotation[];
    }
  | {
      mode: "none";
    };

// ============================================================================
// Chart Configuration
// ============================================================================

/**
 * Configuration for entity visibility filtering (teams, members, contributors)
 */
export type EntityVisibilityConfig<TEntity extends string = string> = {
  /** Map of entity names to visibility state */
  visibleEntities?: Record<TEntity, boolean>;
  /** Callback when visibility changes */
  onVisibilityChange?: (entityName: TEntity, visible: boolean) => void;
};

/**
 * Main configuration object for the unified performance chart
 */
export type PerformanceChartConfig = {
  /** Data source with type discrimination */
  dataSource: PerformanceDataSource;
  /** Event generation strategy */
  eventStrategy?: EventGenerationStrategy;
  /** Annotation generation strategy */
  annotationStrategy?: AnnotationGenerationStrategy;
  /** Time range filter */
  timeRange?: TimeRangeKey;
  /** Entity visibility configuration */
  entityVisibility?: EntityVisibilityConfig;
  /** Accessibility label for screen readers */
  ariaLabel?: string;
  /** Optional CSS class name */
  className?: string;
};

// ============================================================================
// Component Props
// ============================================================================

/**
 * Props for the PerformanceChart component
 */
export type PerformanceChartProps = PerformanceChartConfig;

// ============================================================================
// Builder Pattern for Fluent Configuration
// ============================================================================

/**
 * Builder class for constructing chart configurations with a fluent API
 *
 * @example
 * ```typescript
 * const config = new PerformanceChartConfigBuilder()
 *   .setDataSource({ type: "org", data: orgData })
 *   .withStaticEvents(ORG_HOLIDAYS)
 *   .withStaticAnnotations(ORG_ANNOTATIONS)
 *   .setTimeRange("3m")
 *   .build();
 * ```
 */
export class PerformanceChartConfigBuilder {
  private config: Partial<PerformanceChartConfig> = {};

  /**
   * Set the data source (required)
   */
  setDataSource(dataSource: PerformanceDataSource): this {
    this.config.dataSource = dataSource;
    return this;
  }

  /**
   * Set static events (holidays, milestones)
   */
  withStaticEvents(events: ChartEvent[]): this {
    this.config.eventStrategy = { mode: "static", events };
    return this;
  }

  /**
   * Set dynamic event generation
   */
  withDynamicEvents(generator: (data: NormalizedPerformanceDataPoint[]) => ChartEvent[]): this {
    this.config.eventStrategy = { mode: "dynamic", generator };
    return this;
  }

  /**
   * Disable events
   */
  withoutEvents(): this {
    this.config.eventStrategy = { mode: "none" };
    return this;
  }

  /**
   * Set static annotations
   */
  withStaticAnnotations(annotations: ChartAnnotation[]): this {
    this.config.annotationStrategy = { mode: "static", annotations };
    return this;
  }

  /**
   * Set dynamic annotation generation
   */
  withDynamicAnnotations(
    generator: (data: NormalizedPerformanceDataPoint[]) => ChartAnnotation[]
  ): this {
    this.config.annotationStrategy = { mode: "dynamic", generator };
    return this;
  }

  /**
   * Disable annotations
   */
  withoutAnnotations(): this {
    this.config.annotationStrategy = { mode: "none" };
    return this;
  }

  /**
   * Set time range filter
   */
  setTimeRange(timeRange: TimeRangeKey): this {
    this.config.timeRange = timeRange;
    return this;
  }

  /**
   * Set entity visibility configuration
   */
  setEntityVisibility(visibility: EntityVisibilityConfig): this {
    this.config.entityVisibility = visibility;
    return this;
  }

  /**
   * Set accessibility label
   */
  setAriaLabel(ariaLabel: string): this {
    this.config.ariaLabel = ariaLabel;
    return this;
  }

  /**
   * Set CSS class name
   */
  setClassName(className: string): this {
    this.config.className = className;
    return this;
  }

  /**
   * Build and validate the configuration
   * @throws Error if required fields are missing
   */
  build(): PerformanceChartConfig {
    if (!this.config.dataSource) {
      throw new Error("PerformanceChartConfigBuilder: dataSource is required");
    }

    return {
      dataSource: this.config.dataSource,
      eventStrategy: this.config.eventStrategy ?? { mode: "none" },
      annotationStrategy: this.config.annotationStrategy ?? { mode: "none" },
      timeRange: this.config.timeRange ?? "max",
      entityVisibility: this.config.entityVisibility,
      ariaLabel: this.config.ariaLabel ?? "Performance chart over time",
      className: this.config.className ?? "",
    };
  }
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard for org data source
 */
export function isOrgDataSource(
  source: PerformanceDataSource
): source is Extract<PerformanceDataSource, { type: "org" }> {
  return source.type === "org";
}

/**
 * Type guard for team data source
 */
export function isTeamDataSource(
  source: PerformanceDataSource
): source is Extract<PerformanceDataSource, { type: "team" }> {
  return source.type === "team";
}

/**
 * Type guard for repo data source
 */
export function isRepoDataSource(
  source: PerformanceDataSource
): source is Extract<PerformanceDataSource, { type: "repo" }> {
  return source.type === "repo";
}

/**
 * Type guard for user data source
 */
export function isUserDataSource(
  source: PerformanceDataSource
): source is Extract<PerformanceDataSource, { type: "user" }> {
  return source.type === "user";
}

/**
 * Type guard for static event strategy
 */
export function isStaticEventStrategy(
  strategy: EventGenerationStrategy
): strategy is Extract<EventGenerationStrategy, { mode: "static" }> {
  return strategy.mode === "static";
}

/**
 * Type guard for dynamic event strategy
 */
export function isDynamicEventStrategy(
  strategy: EventGenerationStrategy
): strategy is Extract<EventGenerationStrategy, { mode: "dynamic" }> {
  return strategy.mode === "dynamic";
}

/**
 * Type guard for static annotation strategy
 */
export function isStaticAnnotationStrategy(
  strategy: AnnotationGenerationStrategy
): strategy is Extract<AnnotationGenerationStrategy, { mode: "static" }> {
  return strategy.mode === "static";
}

/**
 * Type guard for dynamic annotation strategy
 */
export function isDynamicAnnotationStrategy(
  strategy: AnnotationGenerationStrategy
): strategy is Extract<AnnotationGenerationStrategy, { mode: "dynamic" }> {
  return strategy.mode === "dynamic";
}
