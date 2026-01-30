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

export type TeamRow = {
  rank: number;
  name: string;
  teamId: string;
  codeQuality: number;
  karmaPoints: number;
};

export type TeamSortColumn = "codeQuality" | "karmaPoints" | null;
