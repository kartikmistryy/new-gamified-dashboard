/** Performance Teams Table Configuration */

import type { CSSProperties } from "react";
import type { TeamPerformanceRow, PerformanceTableFilter } from "./types";
import { DASHBOARD_COLORS } from "./colors";
import { hexToRgba } from "./tableUtils";
import { PERFORMANCE_ZONES } from "./orgPerformanceChartData";
import { TrendingUp, TrendingDown, ArrowRight } from "lucide-react";

export const PERFORMANCE_DISTRIBUTION_SEGMENTS: {
  label: string;
  getCount: (d: TeamPerformanceRow["typeDistribution"]) => number;
  style: CSSProperties;
}[] = [
  {
    label: "Stars",
    getCount: (d) => d.star ?? 0,
    style: { backgroundColor: PERFORMANCE_ZONES.excellent.color, color: DASHBOARD_COLORS.excellent },
  },
  {
    label: "Legacy",
    getCount: (d) => d.legacy ?? 0,
    style: { backgroundColor: PERFORMANCE_ZONES.aboveAvg.color, color: DASHBOARD_COLORS.excellent },
  },
  {
    label: "Bottleneck",
    getCount: (d) => d.bottleneck ?? 0,
    style: { backgroundColor: hexToRgba("#2563eb", 0.25), color: "#2563eb" },
  },
  {
    label: "Key Roles + Risky",
    getCount: (d) => (d.keyRole ?? 0) + (d.risky ?? 0),
    style: { backgroundColor: PERFORMANCE_ZONES.belowAvg.color, color: DASHBOARD_COLORS.danger },
  },
  {
    label: "Time Bombs",
    getCount: (d) => d.timeBomb ?? 0,
    style: { backgroundColor: PERFORMANCE_ZONES.concerning.color, color: DASHBOARD_COLORS.danger },
  },
];

export const PERFORMANCE_FILTER_TABS: { key: PerformanceTableFilter; label: string }[] = [
  { key: "mostProductive", label: "Most Productive" },
  { key: "leastProductive", label: "Least Productive" },
  { key: "mostImproved", label: "Most Improved" },
  { key: "mostRegressed", label: "Most Regressed" },
];

/** Get trend icon for count value compared to average */
export function getTrendIconForCount(counts: number[], index: number) {
  const total = counts.reduce((sum, value) => sum + value, 0);
  const average = counts.length ? total / counts.length : 0;
  const value = counts[index] ?? 0;
  if (value > average) return TrendingUp;
  if (value < average) return TrendingDown;
  return ArrowRight;
}

/** Sort performance teams based on filter criteria */
export function performanceSortFunction(
  rows: TeamPerformanceRow[],
  currentFilter: PerformanceTableFilter
): TeamPerformanceRow[] {
  const copy = [...rows];
  if (currentFilter === "leastProductive") return copy.sort((a, b) => a.performanceValue - b.performanceValue);
  if (currentFilter === "mostProductive") return copy.sort((a, b) => b.performanceValue - a.performanceValue);
  const pts = (r: TeamPerformanceRow) => r.changePts ?? 0;
  if (currentFilter === "mostImproved") return copy.sort((a, b) => pts(b) - pts(a));
  if (currentFilter === "mostRegressed") return copy.sort((a, b) => pts(a) - pts(b));
  return copy;
}
