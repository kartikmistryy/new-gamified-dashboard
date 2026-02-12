import { Hourglass, Code2, RefreshCw, Repeat } from "lucide-react";
import type { PerformanceMetricConfig, OperationBreakdownCard } from "@/lib/dashboard/entities/team/types";

/**
 * Four performance metric configurations with meaningful data per CHARTS.md plan.
 * Ordered by Impact on Score: High -> Heavy -> Medium -> Low
 *
 * Each metric has:
 * - Primary value prominently displayed
 * - Breakdown data for donut visualization (metrics 1-3) or threshold zones (metric 4)
 * - Insights: first = topic sentence (action), rest = bullet points (why/details)
 */
export const PERFORMANCE_METRICS: PerformanceMetricConfig[] = [
  // 1. Normalized Lines of Code (Impact: High - changed from Low)
  {
    id: "normalized-loc",
    sectionTitle: "Meaningful Output",
    title: "Normalized Lines of Code",
    severity: "Heavy",
    severityColor: "#CA3A31",
    bgColor: "#F9E3E2",
    iconColor: "#CA3A31",
    icon: Code2,
    primaryValue: "845",
    primaryLabel: "nLoC",
    visualizationType: "donut",
    status: {
      label: "On track",
      color: "#55B685",
    },
    motivation: {
      why: "Reflects meaningful contribution rather than raw volume, rewarding high-value work.",
      how: "Raw lines weighted by type (core logic counts more than config/docs).",
    },
    breakdown: [
      { label: "Core Logic", value: 50, color: "#55B685" },
      { label: "Tests", value: 25, color: "#7BA8E6" },
      { label: "Config", value: 15, color: "#E9A23B" },
      { label: "Docs", value: 10, color: "#9CA3AF" },
    ],
    currentValue: 845,
    thresholds: [
      { min: 0, max: 200, label: "Critical", color: "#CA3A31" },
      { min: 200, max: 500, label: "Concerning", color: "#E9A23B" },
      { min: 500, max: 800, label: "Expected", color: "#7BA8E6" },
      { min: 800, max: 1500, label: "Great", color: "#55B685" },
    ],
    trend: { direction: "up", value: "120 nLoC", upIsGood: true },
    insights: [
      {
        id: "topic",
        text: "Weighted output is healthy with good focus on high-value work. Maintain current development practices.",
      },
      {
        id: "weighted",
        text: "12,800 raw lines translate to 845 normalized contribution (66% efficiency ratio).",
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

  // 2. Average Age of Code Deleted (Impact: Heavy - unchanged)
  {
    id: "avg-age-code-deleted",
    sectionTitle: "Code Design Quality",
    title: "Average Age of Code Deleted",
    severity: "Heavy",
    severityColor: "#CA3A31",
    bgColor: "#F9E3E2",
    iconColor: "#CA3A31",
    icon: Hourglass,
    primaryValue: "13",
    primaryLabel: "days",
    visualizationType: "donut",
    status: {
      label: "Needs attention",
      color: "#CA3A31",
    },
    motivation: {
      why: "Higher values indicate more stable, well-designed code that doesn't need frequent rewrites.",
      how: "Average age of all deleted lines, weighted by commit history.",
    },
    breakdown: [
      { label: "<14 days", value: 25, color: "#CA3A31" },
      { label: "14d-1mo", value: 30, color: "#E9A23B" },
      { label: "1-3mo", value: 28, color: "#7BA8E6" },
      { label: ">3mo", value: 17, color: "#55B685" },
    ],
    currentValue: 13,
    thresholds: [
      { min: 0, max: 14, label: "Critical", color: "#CA3A31" },
      { min: 14, max: 30, label: "Concerning", color: "#E9A23B" },
      { min: 30, max: 60, label: "Expected", color: "#7BA8E6" },
      { min: 60, max: 120, label: "Great", color: "#55B685" },
    ],
    trend: { direction: "down", value: "5 days", upIsGood: true },
    insights: [
      {
        id: "topic",
        text: "Too much young code is being deleted. Consider improving upfront design reviews before implementation.",
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
        text: "The 13-day average is below the critical threshold of 14 days.",
      },
    ],
  },

  // 3. Churn Rate (Impact: Medium - changed from Heavy)
  {
    id: "churn-rate",
    sectionTitle: "Development Efficiency",
    title: "Churn Rate",
    severity: "Medium",
    severityColor: "#E9A23B",
    bgColor: "#FCF3CC",
    iconColor: "#E9A23B",
    icon: Repeat,
    primaryValue: "12.4",
    primaryLabel: "%",
    visualizationType: "barWithZones",
    status: {
      label: "Concerning",
      color: "#E9A23B",
    },
    motivation: {
      why: "High churn indicates rework cycles, often from unclear requirements or insufficient planning.",
      how: "Ratio of deleted lines to added lines within the same time period.",
    },
    currentValue: 12.4,
    thresholds: [
      { min: 0, max: 5, label: "Great", color: "#55B685" },
      { min: 5, max: 10, label: "Expected", color: "#7BA8E6" },
      { min: 10, max: 20, label: "Concerning", color: "#E9A23B" },
      { min: 20, max: 100, label: "Critical", color: "#CA3A31" },
    ],
    trend: { direction: "up", value: "2.6%", upIsGood: false },
    insights: [
      {
        id: "topic",
        text: "Churn rate is above healthy range. Target reducing to <10% through better specs and design discussions.",
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

  // 4. Legacy Code Updated (Impact: Low - changed from Medium)
  {
    id: "legacy-code-updated",
    sectionTitle: "Technical Debt Management",
    title: "Legacy Code Updated",
    severity: "Low",
    severityColor: "#6BC095",
    bgColor: "#D9F9E6",
    iconColor: "#55B685",
    icon: RefreshCw,
    primaryValue: "23",
    primaryLabel: "%",
    visualizationType: "donut",
    status: {
      label: "Below average",
      color: "#E9A23B",
    },
    motivation: {
      why: "Healthy teams balance new features with legacy upkeep to prevent tech debt accumulation.",
      how: "Percentage of changes touching code older than 6 months.",
    },
    breakdown: [
      { label: "6mo-1yr", value: 52, color: "#55B685" },
      { label: "1-2yr", value: 26, color: "#7BA8E6" },
      { label: "2-3yr", value: 13, color: "#E9A23B" },
      { label: ">3yr", value: 9, color: "#CA3A31" },
    ],
    currentValue: 23,
    thresholds: [
      { min: 0, max: 5, label: "Critical", color: "#CA3A31" },
      { min: 5, max: 10, label: "Concerning", color: "#E9A23B" },
      { min: 10, max: 20, label: "Expected", color: "#7BA8E6" },
      { min: 20, max: 36, label: "Great", color:  "#55B685"},
    ],
    trend: { direction: "up", value: "4%", upIsGood: true },
    insights: [
      {
        id: "topic",
        text: "Legacy systems may be accumulating debt. Consider dedicating sprint capacity to proactive maintenance.",
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
];

/**
 * Operation breakdown data for Detailed Breakdowns section.
 * Sum of all nLoC values = 845 (matches Normalized Lines of Code in Core Metrics).
 */
export const OPERATION_BREAKDOWN_DATA: OperationBreakdownCard[] = [
  {
    operation: "update",
    label: "Updated",
    nLoC: 280,
    trend: { direction: "up", value: "+42", upIsGood: true },
    insight: "Active codebase maintenance. Update activity shows engagement with existing systems.",
  },
  {
    operation: "add",
    label: "Added",
    nLoC: 450,
    trend: { direction: "up", value: "+65", upIsGood: true },
    insight: "Strong new feature output. Addition rate reflects healthy sprint velocity.",
  },
  {
    operation: "delete",
    label: "Delete",
    nLoC: 85,
    trend: { direction: "down", value: "-12", upIsGood: true },
    insight: "Intentional cleanup activity. Removing legacy code to reduce technical debt.",
  },
  {
    operation: "selfDelete",
    label: "SelfDelete",
    nLoC: 30,
    trend: { direction: "up", value: "+8", upIsGood: false },
    insight: "Slight increase in self-deletions. Monitor for potential rework patterns.",
  },
];
