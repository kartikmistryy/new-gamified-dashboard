export type ViewMode = "aggregate" | "individual";

export type PerformanceFilter =
  | "mostProductive"
  | "leastProductive"
  | "mostImproved"
  | "mostRegressed"
  | "highestChurn"
  | "lowestChurn";

export type MemberPerformanceDataPoint = {
  date: string;           // ISO date string YYYY-MM-DD
  value: number;          // Team average performance at this point
  memberValues: Record<string, number>; // Individual member values keyed by memberName
};
