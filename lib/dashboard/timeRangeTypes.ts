/**
 * Time Range Types and Constants
 *
 * Centralized type definitions for time range filtering across all dashboard pages.
 * Provides type-safe time range keys, options, and configuration interfaces.
 *
 * @module lib/dashboard/timeRangeTypes
 */

/**
 * Base time range key used across all dashboards
 *
 * - `1m`: Last 1 month of data
 * - `3m`: Last 3 months of data
 * - `1y`: Last 1 year of data
 * - `max`: All available data (no time limit)
 */
export type TimeRangeKey = "1m" | "3m" | "1y" | "max";

/**
 * Time range option with label and optional disabled state
 *
 * Used to configure available time range options in filter UI.
 * The `disabled` flag prevents user selection (useful for insufficient data).
 */
export interface TimeRangeOption {
  /** Unique identifier for the time range */
  id: TimeRangeKey;
  /** Human-readable label displayed in UI */
  label: string;
  /** Whether this option should be disabled (e.g., insufficient data) */
  disabled?: boolean;
}

/**
 * Standard time range options available across dashboards
 *
 * These options are used by default in all TimeRangeFilter components
 * unless custom options are provided via configuration.
 *
 * @constant
 * @readonly
 */
export const TIME_RANGE_OPTIONS: ReadonlyArray<TimeRangeOption> = [
  { id: "1m", label: "1 Month" },
  { id: "3m", label: "3 Months" },
  { id: "1y", label: "1 Year" },
  { id: "max", label: "Max" },
] as const;

/**
 * Configuration for a dashboard's time range behavior
 *
 * Defines how a TimeRangeProvider should initialize and manage time range state.
 * This configuration is passed to the provider at the page level.
 *
 * @example
 * ```tsx
 * const config: TimeRangeConfig = {
 *   defaultRange: "1m",
 *   options: TIME_RANGE_OPTIONS,
 * };
 * ```
 */
export interface TimeRangeConfig {
  /** Default time range when context is initialized */
  defaultRange: TimeRangeKey;
  /**
   * Available options (defaults to TIME_RANGE_OPTIONS if not provided)
   *
   * Can be customized per-page to disable certain ranges or provide
   * page-specific options (e.g., with disabled flags based on data availability).
   */
  options?: ReadonlyArray<TimeRangeOption>;
  /**
   * Whether to persist time range to URL query params
   *
   * @future Not yet implemented - placeholder for future enhancement
   * When true, time range will sync with URL ?timeRange=1m parameter
   */
  persistToUrl?: boolean;
}

/**
 * Callback function type for time range changes
 *
 * Used in event handlers and hooks to notify of time range updates.
 * Type-safe: only accepts valid TimeRangeKey values.
 *
 * @param range - The new time range value to set
 */
export type TimeRangeChangeHandler = (range: TimeRangeKey) => void;

/**
 * Hook return type with state and setter
 *
 * Standard return type for useTimeRange() and related hooks.
 * Provides everything needed to render and control a time range filter.
 *
 * @example
 * ```tsx
 * const { timeRange, setTimeRange, options } = useTimeRange();
 * ```
 */
export interface UseTimeRangeResult {
  /** Current time range value */
  timeRange: TimeRangeKey;
  /** Function to update time range */
  setTimeRange: TimeRangeChangeHandler;
  /** Available time range options for the current context */
  options: ReadonlyArray<TimeRangeOption>;
}

/**
 * Type guard to check if a string is a valid TimeRangeKey
 *
 * Useful for validating URL params or external input.
 *
 * @param value - The value to check
 * @returns True if value is a valid TimeRangeKey
 *
 * @example
 * ```ts
 * const urlParam = searchParams.get('range');
 * if (isTimeRangeKey(urlParam)) {
 *   setTimeRange(urlParam); // Type-safe!
 * }
 * ```
 */
export function isTimeRangeKey(value: unknown): value is TimeRangeKey {
  return (
    typeof value === "string" &&
    (value === "1m" || value === "3m" || value === "1y" || value === "max")
  );
}

/**
 * Get the label for a time range key
 *
 * @param key - The time range key
 * @returns Human-readable label
 *
 * @example
 * ```ts
 * getTimeRangeLabel("3m") // Returns "3 Months"
 * ```
 */
export function getTimeRangeLabel(key: TimeRangeKey): string {
  const option = TIME_RANGE_OPTIONS.find((opt) => opt.id === key);
  return option?.label ?? key;
}
