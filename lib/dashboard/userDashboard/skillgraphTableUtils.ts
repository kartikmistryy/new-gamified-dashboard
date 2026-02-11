import type { SortingState } from "@tanstack/react-table";
import type { SkillgraphSkillFilter } from "@/lib/orgDashboard/types";

export const SKILLGRAPH_SKILL_FILTER_TABS: { key: SkillgraphSkillFilter; label: string }[] = [
  { key: "mostUsage", label: "Most Usage" },
  { key: "leastUsage", label: "Least Usage" },
  { key: "mostAvgUsage", label: "Highest Completion" },
  { key: "leastAvgUsage", label: "Lowest Completion" },
  { key: "mostContributors", label: "Most Contributors" },
  { key: "leastContributors", label: "Least Contributors" },
];

export function createOpacityScale(values: number[]) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  return (value: number) => {
    if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) return 0.75;
    const t = (value - min) / (max - min);
    return 0.35 + t * 0.6;
  };
}

export function getSortingForFilter(filter: SkillgraphSkillFilter): SortingState {
  switch (filter) {
    case "mostUsage":
      return [{ id: "totalUsage", desc: true }];
    case "leastUsage":
      return [{ id: "totalUsage", desc: false }];
    case "mostAvgUsage":
      return [{ id: "totalSkillCompletion", desc: true }];
    case "leastAvgUsage":
      return [{ id: "totalSkillCompletion", desc: false }];
    case "mostContributors":
      return [{ id: "contributors", desc: true }];
    case "leastContributors":
      return [{ id: "contributors", desc: false }];
    default:
      return [];
  }
}
