import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
} from "d3";
import type { SimulationLinkDatum, SimulationNodeDatum } from "d3";
import type { CollaborationGraph, CollaborationEdge } from "./collaborationNetworkData";

const PADDING = 44;

export type LayoutType = "kamada_kawai" | "spring" | "circular" | "shell";

export type PositionedNode = {
  id: string;
  label: string;
  doaNormalized: number;
  degree: number;
  x: number;
  y: number;
};

export type PositionedEdge = Omit<CollaborationEdge, "source" | "target"> & {
  source: PositionedNode;
  target: PositionedNode;
  spofScore: number;
  collaborationStrength: number;
};

export type PositionedGraph = {
  nodes: PositionedNode[];
  edges: PositionedEdge[];
  totalNodes: number;
  isolatedCount: number;
};

type ForceNode = PositionedNode & SimulationNodeDatum;

type ForceLink = SimulationLinkDatum<ForceNode> & {
  source: string | ForceNode;
  target: string | ForceNode;
  spofScore: number;
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function shellPosition(indexInShell: number, shellSize: number, radius: number, cx: number, cy: number) {
  const angle = (indexInShell / Math.max(shellSize, 1)) * Math.PI * 2;
  return {
    x: cx + Math.cos(angle) * radius,
    y: cy + Math.sin(angle) * radius,
  };
}

function normalizeForceNodes(nodes: ForceNode[], width: number, height: number): ForceNode[] {
  return nodes.map((node) => ({
    ...node,
    x: clamp(node.x ?? width / 2, PADDING, width - PADDING),
    y: clamp(node.y ?? height / 2, PADDING, height - PADDING),
  }));
}

export function layoutGraph(
  baseGraph: CollaborationGraph,
  width: number,
  height: number,
  layout: LayoutType
): PositionedGraph {
  const nodes: PositionedNode[] = baseGraph.nodes.map((node) => ({
    ...node,
    x: width / 2,
    y: height / 2,
  }));

  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const edges: PositionedEdge[] = baseGraph.edges
    .map((edge) => {
      const source = nodeById.get(edge.source);
      const target = nodeById.get(edge.target);
      if (!source || !target) return null;
      return {
        ...edge,
        source,
        target,
      };
    })
    .filter((edge): edge is PositionedEdge => edge !== null);

  const cx = width / 2;
  const cy = height / 2;

  if (layout === "circular") {
    const radius = Math.max(90, Math.min(width, height) * 0.37);
    nodes.forEach((node, index) => {
      const angle = (index / Math.max(nodes.length, 1)) * Math.PI * 2;
      node.x = cx + Math.cos(angle) * radius;
      node.y = cy + Math.sin(angle) * radius;
    });
  } else if (layout === "shell") {
    const sorted = [...nodes].sort((a, b) => b.degree - a.degree);
    const shellOneCount = Math.max(1, Math.ceil(sorted.length * 0.2));
    const shellTwoCount = Math.max(1, Math.ceil(sorted.length * 0.35));

    sorted.forEach((node, index) => {
      if (index < shellOneCount) {
        const pos = shellPosition(index, shellOneCount, 80, cx, cy);
        node.x = pos.x;
        node.y = pos.y;
        return;
      }

      if (index < shellOneCount + shellTwoCount) {
        const localIndex = index - shellOneCount;
        const pos = shellPosition(localIndex, shellTwoCount, 165, cx, cy);
        node.x = pos.x;
        node.y = pos.y;
        return;
      }

      const outerCount = Math.max(1, sorted.length - shellOneCount - shellTwoCount);
      const localIndex = index - shellOneCount - shellTwoCount;
      const pos = shellPosition(localIndex, outerCount, 245, cx, cy);
      node.x = pos.x;
      node.y = pos.y;
    });
  } else {
    const forceNodes: ForceNode[] = nodes.map((node) => ({ ...node }));
    const forceLinks: ForceLink[] = edges.map((edge) => ({
      source: edge.source.id,
      target: edge.target.id,
      spofScore: edge.spofScore,
    }));

    const simulation = forceSimulation(forceNodes)
      .force(
        "link",
        forceLink(forceLinks)
          .id((d) => (d as ForceNode).id)
          .distance((link) => {
            const score = (link as ForceLink).spofScore;
            const base = layout === "kamada_kawai" ? 150 : 125;
            return base - score * 65;
          })
          .strength(layout === "kamada_kawai" ? 0.36 : 0.22)
      )
      .force("charge", forceManyBody().strength(layout === "kamada_kawai" ? -260 : -190))
      .force("center", forceCenter(cx, cy))
      .force("collide", forceCollide<ForceNode>().radius((d) => 16 + d.degree * 1.8).iterations(2))
      .stop();

    const ticks = layout === "kamada_kawai" ? 360 : 260;
    for (let i = 0; i < ticks; i++) simulation.tick();

    const normalized = normalizeForceNodes(forceNodes, width, height);
    normalized.forEach((normalizedNode) => {
      const target = nodeById.get(normalizedNode.id);
      if (!target) return;
      target.x = normalizedNode.x;
      target.y = normalizedNode.y;
    });
  }

  return {
    ...baseGraph,
    nodes,
    edges,
  };
}
