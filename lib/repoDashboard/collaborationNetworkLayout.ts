import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  type SimulationNodeDatum,
  type SimulationLinkDatum,
} from "d3-force";

export type CollaborationNetworkData = {
  nodes: Array<{
    id: string;
    name: string;
    team: string;
    commitCount: number;
  }>;
  links: Array<{
    source: string;
    target: string;
    collaborationCount: number;
  }>;
};

export type LayoutNode = {
  id: string;
  name: string;
  team: string;
  commitCount: number;
  x: number;
  y: number;
  radius: number;
};

export type LayoutLink = {
  source: LayoutNode;
  target: LayoutNode;
  collaborationCount: number;
};

export type NetworkLayout = {
  nodes: LayoutNode[];
  links: LayoutLink[];
};

/**
 * Calculate repository collaboration network layout using D3 force simulation.
 * Adapted from team dashboard calculateNetworkLayout().
 */
export function calculateNetworkLayout(
  data: CollaborationNetworkData,
  width: number,
  height: number
): NetworkLayout | null {
  if (data.nodes.length === 0) return null;

  // Find min/max commits for radius scaling
  const commitCounts = data.nodes.map((n) => n.commitCount);
  const minCommits = Math.min(...commitCounts);
  const maxCommits = Math.max(...commitCounts);
  const commitRange = maxCommits - minCommits || 1;

  // Map nodes with radius based on commit count
  const nodes: (SimulationNodeDatum & LayoutNode)[] = data.nodes.map((node) => {
    const normalizedCommits = (node.commitCount - minCommits) / commitRange;
    const radius = 16 + normalizedCommits * 24; // 16-40px radius

    return {
      ...node,
      x: width / 2,
      y: height / 2,
      radius,
    };
  });

  // Create node lookup for links
  const nodeById = new Map(nodes.map((node) => [node.id, node]));

  // Map links
  const links: (SimulationLinkDatum<LayoutNode> & { collaborationCount: number })[] = data.links
    .map((link) => {
      const source = nodeById.get(link.source);
      const target = nodeById.get(link.target);
      if (!source || !target) return null;
      return {
        source,
        target,
        collaborationCount: link.collaborationCount,
      };
    })
    .filter((link): link is NonNullable<typeof link> => link !== null);

  // Run force simulation
  const simulation = forceSimulation(nodes)
    .force(
      "link",
      forceLink(links)
        .id((d: any) => d.id)
        .distance(100)
        .strength(0.5)
    )
    .force("charge", forceManyBody().strength(-800))
    .force("center", forceCenter(width / 2, height / 2))
    .force(
      "collide",
      forceCollide<LayoutNode>().radius((d) => d.radius + 10)
    )
    .stop();

  // Run simulation ticks
  for (let i = 0; i < 300; i++) {
    simulation.tick();
  }

  // Constrain nodes to canvas bounds
  nodes.forEach((node) => {
    node.x = Math.max(node.radius, Math.min(width - node.radius, node.x || width / 2));
    node.y = Math.max(node.radius, Math.min(height - node.radius, node.y || height / 2));
  });

  return {
    nodes: nodes.map((node) => ({
      id: node.id,
      name: node.name,
      team: node.team,
      commitCount: node.commitCount,
      x: node.x || width / 2,
      y: node.y || height / 2,
      radius: node.radius,
    })),
    links: links.map((link) => ({
      source: link.source as LayoutNode,
      target: link.target as LayoutNode,
      collaborationCount: link.collaborationCount,
    })),
  };
}
