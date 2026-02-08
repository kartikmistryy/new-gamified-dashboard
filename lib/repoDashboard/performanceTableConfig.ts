import type { PerformanceFilter } from "./performanceTypes";
import type { ContributorPerformanceRow } from "./types";

export const PERFORMANCE_FILTER_TABS: { key: PerformanceFilter; label: string }[] = [
  { key: "mostProductive", label: "Most Productive" },
  { key: "leastProductive", label: "Least Productive" },
  { key: "mostImproved", label: "Most Improved" },
  { key: "mostRegressed", label: "Most Regressed" },
  { key: "highestChurn", label: "Highest Churn" },
  { key: "lowestChurn", label: "Lowest Churn" },
];

export type ContributorPerformanceWithDelta = ContributorPerformanceRow & {
  cumulativeDiffDelta: number;
};

export function performanceSortFunction(
  rows: ContributorPerformanceWithDelta[],
  currentFilter: PerformanceFilter
): ContributorPerformanceWithDelta[] {
  const copy = [...rows];
  switch (currentFilter) {
    case "mostProductive":
      return copy.sort((a, b) => b.performanceValue - a.performanceValue);
    case "leastProductive":
      return copy.sort((a, b) => a.performanceValue - b.performanceValue);
    case "mostImproved":
      return copy.sort((a, b) => (b.change ?? 0) - (a.change ?? 0));
    case "mostRegressed":
      return copy.sort((a, b) => (a.change ?? 0) - (b.change ?? 0));
    case "highestChurn":
      return copy.sort((a, b) => (b.churnRate ?? 0) - (a.churnRate ?? 0));
    case "lowestChurn":
      return copy.sort((a, b) => (a.churnRate ?? 0) - (b.churnRate ?? 0));
    default:
      return copy;
  }
}
