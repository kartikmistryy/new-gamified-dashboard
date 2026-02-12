import type React from "react";

export type FilterTab<T extends string = string> = {
  key: T;
  label: string;
};

export type AIRecommendation = {
  sentiment: string;
  sentimentColor: string;
  borderAccent: string;
  text: string;
  cta: string;
};

export type ChartDataPoint = {
  date: string;
  fearGreed: number;
  btcPrice: number;
};

export type NormalizedDataPoint = {
  date: string;
  value: number;
};

export type ChartEvent = {
  date: string;
  label: string;
  type: "holiday" | "milestone";
};

export type ChartAnnotation = {
  date: string;
  label: string;
  value: number;
};

export type ChartInsight = {
  id: string;
  text: string;
};

export type CryptoRow = {
  rank: number;
  name: string;
  symbol: string;
  price: number;
  marketCap: string;
  color: string;
};

export type CryptoSortColumn = "price" | "marketCap" | null;

export type OutlierRow = {
  name: string;
  role: string;
  kp: string;
  own: string;
  delta: string;
};

export type SummaryCardKey =
  | "star"
  | "key-player"
  | "bottleneck"
  | "stable"
  | "risky"
  | "time-bomb";

export type SummaryCardConfig = {
  key: SummaryCardKey;
  title: string;
  count: number;
  pct: number;
  bg: string;
  iconColor: string;
};

export type OverviewSummaryCardConfig = {
  key: SummaryCardKey;
  title: string;
  count: number | string;
  priority: string;
  descriptionLine1: string;
  descriptionLine2: string;
  bg: string;
  iconColor: string;
  badgeColor: string;
};

export type TeamPerformanceRow = {
  rank: number;
  teamName: string;
  teamColor: string;
  performanceLabel: string;
  performanceValue: number;
  trend: "up" | "down" | "flat";
  performanceBarColor: string;
  /** Change in points (e.g. +5, -5, 0); used on performance page. */
  changePts?: number;
  typeDistribution: {
    star: number;
    timeBomb: number;
    keyRole: number;
    bottleneck: number;
    risky: number;
    legacy: number;
  };
};

export type TeamTableFilter = "mostProductive" | "leastProductive" | "mostOptimal" | "mostRisky";

export type PerformanceTableFilter =
  | "mostProductive"
  | "leastProductive"
  | "mostImproved"
  | "mostRegressed";

/** Design page teams table: ownership allocation (3 segments), engineering chaos (4 segments). */
export type DesignTeamRow = {
  teamName: string;
  teamColor: string;
  /** 3 segments: red, blue, green (counts). */
  ownershipAllocation: [number, number, number];
  /** 4 segments: red, light orange, blue, green (counts). */
  engineeringChaos: [number, number, number, number];
  /** Scores backing the filter tabs for deterministic sorting. Higher is \"more\" of that dimension. */
  outlierScore: number;
  skilledAIScore: number;
  unskilledScore: number;
  legacyScore: number;
};

export type DesignTableFilter =
  | "mostOutliers"
  | "mostSkilledAIBuilders"
  | "mostUnskilledVibeCoders"
  | "mostLegacyDevs";

/** Skillgraph page teams table: domain count, skill count, top 3 widely known and proficient skills. */
export type SkillgraphTeamRow = {
  teamName: string;
  teamColor: string;
  totalUsage: number;
  skillCount: number;
  top3WidelyKnown?: { name: string; color: string }[];
  top3Proficient?: { name: string; color: string }[];
  domainDistribution?: { domain: string; value: number }[];
  details?: {
    domain: string;
    skill: string;
    usage: number;
    progress: number;
  }[];
};

export type SkillgraphTableFilter =
  | "mostUsage"
  | "leastUsage"
  | "mostPercentOfChart"
  | "leastPercentOfChart";

export type SkillgraphSkillRow = {
  skillName: string;
  domainName: string;
  totalUsage: number;
  avgUsage: number;
  totalSkillCompletion: number;
  contributors: number;
  details?: {
    team: string;
    usage: number;
    progress: number;
  }[];
};

export type SkillgraphSkillFilter =
  | "mostUsage"
  | "leastUsage"
  | "mostAvgUsage"
  | "leastAvgUsage"
  | "mostContributors"
  | "leastContributors";
/** Single developer point (KarmaPoints vs Ownership %). */
export type DeveloperPoint = {
  name: string;
  team: string;
  totalKarmaPoints: number;
  ownershipPct: number;
};

export type OwnershipTimeRangeKey = "1m" | "3m" | "1y" | "max";

/** Outlier classification: above band = high ownership, below band = low ownership. */
export type OutlierType = "high" | "low" | null;

/** Developer point with regression residual and outlier classification. */
export type ClassifiedPoint = DeveloperPoint & {
  residual: number;
  inNormalRange: boolean;
  /** null = normal range; "high" = above band; "low" = below band. */
  outlierType: OutlierType;
};

/** Band boundary point for normal range area. */
export type BandPoint = {
  x: number;
  yLower: number;
  yUpper: number;
};

