import type { ContributorSkillsRow, ContributorSkillRow } from "./skillsMockData";
import type { ChartInsight } from "@/lib/orgDashboard/types";

/** Filter types for "By Contributor" view */
export type SkillsContributorFilter =
  | "mostDomains"
  | "leastDomains"
  | "mostSkills"
  | "leastSkills"
  | "highestProficiency"
  | "lowestProficiency";

/** Filter tabs for "By Contributor" view */
export const SKILLS_CONTRIBUTOR_FILTER_TABS: { key: SkillsContributorFilter; label: string }[] = [
  { key: "mostDomains", label: "Most Domains" },
  { key: "leastDomains", label: "Least Domains" },
  { key: "mostSkills", label: "Most Skills" },
  { key: "leastSkills", label: "Least Skills" },
  { key: "highestProficiency", label: "Highest Proficiency" },
  { key: "lowestProficiency", label: "Lowest Proficiency" },
];

/** Sort function for "By Contributor" view */
export function skillsContributorSortFunction(
  rows: ContributorSkillsRow[],
  currentFilter: SkillsContributorFilter
): ContributorSkillsRow[] {
  const copy = [...rows];
  switch (currentFilter) {
    case "mostDomains":
      return copy.sort((a, b) => b.domainCount - a.domainCount);
    case "leastDomains":
      return copy.sort((a, b) => a.domainCount - b.domainCount);
    case "mostSkills":
      return copy.sort((a, b) => b.skillCount - a.skillCount);
    case "leastSkills":
      return copy.sort((a, b) => a.skillCount - b.skillCount);
    case "highestProficiency":
      return copy.sort((a, b) => b.avgProficiency - a.avgProficiency);
    case "lowestProficiency":
      return copy.sort((a, b) => a.avgProficiency - b.avgProficiency);
    default:
      return copy;
  }
}

/** Filter types for "By Skill" view */
export type SkillsSkillFilter =
  | "mostUsage"
  | "leastUsage"
  | "mostContributors"
  | "leastContributors"
  | "highestCompletion"
  | "lowestCompletion";

/** Filter tabs for "By Skill" view */
export const SKILLS_SKILL_FILTER_TABS: { key: SkillsSkillFilter; label: string }[] = [
  { key: "mostUsage", label: "Most Usage" },
  { key: "leastUsage", label: "Least Usage" },
  { key: "mostContributors", label: "Most Contributors" },
  { key: "leastContributors", label: "Least Contributors" },
  { key: "highestCompletion", label: "Highest Completion" },
  { key: "lowestCompletion", label: "Lowest Completion" },
];

/** Sort function for "By Skill" view */
export function skillsSkillSortFunction(
  rows: ContributorSkillRow[],
  currentFilter: SkillsSkillFilter
): ContributorSkillRow[] {
  const copy = [...rows];
  switch (currentFilter) {
    case "mostUsage":
      return copy.sort((a, b) => b.totalUsage - a.totalUsage);
    case "leastUsage":
      return copy.sort((a, b) => a.totalUsage - b.totalUsage);
    case "mostContributors":
      return copy.sort((a, b) => b.contributors - a.contributors);
    case "leastContributors":
      return copy.sort((a, b) => a.contributors - b.contributors);
    case "highestCompletion":
      return copy.sort((a, b) => b.totalSkillCompletion - a.totalSkillCompletion);
    case "lowestCompletion":
      return copy.sort((a, b) => a.totalSkillCompletion - b.totalSkillCompletion);
    default:
      return copy;
  }
}

/**
 * Generate insights about contributor skill distribution.
 */
export function getSkillsInsights(contributors: ContributorSkillsRow[]): ChartInsight[] {
  const insights: ChartInsight[] = [];

  // Find contributor with most domains
  const mostDomainsContributor = [...contributors].sort((a, b) => b.domainCount - a.domainCount)[0];
  if (mostDomainsContributor) {
    insights.push({
      id: "most-domains",
      text: `${mostDomainsContributor.contributorName} has the broadest skillset across ${mostDomainsContributor.domainCount} domains`,
    });
  }

  // Find contributor with highest proficiency
  const highestProficiencyContributor = [...contributors].sort((a, b) => b.avgProficiency - a.avgProficiency)[0];
  if (highestProficiencyContributor && highestProficiencyContributor !== mostDomainsContributor) {
    insights.push({
      id: "highest-proficiency",
      text: `${highestProficiencyContributor.contributorName} leads in skill proficiency at ${highestProficiencyContributor.avgProficiency}%`,
    });
  }

  // Find contributor with most skills
  const mostSkillsContributor = [...contributors].sort((a, b) => b.skillCount - a.skillCount)[0];
  if (mostSkillsContributor && mostSkillsContributor !== mostDomainsContributor && mostSkillsContributor !== highestProficiencyContributor) {
    insights.push({
      id: "most-skills",
      text: `${mostSkillsContributor.contributorName} demonstrates expertise in ${mostSkillsContributor.skillCount} distinct skills`,
    });
  }

  // Add skill diversity insight
  const avgDomains = contributors.reduce((sum, c) => sum + c.domainCount, 0) / contributors.length;
  insights.push({
    id: "diversity",
    text: `Repository contributors average ${avgDomains.toFixed(1)} domains each, showing ${avgDomains >= 5 ? "strong" : "moderate"} skill diversity`,
  });

  return insights.slice(0, 4);
}
