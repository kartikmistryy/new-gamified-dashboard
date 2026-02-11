import type { ContributorSpofRow } from "@/lib/dashboard/entities/contributor/mocks/spofMockData";

export type ContributionNode = {
  id: string;
  label: string;
  side: "contributor" | "module";
  value: number;
  health?: "healthy" | "needsAttention" | "critical";
};

export type ContributionLink = {
  source: string;
  target: string;
  value: number;
  percentage: number;
};

export type RepoContributionFlow = {
  nodes: ContributionNode[];
  links: ContributionLink[];
  contributorCount: number;
  moduleCount: number;
};

const MODULE_CATALOG = [
  "auth-handler",
  "data-processor",
  "api-router",
  "cache-manager",
  "webhook-service",
  "notification-engine",
  "batch-jobs",
  "error-handler",
  "security-middleware",
  "logger-service",
] as const;

function noise(seed: number): number {
  const value = Math.sin(seed * 9999) * 10000;
  return value - Math.floor(value);
}

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    const char = value.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function getModuleHealth(score: number): "healthy" | "needsAttention" | "critical" {
  if (score < 1.8) return "healthy";
  if (score < 3.1) return "needsAttention";
  return "critical";
}

/**
 * Build repository contribution flow showing Contributors → Modules.
 * Adapted from team dashboard buildTeamContributionFlow().
 */
export function buildRepoContributionFlow(
  contributors: ContributorSpofRow[],
  minPercentage: number = 5
): RepoContributionFlow {
  if (contributors.length === 0) {
    return { nodes: [], links: [], contributorCount: 0, moduleCount: 0 };
  }

  const contributorNodes: ContributionNode[] = contributors.map((contributor) => ({
    id: `contributor:${contributor.contributorName}`,
    label: contributor.contributorName,
    side: "contributor",
    value: 0,
  }));

  const moduleNodesBase: ContributionNode[] = MODULE_CATALOG.map((moduleName) => {
    const healthSeed = hashString(moduleName);
    const syntheticRisk = 0.8 + noise(healthSeed + 17) * 3.4;
    return {
      id: `module:${moduleName}`,
      label: moduleName,
      side: "module",
      value: 0,
      health: getModuleHealth(syntheticRisk),
    };
  });

  const links: ContributionLink[] = [];

  for (const contributor of contributors) {
    const contributorId = `contributor:${contributor.contributorName}`;
    const contributorSeed = hashString(contributor.contributorName);

    const moduleWeights = MODULE_CATALOG.map((moduleName, index) => {
      const weight = clamp(noise(contributorSeed + (index + 1) * 97), 0.03, 1);
      return { moduleName, weight };
    });

    const sorted = [...moduleWeights].sort((a, b) => b.weight - a.weight);
    const activeModuleCount = clamp(Math.max(2, Math.round(contributor.moduleCount / 4)), 2, MODULE_CATALOG.length);
    const selected = sorted.slice(0, activeModuleCount);

    const totalWeight = selected.reduce((sum, entry) => sum + entry.weight, 0) || 1;
    const totalContribution = Math.max(50, contributor.moduleCount * 90 + contributor.highRiskCount * 45);

    for (const entry of selected) {
      const raw = (entry.weight / totalWeight) * totalContribution;
      const percentage = (raw / totalContribution) * 100;
      if (percentage < minPercentage) continue;

      links.push({
        source: contributorId,
        target: `module:${entry.moduleName}`,
        value: raw,
        percentage,
      });
    }
  }

  const contributionByNode = new Map<string, number>();
  for (const link of links) {
    contributionByNode.set(link.source, (contributionByNode.get(link.source) ?? 0) + link.value);
    contributionByNode.set(link.target, (contributionByNode.get(link.target) ?? 0) + link.value);
  }

  const contributorNodesWithValues = contributorNodes
    .map((node) => ({ ...node, value: contributionByNode.get(node.id) ?? 0 }))
    .filter((node) => node.value > 0)
    .sort((a, b) => b.value - a.value);

  const moduleNodesWithValues = moduleNodesBase
    .map((node) => ({ ...node, value: contributionByNode.get(node.id) ?? 0 }))
    .filter((node) => node.value > 0)
    .sort((a, b) => b.value - a.value);

  const activeNodeIds = new Set([...contributorNodesWithValues, ...moduleNodesWithValues].map((node) => node.id));
  const filteredLinks = links.filter(
    (link) => activeNodeIds.has(link.source) && activeNodeIds.has(link.target)
  );

  return {
    nodes: [...contributorNodesWithValues, ...moduleNodesWithValues],
    links: filteredLinks,
    contributorCount: contributorNodesWithValues.length,
    moduleCount: moduleNodesWithValues.length,
  };
}
