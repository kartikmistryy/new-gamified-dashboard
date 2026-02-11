import type { MemberSpofRow } from "@/lib/dashboard/entities/member/mocks/spofMockData";

export type ContributionNode = {
  id: string;
  label: string;
  side: "member" | "repo";
  value: number;
  health?: "healthy" | "needsAttention" | "critical";
};

export type ContributionLink = {
  source: string;
  target: string;
  value: number;
  percentage: number;
};

export type TeamContributionFlow = {
  nodes: ContributionNode[];
  links: ContributionLink[];
  memberCount: number;
  repoCount: number;
};

const REPO_CATALOG = [
  "api-gateway",
  "frontend-web",
  "mobile-app",
  "infra-core",
  "auth-service",
  "analytics-engine",
  "ci-pipelines",
  "design-system",
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

function getRepoHealth(score: number): "healthy" | "needsAttention" | "critical" {
  if (score < 1.8) return "healthy";
  if (score < 3.1) return "needsAttention";
  return "critical";
}

export function buildTeamContributionFlow(
  members: MemberSpofRow[],
  minPercentage: number = 5
): TeamContributionFlow {
  if (members.length === 0) {
    return { nodes: [], links: [], memberCount: 0, repoCount: 0 };
  }

  const memberNodes: ContributionNode[] = members.map((member) => ({
    id: `member:${member.memberName}`,
    label: member.memberName,
    side: "member",
    value: 0,
  }));

  const repoNodesBase: ContributionNode[] = REPO_CATALOG.map((repoName) => {
    const healthSeed = hashString(repoName);
    const syntheticRisk = 0.8 + noise(healthSeed + 17) * 3.4;
    return {
      id: `repo:${repoName}`,
      label: repoName,
      side: "repo",
      value: 0,
      health: getRepoHealth(syntheticRisk),
    };
  });

  const links: ContributionLink[] = [];

  for (const member of members) {
    const memberId = `member:${member.memberName}`;
    const memberSeed = hashString(member.memberName);

    const repoWeights = REPO_CATALOG.map((repoName, index) => {
      const weight = clamp(noise(memberSeed + (index + 1) * 97), 0.03, 1);
      return { repoName, weight };
    });

    const sorted = [...repoWeights].sort((a, b) => b.weight - a.weight);
    const activeRepoCount = clamp(Math.max(2, Math.round(member.repoCount / 4)), 2, REPO_CATALOG.length);
    const selected = sorted.slice(0, activeRepoCount);

    const totalWeight = selected.reduce((sum, entry) => sum + entry.weight, 0) || 1;
    const totalContribution = Math.max(50, member.repoCount * 90 + member.highRiskCount * 45);

    for (const entry of selected) {
      const raw = (entry.weight / totalWeight) * totalContribution;
      const percentage = (raw / totalContribution) * 100;
      if (percentage < minPercentage) continue;

      links.push({
        source: memberId,
        target: `repo:${entry.repoName}`,
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

  const memberNodesWithValues = memberNodes
    .map((node) => ({ ...node, value: contributionByNode.get(node.id) ?? 0 }))
    .filter((node) => node.value > 0)
    .sort((a, b) => b.value - a.value);

  const repoNodesWithValues = repoNodesBase
    .map((node) => ({ ...node, value: contributionByNode.get(node.id) ?? 0 }))
    .filter((node) => node.value > 0)
    .sort((a, b) => b.value - a.value);

  const activeNodeIds = new Set([...memberNodesWithValues, ...repoNodesWithValues].map((node) => node.id));
  const filteredLinks = links.filter(
    (link) => activeNodeIds.has(link.source) && activeNodeIds.has(link.target)
  );

  return {
    nodes: [...memberNodesWithValues, ...repoNodesWithValues],
    links: filteredLinks,
    memberCount: memberNodesWithValues.length,
    repoCount: repoNodesWithValues.length,
  };
}
