import type { MemberPerformanceRow } from "./types";
import type { ViewMode, PerformanceFilter, MemberPerformanceDataPoint } from "./performanceTypes";
import type { TimeRangeKey } from "@/lib/shared/types/timeRangeTypes";
import type { ChartInsight } from "@/lib/orgDashboard/types";
import {
  smartSample,
  filterByTimeRange,
  isTimeRangeSufficient,
} from "@/lib/shared/performanceUtils";

// Re-export shared utilities for backward compatibility
export { smartSample, filterByTimeRange, isTimeRangeSufficient };

/**
 * Gets visible members for a filter in individual view mode.
 * Returns Set of member names to display.
 */
export function getVisibleMembersForFilter(
  members: MemberPerformanceRow[],
  filter: PerformanceFilter,
  viewMode: ViewMode
): Set<string> {
  if (viewMode === "aggregate") {
    return new Set();
  }

  let filtered: MemberPerformanceRow[] = [];

  switch (filter) {
    case "mostProductive":
      // Sort by performanceValue desc, take top 3
      filtered = [...members]
        .sort((a, b) => b.performanceValue - a.performanceValue)
        .slice(0, 3);
      break;

    case "leastProductive":
      // Sort by performanceValue asc, take top 3
      filtered = [...members]
        .sort((a, b) => a.performanceValue - b.performanceValue)
        .slice(0, 3);
      break;

    case "mostImproved":
      // Filter where change > 0
      filtered = members.filter((m) => (m.change ?? 0) > 0);
      break;

    case "mostRegressed":
      // Filter where change < 0
      filtered = members.filter((m) => (m.change ?? 0) < 0);
      break;

    case "highestChurn":
      // Sort by churnRate desc, take top 3
      filtered = [...members]
        .sort((a, b) => (b.churnRate ?? 0) - (a.churnRate ?? 0))
        .slice(0, 3);
      break;

    case "lowestChurn":
      // Sort by churnRate asc, take top 3
      filtered = [...members]
        .sort((a, b) => (a.churnRate ?? 0) - (b.churnRate ?? 0))
        .slice(0, 3);
      break;
  }

  return new Set(filtered.map((m) => m.memberName));
}

/**
 * Generates performance insights based on member data and time range.
 * Returns up to 4 insights personalized with member names.
 */
export function getPerformanceInsights(
  members: MemberPerformanceRow[],
  data: MemberPerformanceDataPoint[],
  timeRange: TimeRangeKey
): ChartInsight[] {
  const insights: ChartInsight[] = [];

  if (data.length < 2) {
    return insights;
  }

  const firstValue = data[0].value;
  const lastValue = data[data.length - 1].value;
  const change = lastValue - firstValue;

  // Time range label
  const periodLabels: Record<TimeRangeKey, string> = {
    "1m": "past month",
    "3m": "past 3 months",
    "1y": "past year",
    "max": "entire period",
  };
  const period = periodLabels[timeRange];

  // Trend insight
  if (change > 5) {
    insights.push({
      id: "trend-positive",
      text: `Team performance increased ${Math.round(change)} points over the ${period}`,
    });
  } else if (change < -5) {
    insights.push({
      id: "trend-negative",
      text: `Team performance decreased ${Math.abs(Math.round(change))} points over the ${period}`,
    });
  } else {
    insights.push({
      id: "trend-stable",
      text: `Team performance remained stable over the ${period}`,
    });
  }

  // Top performers insight (performanceValue >= 75)
  const topPerformers = members.filter((m) => m.performanceValue >= 75);
  if (topPerformers.length > 0) {
    const names = topPerformers.map((m) => m.memberName).slice(0, 3).join(", ");
    insights.push({
      id: "top-performers",
      text: `${topPerformers.length} high performer${topPerformers.length > 1 ? "s" : ""}: ${names}`,
    });
  }

  // Improved members insight (change > 10)
  const improvedMembers = members.filter((m) => (m.change ?? 0) > 10);
  if (improvedMembers.length > 0) {
    const names = improvedMembers.map((m) => m.memberName).slice(0, 3).join(", ");
    insights.push({
      id: "improved-members",
      text: `${improvedMembers.length} member${improvedMembers.length > 1 ? "s" : ""} improved significantly: ${names}`,
    });
  }

  // Low performers concern (performanceValue < 40)
  const lowPerformers = members.filter((m) => m.performanceValue < 40);
  if (lowPerformers.length > 0) {
    const names = lowPerformers.map((m) => m.memberName).slice(0, 2).join(", ");
    insights.push({
      id: "low-performers",
      text: `${lowPerformers.length} member${lowPerformers.length > 1 ? "s need" : " needs"} attention: ${names}`,
    });
  }

  // Return up to 4 insights
  return insights.slice(0, 4);
}
