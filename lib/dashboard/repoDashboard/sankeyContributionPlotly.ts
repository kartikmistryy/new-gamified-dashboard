/** Sankey Contribution Chart - Plotly Configuration Builder */

import type { Data, Layout } from "plotly.js";
import { formatTargetLabel, getTargetNodeColor, withAlpha } from "./sankeyContributionUtils";

type ContributionNode = {
  id: string;
  label: string;
  side: string;
  value: number;
  health?: "healthy" | "needsAttention" | "critical";
};

type ContributionLink = {
  source: string;
  target: string;
  value: number;
  percentage: number;
};

type ContributionFlow = {
  nodes: ContributionNode[];
  links: ContributionLink[];
};

/** Build Plotly data and layout for Sankey diagram */
export function buildSankeyPlotly(
  flow: ContributionFlow,
  colorMap: Map<string, string>,
  height: number
): { plotlyData: Data[]; plotlyLayout: Partial<Layout> } {
  if (flow.nodes.length === 0 || flow.links.length === 0) {
    return { plotlyData: [], plotlyLayout: {} };
  }

  const sourceNodes = flow.nodes.filter((n) => n.side === "member" || n.side === "contributor");
  const targetNodes = flow.nodes.filter((n) => n.side === "repo" || n.side === "module");

  const allNodes = [...sourceNodes, ...targetNodes];
  const nodeIndexMap = new Map<string, number>();
  allNodes.forEach((node, index) => {
    nodeIndexMap.set(node.id, index);
  });

  const sankeyData: Data = {
    type: "sankey",
    orientation: "h",
    node: {
      pad: 10,
      thickness: 20,
      line: { width: 0 },
      label: allNodes.map((node) => {
        if (node.side === "repo" || node.side === "module") {
          return formatTargetLabel(node.label);
        }
        return node.label;
      }),
      color: allNodes.map((node) => {
        if (node.side === "member" || node.side === "contributor") {
          return colorMap.get(node.label) ?? "#3b82f6";
        }
        return getTargetNodeColor(node.health);
      }),
      customdata: allNodes.map((node) => ({
        value: node.value,
        side: node.side,
      })) as any,
      hovertemplate:
        "<b>%{label}</b><br>" + "Total Contribution: %{customdata.value:.0f}<br>" + "<extra></extra>",
    },
    link: {
      source: flow.links.map((link) => nodeIndexMap.get(link.source) ?? 0),
      target: flow.links.map((link) => nodeIndexMap.get(link.target) ?? 0),
      value: flow.links.map((link) => link.value),
      color: flow.links.map((link) => {
        const sourceNode = flow.nodes.find((n) => n.id === link.source);
        const sourceColor = colorMap.get(sourceNode?.label ?? "") ?? "#3b82f6";
        return withAlpha(sourceColor, 0.3);
      }),
      customdata: flow.links.map((link) => {
        const sourceNode = flow.nodes.find((n) => n.id === link.source);
        const targetNode = flow.nodes.find((n) => n.id === link.target);
        return {
          source: sourceNode?.label ?? "",
          target: targetNode?.label ?? "",
          percentage: link.percentage,
        };
      }) as any,
      hovertemplate:
        "<b>%{customdata.source} → %{customdata.target}</b><br>" +
        "Contribution: %{value:.0f}<br>" +
        "Share: %{customdata.percentage:.1f}%<br>" +
        "<extra></extra>",
    },
  };

  const layout: Partial<Layout> = {
    font: {
      size: 12,
      color: "#334155",
      family: "inherit",
    },
    plot_bgcolor: "#f9fafb",
    paper_bgcolor: "#ffffff",
    margin: { t: 10, r: 10, b: 10, l: 10 },
    height: height,
    hoverlabel: {
      bgcolor: "#ffffff",
      bordercolor: "#e5e7eb",
      font: {
        size: 12,
        color: "#0f172a",
        family: "inherit",
      },
    },
  };

  return { plotlyData: [sankeyData], plotlyLayout: layout };
}
