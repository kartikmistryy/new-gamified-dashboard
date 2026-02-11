/**
 * Shared Collaboration Network Generator
 *
 * Generic collaboration network data generator used by both team and repo dashboards.
 * Generates deterministic collaboration graphs with nodes and edges.
 */

import type { TimeRangeKey } from "@/lib/shared/types/timeRangeTypes";
import { noise, seedFromText, clamp, getRangeConfig } from "./mockDataUtils";

export type CollaborationNodeSeed = {
  id: string;
  label: string;
  doaNormalized: number;
};

export type CollaborationEdge = {
  source: string;
  target: string;
  spofScore: number;
  collaborationStrength: number;
};

export type CollaborationModule = {
  id: string;
  name: string;
  nodes: CollaborationNodeSeed[];
  edges: CollaborationEdge[];
};

export type CollaborationGraphNode = CollaborationNodeSeed & {
  degree: number;
};

export type CollaborationGraph = {
  nodes: CollaborationGraphNode[];
  edges: CollaborationEdge[];
  totalNodes: number;
  isolatedCount: number;
};

/**
 * Generate collaboration network data for a group of people
 * @param contextId - Unique identifier for the context (teamId or repoId)
 * @param names - Array of person names (members or contributors)
 * @param contextType - Type of context ("team" or "repo")
 * @param timeRange - Time range filter
 * @returns Collaboration module with nodes and edges
 */
export function generateCollaborationData(
  contextId: string,
  names: string[],
  contextType: "team" | "repo",
  timeRange: TimeRangeKey = "max"
): CollaborationModule | undefined {
  if (names.length === 0) return undefined;

  const rangeConfig = getRangeConfig(timeRange);
  const moduleSeed = seedFromText(`${contextId}:${contextType}-collaboration:${timeRange}`) + rangeConfig.seedOffset;

  const nodes: CollaborationNodeSeed[] = names.map((name, personIndex) => {
    const id = name.toLowerCase().replace(/\s+/g, "-");
    const nodeSeed = seedFromText(`${contextId}:${name}:overall:${personIndex}`);
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
    id: `${contextId}-collaboration`,
    name: `${contextType === "team" ? "Team" : "Repository"} Collaboration`,
    nodes,
    edges,
  };
}

/**
 * Build collaboration graph with node degrees calculated
 */
export function buildCollaborationGraph(module: CollaborationModule): CollaborationGraph {
  const degreeMap = new Map<string, number>();

  for (const edge of module.edges) {
    degreeMap.set(edge.source, (degreeMap.get(edge.source) ?? 0) + 1);
    degreeMap.set(edge.target, (degreeMap.get(edge.target) ?? 0) + 1);
  }

  const nodes: CollaborationGraphNode[] = module.nodes.map((node) => ({
    ...node,
    degree: degreeMap.get(node.id) ?? 0,
  }));

  const isolatedCount = nodes.filter((n) => n.degree === 0).length;

  return {
    nodes,
    edges: module.edges,
    totalNodes: nodes.length,
    isolatedCount,
  };
}
