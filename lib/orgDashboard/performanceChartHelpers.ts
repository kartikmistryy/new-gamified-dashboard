import type { TimeRangeKey } from "./timeRangeTypes";

/** Calculate the start date based on time range key */
export function getStartDateForRange(timeRange: TimeRangeKey, endDate: Date): Date {
  const start = new Date(endDate);
  switch (timeRange) {
    case "1m":
      start.setMonth(start.getMonth() - 1);
      break;
    case "3m":
      start.setMonth(start.getMonth() - 3);
      break;
    case "1y":
      start.setFullYear(start.getFullYear() - 1);
      break;
    case "max":
    default:
      return new Date(0); // Return epoch for max (include all data)
  }
  return start;
}

export function formatXAxis(dateStr: string): string {
  const d = new Date(dateStr);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[d.getMonth()]} ${d.getFullYear()}`;
}
