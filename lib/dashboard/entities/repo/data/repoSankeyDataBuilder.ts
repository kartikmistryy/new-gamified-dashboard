/**
 * Builds Sankey chart data from real git_analysis.json data
 * Transforms moduleStats to Contributor → Module flow format
 */

import type { ModuleStats, BusFactorResults } from "./repoSpofDataLoader";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SankeyNode = {
  id: string;
  label: string;
  side: "contributor" | "module";
  value: number;
  health?: "healthy" | "needsAttention" | "critical";
};

export type SankeyLink = {
  source: string;
  target: string;
  value: number;
  percentage: number;
};

export type SankeyFlowData = {
  nodes: SankeyNode[];
  links: SankeyLink[];
  contributorCount: number;
  moduleCount: number;
};

// ---------------------------------------------------------------------------
// Helper Functions
// ---------------------------------------------------------------------------

/** Get module health from bus factor */
function getModuleHealth(
  busFactor: number
): "healthy" | "needsAttention" | "critical" {
  if (busFactor <= 1) return "critical";
  if (busFactor === 2) return "needsAttention";
  return "healthy";
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Build Sankey flow data from moduleStats and busFactorResults
 *
 * @param moduleStats - Contributor line counts per module
 * @param busFactorResults - Bus factor data for module health coloring
 * @param minPercentage - Minimum ownership % to include a flow (default 2%)
 */
export function buildRepoSankeyData(
  moduleStats: ModuleStats,
  busFactorResults: BusFactorResults,
  minPercentage: number = 2.0
): SankeyFlowData {
  if (!moduleStats || Object.keys(moduleStats).length === 0) {
    return { nodes: [], links: [], contributorCount: 0, moduleCount: 0 };
  }

  // Calculate total contribution per contributor across all modules
  const contributorTotals = new Map<string, number>();
  for (const devs of Object.values(moduleStats)) {
    for (const [dev, lines] of Object.entries(devs)) {
      const current = contributorTotals.get(dev) || 0;
      contributorTotals.set(dev, current + lines);
    }
  }

  // Sort contributors by total contribution (descending)
  const sortedContributors = Array.from(contributorTotals.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => name);

  // Sort modules by bus factor (ascending) - high risk at top
  const sortedModules = Object.keys(moduleStats).sort((a, b) => {
    const bfA = busFactorResults.modules[a]?.busFactor ?? 99;
    const bfB = busFactorResults.modules[b]?.busFactor ?? 99;
    return bfA - bfB;
  });

  // Build links and track which nodes have flows
  const links: SankeyLink[] = [];
  const contributorsWithLinks = new Set<string>();
  const modulesWithLinks = new Set<string>();

  for (const moduleName of sortedModules) {
    const devs = moduleStats[moduleName];
    const moduleTotal = Object.values(devs).reduce((sum, v) => sum + v, 0);

    for (const [dev, lines] of Object.entries(devs)) {
      const percentage = moduleTotal > 0 ? (lines / moduleTotal) * 100 : 0;

      if (percentage >= minPercentage) {
        links.push({
          source: `contributor:${dev}`,
          target: `module:${moduleName}`,
          value: lines,
          percentage: Math.round(percentage * 10) / 10,
        });
        contributorsWithLinks.add(dev);
        modulesWithLinks.add(moduleName);
      }
    }
  }

  // Build contributor nodes (only those with links)
  const contributorNodes: SankeyNode[] = sortedContributors
    .filter((name) => contributorsWithLinks.has(name))
    .map((name) => ({
      id: `contributor:${name}`,
      label: name,
      side: "contributor" as const,
      value: contributorTotals.get(name) || 0,
    }));

  // Build module nodes (only those with links)
  const moduleNodes: SankeyNode[] = sortedModules
    .filter((name) => modulesWithLinks.has(name))
    .map((name) => {
      const busFactor = busFactorResults.modules[name]?.busFactor ?? 4;
      return {
        id: `module:${name}`,
        label: name,
        side: "module" as const,
        value: Object.values(moduleStats[name]).reduce((sum, v) => sum + v, 0),
        health: getModuleHealth(busFactor),
      };
    });

  return {
    nodes: [...contributorNodes, ...moduleNodes],
    links,
    contributorCount: contributorNodes.length,
    moduleCount: moduleNodes.length,
  };
}

/**
 * Get color map for contributors based on their index
 * Cycles through dashboard colors
 */
export function buildContributorColorMap(
  contributorNames: string[]
): Map<string, string> {
  const COLORS = [
    "#3B82F6", // blue
    "#22C55E", // green
    "#F97316", // orange
    "#A78BFA", // lavender
    "#06B6D4", // cyan
    "#EC4899", // pink
    "#EAB308", // yellow
    "#8B5CF6", // purple
  ];

  const colorMap = new Map<string, string>();
  contributorNames.forEach((name, index) => {
    colorMap.set(name, COLORS[index % COLORS.length]);
  });

  return colorMap;
}
