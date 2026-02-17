/** User Dashboard Types - performance metrics, developer classifications, and UI card configurations. */

import type { SummaryCardKey } from "@/lib/dashboard/entities/team/types";

/** Developer type classifications. */
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

/** User metric card configuration for OverviewSummaryCard component. */
export type UserMetricCardConfig = {
  key: SummaryCardKey;
  title: string;
  count: number | string;
  priority: string;
  badgeColor: string;
  descriptionLine1: string;
  descriptionLine2: string;
  bg: string;
  iconColor: string;
};

/** Complete user performance data with all dashboard metrics. */
export type UserPerformanceData = {
  userId: string;
  userName: string;
  userAvatar?: string;
  performanceScore: number;
  weeklyDiffDelta: {
    value: number;
    level: PerformanceLevel;
  };
  churnRate: {
    percentage: number;
    comparison: string;
  };
  cumulativeDiffDelta: {
    value: number;
    weekOverWeek: number;
    trend: TrendDirection;
  };
  developerType: {
    type: DeveloperType;
    spofLevel: "Low" | "High";
    skillLevel: string;
  };
  engineeringChaos: {
    status: EngineeringChaosStatus;
    churnLevel: "Low" | "High";
    diffDeltaLevel: "Low" | "High";
  };
  spofRisk: {
    level: SPOFRiskLevel;
    ownership: "Low" | "High";
    percentile: number;
  };
  insights: string[];
};

export type UserPerformanceFilter = "all" | "recent" | "trends";

export type SPOFScoreRange = "low" | "medium" | "high";

export type ModuleOwner = {
  id: string;
  name: string;
  ownershipPercent: number;
};

export type CapabilityContributor = {
  name: string;
  ownershipPercent: number;
};

export type ModuleCapability = {
  id: string;
  name: string;
  description: string;
  importance: number;
  busFactor: number;
  backupCount: number;
  topOwnerPercent: number;
  fileCount: number;
  contributors: CapabilityContributor[];
  spofScore?: number;
};

/** Module status based on bus factor */
export type ModuleStatus = "At Risk" | "Needs Attention" | "Healthy";

export type ModuleSPOFData = {
  id: string;
  name: string;
  repoName: string;
  spofScore: number;
  size: number;
  scoreRange: SPOFScoreRange;
  /** Status derived from bus factor (not spofScore) */
  status: ModuleStatus;
  primaryOwner: ModuleOwner;
  backupOwners: ModuleOwner[];
  description?: string;
  activeContributors?: number;
  teamLoad?: "Low Pressure" | "Medium Pressure" | "High Pressure";
  capabilities?: ModuleCapability[];
};
