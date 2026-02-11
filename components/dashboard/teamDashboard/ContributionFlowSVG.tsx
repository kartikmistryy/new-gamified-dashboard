import { format } from "d3";
import type { D3TooltipController } from "@/lib/dashboard/shared/charts/tooltip/chartTooltip";
import { buildFlowPath as buildTeamFlowPath } from "@/lib/dashboard/entities/member/charts/contributionFlow/contributionFlowLayout";
import { buildFlowPath as buildRepoFlowPath } from "@/lib/dashboard/entities/contributor/charts/contributionFlow/contributionFlowLayout";
import { formatRepoLabel, getRepoColor, withAlpha } from "@/lib/dashboard/entities/member/utils/contributionFlowHelpers";
import { DASHBOARD_COLORS } from "@/lib/dashboard/shared/utils/colors";

type BaseNode = {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  side: string;
};

type BaseLink = {
  source: string;
  target: string;
  value: number;
  percentage: number;
  sourceY0: number;
  sourceY1: number;
  targetY0: number;
  targetY1: number;
  sourceNode: BaseNode;
  targetNode: BaseNode;
};

type BaseLayout = {
  nodes: BaseNode[];
  links: BaseLink[];
};

type ContributionFlowSVGProps = {
  layout: BaseLayout;
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
  // Determine if this is a team or repo layout based on node side values
  const isTeamLayout = layout.nodes.some(n => n.side === "member" || n.side === "repo");
  const buildFlowPath = isTeamLayout ? buildTeamFlowPath : buildRepoFlowPath;

  // For repo layouts: "contributor" is left, "module" is right
  // For team layouts: "member" is left, "repo" is right
  const isLeftSide = (side: string) => side === "member" || side === "contributor";
  const isRightSide = (side: string) => side === "repo" || side === "module";

  return (
    <svg
      role="img"
      aria-label="Contribution flow chart"
      viewBox={`0 0 ${width} ${height}`}
      className="h-[500px] w-full"
    >
      {layout.links.map((link, index) => {
        const path = buildFlowPath(link as any);
        const strokeWidth = Math.max(1.5, link.sourceY1 - link.sourceY0);
        return (
          <path
            key={`${link.source}-${link.target}-${index}`}
            d={path}
            fill="none"
            stroke={withAlpha(memberColorMap.get(link.sourceNode.label) ?? DASHBOARD_COLORS.blueTailwind, 0.3)}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            onMouseEnter={(event) => {
              tooltipRef.current?.show(
                `<div style=\"font-weight:600; color:${DASHBOARD_COLORS.gray950};\">${link.sourceNode.label} → ${formatRepoLabel(link.targetNode.label)}</div>` +
                  `<div style=\"color:${DASHBOARD_COLORS.blue800};\">Contribution: ${numberFormat(link.value)}</div>` +
                  `<div style=\"color:${DASHBOARD_COLORS.slate600};\">Share of member output: ${link.percentage.toFixed(1)}%</div>`,
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
              isLeftSide(node.side)
                ? (memberColorMap.get(node.label) ?? DASHBOARD_COLORS.blueTailwind)
                : getRepoColor(node as any)
            }
            stroke={`${DASHBOARD_COLORS.gray950}47`}
            strokeWidth={0.6}
          />
          <text
            x={isLeftSide(node.side) ? node.x - 10 : node.x + node.width + 10}
            y={node.y + node.height / 2}
            textAnchor={isLeftSide(node.side) ? "end" : "start"}
            dominantBaseline="central"
            className="fill-slate-700 text-[12px] font-medium"
          >
            {isRightSide(node.side) ? formatRepoLabel(node.label) : node.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
