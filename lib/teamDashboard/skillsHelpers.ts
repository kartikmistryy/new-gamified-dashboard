import type { MemberSkillsRow, MemberSkillRow } from "./skillsMockData";
import type { ChartInsight } from "@/lib/orgDashboard/types";

/** Filter types for "By Member" view */
export type SkillsMemberFilter =
  | "mostDomains"
  | "leastDomains"
  | "mostSkills"
  | "leastSkills"
  | "highestProficiency"
  | "lowestProficiency";

/** Filter tabs for "By Member" view */
export const SKILLS_MEMBER_FILTER_TABS: { key: SkillsMemberFilter; label: string }[] = [
  { key: "mostDomains", label: "Most Domains" },
  { key: "leastDomains", label: "Least Domains" },
  { key: "mostSkills", label: "Most Skills" },
  { key: "leastSkills", label: "Least Skills" },
  { key: "highestProficiency", label: "Highest Proficiency" },
  { key: "lowestProficiency", label: "Lowest Proficiency" },
];

/** Sort function for "By Member" view */
export function skillsMemberSortFunction(
  rows: MemberSkillsRow[],
  currentFilter: SkillsMemberFilter
): MemberSkillsRow[] {
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
  rows: MemberSkillRow[],
  currentFilter: SkillsSkillFilter
): MemberSkillRow[] {
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
 * Generate insights about member skill distribution.
 */
export function getSkillsInsights(members: MemberSkillsRow[]): ChartInsight[] {
  const insights: ChartInsight[] = [];

  // Find member with most domains
  const mostDomainsMember = [...members].sort((a, b) => b.domainCount - a.domainCount)[0];
  if (mostDomainsMember) {
    insights.push({
      id: "most-domains",
      text: `${mostDomainsMember.memberName} has the broadest skillset across ${mostDomainsMember.domainCount} domains`,
    });
  }

  // Find member with highest proficiency
  const highestProficiencyMember = [...members].sort((a, b) => b.avgProficiency - a.avgProficiency)[0];
  if (highestProficiencyMember && highestProficiencyMember !== mostDomainsMember) {
    insights.push({
      id: "highest-proficiency",
      text: `${highestProficiencyMember.memberName} leads in skill proficiency at ${highestProficiencyMember.avgProficiency}%`,
    });
  }

  // Find member with most skills
  const mostSkillsMember = [...members].sort((a, b) => b.skillCount - a.skillCount)[0];
  if (mostSkillsMember && mostSkillsMember !== mostDomainsMember && mostSkillsMember !== highestProficiencyMember) {
    insights.push({
      id: "most-skills",
      text: `${mostSkillsMember.memberName} demonstrates expertise in ${mostSkillsMember.skillCount} distinct skills`,
    });
  }

  // Add skill diversity insight
  const avgDomains = members.reduce((sum, m) => sum + m.domainCount, 0) / members.length;
  insights.push({
    id: "diversity",
    text: `Team members average ${avgDomains.toFixed(1)} domains each, showing ${avgDomains >= 5 ? "strong" : "moderate"} skill diversity`,
  });

  return insights.slice(0, 4);
}
