/**
 * Builds Collaboration Network data from real git_analysis.json data
 * Creates nodes and edges based on shared file work
 */

import type { BusFactorResults, FileScore } from "./repoSpofDataLoader";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CollaborationNode = {
  id: string;
  name: string;
  totalDOA: number;
  normalizedTotalDOA: number;
  fileCount: number;
};

export type CollaborationEdge = {
  source: string;
  target: string;
  weight: number; // Number of shared files
  normalizedWeight: number;
};

export type CollaborationNetworkData = {
  nodes: CollaborationNode[];
  edges: CollaborationEdge[];
  stats: {
    totalContributors: number;
    totalConnections: number;
    maxSharedFiles: number;
    maxDOA: number;
  };
};

// ---------------------------------------------------------------------------
// Helper Functions
// ---------------------------------------------------------------------------

/** Collect file scores from all modules or a specific module */
function collectFileScores(
  busFactorResults: BusFactorResults,
  moduleName?: string
): FileScore[] {
  if (moduleName) {
    // Single module
    return busFactorResults.modules[moduleName]?.fileScores || [];
  }

  // All modules
  const allScores: FileScore[] = [];
  for (const moduleData of Object.values(busFactorResults.modules)) {
    allScores.push(...moduleData.fileScores);
  }
  return allScores;
}

/** Group file scores by file path */
function groupByFile(fileScores: FileScore[]): Map<string, FileScore[]> {
  const grouped = new Map<string, FileScore[]>();

  for (const score of fileScores) {
    const existing = grouped.get(score.filePath) || [];
    existing.push(score);
    grouped.set(score.filePath, existing);
  }

  return grouped;
}

/** Normalize developer name to create a consistent ID */
function normalizeDeveloperName(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-");
}

