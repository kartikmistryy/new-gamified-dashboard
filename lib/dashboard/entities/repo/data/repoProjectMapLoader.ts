/**
 * Data loader for project_map.json files
 * Provides capabilities/functions data for Module Detail Sheet
 */

import type {
  ModuleCapability,
  CapabilityContributor,
} from "@/lib/dashboard/entities/user/types";

// ---------------------------------------------------------------------------
// Raw JSON Types (matching project_map.json structure)
// ---------------------------------------------------------------------------

export type ProjectMapFile = {
  path: string;
  description: string;
  spof: boolean;
};

export type ProjectMapFunction = {
  files: ProjectMapFile[];
  contributors: Array<{
    name: string;
    percent: number;
  }>;
};

export type ProjectMapModule = {
  description: string;
  functions: Record<string, ProjectMapFunction>;
};

export type ProjectMapData = Record<string, ProjectMapModule>;

// ---------------------------------------------------------------------------
// Helper Functions
// ---------------------------------------------------------------------------

/** Calculate SPOF score for a capability based on contributor concentration and SPOF files */
function calculateCapabilitySpofScore(func: ProjectMapFunction): number | undefined {
  if (func.contributors.length === 0) return undefined;

  // Higher concentration in top contributor = higher SPOF risk
  const topPercent = func.contributors[0]?.percent || 0;

  // Count SPOF files
  const spofFileCount = func.files.filter((f) => f.spof).length;
  const spofRatio = func.files.length > 0 ? spofFileCount / func.files.length : 0;

  // Score based on concentration and SPOF file ratio
  if (topPercent >= 70 || spofRatio >= 0.5) {
    return Math.round(topPercent / 10); // High risk: 7-10
  }

  return undefined; // No significant SPOF risk
}

/** Estimate bus factor from contributor distribution */
function estimateBusFactor(contributors: ProjectMapFunction["contributors"]): number {
  if (contributors.length === 0) return 0;
  if (contributors.length === 1) return 1;

  // Count contributors with significant ownership (>= 10%)
  const significantContributors = contributors.filter((c) => c.percent >= 10);
  return Math.max(1, significantContributors.length);
}

/** Transform project map function to ModuleCapability */
function transformToCapability(
  funcName: string,
  func: ProjectMapFunction,
  index: number,
  moduleName: string
): ModuleCapability {
  const topContributor = func.contributors[0];
  const busFactor = estimateBusFactor(func.contributors);
  const backupCount = Math.max(0, func.contributors.length - 1);

  const contributors: CapabilityContributor[] = func.contributors
    .slice(0, 5)
    .map((c) => ({
      name: c.name,
      ownershipPercent: c.percent,
    }));

  return {
    id: `cap-${moduleName.toLowerCase().replace(/\s+/g, "-")}-${index}`,
    name: funcName,
    description:
      func.files[0]?.description ||
      `Handles ${funcName.toLowerCase()} functionality.`,
    importance: Math.max(50, 100 - index * 5), // Decrease importance by position
    busFactor,
    backupCount,
    topOwnerPercent: topContributor?.percent || 0,
    fileCount: func.files.length,
    contributors,
    spofScore: calculateCapabilitySpofScore(func),
  };
}

// ---------------------------------------------------------------------------
// Data Loading
// ---------------------------------------------------------------------------

/** Load project_map.json for a repo via fetch (works in browser) */
async function loadProjectMap(repoId: string): Promise<ProjectMapData | null> {
  // Try different naming patterns
  const namingPatterns = [
    repoId,
    repoId.toLowerCase(),
    repoId.replace(/-/g, "_"),
    repoId.replace(/_/g, "-"),
  ];

  for (const pattern of namingPatterns) {
    try {
      const response = await fetch(`/data/spof/${pattern}_project_map.json`);
      if (response.ok) {
        return (await response.json()) as ProjectMapData;
      }
    } catch {
      // Try next pattern
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Cache for loaded project map data */
const projectMapCache = new Map<string, ProjectMapData>();

/** Get project map data for a repository */
export async function getProjectMapData(
  repoId: string
): Promise<ProjectMapData | null> {
  // Check cache first
  if (projectMapCache.has(repoId)) {
    return projectMapCache.get(repoId)!;
  }

  const data = await loadProjectMap(repoId);
  if (!data) {
    return null;
  }

  projectMapCache.set(repoId, data);
  return data;
}

/** Get capabilities for a specific module */
export async function getModuleCapabilities(
  repoId: string,
  moduleName: string
): Promise<ModuleCapability[]> {
  const projectMap = await getProjectMapData(repoId);
  if (!projectMap) {
    return [];
  }

  // Find the module (case-insensitive match)
  const moduleKey = Object.keys(projectMap).find(
    (key) => key.toLowerCase() === moduleName.toLowerCase()
  );

  if (!moduleKey || !projectMap[moduleKey]) {
    return [];
  }

  const moduleData = projectMap[moduleKey];
  const capabilities: ModuleCapability[] = [];

  let index = 0;
  for (const [funcName, func] of Object.entries(moduleData.functions)) {
    capabilities.push(transformToCapability(funcName, func, index, moduleName));
    index++;
  }

  // Sort by importance (highest first)
  capabilities.sort((a, b) => b.importance - a.importance);

  return capabilities;
}

/** Get module description from project map */
export async function getModuleDescription(
  repoId: string,
  moduleName: string
): Promise<string | undefined> {
  const projectMap = await getProjectMapData(repoId);
  if (!projectMap) {
    return undefined;
  }

  // Find the module (case-insensitive match)
  const moduleKey = Object.keys(projectMap).find(
    (key) => key.toLowerCase() === moduleName.toLowerCase()
  );

  if (!moduleKey || !projectMap[moduleKey]) {
    return undefined;
  }

  return projectMap[moduleKey].description;
}

/** Get all module names from project map */
export async function getProjectMapModuleNames(
  repoId: string
): Promise<string[]> {
  const projectMap = await getProjectMapData(repoId);
  if (!projectMap) {
    return [];
  }

  return Object.keys(projectMap);
}

/** Clear the project map cache */
export function clearProjectMapCache(): void {
  projectMapCache.clear();
}