/** Tooltip position and point. */
export type TooltipState = {
  point: ClassifiedPoint & { cx?: number; cy?: number };
  x: number;
  y: number;
} | null;

/** Trend line in pixel coordinates. */
export type TrendLine = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};
import type * as d3 from "d3";

export type SpofChartDimensions = {
  width: number;
  height: number;
  margin: { top: number; right: number; bottom: number; left: number };
  innerWidth: number;
  innerHeight: number;
};

export type SpofChartScales = {
  xScale: d3.ScaleLinear<number, number>;
  yScale: d3.ScaleLinear<number, number>;
};

export type StackedBinData = {
  x0: number;
  x1: number;
  stacks: { team: string; y0: number; y1: number }[];
};

/** Severity level for performance metric cards. */
export type MetricSeverity = "Heavy" | "Medium" | "Low";

/** A segment in a donut chart breakdown. */
export type DonutSegment = {
  label: string;
  value: number;
  color: string;
};

/** A threshold zone for horizontal bar visualization. */
export type ThresholdZone = {
  min: number;
  max: number;
  label: string;
  color: string;
};

/** Configuration for a performance metric card (e.g. Churn Rate, Legacy Code Refactoring). */
export type PerformanceMetricConfig = {
  id: string;
  /** Plain language section title (e.g., "Code Design Quality"). */
  sectionTitle: string;
  /** Technical description shown as subtitle (e.g., "Average Age of Code Deleted"). */
  title: string;
  severity: MetricSeverity;
  severityColor: string;
  bgColor: string;
  iconColor: string;
  /** Lucide icon component rendered in the card header. */
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  /** Status indicator for the metric (e.g., "On track", "Needs attention"). */
  status?: {
    label: string;
    color: string;
  };
  insights: ChartInsight[];
  /** Explains why this metric matters and how it's calculated. */
  motivation?: {
    why: string;
    how: string;
  };
  /** Primary display value (e.g., "42 days", "8,450", "23%", "12.4%"). */
  primaryValue: string;
  /** Unit or label shown below the primary value. */
  primaryLabel?: string;
  /** Type of visualization: 'donut' for categorical breakdown, 'barWithZones' for threshold-based. */
  visualizationType: "donut" | "barWithZones";
  /** Breakdown segments for donut chart visualization. */
  breakdown?: DonutSegment[];
  /** Threshold zones for bar visualization (only used when visualizationType is 'barWithZones'). */
  thresholds?: ThresholdZone[];
  /** Current numeric value for positioning on threshold bar (0-100 scale or actual value). */
  currentValue?: number;
  /** Trend compared to previous period. */
  trend?: {
    direction: "up" | "down" | "flat";
    value: string;
    /** If true, up = green (good), down = red (bad). If false, up = red (bad), down = green (good). */
    upIsGood: boolean;
  };
};

/** Operation type for nLoC breakdown. */
export type OperationType = "add" | "update" | "delete" | "selfDelete";

/** Configuration for an operation breakdown card in the Detailed Breakdowns section. */
export type OperationBreakdownCard = {
  operation: OperationType;
  label: string;
  nLoC: number;
  trend: {
    direction: "up" | "down" | "flat";
    value: string;
    upIsGood: boolean;
  };
  insight: string;
};

// =============================================================================
// Org Design Page - Outliers Types
// =============================================================================

/** Ownership category from the Ownership Misallocation Detector chart. */
export type OwnershipCategory = "higher" | "lower" | "expected";

/** Chaos category from the Engineering Chaos Matrix chart. */
export type ChaosCategory =
  | "Skilled AI User"
  | "Unskilled AI User"
  | "Traditional Developer"
  | "Low-Skill Developer";

/** SPOF assessment level for individual developers. */
export type SpofAssessment = "low" | "medium" | "high";

/** Priority level for outlier developers based on combined ranking. */
export type OutlierPriority = "critical" | "attention" | "normal";

/**
 * Combined developer data for the outliers table.
 * Merges ownership classification, chaos quadrant, and SPOF assessment.
 */
export type OutlierDeveloper = {
  id: string;
  name: string;
  team: string;
  /** Ownership classification: higher/lower/expected relative to trend line. */
  ownershipCategory: OwnershipCategory;
  /** Chaos quadrant based on KP and churn rate. */
  chaosCategory: ChaosCategory;
  /** SPOF risk assessment level. */
  spofAssessment: SpofAssessment;
  /**
   * Combined rank (1-12, lower is worse).
   * Ranking: Ownership (primary) → Chaos (secondary)
   * 1 = lower + Low-Skill Developer (worst)
   * 12 = expected + Skilled AI User (best)
   */
  combinedRank: number;
  /** Priority derived from ownership category. */
  priority: OutlierPriority;
};

/** Filter options for the outliers table. */
export type OutliersTableFilter =
  | "all"
  | "critical"
  | "attention"
  | "normal";

/** Motivation content for chart explanation panels. */
export type ChartMotivation = {
  why: string;
  how: string;
};
