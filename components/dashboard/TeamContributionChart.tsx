"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { format, scaleLinear } from "d3";
import type { MemberSpofRow } from "@/lib/teamDashboard/spofMockData";
import {
  buildTeamContributionFlow,
  type ContributionLink,
  type ContributionNode,
} from "@/lib/teamDashboard/spofContributionData";
import { createChartTooltip, type D3TooltipController } from "@/lib/chartTooltip";

type TeamContributionChartProps = {
  members: MemberSpofRow[];
  minPercentage?: number;
  height?: number;
};

type PositionedNode = ContributionNode & {
  x: number;
  y: number;
  width: number;
  height: number;
};

type PositionedLink = ContributionLink & {
  sourceNode: PositionedNode;
  targetNode: PositionedNode;
  sourceY0: number;
  sourceY1: number;
  targetY0: number;
  targetY1: number;
};

const DEFAULT_HEIGHT = 500;
const MIN_WIDTH = 920;
const MARGIN = { top: 24, right: 220, bottom: 24, left: 220 };
const NODE_WIDTH = 20;
const NODE_GAP = 10;
const MEMBER_FALLBACK_COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#a855f7", "#06b6d4", "#ef4444"];

function formatRepoLabel(label: string): string {
  return label
    .split("-")
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function getRepoColor(node: ContributionNode): string {
  if (node.health === "healthy") return "#10b981";
  if (node.health === "needsAttention") return "#f59e0b";
  return "#ef4444";
}

function withAlpha(hex: string, alpha: number): string {
  const safe = hex.replace("#", "");
  const full = safe.length === 3
    ? safe.split("").map((char) => `${char}${char}`).join("")
    : safe;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function buildFlowPath(link: PositionedLink): string {
  const sourceX = link.sourceNode.x + link.sourceNode.width;
  const targetX = link.targetNode.x;
  const sourceY = (link.sourceY0 + link.sourceY1) / 2;
  const targetY = (link.targetY0 + link.targetY1) / 2;
  const controlX1 = sourceX + (targetX - sourceX) * 0.38;
  const controlX2 = sourceX + (targetX - sourceX) * 0.62;
  return `M ${sourceX} ${sourceY} C ${controlX1} ${sourceY}, ${controlX2} ${targetY}, ${targetX} ${targetY}`;
}

export function TeamContributionChart({
  members,
  minPercentage = 5,
  height = DEFAULT_HEIGHT,
}: TeamContributionChartProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const tooltipRef = useRef<D3TooltipController | null>(null);
  const [width, setWidth] = useState(MIN_WIDTH);

  useEffect(() => {
    const element = wrapperRef.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      setWidth(Math.max(MIN_WIDTH, Math.floor(entry.contentRect.width)));
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    tooltipRef.current = createChartTooltip("team-contribution-tooltip");
    return () => tooltipRef.current?.destroy();
  }, []);

  const flow = useMemo(
    () => buildTeamContributionFlow(members, minPercentage),
    [members, minPercentage]
  );
  const memberColorMap = useMemo(() => {
    return new Map(
      members.map((member, index) => [
        member.memberName,
        member.memberColor ?? MEMBER_FALLBACK_COLORS[index % MEMBER_FALLBACK_COLORS.length],
      ])
    );
  }, [members]);

  const layout = useMemo(() => {
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
  }, [flow, width, height]);

  const numberFormat = useMemo(() => format(",.0f"), []);

  if (!layout) {
    return (
      <div ref={wrapperRef} className="w-full rounded-xl border border-gray-100 bg-[#e8edf5] p-6">
        <p className="text-sm text-slate-600">Not enough data to render contribution flow.</p>
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className="w-full rounded-xl border border-gray-100 bg-[#e8edf5] p-4">
      <svg
        role="img"
        aria-label="Team contribution flow chart"
        viewBox={`0 0 ${width} ${height}`}
        className="h-[500px] w-full"
      >
        {layout.links.map((link, index) => {
          const path = buildFlowPath(link);
          const strokeWidth = Math.max(1.5, link.sourceY1 - link.sourceY0);
          return (
            <path
              key={`${link.source}-${link.target}-${index}`}
              d={path}
              fill="none"
              stroke={withAlpha(memberColorMap.get(link.sourceNode.label) ?? "#3b82f6", 0.3)}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              onMouseEnter={(event) => {
                tooltipRef.current?.show(
                  `<div style=\"font-weight:600; color:#0f172a;\">${link.sourceNode.label} → ${formatRepoLabel(link.targetNode.label)}</div>` +
                    `<div style=\"color:#1e40af;\">Contribution: ${numberFormat(link.value)}</div>` +
                    `<div style=\"color:#475569;\">Share of member output: ${link.percentage.toFixed(1)}%</div>`,
                  event.clientX + 12,
                  event.clientY + 12
                );
              }}
              onMouseMove={(event) => tooltipRef.current?.move(event.clientX + 12, event.clientY + 12)}
              onMouseLeave={() => tooltipRef.current?.hide()}
            />
          );
        })}

        {layout.nodes.map((node) => (
          <g key={node.id}>
            <rect
              x={node.x}
              y={node.y}
              width={node.width}
              height={node.height}
              rx={3}
              fill={
                node.side === "member"
                  ? (memberColorMap.get(node.label) ?? "#3b82f6")
                  : getRepoColor(node)
              }
              stroke="rgba(15, 23, 42, 0.28)"
              strokeWidth={0.6}
            />
            <text
              x={node.side === "member" ? node.x - 10 : node.x + node.width + 10}
              y={node.y + node.height / 2}
              textAnchor={node.side === "member" ? "end" : "start"}
              dominantBaseline="central"
              className="fill-slate-700 text-[12px] font-medium"
            >
              {node.side === "repo" ? formatRepoLabel(node.label) : node.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
