import { useState } from "react";
import type { ScaleLinear, ScaleSequential } from "d3";
import type { D3TooltipController } from "@/lib/chartTooltip";
import type { PositionedGraph } from "@/lib/teamDashboard/collaborationNetworkLayout";
import { getUserAvatarUrl } from "@/components/shared/UserAvatar";
import Image from "next/image";

type CollaborationNetworkSVGProps = {
  graph: PositionedGraph;
  width: number;
  height: number;
  colorScale: ScaleSequential<string, never>;
  edgeWidthScale: ScaleLinear<number, number, never>;
  tooltipRef: React.MutableRefObject<D3TooltipController | null>;
};

export function CollaborationNetworkSVG({
  graph,
  width,
  height,
  colorScale,
  edgeWidthScale,
  tooltipRef,
}: CollaborationNetworkSVGProps) {
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [hoveredEdgeKey, setHoveredEdgeKey] = useState<string | null>(null);

  return (
    <svg
      role="img"
      aria-label="Team collaboration network"
      viewBox={`0 0 ${Math.max(420, width)} ${height}`}
      className="h-[540px] min-w-0 flex-1"
    >
      <g transform="translate(24, 24)">
        {graph.edges.map((edge) => {
          const source = edge.source as unknown as typeof graph.nodes[number];
          const target = edge.target as unknown as typeof graph.nodes[number];
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
                  `<div style=\"font-weight:600; color:#0f172a;\">${source.label} ↔ ${target.label}</div>` +
                    `<div style=\"color:#1d4ed8;\">SPOF score: ${edge.spofScore.toFixed(2)}</div>` +
                    `<div style=\"color:#475569;\">Collaboration strength: ${edge.collaborationStrength.toFixed(2)}</div>`,
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

        {graph.nodes.map((node) => {
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
                  `<div style=\"font-weight:600; color:#0f172a;\">${node.label}</div>` +
                    `<div style=\"color:#1d4ed8;\">Total DOA (normalized): ${node.doaNormalized.toFixed(2)}</div>` +
                    `<div style=\"color:#475569;\">Active links: ${node.degree}</div>`,
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
  );
}
