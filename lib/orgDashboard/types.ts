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
