import * as d3 from "d3";
import { DASHBOARD_COLORS } from "@/lib/dashboard/shared/utils/colors";

export type D3TooltipController = {
  show: (html: string, x: number, y: number) => void;
  move: (x: number, y: number) => void;
  hide: () => void;
  destroy: () => void;
};

const TOOLTIP_STYLES: Record<string, string> = {
  position: "fixed",
  zIndex: "1000",
  pointerEvents: "none",
  opacity: "0",
  padding: "10px 12px",
  borderRadius: "10px",
  background: DASHBOARD_COLORS.chartBackground,
  border: `1px solid ${DASHBOARD_COLORS.gray200}`,
  color: DASHBOARD_COLORS.gray900,
  boxShadow: `0 12px 24px ${DASHBOARD_COLORS.gray950}1F`,
  fontSize: "12px",
  lineHeight: "1.4",
  maxWidth: "280px",
  transform: "translateZ(0)",
  transition: "opacity 120ms ease",
};

export function createChartTooltip(id: string): D3TooltipController {
  const tooltip = d3
    .select("body")
    .selectAll<HTMLDivElement, null>(`#${id}`)
    .data([null])
    .join("div")
    .attr("id", id)
    .attr("role", "tooltip")
    .style("position", TOOLTIP_STYLES.position)
    .style("z-index", TOOLTIP_STYLES.zIndex)
    .style("pointer-events", TOOLTIP_STYLES.pointerEvents)
    .style("opacity", TOOLTIP_STYLES.opacity)
    .style("padding", TOOLTIP_STYLES.padding)
    .style("border-radius", TOOLTIP_STYLES.borderRadius)
    .style("background", TOOLTIP_STYLES.background)
    .style("border", TOOLTIP_STYLES.border)
    .style("color", TOOLTIP_STYLES.color)
    .style("box-shadow", TOOLTIP_STYLES.boxShadow)
    .style("font-size", TOOLTIP_STYLES.fontSize)
    .style("line-height", TOOLTIP_STYLES.lineHeight)
    .style("max-width", TOOLTIP_STYLES.maxWidth)
    .style("transform", TOOLTIP_STYLES.transform)
    .style("transition", TOOLTIP_STYLES.transition);

  return {
    show: (html: string, x: number, y: number) => {
      tooltip
        .html(html)
        .style("left", `${x}px`)
        .style("top", `${y}px`)
        .style("opacity", "1");
    },
    move: (x: number, y: number) => {
      tooltip.style("left", `${x}px`).style("top", `${y}px`);
    },
    hide: () => {
      tooltip.style("opacity", "0");
    },
    destroy: () => {
      tooltip.remove();
    },
  };
}
