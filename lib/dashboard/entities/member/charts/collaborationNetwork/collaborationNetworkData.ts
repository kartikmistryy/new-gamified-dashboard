import type { ChartInsight } from "@/lib/dashboard/entities/team/types";
import type { TimeRangeKey } from "@/lib/shared/types/timeRangeTypes";
import {
  generateCollaborationData,
  type CollaborationModule,
  type CollaborationEdge,
  type CollaborationGraphNode,
  type CollaborationGraph,
} from "@/lib/shared/collaborationNetworkGenerator";

/**
 * Generate team collaboration network data
 * Uses shared collaboration generator with team context
 */
export function getTeamCollaborationData(
  teamId: string,
  memberNames: string[],
  timeRange: TimeRangeKey = "max"
): CollaborationModule | undefined {
  return generateCollaborationData(teamId, memberNames, "team", timeRange);
}

// Re-export types for backward compatibility
export type {
  CollaborationModule,
  CollaborationEdge,
  CollaborationGraphNode,
  CollaborationGraph,
};

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
