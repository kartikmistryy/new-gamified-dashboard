// lib/dashboard/entities/team/data/orgPerformanceDataLoader.ts

// ─── Imports ─────────────────────────────────────────────────────────────────
import orgPerformanceData from "./org_performance_data.json";
import { DASHBOARD_COLORS } from "@/lib/dashboard/shared/utils/colors";
import type {
  PerformanceMetricConfig,
  OperationBreakdownCard,
} from "@/lib/dashboard/entities/team/types";
import { Code2, Repeat } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
export type OrgPerformanceNLoc = {
  total: number;
  byOperation: {
    add: number;
    update: number;
    delete: number;
    selfDelete: number;
  };
  fractions: {
    add: number;
    update: number;
    delete: number;
    selfDelete: number;
  };
};

export type OrgPerformanceChurn = {
  churnRatePct: number;
  totalSelfDeleteLines: number;
  totalLinesChanged: number;
};

export type OrgPerformanceData = {
  schemaVersion: "1.0";
  generatedAt: string;
  repos: string[];
  contributor: {
    repoCount: number;
    contributorCount: number;
    totalCommits: number;
  };
  nLoc: OrgPerformanceNLoc;
  churn: OrgPerformanceChurn;
};

// ─── Single Cast ──────────────────────────────────────────────────────────────
export const ORG_PERFORMANCE_DATA: OrgPerformanceData =
  orgPerformanceData as OrgPerformanceData;

// ─── Derived Constants ────────────────────────────────────────────────────────

/** Total normalized lines of code across all repos */
export const ORG_TOTAL_NLOC = ORG_PERFORMANCE_DATA.nLoc.total;

/** Churn rate as a percentage (e.g. 4.83) */
export const ORG_CHURN_RATE_PCT = ORG_PERFORMANCE_DATA.churn.churnRatePct;

/**
 * Deterministic gauge value derived from churn rate.
 * Lower churn = higher performance score.
 * Churn 0% → ~90, Churn 5% → ~75, Churn 10% → ~60, Churn 20% → ~40
 */
export const ORG_PERFORMANCE_GAUGE_VALUE = Math.round(
  Math.max(10, Math.min(95, 90 - ORG_CHURN_RATE_PCT * 3))
);

/** Format a large number as "7.8M" or "1.4M" etc. */
function formatNLoC(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
  return `${n}`;
}

/** Derive severity label and colors from a churn rate percentage */
function churnSeverity(pct: number): {
  severity: "Heavy" | "Medium" | "Low";
  severityColor: string;
  bgColor: string;
  iconColor: string;
  statusLabel: string;
  statusColor: string;
} {
  if (pct >= 20)
    return {
      severity: "Heavy",
      severityColor: DASHBOARD_COLORS.danger,
      bgColor: DASHBOARD_COLORS.bgRedLight,
      iconColor: DASHBOARD_COLORS.danger,
      statusLabel: "Critical",
      statusColor: DASHBOARD_COLORS.danger,
    };
  if (pct >= 10)
    return {
      severity: "Medium",
      severityColor: DASHBOARD_COLORS.caution,
      bgColor: DASHBOARD_COLORS.bgYellowLight,
      iconColor: DASHBOARD_COLORS.caution,
      statusLabel: "Concerning",
      statusColor: DASHBOARD_COLORS.caution,
    };
  if (pct >= 5)
    return {
      severity: "Medium",
      severityColor: DASHBOARD_COLORS.caution,
      bgColor: DASHBOARD_COLORS.bgYellowLight,
      iconColor: DASHBOARD_COLORS.caution,
      statusLabel: "Watch",
      statusColor: DASHBOARD_COLORS.caution,
    };
  return {
    severity: "Low",
    severityColor: DASHBOARD_COLORS.excellent,
    bgColor: DASHBOARD_COLORS.bgGreenLight,
    iconColor: DASHBOARD_COLORS.excellent,
    statusLabel: "On track",
    statusColor: DASHBOARD_COLORS.excellent,
  };
}

// ─── Transform Functions ──────────────────────────────────────────────────────

