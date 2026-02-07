import { scaleLinear } from "d3";
import type { TeamContributionFlow, ContributionNode, ContributionLink } from "./spofContributionData";

export const MARGIN = { top: 24, right: 220, bottom: 24, left: 220 };
export const NODE_WIDTH = 20;
export const NODE_GAP = 10;

export type PositionedNode = ContributionNode & {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type PositionedLink = ContributionLink & {
  sourceNode: PositionedNode;
  targetNode: PositionedNode;
  sourceY0: number;
  sourceY1: number;
  targetY0: number;
  targetY1: number;
};

export type FlowLayout = {
  nodes: PositionedNode[];
  links: PositionedLink[];
};

export function buildFlowPath(link: PositionedLink): string {
  const sourceX = link.sourceNode.x + link.sourceNode.width;
  const targetX = link.targetNode.x;
  const sourceY = (link.sourceY0 + link.sourceY1) / 2;
  const targetY = (link.targetY0 + link.targetY1) / 2;
  const controlX1 = sourceX + (targetX - sourceX) * 0.38;
  const controlX2 = sourceX + (targetX - sourceX) * 0.62;
  return `M ${sourceX} ${sourceY} C ${controlX1} ${sourceY}, ${controlX2} ${targetY}, ${targetX} ${targetY}`;
}

export function calculateFlowLayout(
  flow: TeamContributionFlow,
  width: number,
  height: number
): FlowLayout | null {
  if (flow.nodes.length === 0 || flow.links.length === 0) return null;

  const memberNodes = flow.nodes.filter((node) => node.side === "member");
  const repoNodes = flow.nodes.filter((node) => node.side === "repo");
  if (memberNodes.length === 0 || repoNodes.length === 0) return null;

  const innerWidth = width - MARGIN.left - MARGIN.right;
  const innerHeight = height - MARGIN.top - MARGIN.bottom;

  const leftX = MARGIN.left;
  const rightX = MARGIN.left + innerWidth - NODE_WIDTH;

  const memberTotal = memberNodes.reduce((sum, node) => sum + node.value, 0);
  const repoTotal = repoNodes.reduce((sum, node) => sum + node.value, 0);
  const totalValue = Math.max(memberTotal, repoTotal, 1);

  const maxNodeCount = Math.max(memberNodes.length, repoNodes.length);
  const availableHeight = Math.max(80, innerHeight - NODE_GAP * (maxNodeCount - 1));

  const valueToHeight = scaleLinear()
    .domain([0, totalValue])
    .range([0, availableHeight]);

  const leftNodes: PositionedNode[] = [];
  let leftCursor = MARGIN.top;
  for (const node of memberNodes) {
    const nodeHeight = Math.max(8, valueToHeight(node.value));
    leftNodes.push({
      ...node,
      x: leftX,
      y: leftCursor,
      width: NODE_WIDTH,
      height: nodeHeight,
    });
    leftCursor += nodeHeight + NODE_GAP;
  }

  const rightNodes: PositionedNode[] = [];
  let rightCursor = MARGIN.top;
  for (const node of repoNodes) {
    const nodeHeight = Math.max(8, valueToHeight(node.value));
    rightNodes.push({
      ...node,
      x: rightX,
      y: rightCursor,
      width: NODE_WIDTH,
      height: nodeHeight,
    });
    rightCursor += nodeHeight + NODE_GAP;
  }

  const nodesById = new Map<string, PositionedNode>();
  [...leftNodes, ...rightNodes].forEach((node) => nodesById.set(node.id, node));

  const sourceOffsets = new Map<string, number>();
  const targetOffsets = new Map<string, number>();

  const links: PositionedLink[] = flow.links
    .map((link) => {
      const sourceNode = nodesById.get(link.source);
      const targetNode = nodesById.get(link.target);
      if (!sourceNode || !targetNode) return null;

      const thickness = Math.max(1.5, valueToHeight(link.value));
      const sourceOffset = sourceOffsets.get(link.source) ?? 0;
      const targetOffset = targetOffsets.get(link.target) ?? 0;

      const positionedLink: PositionedLink = {
        ...link,
        sourceNode,
        targetNode,
        sourceY0: sourceNode.y + sourceOffset,
        sourceY1: sourceNode.y + sourceOffset + thickness,
        targetY0: targetNode.y + targetOffset,
        targetY1: targetNode.y + targetOffset + thickness,
      };

      sourceOffsets.set(link.source, sourceOffset + thickness);
      targetOffsets.set(link.target, targetOffset + thickness);

      return positionedLink;
    })
    .filter((link): link is PositionedLink => link !== null)
    .sort((a, b) => b.value - a.value);

  return {
    nodes: [...leftNodes, ...rightNodes],
    links,
  };
}