/** Build shared file counts between developers */
function buildSharedFileCounts(
  filesByPath: Map<string, FileScore[]>,
  doaThreshold: number
): Map<string, number> {
  const sharedCounts = new Map<string, number>(); // "dev1|dev2" -> count

  for (const scores of filesByPath.values()) {
    // Filter to significant contributors on this file, normalize names
    const significantDevs = scores
      .filter((s) => s.normalizedDOA >= doaThreshold)
      .map((s) => normalizeDeveloperName(s.developer));

    // Unique developers (already normalized)
    const uniqueDevs = [...new Set(significantDevs)];

    // Count pairs
    for (let i = 0; i < uniqueDevs.length; i++) {
      for (let j = i + 1; j < uniqueDevs.length; j++) {
        // Alphabetical order for consistent key
        const [d1, d2] = [uniqueDevs[i], uniqueDevs[j]].sort();
        const key = `${d1}|${d2}`;
        const count = sharedCounts.get(key) || 0;
        sharedCounts.set(key, count + 1);
      }
    }
  }

  return sharedCounts;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Build collaboration network from bus factor results
 *
 * @param busFactorResults - Bus factor data with file scores
 * @param moduleName - Optional module name to filter to single module
 * @param doaThreshold - Minimum normalizedDOA to consider contributor significant (default 0.5)
 * @param minSharedFiles - Minimum shared files to create an edge (default 1)
 */
export function buildCollaborationNetwork(
  busFactorResults: BusFactorResults,
  moduleName?: string,
  doaThreshold: number = 0.5,
  minSharedFiles: number = 1
): CollaborationNetworkData {
  const fileScores = collectFileScores(busFactorResults, moduleName);

  if (fileScores.length === 0) {
    return {
      nodes: [],
      edges: [],
      stats: {
        totalContributors: 0,
        totalConnections: 0,
        maxSharedFiles: 0,
        maxDOA: 0,
      },
    };
  }

  // Calculate total DOA per developer (normalize names to avoid duplicates)
  const developerStats = new Map<
    string,
    { totalDOA: number; fileCount: number; displayName: string }
  >();

  for (const score of fileScores) {
    if (score.normalizedDOA >= doaThreshold) {
      const normalizedName = normalizeDeveloperName(score.developer);
      const existing = developerStats.get(normalizedName) || {
        totalDOA: 0,
        fileCount: 0,
        displayName: score.developer, // Keep first encountered display name
      };
      existing.totalDOA += score.normalizedDOA;
      existing.fileCount += 1;
      developerStats.set(normalizedName, existing);
    }
  }

  // Find max DOA for normalization
  const maxDOA = Math.max(
    ...Array.from(developerStats.values()).map((s) => s.totalDOA),
    1
  );

  // Build nodes (key is already normalized, use displayName for label)
  const nodes: CollaborationNode[] = Array.from(developerStats.entries()).map(
    ([normalizedId, stats]) => ({
      id: normalizedId,
      name: stats.displayName,
      totalDOA: Math.round(stats.totalDOA * 100) / 100,
      normalizedTotalDOA: Math.round((stats.totalDOA / maxDOA) * 100) / 100,
      fileCount: stats.fileCount,
    })
  );

  // Build shared file counts
  const filesByPath = groupByFile(fileScores);
  const sharedCounts = buildSharedFileCounts(filesByPath, doaThreshold);

  // Find max shared files for normalization
  const maxSharedFiles = Math.max(...Array.from(sharedCounts.values()), 1);

  // Build edges (d1/d2 are already normalized IDs from buildSharedFileCounts)
  const edges: CollaborationEdge[] = [];
  for (const [key, count] of sharedCounts.entries()) {
    if (count >= minSharedFiles) {
      const [d1, d2] = key.split("|");
      edges.push({
        source: d1,
        target: d2,
        weight: count,
        normalizedWeight: Math.round((count / maxSharedFiles) * 100) / 100,
      });
    }
  }

  // Sort edges by weight descending
  edges.sort((a, b) => b.weight - a.weight);

  return {
    nodes,
    edges,
    stats: {
      totalContributors: nodes.length,
      totalConnections: edges.length,
      maxSharedFiles,
      maxDOA: Math.round(maxDOA * 100) / 100,
    },
  };
}

/**
 * Get Viridis-like color for a normalized DOA value (0-1)
 */
export function getViridisColor(normalizedDOA: number): string {
  // Simplified Viridis-inspired palette (purple → green → yellow)
  const colors = [
    { stop: 0.0, r: 68, g: 1, b: 84 }, // dark purple
    { stop: 0.25, r: 59, g: 82, b: 139 }, // blue-purple
    { stop: 0.5, r: 33, g: 144, b: 140 }, // teal
    { stop: 0.75, r: 93, g: 201, b: 99 }, // green
    { stop: 1.0, r: 253, g: 231, b: 37 }, // yellow
  ];

  // Clamp value
  const v = Math.max(0, Math.min(1, normalizedDOA));

  // Find the two stops to interpolate between
  let lower = colors[0];
  let upper = colors[colors.length - 1];

  for (let i = 0; i < colors.length - 1; i++) {
    if (v >= colors[i].stop && v <= colors[i + 1].stop) {
      lower = colors[i];
      upper = colors[i + 1];
      break;
    }
  }

  // Interpolate
  const range = upper.stop - lower.stop;
  const t = range > 0 ? (v - lower.stop) / range : 0;

  const r = Math.round(lower.r + t * (upper.r - lower.r));
  const g = Math.round(lower.g + t * (upper.g - lower.g));
  const b = Math.round(lower.b + t * (upper.b - lower.b));

  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Get module names available for filtering collaboration network
 */
export function getCollaborationModuleOptions(
  busFactorResults: BusFactorResults
): Array<{ value: string; label: string }> {
  const options = [{ value: "", label: "All Repository" }];

  for (const moduleName of Object.keys(busFactorResults.modules)) {
    options.push({ value: moduleName, label: moduleName });
  }

  return options;
}