/** Build the nLoC metric config using real linesByOperation data */
export function buildNLocMetricConfig(): PerformanceMetricConfig {
  const { total, fractions } = ORG_PERFORMANCE_DATA.nLoc;

  return {
    id: "normalized-loc",
    sectionTitle: "Meaningful Output",
    title: "Normalized Lines of Code",
    severity: "Heavy",
    severityColor: DASHBOARD_COLORS.danger,
    bgColor: DASHBOARD_COLORS.bgRedLight,
    iconColor: DASHBOARD_COLORS.danger,
    icon: Code2,
    primaryValue: formatNLoC(total),
    primaryLabel: "nLoC",
    visualizationType: "donut",
    status: { label: "On track", color: DASHBOARD_COLORS.excellent },
    breakdown: [
      {
        label: "Added",
        value: Math.round(fractions.add * 100),
        color: DASHBOARD_COLORS.excellent,
      },
      {
        label: "Updated",
        value: Math.round(fractions.update * 100),
        color: DASHBOARD_COLORS.blueAccent,
      },
      {
        label: "Deleted",
        value: Math.round(fractions.delete * 100),
        color: DASHBOARD_COLORS.caution,
      },
      {
        label: "Self-Deleted",
        value: Math.round(fractions.selfDelete * 100),
        color: DASHBOARD_COLORS.gray400,
      },
    ],
    currentValue: total,
    thresholds: [
      { min: 0, max: 500_000, label: "Critical", color: DASHBOARD_COLORS.danger },
      { min: 500_000, max: 2_000_000, label: "Concerning", color: DASHBOARD_COLORS.caution },
      { min: 2_000_000, max: 5_000_000, label: "Expected", color: DASHBOARD_COLORS.blueAccent },
      { min: 5_000_000, max: 20_000_000, label: "Great", color: DASHBOARD_COLORS.excellent },
    ],
    trend: { direction: "up", value: "", upIsGood: true },
    insights: [
      {
        id: "topic",
        text: `Org produced ${formatNLoC(total)} lines of code across ${ORG_PERFORMANCE_DATA.contributor.repoCount} repos and ${ORG_PERFORMANCE_DATA.contributor.contributorCount.toLocaleString()} contributors.`,
      },
      {
        id: "add-share",
        text: `${Math.round(fractions.add * 100)}% of output is new code additions — the primary driver of feature velocity.`,
      },
      {
        id: "delete-share",
        text: `${Math.round(fractions.delete * 100)}% is intentional code deletion, indicating active technical debt reduction.`,
      },
      {
        id: "churn-share",
        text: `${Math.round(fractions.selfDelete * 100)}% is self-deletions (churn), reflecting rework of one's own recent code.`,
      },
    ],
    motivation: {
      why: "Reflects total output volume across all repos, broken down by contribution type.",
      how: "Sum of all linesByOperation across all contributors in all repos.",
    },
  };
}

/** Build the Churn Rate metric config using real churn data */
export function buildChurnMetricConfig(): PerformanceMetricConfig {
  const { churnRatePct } = ORG_PERFORMANCE_DATA.churn;
  const rounded = parseFloat(churnRatePct.toFixed(1));
  const sev = churnSeverity(churnRatePct);

  return {
    id: "churn-rate",
    sectionTitle: "Development Efficiency",
    title: "Churn Rate",
    severity: sev.severity,
    severityColor: sev.severityColor,
    bgColor: sev.bgColor,
    iconColor: sev.iconColor,
    icon: Repeat,
    primaryValue: `${rounded}`,
    primaryLabel: "%",
    visualizationType: "barWithZones",
    status: { label: sev.statusLabel, color: sev.statusColor },
    currentValue: rounded,
    thresholds: [
      { min: 0, max: 5, label: "Great", color: DASHBOARD_COLORS.excellent },
      { min: 5, max: 10, label: "Expected", color: DASHBOARD_COLORS.blueAccent },
      { min: 10, max: 20, label: "Concerning", color: DASHBOARD_COLORS.caution },
      { min: 20, max: 100, label: "Critical", color: DASHBOARD_COLORS.danger },
    ],
    trend: { direction: "down", value: "", upIsGood: false },
    insights: [
      {
        id: "topic",
        text:
          churnRatePct < 5
            ? "Churn is healthy. Developers rarely delete their own recent code, indicating well-planned implementations."
            : churnRatePct < 10
            ? "Churn is in the expected range. Monitor for teams trending upward."
            : "Churn rate is above healthy range. Consider improving design reviews before implementation.",
      },
      {
        id: "ratio",
        text: `${rounded}% means roughly 1 in ${Math.round(100 / Math.max(rounded, 1))} lines of new code gets self-deleted (healthy range: < 5%).`,
      },
      {
        id: "volume",
        text: `${ORG_PERFORMANCE_DATA.churn.totalSelfDeleteLines.toLocaleString()} self-deleted lines out of ${ORG_PERFORMANCE_DATA.churn.totalLinesChanged.toLocaleString()} total lines changed.`,
      },
    ],
    motivation: {
      why: "High churn indicates rework cycles, often from unclear requirements or insufficient planning.",
      how: "Ratio of self-deleted lines to total lines changed (selfDelete / totalLinesChanged).",
    },
  };
}

/** Build the four Operation Breakdown cards using real linesByOperation data */
export function buildOperationBreakdownCards(): OperationBreakdownCard[] {
  const { byOperation } = ORG_PERFORMANCE_DATA.nLoc;

  return [
    {
      operation: "update",
      label: "Updated",
      nLoC: byOperation.update,
      trend: { direction: "up", value: "", upIsGood: true },
      insight: "Active codebase maintenance across all repos.",
    },
    {
      operation: "add",
      label: "Added",
      nLoC: byOperation.add,
      trend: { direction: "up", value: "", upIsGood: true },
      insight: "New feature output — the primary driver of velocity.",
    },
    {
      operation: "delete",
      label: "Deleted",
      nLoC: byOperation.delete,
      trend: { direction: "down", value: "", upIsGood: true },
      insight: "Intentional cleanup reducing technical debt.",
    },
    {
      operation: "selfDelete",
      label: "Self-Deleted",
      nLoC: byOperation.selfDelete,
      trend: { direction: "up", value: "", upIsGood: false },
      insight: "Rework of own recent code — monitor for churn patterns.",
    },
  ];
}
