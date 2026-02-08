import type { TimeRangeKey } from "@/lib/orgDashboard/timeRangeTypes";
import type { CollaborationModule, CollaborationEdge } from "@/lib/teamDashboard/collaborationNetworkData";

type CollaborationNodeSeed = {
  id: string;
  label: string;
  doaNormalized: number;
};

function noise(seed: number): number {
  const value = Math.sin(seed * 9999) * 10000;
  return value - Math.floor(value);
}

function seedFromText(input: string): number {
  return input.split("").reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 1), 0);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function getRangeConfig(timeRange: TimeRangeKey) {
  switch (timeRange) {
    case "1m":
      return { seedOffset: 101, affinityCutoff: 0.58, doaVolatility: 0.18 };
    case "3m":
      return { seedOffset: 211, affinityCutoff: 0.5, doaVolatility: 0.12 };
    case "1y":
      return { seedOffset: 307, affinityCutoff: 0.44, doaVolatility: 0.08 };
    case "max":
    default:
      return { seedOffset: 401, affinityCutoff: 0.4, doaVolatility: 0.04 };
  }
}

/**
 * Generate repository collaboration network data for contributors.
 * Shows collaboration patterns between contributors in a repository.
 * Follows the same pattern as team dashboard getTeamCollaborationData().
 */
export function getRepoCollaborationData(
  repoId: string,
  contributorNames: string[],
  timeRange: TimeRangeKey = "max"
): CollaborationModule | undefined {
  if (contributorNames.length === 0) return undefined;

  const rangeConfig = getRangeConfig(timeRange);
  const moduleSeed = seedFromText(`${repoId}:repo-collaboration:${timeRange}`) + rangeConfig.seedOffset;

  const nodes: CollaborationNodeSeed[] = contributorNames.map((name, contributorIndex) => {
    const id = name.toLowerCase().replace(/\s+/g, "-");
    const nodeSeed = seedFromText(`${repoId}:${name}:overall:${contributorIndex}`);
    const baseDoa = 0.05 + noise(nodeSeed + moduleSeed) * 0.95;
    const rangeShift = (noise(nodeSeed + moduleSeed + 13) - 0.5) * rangeConfig.doaVolatility;
    const doaNormalized = clamp(baseDoa + rangeShift, 0.05, 1);
    return {
      id,
      label: name,
      doaNormalized,
    };
  });

  const edges: CollaborationEdge[] = [];

  // Guaranteed backbone so higher thresholds still show an interpretable network.
  for (let i = 0; i < nodes.length; i++) {
    const current = nodes[i];
    const next = nodes[(i + 1) % nodes.length];
    if (!current || !next || current.id === next.id) continue;

    const ringSeed = seedFromText(`${current.id}:${next.id}:ring:${moduleSeed}`);
    edges.push({
      source: current.id,
      target: next.id,
      spofScore: clamp(0.7 + noise(ringSeed + 19) * 0.25, 0, 1),
      collaborationStrength: clamp(0.6 + noise(ringSeed + 47) * 0.4, 0.15, 1),
    });
  }

  const existingPairs = new Set(
    edges.map((edge) => [edge.source, edge.target].sort().join("|"))
  );

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const pairKey = [nodes[i].id, nodes[j].id].sort().join("|");
      if (existingPairs.has(pairKey)) continue;

      const pairSeed = seedFromText(`${nodes[i].id}:${nodes[j].id}:${moduleSeed}`);
      const affinity = noise(pairSeed + 31);
      if (affinity < rangeConfig.affinityCutoff) continue;

      const spofScore = clamp((nodes[i].doaNormalized + nodes[j].doaNormalized) / 2 + (affinity - 0.5) * 0.35, 0, 1);
      const collaborationStrength = clamp(0.15 + noise(pairSeed + 67) * 0.85, 0.15, 1);

      edges.push({
        source: nodes[i].id,
        target: nodes[j].id,
        spofScore,
        collaborationStrength,
      });
    }
  }

  return {
    id: "repo-overall",
    name: "Repository Collaboration",
    nodes,
    edges,
  };
}
