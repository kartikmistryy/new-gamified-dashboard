/** Unified Performance Chart Type System - Core types, data sources, and strategies */

import type { TimeRangeKey } from "@/lib/shared/types/timeRangeTypes";
import type { ChartEvent, ChartAnnotation } from "@/lib/dashboard/entities/team/types";

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

export type PerformanceChartProps = PerformanceChartConfig;

// Re-export Builder and Type Guards from separate modules
export { PerformanceChartConfigBuilder } from "./performanceChartBuilder";
export {
  isOrgDataSource,
  isTeamDataSource,
  isRepoDataSource,
  isUserDataSource,
  isStaticEventStrategy,
  isDynamicEventStrategy,
  isStaticAnnotationStrategy,
  isDynamicAnnotationStrategy,
} from "./performanceChartTypeGuards";
