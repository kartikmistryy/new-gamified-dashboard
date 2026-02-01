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
