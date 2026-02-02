/** Shared time range keys for dashboard filters. */
export type TimeRangeKey = "1m" | "3m" | "1y" | "max";

export const TIME_RANGE_OPTIONS: Array<{ id: TimeRangeKey; label: string }> = [
  { id: "1m", label: "1 Month" },
  { id: "3m", label: "3 Months" },
  { id: "1y", label: "1 Year" },
  { id: "max", label: "Max" },
];
