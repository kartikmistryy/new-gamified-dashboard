import { useState, useMemo } from "react";
import type { ScaleLinear, ScaleSequential } from "d3";
import type { D3TooltipController } from "@/lib/chartTooltip";
import type { PositionedGraph } from "@/lib/teamDashboard/collaborationNetworkLayout";
import { getUserAvatarUrl } from "@/components/shared/UserAvatar";

type CollaborationNetworkSVGProps = {
  graph: PositionedGraph;
  width: number;
  height: number;
  colorScale: ScaleSequential<string, never>;
  edgeWidthScale: ScaleLinear<number, number, never>;
  tooltipRef: React.MutableRefObject<D3TooltipController | null>;
};

// Generate a unique color for each edge based on edge key
function getEdgeColor(edgeKey: string): string {
  const colors = [
    "#3b82f6", // blue
    "#8b5cf6", // purple
    "#ec4899", // pink
    "#f59e0b", // amber
    "#10b981", // emerald
    "#06b6d4", // cyan
    "#f97316", // orange
    "#6366f1", // indigo
    "#14b8a6", // teal
    "#a855f7", // violet
    "#84cc16", // lime
    "#eab308", // yellow
    "#ef4444", // red
    "#22c55e", // green
    "#0ea5e9", // sky
  ];

  // Simple hash function to consistently map edge keys to colors
  let hash = 0;
  for (let i = 0; i < edgeKey.length; i++) {
    hash = edgeKey.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

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

  // Generate edge colors map
  const edgeColors = useMemo(() => {
    const colorMap = new Map<string, string>();
    graph.edges.forEach((edge) => {
      const source = edge.source as unknown as typeof graph.nodes[number];
      const target = edge.target as unknown as typeof graph.nodes[number];
      const key = `${source.id}-${target.id}`;
      colorMap.set(key, getEdgeColor(key));
    });
    return colorMap;
  }, [graph.edges]);

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
          const edgeColor = edgeColors.get(key) || "#6b7280";

          return (
            <line
              key={key}
              x1={source.x}
              y1={source.y}
              x2={target.x}
              y2={target.y}
              stroke={edgeColor}
              strokeOpacity={isHovered ? 0.9 : 0.6}
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
                    border: isHovered ? '2.6px solid #ffffff' : '1.8px solid #e2e8f0',
                    boxSizing: 'border-box',
                  }}
                >
                  <img
                    src={avatarUrl}
                    alt={node.label}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
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
