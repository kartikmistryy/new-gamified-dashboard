/**
 * Consolidated time range types.
 *
 * Eliminates duplicate time range definitions across the codebase
 * and provides type-safe time range operations.
 */

/** Time range union type - all valid time range keys */
export type TimeRangeKey = "1m" | "3m" | "1y" | "max";

/**
 * Time range configuration
 */
export type TimeRangeConfig = {
  readonly id: TimeRangeKey;
  readonly label: string;
  /** Duration in milliseconds, null for "max" (all time) */
  readonly durationMs: number | null;
  /** Optional disabled state */
  readonly disabled?: boolean;
};

/**
 * Standard time range configurations
 * Can be used directly or extended with disabled states
 */
export const TIME_RANGE_CONFIGS: ReadonlyArray<TimeRangeConfig> = [
  {
    id: "1m",
    label: "1 Month",
    durationMs: 30 * 24 * 60 * 60 * 1000,
  },
  {
    id: "3m",
    label: "3 Months",
    durationMs: 90 * 24 * 60 * 60 * 1000,
  },
  {
    id: "1y",
    label: "1 Year",
    durationMs: 365 * 24 * 60 * 60 * 1000,
  },
  {
    id: "max",
    label: "Max",
    durationMs: null,
  },
] as const;

/**
 * Simplified time range options for TimeRangeFilter component
 * Compatible with the existing orgDashboard TIME_RANGE_OPTIONS format
 */
export const TIME_RANGE_OPTIONS: ReadonlyArray<{ id: TimeRangeKey; label: string }> = [
  { id: "1m", label: "1 Month" },
  { id: "3m", label: "3 Months" },
  { id: "1y", label: "1 Year" },
  { id: "max", label: "Max" },
] as const;

/**
 * Type-safe time range lookup
 * @throws Error if invalid time range key
 */
export function getTimeRangeConfig(key: TimeRangeKey): TimeRangeConfig {
  const config = TIME_RANGE_CONFIGS.find((c) => c.id === key);
  if (!config) {
    throw new Error(`Invalid time range key: ${key}`);
  }
  return config;
}

/**
 * Calculate start date for a time range
 * @param timeRange - The time range to calculate for
 * @param endDate - End date (defaults to now)
 * @returns Start date for the range
 */
export function getStartDateForRange(
  timeRange: TimeRangeKey,
  endDate: Date = new Date()
): Date {
  const config = getTimeRangeConfig(timeRange);

  // For "max", return epoch (beginning of time)
  if (config.durationMs === null) {
    return new Date(0);
  }

  // Calculate start date by subtracting duration from end date
  return new Date(endDate.getTime() - config.durationMs);
}

/**
 * Check if a date falls within a time range
 * @param date - Date to check
 * @param timeRange - Time range to check against
 * @param referenceDate - Reference date (defaults to now)
 * @returns True if date is within range
 */
export function isDateInRange(
  date: Date,
  timeRange: TimeRangeKey,
  referenceDate: Date = new Date()
): boolean {
  const startDate = getStartDateForRange(timeRange, referenceDate);
  return date >= startDate && date <= referenceDate;
}

/**
 * Get display label for a time range
 */
export function getTimeRangeLabel(key: TimeRangeKey): string {
  return getTimeRangeConfig(key).label;
}

/**
 * Type guard to check if a value is a valid time range key
 */
export function isTimeRangeKey(value: unknown): value is TimeRangeKey {
  return (
    typeof value === "string" &&
    ["1m", "3m", "1y", "max"].includes(value)
  );
}
