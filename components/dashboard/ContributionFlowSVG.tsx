import { format } from "d3";
import type { D3TooltipController } from "@/lib/chartTooltip";
import type { FlowLayout, PositionedLink } from "@/lib/teamDashboard/contributionFlowLayout";
import { buildFlowPath } from "@/lib/teamDashboard/contributionFlowLayout";
import { formatRepoLabel, getRepoColor, withAlpha } from "@/lib/teamDashboard/contributionFlowHelpers";

type ContributionFlowSVGProps = {
  layout: FlowLayout;
  width: number;
  height: number;
  memberColorMap: Map<string, string>;
  tooltipRef: React.MutableRefObject<D3TooltipController | null>;
};

const numberFormat = format(",.0f");

export function ContributionFlowSVG({
  layout,
  width,
  height,
  memberColorMap,
  tooltipRef,
}: ContributionFlowSVGProps) {
  return (
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
  );
}
