"use client";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createChartTooltip, type D3TooltipController } from "@/lib/chartTooltip";
import type { ChartInsight } from "@/lib/orgDashboard/types";
import {
  buildCollaborationGraph,
  getCollaborationInsights,
  type CollaborationModule,
} from "@/lib/teamDashboard/collaborationNetworkData";
import { layoutGraph, type LayoutType } from "@/lib/teamDashboard/collaborationNetworkLayout";
import { getUserAvatarUrl } from "@/components/shared/UserAvatar";
import {
  createColorScale,
  createEdgeWidthScale,
  calculateNodeRadius,
} from "@/lib/dashboard/shared/collaborationNetworkScales";
import { formatNodeTooltip, formatEdgeTooltip } from "@/lib/dashboard/shared/collaborationNetworkTooltips";
import { CollaborationNetworkLegend } from "./CollaborationNetworkLegend";
const CHART_HEIGHT = 540;
const DEFAULT_THRESHOLD = 0.7;
const DEFAULT_LAYOUT: LayoutType = "shell";

type CollaborationNetworkGraphProps = {
  data: CollaborationModule | undefined;
  onInsightsChange?: (insights: ChartInsight[]) => void;
};

export function CollaborationNetworkGraph({ data, onInsightsChange }: CollaborationNetworkGraphProps) {
  const [width, setWidth] = useState(820);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [hoveredEdgeKey, setHoveredEdgeKey] = useState<string | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const tooltipRef = useRef<D3TooltipController | null>(null);
  const tooltipId = useId().replace(/:/g, "");

  useEffect(() => {
    const element = wrapperRef.current;
    if (!element) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      setWidth(Math.max(460, Math.floor(entry.contentRect.width)));
    });

    resizeObserver.observe(element);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    tooltipRef.current = createChartTooltip(`collab-tooltip-${tooltipId}`);
    return () => tooltipRef.current?.destroy();
  }, [tooltipId]);

  const graph = useMemo(
    () => buildCollaborationGraph(data, DEFAULT_THRESHOLD, true),
    [data]
  );

  const insights = useMemo(
    () => getCollaborationInsights(data, graph, DEFAULT_THRESHOLD),
    [data, graph]
  );

  useEffect(() => {
    if (!onInsightsChange) return;
    onInsightsChange(insights);
  }, [insights, onInsightsChange]);

  const laidOutGraph = useMemo(
    () => layoutGraph(graph, width - 72, CHART_HEIGHT - 64, DEFAULT_LAYOUT),
    [graph, width]
  );

  const colorScale = useMemo(() => createColorScale(), []);
  const edgeWidthScale = useMemo(() => createEdgeWidthScale(), []);

  return (
    <div className="w-full min-w-0" ref={wrapperRef}>
      <div className="rounded-xl border border-gray-100 bg-[#e8edf5] p-4">
        <div className="flex min-w-0 items-stretch gap-4">
          {/* Main SVG Chart */}
          <svg
            role="img"
            aria-label="Team collaboration network"
            viewBox={`0 0 ${Math.max(420, width - 72)} ${CHART_HEIGHT}`}
            className="h-[540px] min-w-0 flex-1"
          >
            <g transform="translate(24, 24)">
              {/* Render edges */}
              {laidOutGraph.edges.map((edge) => {
                const source = edge.source as unknown as typeof laidOutGraph.nodes[number];
                const target = edge.target as unknown as typeof laidOutGraph.nodes[number];
                const key = `${source.id}-${target.id}`;
                const isHovered = hoveredEdgeKey === key;

                return (
                  <line
                    key={key}
                    x1={source.x}
                    y1={source.y}
                    x2={target.x}
                    y2={target.y}
                    stroke="#94a3b8"
                    strokeOpacity={isHovered ? 0.8 : 0.5}
                    strokeWidth={edgeWidthScale(edge.collaborationStrength)}
                    onMouseEnter={(event) => {
                      setHoveredEdgeKey(key);
                      tooltipRef.current?.show(
                        formatEdgeTooltip(source.label, target.label, edge.spofScore, edge.collaborationStrength),
                        event.clientX + 12,
                        event.clientY + 12
                      );
                    }}
                    onMouseMove={(event) => tooltipRef.current?.move(event.clientX + 12, event.clientY + 12)}
                    onMouseLeave={() => {
                      setHoveredEdgeKey(null);
                      tooltipRef.current?.hide();
                    }}
                  />
                );
              })}

              {/* Render nodes */}
              {laidOutGraph.nodes.map((node) => {
                const radius = calculateNodeRadius(node.degree);
                const isHovered = hoveredNodeId === node.id;
                const avatarSize = radius * 2;
                const avatarUrl = getUserAvatarUrl(node.label, 64);
                const borderColor = colorScale(node.doaNormalized);

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    onMouseEnter={(event) => {
                      setHoveredNodeId(node.id);
                      tooltipRef.current?.show(
                        formatNodeTooltip(node.label, node.doaNormalized, node.degree),
                        event.clientX + 12,
                        event.clientY + 12
                      );
                    }}
                    onMouseMove={(event) => tooltipRef.current?.move(event.clientX + 12, event.clientY + 12)}
                    onMouseLeave={() => {
                      setHoveredNodeId(null);
                      tooltipRef.current?.hide();
                    }}
                  >
                    {/* Avatar using foreignObject */}
                    <foreignObject
                      x={-radius}
                      y={-radius}
                      width={avatarSize}
                      height={avatarSize}
                    >
                      <div
                        style={{
                          width: avatarSize,
                          height: avatarSize,
                          borderRadius: '50%',
                          overflow: 'hidden',
                          border: isHovered ? `2.6px solid ${borderColor}` : `2px solid ${borderColor}`,
                          boxSizing: 'border-box',
                        }}
                      >
                        <img
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                          src={avatarUrl}
                          alt={node.label}
                        />
                      </div>
                    </foreignObject>

                    {/* Name label */}
                    <text
                      x={0}
                      y={-radius - 8}
                      textAnchor="middle"
                      className="fill-slate-600 text-[11px] font-medium"
                    >
                      {node.label}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>

          <CollaborationNetworkLegend />
        </div>
      </div>
    </div>
  );
}
