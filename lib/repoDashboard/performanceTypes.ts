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
