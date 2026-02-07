import type { MemberSpofRow } from "./spofMockData";
import type { ChartInsight } from "@/lib/orgDashboard/types";

/** Filter types for SPOF member table. */
export type SpofMemberFilter =
  | "highestRisk"
  | "lowestRisk"
  | "mostRepos"
  | "leastRepos";

/** Filter tab configuration for SPOF member table. */
export const SPOF_MEMBER_FILTER_TABS: { key: SpofMemberFilter; label: string }[] = [
  { key: "highestRisk", label: "Highest Ownership" },
  { key: "lowestRisk", label: "Lowest Ownership" },
  { key: "mostRepos", label: "Most Modules" },
  { key: "leastRepos", label: "Least Modules" },
];

/**
 * Sort function for SPOF member table.
 * Follows the Performance tab sort pattern.
 */
export function spofMemberSortFunction(
  rows: MemberSpofRow[],
  currentFilter: SpofMemberFilter
): MemberSpofRow[] {
  const copy = [...rows];

  switch (currentFilter) {
    case "highestRisk":
      return copy.sort((a, b) => b.avgSpofScore - a.avgSpofScore);
    case "lowestRisk":
      return copy.sort((a, b) => a.avgSpofScore - b.avgSpofScore);
    case "mostRepos":
      return copy.sort((a, b) => b.repoCount - a.repoCount);
    case "leastRepos":
      return copy.sort((a, b) => a.repoCount - b.repoCount);
    default:
      return copy;
  }
}

/**
 * Generate insights for SPOF risk analysis.
 * Returns 3-4 member-specific insights.
 */
export function getSpofInsights(members: MemberSpofRow[]): ChartInsight[] {
  if (members.length === 0) return [];

  const insights: ChartInsight[] = [];

  // Sort by SPOF score to get highest/lowest risk members
  const sortedByRisk = [...members].sort((a, b) => b.avgSpofScore - a.avgSpofScore);
  const highestRisk = sortedByRisk[0];
  const lowestRisk = sortedByRisk[sortedByRisk.length - 1];

  // Insight 1: Highest risk member
  insights.push({
    id: "highest-risk",
    text: `${highestRisk.memberName} has the highest SPOF risk with an average score of ${highestRisk.avgSpofScore.toFixed(1)}`,
  });

  // Insight 2: Lowest risk member
  insights.push({
    id: "lowest-risk",
    text: `${lowestRisk.memberName} has the lowest SPOF risk with an average score of ${lowestRisk.avgSpofScore.toFixed(1)}`,
  });

  // Insight 3: Repo health for a member (pick member with best health ratio)
  const sortedByHealth = [...members].sort((a, b) => {
    const aHealthRatio = a.repoHealthHealthy / a.repoCount;
    const bHealthRatio = b.repoHealthHealthy / b.repoCount;
    return bHealthRatio - aHealthRatio;
  });
  const healthiestMember = sortedByHealth[0];
  const healthPercentage = Math.round((healthiestMember.repoHealthHealthy / healthiestMember.repoCount) * 100);

  insights.push({
    id: "repo-health",
    text: `${healthPercentage}% of ${healthiestMember.memberName}'s repositories are in healthy state`,
  });

  // Insight 4: High risk repo count (optional, include if any member has significant high-risk repos)
  const memberWithMostHighRisk = [...members].sort((a, b) => b.highRiskCount - a.highRiskCount)[0];
  if (memberWithMostHighRisk.highRiskCount > 0) {
    insights.push({
      id: "high-risk-repos",
      text: `${memberWithMostHighRisk.memberName} has ${memberWithMostHighRisk.highRiskCount} high-risk repositories`,
    });
  }

  return insights.slice(0, 4); // Max 4 insights
}
