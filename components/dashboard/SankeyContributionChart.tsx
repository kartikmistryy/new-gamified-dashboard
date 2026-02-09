"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import type { Data, Layout, Config } from "plotly.js";

// Dynamically import Plotly to avoid SSR issues
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

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

type SankeyContributionChartProps = {
  /** Flow data with nodes and links */
  flow: ContributionFlow;
  /** Color map for source nodes (left side) */
  colorMap: Map<string, string>;
  /** Label for source entities in tooltips (e.g., "Member", "Contributor") */
  sourceLabel?: string;
  /** Label for target entities in tooltips (e.g., "Repo", "Module") */
  targetLabel?: string;
  /** Chart height in pixels */
  height?: number;
};

/**
 * Helper to format repo/module labels by removing hyphens and capitalizing
 */
function formatTargetLabel(label: string): string {
  return label
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Get color for target nodes based on health status
 */
function getTargetNodeColor(health?: "healthy" | "needsAttention" | "critical"): string {
  switch (health) {
    case "healthy":
      return "#10b981"; // green
    case "needsAttention":
      return "#f59e0b"; // amber
    case "critical":
      return "#ef4444"; // red
    default:
      return "#64748b"; // slate
  }
}

/**
 * Helper to add alpha channel to hex color
 */
function withAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Unified Sankey Contribution Chart Component (Plotly.js version)
 *
 * Visualizes contribution flows between source entities (members/contributors)
 * and target entities (repos/modules) using a Sankey diagram.
 *
 * Features:
 * - Color-coded source nodes with custom color map
 * - Health-based coloring for target nodes
 * - Interactive tooltips with detailed contribution information
 * - Responsive sizing
 * - Consistent styling with other dashboard charts
 *
 * @example
 * // Team dashboard usage
 * <SankeyContributionChart
 *   flow={teamFlow}
 *   colorMap={memberColorMap}
 *   sourceLabel="Member"
 *   targetLabel="Repo"
 * />
 *
 * @example
 * // Repo dashboard usage
 * <SankeyContributionChart
 *   flow={repoFlow}
 *   colorMap={contributorColorMap}
 *   sourceLabel="Contributor"
 *   targetLabel="Module"
 * />
 */
export function SankeyContributionChart({
  flow,
  colorMap,
  sourceLabel = "Source",
  targetLabel = "Target",
  height = 500,
}: SankeyContributionChartProps) {
  const { plotlyData, plotlyLayout } = useMemo(() => {
    if (flow.nodes.length === 0 || flow.links.length === 0) {
      return { plotlyData: [], plotlyLayout: {} };
    }

    // Separate source and target nodes
    const sourceNodes = flow.nodes.filter(
      (n) => n.side === "member" || n.side === "contributor"
    );
    const targetNodes = flow.nodes.filter(
      (n) => n.side === "repo" || n.side === "module"
    );

    // Create node index map for Plotly (Plotly uses numeric indices)
    const allNodes = [...sourceNodes, ...targetNodes];
    const nodeIndexMap = new Map<string, number>();
    allNodes.forEach((node, index) => {
      nodeIndexMap.set(node.id, index);
    });

    // Build Plotly Sankey data
    const sankeyData: Data = {
      type: "sankey",
      orientation: "h",
      node: {
        pad: 10,
        thickness: 20,
        line: {
          width: 0,
        },
        label: allNodes.map((node) => {
          // Format target node labels (repos/modules)
          if (node.side === "repo" || node.side === "module") {
            return formatTargetLabel(node.label);
          }
          return node.label;
        }),
        color: allNodes.map((node) => {
          // Source nodes use custom color map
          if (node.side === "member" || node.side === "contributor") {
            return colorMap.get(node.label) ?? "#3b82f6";
          }
          // Target nodes use health-based colors
          return getTargetNodeColor(node.health);
        }),
        customdata: allNodes.map((node) => ({
          value: node.value,
          side: node.side,
        })) as any,
        hovertemplate:
          "<b>%{label}</b><br>" +
          "Total Contribution: %{customdata.value:.0f}<br>" +
          "<extra></extra>",
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
  }, [flow, colorMap, sourceLabel, targetLabel, height]);

  const config: Partial<Config> = {
    displayModeBar: false,
    responsive: true,
  };

  if (flow.nodes.length === 0 || flow.links.length === 0) {
    return (
      <div className="w-full rounded-xl bg-[#e8edf5] p-6">
        <p className="text-sm text-slate-600">
          Not enough data to render contribution flow.
        </p>
      </div>
    );
  }

  return (
      <div className="relative w-full overflow-visible bg-white rounded-lg">
        <Plot
          data={plotlyData}
          layout={plotlyLayout}
          config={config}
          style={{ width: "100%", height: "100%" }}
          useResizeHandler={true}
        />
      </div>
  );
}
