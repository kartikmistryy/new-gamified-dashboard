import { Hourglass, Code2, RefreshCw, Repeat } from "lucide-react";
import type { PerformanceMetricConfig } from "./types";

/**
 * Four performance metric configurations with meaningful data per CHARTS.md plan.
 *
 * Each metric has:
 * - Primary value prominently displayed
 * - Breakdown data for donut visualization (metrics 1-3) or threshold zones (metric 4)
 * - Insights: first = topic sentence (action), rest = bullet points (why/details)
 */
export const PERFORMANCE_METRICS: PerformanceMetricConfig[] = [
  // Chart 1: Average Age of Code Deleted
  {
    id: "avg-age-code-deleted",
    title: "Average Age of Code Deleted",
    severity: "Heavy",
    severityColor: "#CA3A31",
    bgColor: "#F9E3E2",
    iconColor: "#CA3A31",
    icon: Hourglass,
    primaryValue: "42",
    primaryLabel: "days",
    visualizationType: "donut",
    breakdown: [
      { label: "<14 days", value: 25, color: "#CA3A31" },
      { label: "14d-1mo", value: 30, color: "#E9A23B" },
      { label: "1-3mo", value: 28, color: "#7BA8E6" },
      { label: ">3mo", value: 17, color: "#55B685" },
    ],
    insights: [
      {
        id: "topic",
        text: "Needs attention — too much young code is being deleted. Consider improving upfront design reviews before implementation.",
      },
      {
        id: "young-code",
        text: "25% of deleted code is less than 2 weeks old, indicating rushed implementations that don't survive review.",
      },
      {
        id: "mature-deletions",
        text: "Only 17% of deletions target mature code (>3 months), suggesting limited intentional refactoring.",
      },
      {
        id: "threshold",
        text: "The 42-day average is below the healthy threshold of 60 days.",
      },
    ],
  },

  // Chart 2: Normalized Lines of Code
  {
    id: "normalized-loc",
    title: "Normalized Lines of Code",
    severity: "Low",
    severityColor: "#6BC095",
    bgColor: "#D9F9E6",
    iconColor: "#55B685",
    icon: Code2,
    primaryValue: "8,450",
    primaryLabel: "nLoC",
    visualizationType: "donut",
    breakdown: [
      { label: "Core Logic", value: 50, color: "#55B685" },
      { label: "Tests", value: 25, color: "#7BA8E6" },
      { label: "Config", value: 15, color: "#E9A23B" },
      { label: "Docs", value: 10, color: "#9CA3AF" },
    ],
    insights: [
      {
        id: "topic",
        text: "On track — weighted output is healthy with good focus on high-value work. Maintain current development practices.",
      },
      {
        id: "weighted",
        text: "12,800 raw lines translate to 8,450 normalized contribution (66% efficiency ratio).",
      },
      {
        id: "core-focus",
        text: "Half of contributions target core business logic, indicating focus on high-value work.",
      },
      {
        id: "test-coverage",
        text: "Test coverage contributions (25%) align with quality-first development practices.",
      },
    ],
  },

  // Chart 3: Legacy Code Updated
  {
    id: "legacy-code-updated",
    title: "Legacy Code Updated",
    severity: "Medium",
    severityColor: "#E9A23B",
    bgColor: "#FCF3CC",
    iconColor: "#E9A23B",
    icon: RefreshCw,
    primaryValue: "23",
    primaryLabel: "%",
    visualizationType: "donut",
    breakdown: [
      { label: "6mo-1yr", value: 52, color: "#55B685" },
      { label: "1-2yr", value: 26, color: "#7BA8E6" },
      { label: "2-3yr", value: 13, color: "#E9A23B" },
      { label: ">3yr", value: 9, color: "#CA3A31" },
    ],
    insights: [
      {
        id: "topic",
        text: "Below average — legacy systems may be accumulating debt. Consider dedicating sprint capacity to proactive maintenance.",
      },
      {
        id: "low-legacy",
        text: "Only 23% of changes touch code older than 6 months (target: 30-40%).",
      },
      {
        id: "oldest-code",
        text: "Updates to 3+ year old code represent just 9% of legacy work, despite these areas often needing the most attention.",
      },
      {
        id: "risk",
        text: "Low legacy engagement increases risk of critical failures in older systems.",
      },
    ],
  },

  // Chart 4: Churn Rate
  {
    id: "churn-rate",
    title: "Churn Rate",
    severity: "Heavy",
    severityColor: "#CA3A31",
    bgColor: "#F9E3E2",
    iconColor: "#CA3A31",
    icon: Repeat,
    primaryValue: "12.4",
    primaryLabel: "%",
    visualizationType: "barWithZones",
    currentValue: 12.4,
    thresholds: [
      { min: 0, max: 5, label: "Great", color: "#55B685" },
      { min: 5, max: 10, label: "Expected", color: "#7BA8E6" },
      { min: 10, max: 20, label: "Concerning", color: "#E9A23B" },
      { min: 20, max: 100, label: "Critical", color: "#CA3A31" },
    ],
    insights: [
      {
        id: "topic",
        text: "Concerning — churn rate is above healthy range. Target reducing to <10% through better specs and design discussions.",
      },
      {
        id: "ratio",
        text: "12.4% means roughly 1 in 8 lines of new code gets deleted (healthy range: 5-10%).",
      },
      {
        id: "trend",
        text: "Churn increased from 9.8% last period, suggesting growing rework cycles.",
      },
      {
        id: "correlation",
        text: "High churn often correlates with insufficient planning or over-reliance on trial-and-error coding.",
      },
    ],
  },
];
