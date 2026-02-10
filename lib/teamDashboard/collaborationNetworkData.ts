import type { ChartInsight } from "@/lib/orgDashboard/types";
import type { TimeRangeKey } from "@/lib/shared/types/timeRangeTypes";

type CollaborationNodeSeed = {
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

export function getTeamCollaborationData(
  teamId: string,
  memberNames: string[],
  timeRange: TimeRangeKey = "max"
): CollaborationModule | undefined {
  if (memberNames.length === 0) return undefined;

  const rangeConfig = getRangeConfig(timeRange);
  const moduleSeed = seedFromText(`${teamId}:team-collaboration:${timeRange}`) + rangeConfig.seedOffset;

  const nodes = memberNames.map((name, memberIndex) => {
    const id = name.toLowerCase().replace(/\s+/g, "-");
    const nodeSeed = seedFromText(`${teamId}:${name}:overall:${memberIndex}`);
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
    id: "team-overall",
    name: "Team Collaboration",
    nodes,
    edges,
  };
}

export function buildCollaborationGraph(
  moduleData: CollaborationModule | undefined,
  threshold: number,
  removeIsolated: boolean = true
): CollaborationGraph {
  if (!moduleData) {
    return {
      nodes: [],
      edges: [],
      totalNodes: 0,
      isolatedCount: 0,
    };
  }

  const thresholdedEdges = moduleData.edges.filter((edge) => edge.spofScore >= threshold);
  const degreeMap = new Map<string, number>();

  moduleData.nodes.forEach((node) => degreeMap.set(node.id, 0));
  thresholdedEdges.forEach((edge) => {
    degreeMap.set(edge.source, (degreeMap.get(edge.source) ?? 0) + 1);
    degreeMap.set(edge.target, (degreeMap.get(edge.target) ?? 0) + 1);
  });

  const totalNodes = moduleData.nodes.length;
  const isolatedCount = Array.from(degreeMap.values()).filter((degree) => degree === 0).length;

  const nodes = moduleData.nodes
    .filter((node) => !removeIsolated || (degreeMap.get(node.id) ?? 0) > 0)
    .map((node) => ({
      ...node,
      degree: degreeMap.get(node.id) ?? 0,
    }));

  const nodeSet = new Set(nodes.map((node) => node.id));
  const edges = thresholdedEdges.filter((edge) => nodeSet.has(edge.source) && nodeSet.has(edge.target));

  return {
    nodes,
    edges,
    totalNodes,
    isolatedCount,
  };
}

export function getCollaborationInsights(
  moduleData: CollaborationModule | undefined,
  graph: CollaborationGraph,
  threshold: number
): ChartInsight[] {
  if (!moduleData || graph.nodes.length === 0) {
    return [
      {
        id: "collab-no-data",
        text: "No connected collaborators at this SPOF threshold. Lower the threshold to reveal weaker collaboration paths.",
      },
    ];
  }

  const sortedByDoa = [...graph.nodes].sort((a, b) => b.doaNormalized - a.doaNormalized);
  const topNode = sortedByDoa[0];
  const avgDoa = graph.nodes.reduce((sum, node) => sum + node.doaNormalized, 0) / graph.nodes.length;
  const edgeDensity =
    graph.nodes.length <= 1
      ? 0
      : graph.edges.length / ((graph.nodes.length * (graph.nodes.length - 1)) / 2);

  const hub = [...graph.nodes].sort((a, b) => b.degree - a.degree)[0];

  return [
    {
      id: "collab-threshold",
      text: `SPOF threshold ${threshold.toFixed(2)} keeps ${graph.nodes.length}/${graph.totalNodes} collaborators and ${graph.edges.length} weighted links (${graph.isolatedCount} isolated removed).`,
    },
    {
      id: "collab-top-doa",
      text: `${topNode.label} has the highest normalized DOA (${topNode.doaNormalized.toFixed(2)}), indicating concentrated ownership risk across the team.`,
    },
    {
      id: "collab-hub",
      text: `${hub.label} is the top collaboration hub with ${hub.degree} active links; graph density is ${(edgeDensity * 100).toFixed(0)}% and average DOA is ${avgDoa.toFixed(2)}.`,
    },
  ];
}
