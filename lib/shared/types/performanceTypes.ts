/**
 * Shared performance-related types for org and team dashboards.
 *
 * Consolidates common performance type definitions to eliminate
 * duplication and ensure consistency.
 */

/**
 * Developer type distribution across performance categories.
 * Represents how code ownership is distributed across different
 * developer effectiveness profiles.
 */
export type DeveloperTypeDistribution = Readonly<{
  /** Star performers - high ownership, low chaos */
  star: number;
  /** Time bombs - high risk ownership patterns */
  timeBomb: number;
  /** Key roles - critical ownership positions */
  keyRole: number;
  /** Bottlenecks - single points of dependency */
  bottleneck: number;
  /** Risky ownership - unstable patterns */
  risky: number;
  /** Legacy maintainers - old code ownership */
  legacy: number;
}>;

/** Keys for developer type categories */
export type DeveloperTypeKey = keyof DeveloperTypeDistribution;

/**
 * Trend direction indicator for performance metrics
 */
export type TrendDirection = "up" | "down" | "flat";

/**
 * Performance level categories
 */
export type PerformanceLevel =
  | "excellent"  // 80-100
  | "good"       // 60-79
  | "fair"       // 40-59
  | "poor";      // 0-39

/**
 * Base performance entity with common fields shared across
 * org and team performance views
 */
export type BasePerformanceEntity = {
  readonly performanceLabel: string;
  readonly performanceValue: number; // 0-100
  readonly trend: TrendDirection;
  readonly performanceBarColor: string;
  readonly changePts?: number; // Change in points
  readonly typeDistribution: DeveloperTypeDistribution;
};

/**
 * Performance metric card data for dashboard summaries
 */
export type PerformanceMetric = {
  readonly label: string;
  readonly value: number | string;
  readonly change?: number;
  readonly trend?: TrendDirection;
  readonly unit?: string;
  readonly description?: string;
};

/**
 * Performance comparison data for benchmarking
 */
export type PerformanceComparison = {
  readonly current: number;
  readonly previous: number;
  readonly percentageChange: number;
  readonly trend: TrendDirection;
};

/**
 * Performance threshold configuration
 */
export type PerformanceThresholds = {
  readonly excellent: number;  // Minimum for excellent (default: 80)
  readonly good: number;       // Minimum for good (default: 60)
  readonly fair: number;       // Minimum for fair (default: 40)
  // Below fair is considered poor
};

/**
 * Get performance level from value
 */
export function getPerformanceLevel(
  value: number,
  thresholds: PerformanceThresholds = {
    excellent: 80,
    good: 60,
    fair: 40,
  }
): PerformanceLevel {
  if (value >= thresholds.excellent) return "excellent";
  if (value >= thresholds.good) return "good";
  if (value >= thresholds.fair) return "fair";
  return "poor";
}

/**
 * Calculate trend direction from change value
 */
export function getTrendFromChange(
  change: number,
  threshold: number = 5
): TrendDirection {
  if (change > threshold) return "up";
  if (change < -threshold) return "down";
  return "flat";
}
