/**
 * User Dashboard Types
 * Defines all TypeScript types for the user dashboard, including performance metrics,
 * developer classifications, and UI card configurations.
 */

import type { SummaryCardKey } from "@/lib/orgDashboard/types";

/** Developer type classifications based on performance and behavior patterns. */
export type DeveloperType =
  | "Star"
  | "Key Player"
  | "Bottleneck"
  | "Stable"
  | "Risky"
  | "Time Bomb";

/** Engineering chaos classification based on churn and DiffDelta patterns. */
export type EngineeringChaosStatus =
  | "Skilled AI Builder"
  | "Low-Skill Dev"
  | "Unskilled Vibe Coder"
  | "Legacy Dev";

/** SPOF (Single Point of Failure) risk level. */
export type SPOFRiskLevel =
  | "Need Attention"
  | "High Risk"
  | "Low Risk"
  | "Optimal";

/** Performance level for Weekly DiffDelta. */
export type PerformanceLevel =
  | "Extreme Underperforming"
  | "Underperforming"
  | "Average"
  | "Good"
  | "Excellent";

/** Trend direction for metrics. */
export type TrendDirection = "up" | "down" | "flat";

/** Tab keys for user dashboard navigation. */
export type UserDashboardTab = "performance" | "skillsgraph" | "spof";

/**
 * Configuration for user metric cards using the OverviewSummaryCard component.
 * These cards display key performance indicators in the 3x2 grid.
 */
export type UserMetricCardConfig = {
  /** Unique identifier for the card. */
  key: SummaryCardKey;
  /** Display title shown at top of card. */
  title: string;
  /** Main metric value (number, percentage, or status). */
  count: number | string;
  /** Badge text (priority/status indicator). */
  priority: string;
  /** Badge color classes. */
  badgeColor: string;
  /** First line of description text. */
  descriptionLine1: string;
  /** Second line of description text. */
  descriptionLine2: string;
  /** Background color class or hex value. */
  bg: string;
  /** Icon color class or hex value. */
  iconColor: string;
};

/**
 * Complete user performance data structure.
 * Contains all metrics displayed in the user dashboard overview.
 */
export type UserPerformanceData = {
  /** User identification. */
  userId: string;
  userName: string;
  userAvatar?: string;

  /** Overall performance score (0-100). */
  performanceScore: number;

  /** Weekly DiffDelta metrics. */
  weeklyDiffDelta: {
    value: number;
    level: PerformanceLevel;
  };

  /** Churn rate metrics. */
  churnRate: {
    percentage: number;
    comparison: string; // e.g., "Extreme Higher Than The Medium"
  };

  /** Cumulative DiffDelta metrics. */
  cumulativeDiffDelta: {
    value: number;
    weekOverWeek: number; // WoW change
    trend: TrendDirection;
  };

  /** Developer type classification. */
  developerType: {
    type: DeveloperType;
    spofLevel: "Low" | "High";
    skillLevel: string; // e.g., "Skilled AI Builder"
  };

  /** Engineering chaos metrics. */
  engineeringChaos: {
    status: EngineeringChaosStatus;
    churnLevel: "Low" | "High";
    diffDeltaLevel: "Low" | "High";
  };

  /** SPOF risk assessment. */
  spofRisk: {
    level: SPOFRiskLevel;
    ownership: "Low" | "High";
    percentile: number; // Percentile compared to peers
  };

  /** Chart insights for performance visualization. */
  insights: string[];
};

/**
 * Filter types for user performance tabs.
 */
export type UserPerformanceFilter = "all" | "recent" | "trends";

/**
 * SPOF score ranges for color coding modules.
 */
export type SPOFScoreRange = "low" | "medium" | "high";

/**
 * Owner information for a module.
 */
export type ModuleOwner = {
  /** Owner user ID. */
  id: string;
  /** Owner name. */
  name: string;
  /** Ownership percentage (0-100). */
  ownershipPercent: number;
};

/**
 * Module data for SPOF treemap visualization.
 */
export type ModuleSPOFData = {
  /** Unique identifier for the module. */
  id: string;
  /** Display name of the module. */
  name: string;
  /** Repository name. */
  repoName: string;
  /** SPOF score (0-100) - higher is more risky. */
  spofScore: number;
  /** Size/weight for treemap (based on contribution or lines of code). */
  size: number;
  /** SPOF score range category. */
  scoreRange: SPOFScoreRange;
  /** Primary owner (highest ownership). */
  primaryOwner: ModuleOwner;
  /** Backup owner (second highest ownership). */
  backupOwner: ModuleOwner;
};
