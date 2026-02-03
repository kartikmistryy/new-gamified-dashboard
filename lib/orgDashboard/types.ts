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
  count: number;
  priority: "Optimal" | "P0" | "P1" | "P2" | "P3";
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
  domainCount: number;
  skillCount: number;
  top3WidelyKnown: { name: string; color: string }[];
  top3Proficient: { name: string; color: string }[];
};

export type SkillgraphTableFilter =
  | "mostDomains"
  | "leastDomains"
  | "mostSkills"
  | "leastSkills";
