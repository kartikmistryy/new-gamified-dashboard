import type { ContributorSpofRow } from "./spofMockData";
import type { ChartInsight, FilterTab } from "@/lib/orgDashboard/types";

export type SpofContributorFilter = "highestRisk" | "mostModules" | "mostOwnership" | "leastDistributed";

export const SPOF_CONTRIBUTOR_FILTER_TABS: FilterTab<SpofContributorFilter>[] = [
  { key: "highestRisk", label: "Highest Risk" },
  { key: "mostModules", label: "Most Modules" },
  { key: "mostOwnership", label: "Most Ownership" },
  { key: "leastDistributed", label: "Least Distributed" },
];

/**
 * Sort function for SPOF contributor table based on filter.
 */
export function spofContributorSortFunction(
  rows: ContributorSpofRow[],
  filter: SpofContributorFilter
): ContributorSpofRow[] {
  const copy = [...rows];

  switch (filter) {
    case "highestRisk":
      // Sort by avgSpofScore descending (higher = riskier)
      return copy.sort((a, b) => b.avgSpofScore - a.avgSpofScore);
    case "mostModules":
      // Sort by moduleCount descending
      return copy.sort((a, b) => b.moduleCount - a.moduleCount);
    case "mostOwnership":
      // Sort by ownershipPct descending
      return copy.sort((a, b) => b.ownershipPct - a.ownershipPct);
    case "leastDistributed":
      // Sort by highRiskCount descending (more high-risk modules = less distributed)
      return copy.sort((a, b) => b.highRiskCount - a.highRiskCount);
    default:
      return copy;
  }
}

/**
 * Generate insights for SPOF page based on contributor data.
 * Adapted from team dashboard getSpofInsights().
 */
export function getSpofInsights(contributors: ContributorSpofRow[]): ChartInsight[] {
  if (contributors.length === 0) return [];

  const insights: ChartInsight[] = [];

  // Calculate overall averages
  const avgSpof = contributors.reduce((sum, c) => sum + c.avgSpofScore, 0) / contributors.length;
  const avgOwnership = contributors.reduce((sum, c) => sum + c.ownershipPct, 0) / contributors.length;

  // Find highest risk contributor
  const highestRisk = contributors.reduce((max, c) =>
    c.avgSpofScore > max.avgSpofScore ? c : max,
    contributors[0]
  );

  // SPOF risk level insight
  if (avgSpof > 3.0) {
    insights.push({
      id: "high-risk",
      text: `Repository has high SPOF risk (${avgSpof.toFixed(1)}/6.0). ${highestRisk.contributorName} shows the highest concentration.`
    });
  } else if (avgSpof < 1.5) {
    insights.push({
      id: "low-risk",
      text: `Repository shows excellent knowledge distribution with low SPOF risk (${avgSpof.toFixed(1)}/6.0).`
    });
  } else {
    insights.push({
      id: "moderate-risk",
      text: `Repository has moderate SPOF risk (${avgSpof.toFixed(1)}/6.0). Consider distributing ownership more evenly.`
    });
  }

  // Ownership concentration insight
  const highOwnershipContributors = contributors.filter(c => c.ownershipPct > 30);
  if (highOwnershipContributors.length > 0) {
    const names = highOwnershipContributors.slice(0, 2).map(c => c.contributorName).join(" and ");
    insights.push({
      id: "ownership",
      text: `${highOwnershipContributors.length} contributor${highOwnershipContributors.length > 1 ? 's' : ''} (${names}) own more than 30% of modules.`
    });
  }

  // Critical modules insight
  const totalCritical = contributors.reduce((sum, c) => sum + c.repoHealthCritical, 0);
  if (totalCritical > 0) {
    insights.push({
      id: "critical",
      text: `${totalCritical} module${totalCritical > 1 ? 's' : ''} are in critical health status and require immediate attention.`
    });
  }

  return insights.slice(0, 4);
}
