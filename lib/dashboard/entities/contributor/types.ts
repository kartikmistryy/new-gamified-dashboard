export type ContributorPerformanceRow = {
  level: "contributor";
  rank: number;
  contributorName: string;
  contributorAvatar: string;
  repoId: string;
  performanceLabel: string;
  performanceValue: number;
  trend: "up" | "down" | "flat";
  performanceBarColor: string;
  changePts?: number;
  change?: number; // Performance change in points, positive = improved, negative = regressed
  churnRate?: number; // Code churn rate 0-100
  typeDistribution: {
    star: number;
    timeBomb: number;
    keyRole: number;
    bottleneck: number;
    risky: number;
    legacy: number;
  };
};

export type ContributorTableFilter = "mostProductive" | "leastProductive" | "mostOptimal" | "mostRisky";
export type ViewMode = "aggregate" | "individual";

export type PerformanceFilter =
  | "mostProductive"
  | "leastProductive"
  | "mostImproved"
  | "mostRegressed"
  | "highestChurn"
  | "lowestChurn";

export type ContributorPerformanceDataPoint = {
  date: string;           // ISO date string YYYY-MM-DD
  value: number;          // Repository average performance at this point
  contributorValues: Record<string, number>; // Individual contributor values keyed by contributorName
};
