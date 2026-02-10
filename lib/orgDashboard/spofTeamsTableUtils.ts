/** SPOF Teams Table Utilities */

import type { SpofTeamRow } from "./spofMockData";
import { TrendingUp, TrendingDown, ArrowRight } from "lucide-react";

export type SpofTableFilter = "highestRisk" | "lowestRisk" | "mostMembers" | "leastMembers";

export const SPOF_FILTER_TABS: { key: SpofTableFilter; label: string }[] = [
  { key: "lowestRisk", label: "Most Optimal" },
  { key: "highestRisk", label: "Most Risky" },
  { key: "mostMembers", label: "Healthiest" },
  { key: "leastMembers", label: "Most Critical" },
];

export const SPOF_OWNER_SEGMENTS = [
  { key: "low", label: "Low", color: "#10b981" },
  { key: "medium", label: "Medium", color: "#3b82f6" },
  { key: "high", label: "High", color: "#f97316" },
];

/** Get trend icon for count value compared to average */
export function getTrendIconForCount(counts: number[], index: number) {
  const total = counts.reduce((sum, value) => sum + value, 0);
  const average = counts.length ? total / counts.length : 0;
  const value = counts[index] ?? 0;
  if (value > average) return TrendingUp;
  if (value < average) return TrendingDown;
  return ArrowRight;
}

/** Sort SPOF teams based on filter criteria */
export function sortSpofTeams(rows: SpofTeamRow[], filter: SpofTableFilter): SpofTeamRow[] {
  const copy = [...rows];
  switch (filter) {
    case "highestRisk":
      return copy.sort((a, b) => b.avgSpofScore - a.avgSpofScore);
    case "lowestRisk":
      return copy.sort((a, b) => a.avgSpofScore - b.avgSpofScore);
    case "mostMembers":
      return copy.sort((a, b) => b.memberCount - a.memberCount);
    case "leastMembers":
      return copy.sort((a, b) => a.memberCount - b.memberCount);
    default:
      return copy;
  }
}
