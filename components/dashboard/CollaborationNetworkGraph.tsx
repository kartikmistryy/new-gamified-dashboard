"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { interpolateViridis, scaleLinear, scaleSequential } from "d3";
import { createChartTooltip, type D3TooltipController } from "@/lib/chartTooltip";
import type { ChartInsight } from "@/lib/orgDashboard/types";
import {
  buildCollaborationGraph,
  getCollaborationInsights,
  type CollaborationModule,
} from "@/lib/teamDashboard/collaborationNetworkData";
import { layoutGraph, type LayoutType } from "@/lib/teamDashboard/collaborationNetworkLayout";
import { getUserAvatarUrl } from "@/components/shared/UserAvatar";

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

  const colorScale = useMemo(
    () => scaleSequential(interpolateViridis).domain([0.05, 1]),
    []
  );

  const edgeWidthScale = useMemo(
    () => scaleLinear().domain([0.35, 1]).range([1.4, 5.6]).clamp(true),
    []
  );

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
                        `<div style="font-weight:600; color:#0f172a;">${source.label} ↔ ${target.label}</div>` +
                          `<div style="color:#1d4ed8;">SPOF score: ${edge.spofScore.toFixed(2)}</div>` +
                          `<div style="color:#475569;">Collaboration strength: ${edge.collaborationStrength.toFixed(2)}</div>`,
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
                const radius = 9 + Math.min(7, node.degree * 1.2);
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
                        `<div style="font-weight:600; color:#0f172a;">${node.label}</div>` +
                          `<div style="color:#1d4ed8;">Total DOA (normalized): ${node.doaNormalized.toFixed(2)}</div>` +
                          `<div style="color:#475569;">Active links: ${node.degree}</div>`,
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

          {/* Legend */}
          <div className="w-20 shrink-0 pb-2 pt-3">
            <h3 className="mb-3 text-right text-sm font-semibold leading-tight text-slate-600">
              Total DOA
              <br />
              (normalized)
            </h3>
            <div className="flex items-stretch justify-end gap-2">
              <div
                className="h-[472px] w-8 rounded-sm border border-slate-300"
                style={{
                  background:
                    "linear-gradient(to top, #440154 0%, #414487 20%, #2a788e 40%, #22a884 60%, #7ad151 80%, #fde725 100%)",
                }}
              />
              <div className="flex h-[472px] flex-col justify-between text-right text-xs font-medium text-slate-600">
                <span>1.0</span>
                <span>0.9</span>
                <span>0.8</span>
                <span>0.7</span>
                <span>0.6</span>
                <span>0.5</span>
                <span>0.4</span>
                <span>0.3</span>
                <span>0.2</span>
                <span>0.1</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
