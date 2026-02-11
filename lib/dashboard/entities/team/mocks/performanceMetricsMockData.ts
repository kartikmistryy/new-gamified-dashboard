import { Hourglass, Code2, RefreshCw, Repeat } from "lucide-react";
import type { PerformanceMetricConfig } from "./types";

/**
 * Generate mock weekly time-series data for a metric chart.
 * Creates ~12 data points with a base value and some variance.
 */
function generateWeeklyData(
  baseValue: number,
  variance: number,
  weeks = 12,
): { date: string; value: number }[] {
  const data: { date: string; value: number }[] = [];
  const today = new Date();

  for (let i = weeks - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i * 7);
    const dateStr = date.toISOString().split("T")[0];

    // Generate a value that trends slightly and has noise
    const trend = ((weeks - 1 - i) / (weeks - 1)) * variance * 0.3;
    const noise = (Math.random() - 0.5) * variance;
    const value = Math.max(0, Math.round(baseValue + trend + noise));

    data.push({ date: dateStr, value });
  }

  return data;
}

const SHARED_INSIGHTS_TEXT = [
  {
    id: "baseline",
    text: "Performance stayed mostly above baseline, with the median clustering in the P40\u2013P60 band throughout the year.",
  },
  {
    id: "milestones",
    text: 'Leadership and delivery milestones drive outsized gains, pushing results into the P70+ "Excellent" range.',
  },
  {
    id: "disruption",
    text: "Team disruption has immediate impact, as seen in the sharp mid-year dip during the Architect\u2019s leave.",
  },
  {
    id: "holiday",
    text: "Holiday effects are real but temporary, causing short dips without long-term degradation.",
  },
  {
    id: "recovery",
    text: "Recovery speed is strong, with performance rebounding within weeks after each downturn.",
  },
  {
    id: "volatility",
    text: "End-of-year volatility reflects seasonality, not a structural decline in performance.",
  },
];

/**
 * Four performance metric configurations matching the Figma design.
 *
 * Each metric has:
 * - Severity badge with color
 * - Colored card background
 * - Mock chart data (~12 weeks)
 * - Chart Insights paragraphs
 */
export const PERFORMANCE_METRICS: PerformanceMetricConfig[] = [
  {
    id: "avg-age-code-deleted",
    title: "Average Age of Code Deleted",
    severity: "Heavy",
    severityColor: "#CA3A31",
    bgColor: "#F9E3E2",
    iconColor: "#CA3A31",
    icon: Hourglass,
    chartData: generateWeeklyData(180, 60),
    insights: SHARED_INSIGHTS_TEXT,
  },
  {
    id: "normalized-loc",
    title: "Normalized Lines of Code",
    severity: "Low",
    severityColor: "#6BC095",
    bgColor: "#D9F9E6",
    iconColor: "#55B685",
    icon: Code2,
    chartData: generateWeeklyData(1200, 400),
    insights: SHARED_INSIGHTS_TEXT,
  },
  {
    id: "legacy-code-refactoring",
    title: "Legacy Code Refactoring",
    severity: "Medium",
    severityColor: "#E2B53E",
    bgColor: "#FDF9C9",
    iconColor: "#E2B53E",
    icon: RefreshCw,
    chartData: generateWeeklyData(45, 20),
    insights: SHARED_INSIGHTS_TEXT,
  },
  {
    id: "churn-rate",
    title: "Churn Rate",
    severity: "Heavy",
    severityColor: "#CA3A31",
    bgColor: "#F9E3E2",
    iconColor: "#CA3A31",
    icon: Repeat,
    chartData: generateWeeklyData(25, 12),
    insights: SHARED_INSIGHTS_TEXT,
  },
];
