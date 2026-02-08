import { getContributorPerformanceRowsForRepo } from "./overviewMockData";
import {
  noise,
  hashString,
  SKILL_DOMAINS,
  SKILLS_BY_DOMAIN,
  getDomainColor,
} from "./skillsMockDataGenerator";

/** "By Contributor" view row type */
export type ContributorSkillsRow = {
  contributorName: string;
  repoId: string;
  domainCount: number;
  skillCount: number;
  totalUsage: number;
  avgProficiency: number;
  top3WidelyKnown: { name: string; color: string }[];
  top3Proficient: { name: string; color: string }[];
  domainDistribution: { domain: string; value: number }[];
  details: { domain: string; skill: string; usage: number; progress: number }[];
};

/** "By Skill" view row type (mirrors org SkillgraphSkillRow) */
export type ContributorSkillRow = {
  skillName: string;
  domainName: string;
  totalUsage: number;
  avgUsage: number;
  totalSkillCompletion: number;
  contributors: number;
  details: { team: string; usage: number; progress: number }[];
};

/**
 * Generate contributor skills data for a repository.
 * Each contributor gets 3-7 domains with 2-5 skills per domain.
 */
export function getContributorSkillsData(
  repoId: string,
  contributorCount: number = 6
): ContributorSkillsRow[] {
  const contributors = getContributorPerformanceRowsForRepo(52, repoId, contributorCount);

  return contributors.map((contributor) => {
    const seed = hashString(contributor.contributorName);

    // Determine how many domains this contributor has (3-7)
    const domainCount = 3 + Math.floor(noise(seed) * 5);

    // Select domains deterministically
    const selectedDomains: string[] = [];
    for (let i = 0; i < domainCount; i++) {
      const domainIndex = Math.floor(noise(seed + i * 100) * SKILL_DOMAINS.length);
      const domain = SKILL_DOMAINS[domainIndex];
      if (!selectedDomains.includes(domain)) {
        selectedDomains.push(domain);
      }
    }

    // Generate skills for each domain
    const details: { domain: string; skill: string; usage: number; progress: number }[] = [];
    const domainDistribution: { domain: string; value: number }[] = [];

    selectedDomains.forEach((domain, domainIdx) => {
      const skillsInDomain = SKILLS_BY_DOMAIN[domain] || [];
      const skillCountForDomain = 2 + Math.floor(noise(seed + domainIdx * 200) * 4); // 2-5 skills

      let domainTotalUsage = 0;

      for (let skillIdx = 0; skillIdx < skillCountForDomain && skillIdx < skillsInDomain.length; skillIdx++) {
        const skill = skillsInDomain[skillIdx];
        const usage = 50 + Math.floor(noise(seed + domainIdx * 300 + skillIdx * 50) * 150); // 50-200
        const progress = 20 + Math.floor(noise(seed + domainIdx * 400 + skillIdx * 60) * 75); // 20-95

        details.push({ domain, skill, usage, progress });
        domainTotalUsage += usage;
      }

      domainDistribution.push({ domain, value: domainTotalUsage });
    });

    // Calculate totals
    const totalUsage = details.reduce((sum, d) => sum + d.usage, 0);
    const avgProficiency = Math.round(
      details.reduce((sum, d) => sum + d.progress, 0) / details.length
    );
    const skillCount = details.length;

    // Get top 3 by usage (widely known)
    const sortedByUsage = [...details].sort((a, b) => b.usage - a.usage);
    const top3WidelyKnown = sortedByUsage.slice(0, 3).map((d) => ({
      name: d.skill,
      color: getDomainColor(d.domain),
    }));

    // Get top 3 by proficiency
    const sortedByProgress = [...details].sort((a, b) => b.progress - a.progress);
    const top3Proficient = sortedByProgress.slice(0, 3).map((d) => ({
      name: d.skill,
      color: getDomainColor(d.domain),
    }));

    return {
      contributorName: contributor.contributorName,
      repoId,
      domainCount: selectedDomains.length,
      skillCount,
      totalUsage,
      avgProficiency,
      top3WidelyKnown,
      top3Proficient,
      domainDistribution,
      details,
    };
  });
}

/**
 * Aggregate contributor skills into per-skill rows for "By Skill" view.
 */
export function getContributorSkillRows(contributorSkills: ContributorSkillsRow[]): ContributorSkillRow[] {
  const skillMap = new Map<string, {
    domain: string;
    totalUsage: number;
    totalProgress: number;
    contributors: number;
    details: { team: string; usage: number; progress: number }[];
  }>();

  contributorSkills.forEach((contributor) => {
    contributor.details.forEach((detail) => {
      const key = `${detail.domain}:${detail.skill}`;
      const existing = skillMap.get(key);

      if (existing) {
        existing.totalUsage += detail.usage;
        existing.totalProgress += detail.progress;
        existing.contributors += 1;
        existing.details.push({
          team: contributor.contributorName, // Use contributor name as "team" for repo dashboard
          usage: detail.usage,
          progress: detail.progress,
        });
      } else {
        skillMap.set(key, {
          domain: detail.domain,
          totalUsage: detail.usage,
          totalProgress: detail.progress,
          contributors: 1,
          details: [{
            team: contributor.contributorName,
            usage: detail.usage,
            progress: detail.progress,
          }],
        });
      }
    });
  });

  const skillRows: ContributorSkillRow[] = [];
  skillMap.forEach((value, key) => {
    const [domain, skill] = key.split(":");
    skillRows.push({
      skillName: skill,
      domainName: domain,
      totalUsage: value.totalUsage,
      avgUsage: Math.round(value.totalUsage / value.contributors),
      totalSkillCompletion: Math.round(value.totalProgress / value.contributors),
      contributors: value.contributors,
      details: value.details,
    });
  });

  return skillRows;
}

/**
 * Compute domain weights for SkillGraph from visible contributors.
 */
export function computeDomainWeights(
  contributors: ContributorSkillsRow[],
  visibleContributors: Record<string, boolean>
): Record<string, number> | undefined {
  const totals: Record<string, number> = {};
  const activeContributors = contributors.filter((row) => visibleContributors[row.contributorName] !== false);
  const sourceRows = activeContributors.length > 0 ? activeContributors : contributors;

  sourceRows.forEach((row) => {
    row.domainDistribution?.forEach((segment) => {
      totals[segment.domain] = (totals[segment.domain] ?? 0) + segment.value;
    });
  });

  const totalSum = Object.values(totals).reduce((sum, value) => sum + value, 0);
  if (totalSum === 0) {
    return undefined;
  }
  return totals;
}
