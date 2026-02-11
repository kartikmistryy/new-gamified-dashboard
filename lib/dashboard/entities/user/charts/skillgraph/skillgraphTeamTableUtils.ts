import type { SortingState } from "@tanstack/react-table";
import type { SkillgraphTableFilter, SkillgraphTeamRow } from "@/lib/dashboard/entities/team/types";

export const SKILLGRAPH_TEAM_FILTER_TABS: { key: SkillgraphTableFilter; label: string }[] = [
  { key: "mostUsage", label: "Most Usage" },
  { key: "leastUsage", label: "Least Usage" },
  { key: "mostPercentOfChart", label: "Highest % of Chart" },
  { key: "leastPercentOfChart", label: "Lowest % of Chart" },
];

export function getTeamSkillUsageValue(row: SkillgraphTeamRow) {
  if (row.domainDistribution?.length) {
    return row.domainDistribution.reduce((sum, item) => sum + item.value, 0);
  }
  return row.skillCount;
}

export function getSortingForFilter(filter: SkillgraphTableFilter): SortingState {
  if (filter === "mostUsage") return [{ id: "totalSkillUsage", desc: true }];
  if (filter === "leastUsage") return [{ id: "totalSkillUsage", desc: false }];
  if (filter === "mostPercentOfChart") return [{ id: "percentOfChart", desc: true }];
  if (filter === "leastPercentOfChart") return [{ id: "percentOfChart", desc: false }];
  return [{ id: "totalSkillUsage", desc: true }];
}
