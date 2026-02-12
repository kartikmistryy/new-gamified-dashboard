/**
 * Data loader for Repo SPOF page
 * Loads data from git_analysis.json files by repoId
 */

import type { SpofRiskLevel } from "@/lib/dashboard/entities/team/data/orgSpofDataLoader";
import type {
  ModuleSPOFData,
  ModuleOwner,
  SPOFScoreRange,
} from "@/lib/dashboard/entities/user/types";

// ---------------------------------------------------------------------------
// Raw JSON Types (matching git_analysis.json structure)
// ---------------------------------------------------------------------------

export type GitAnalysisSummary = {
  projectName: string;
  analyzedAt?: string;
  totalModules: number;
  totalFunctions?: number;
  totalContributors: number;
  totalFiles: number;
  spofFileCount: number;
  spofFilePercentage?: number;
  repositoryBusFactor: number;
  algorithmUsed?: string;
  algorithmReason?: string;
};

export type FileScore = {
  filePath: string;
  developer: string;
  rawDOA: number;
  normalizedDOA: number;
  isAuthor: boolean;
  components?: {
    FA: number;
    DL: number;
    AC: number;
  };
};

export type ModuleBusFactorData = {
  moduleName: string;
  busFactor: number;
  authorCount?: number;
  fileCount: number;
  fileScores: FileScore[];
};

export type RepositoryBusFactorData = {
  busFactor: number;
  authorCount?: number;
  totalFiles?: number;
  filesByAuthor: Record<string, number>;
  algorithmUsed?: string;
  algorithmReason?: string;
};

export type BusFactorResults = {
  repository: RepositoryBusFactorData;
  modules: Record<string, ModuleBusFactorData>;
};

export type ModuleStats = Record<string, Record<string, number>>;

export type GitAnalysisData = {
  summary: GitAnalysisSummary;
  busFactorResults: BusFactorResults;
  moduleStats: ModuleStats;
};

// ---------------------------------------------------------------------------
// Transformed Types for Components
// ---------------------------------------------------------------------------

export type RepoSpofModuleStatus = "At Risk" | "Needs Attention" | "Healthy";

export type RepoSpofTotals = {
  spofModuleCount: number;
  uniqueSpofOwnerCount: number;
  healthDistribution: {
    healthy: number;
    needsAttention: number;
    critical: number;
  };
};

export type RepoSpofData = {
  repoId: string;
  repoName: string;
  summary: GitAnalysisSummary;
  totals: RepoSpofTotals;
  riskLevel: SpofRiskLevel;
  atRiskPercent: number;
  modules: ModuleSPOFData[];
  moduleStats: ModuleStats;
  busFactorResults: BusFactorResults;
};

// ---------------------------------------------------------------------------
// Available Repos (based on files in _local.tmp)
// ---------------------------------------------------------------------------

const AVAILABLE_REPOS = [
  "AutoGPT",
  "Flowise",
  "langchain",
  "langfuse",
  "llama_index",
  "novu",
  "quivr",
  "reflex",
  "ruff",
  "rustdesk",
  "stable-diffusion-webui",
  "text-generation-webui",
  "transformers",
  "twenty",
  "typst",
] as const;

export type AvailableRepo = (typeof AVAILABLE_REPOS)[number];

// ---------------------------------------------------------------------------
// Helper Functions
// ---------------------------------------------------------------------------

/** Get module status from bus factor */
function getModuleStatus(busFactor: number): RepoSpofModuleStatus {
  if (busFactor <= 1) return "At Risk";
  if (busFactor === 2) return "Needs Attention";
  return "Healthy";
}

/** Get SPOF score range from score (0-100 scale) */
function getScoreRange(spofScore: number): SPOFScoreRange {
  if (spofScore >= 70) return "high";
  if (spofScore >= 40) return "medium";
  return "low";
}

/** Calculate SPOF score based on ownership concentration (0-100) */
function calculateSpofScore(moduleData: ModuleBusFactorData): number {
  if (moduleData.fileScores.length === 0) return 0;

  // Calculate total DOA per developer
  const developerDOA = new Map<string, number>();
  for (const score of moduleData.fileScores) {
    const current = developerDOA.get(score.developer) || 0;
    developerDOA.set(score.developer, current + score.normalizedDOA);
  }

  const doaValues = Array.from(developerDOA.values());
  if (doaValues.length === 0) return 0;

  const totalDOA = doaValues.reduce((sum, v) => sum + v, 0);
  const maxDOA = Math.max(...doaValues);

  // Higher concentration = higher SPOF score
  const concentration = totalDOA > 0 ? (maxDOA / totalDOA) * 100 : 0;

  // Adjust by bus factor (lower bus factor = higher risk)
  const bfMultiplier =
    moduleData.busFactor <= 1 ? 1.2 : moduleData.busFactor === 2 ? 1.1 : 1.0;

  return Math.min(100, Math.round(concentration * bfMultiplier));
}

/** Extract primary and backup owners from module data */
function extractOwners(moduleData: ModuleBusFactorData): {
  primaryOwner: ModuleOwner;
  backupOwners: ModuleOwner[];
} {
  // Calculate total DOA per developer
  const developerDOA = new Map<string, number>();
  for (const score of moduleData.fileScores) {
    if (score.isAuthor) {
      const current = developerDOA.get(score.developer) || 0;
      developerDOA.set(score.developer, current + score.normalizedDOA);
    }
  }

  // Sort by DOA descending
  const sortedDevs = Array.from(developerDOA.entries()).sort(
    (a, b) => b[1] - a[1]
  );

  const totalDOA = sortedDevs.reduce((sum, [, doa]) => sum + doa, 0);

  if (sortedDevs.length === 0) {
    return {
      primaryOwner: { id: "unknown", name: "Unknown", ownershipPercent: 0 },
      backupOwners: [],
    };
  }

  const [primaryName, primaryDOA] = sortedDevs[0];
  const primaryOwner: ModuleOwner = {
    id: primaryName.toLowerCase().replace(/\s+/g, "-"),
    name: primaryName,
    ownershipPercent:
      totalDOA > 0 ? Math.round((primaryDOA / totalDOA) * 100) : 100,
  };

  const backupOwners: ModuleOwner[] = sortedDevs.slice(1, 4).map(([name, doa]) => ({
    id: name.toLowerCase().replace(/\s+/g, "-"),
    name,
    ownershipPercent: totalDOA > 0 ? Math.round((doa / totalDOA) * 100) : 0,
  }));

  return { primaryOwner, backupOwners };
}

/** Calculate SPOF risk level based on at-risk module percentage */
function calculateSpofRiskLevel(healthDist: RepoSpofTotals["healthDistribution"]): SpofRiskLevel {
  const { healthy, needsAttention, critical } = healthDist;
  const total = healthy + needsAttention + critical;
  if (total === 0) return "Low";

  const atRiskPercent = ((needsAttention + critical) / total) * 100;

  if (atRiskPercent > 50) return "Severe";
  if (atRiskPercent >= 30) return "High";
  if (atRiskPercent >= 15) return "Medium";
  return "Low";
}

/** Get unique SPOF owners (developers who are primary owners of at-risk modules) */
function getUniqueSpofOwners(
  modules: Record<string, ModuleBusFactorData>
): Set<string> {
  const spofOwners = new Set<string>();

  for (const moduleData of Object.values(modules)) {
    if (moduleData.busFactor <= 2) {
      // At Risk or Needs Attention
      const { primaryOwner } = extractOwners(moduleData);
      if (primaryOwner.name !== "Unknown") {
        spofOwners.add(primaryOwner.name);
      }
    }
  }

  return spofOwners;
}

// ---------------------------------------------------------------------------
// Data Loading
// ---------------------------------------------------------------------------

/** Load git_analysis.json for a repo via fetch (works in browser) */
async function loadGitAnalysis(repoId: string): Promise<GitAnalysisData | null> {
  // Try different naming patterns
  const namingPatterns = [
    repoId,
    repoId.toLowerCase(),
    repoId.replace(/-/g, "_"),
    repoId.replace(/_/g, "-"),
  ];

  for (const pattern of namingPatterns) {
    try {
      const response = await fetch(`/data/spof/${pattern}_git_analysis.json`);
      if (response.ok) {
        return (await response.json()) as GitAnalysisData;
      }
    } catch {
      // Try next pattern
    }
  }

  return null;
}

/** Transform raw git_analysis data to component-ready format */
function transformToRepoSpofData(
  repoId: string,
  raw: GitAnalysisData
): RepoSpofData {
  const modules: ModuleSPOFData[] = [];
  let healthDist = { healthy: 0, needsAttention: 0, critical: 0 };

  for (const [moduleName, moduleData] of Object.entries(raw.busFactorResults.modules)) {
    const status = getModuleStatus(moduleData.busFactor);
    const spofScore = calculateSpofScore(moduleData);
    const { primaryOwner, backupOwners } = extractOwners(moduleData);

    // Count health distribution
    if (status === "Healthy") healthDist.healthy++;
    else if (status === "Needs Attention") healthDist.needsAttention++;
    else healthDist.critical++;

    // Count unique active contributors
    const uniqueContributors = new Set(
      moduleData.fileScores.map((s) => s.developer)
    );

    modules.push({
      id: `${repoId}-${moduleName.toLowerCase().replace(/\s+/g, "-")}`,
      name: moduleName,
      repoName: repoId,
      spofScore,
      size: moduleData.fileCount,
      scoreRange: getScoreRange(spofScore),
      primaryOwner,
      backupOwners,
      activeContributors: uniqueContributors.size,
      teamLoad:
        spofScore >= 70
          ? "High Pressure"
          : spofScore >= 40
            ? "Medium Pressure"
            : "Low Pressure",
    });
  }

  // Sort modules by SPOF score descending (highest risk first)
  modules.sort((a, b) => b.spofScore - a.spofScore);

  const uniqueSpofOwners = getUniqueSpofOwners(raw.busFactorResults.modules);
  const spofModuleCount = healthDist.needsAttention + healthDist.critical;

  const riskLevel = calculateSpofRiskLevel(healthDist);
  const total = healthDist.healthy + healthDist.needsAttention + healthDist.critical;
  const atRiskPercent =
    total > 0
      ? Math.round(((healthDist.needsAttention + healthDist.critical) / total) * 100)
      : 0;

  return {
    repoId,
    repoName: raw.summary.projectName,
    summary: raw.summary,
    totals: {
      spofModuleCount,
      uniqueSpofOwnerCount: uniqueSpofOwners.size,
      healthDistribution: healthDist,
    },
    riskLevel,
    atRiskPercent,
    modules,
    moduleStats: raw.moduleStats,
    busFactorResults: raw.busFactorResults,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Cache for loaded repo data */
const repoDataCache = new Map<string, RepoSpofData>();

/** Get SPOF data for a repository */
export async function getRepoSpofData(
  repoId: string
): Promise<RepoSpofData | null> {
  // Check cache first
  if (repoDataCache.has(repoId)) {
    return repoDataCache.get(repoId)!;
  }

  const raw = await loadGitAnalysis(repoId);
  if (!raw) {
    return null;
  }

  const data = transformToRepoSpofData(repoId, raw);
  repoDataCache.set(repoId, data);

  return data;
}

/** Check if a repo has SPOF data available */
export function isRepoAvailable(repoId: string): boolean {
  const normalized = repoId.toLowerCase();
  return AVAILABLE_REPOS.some(
    (r) => r.toLowerCase() === normalized || r.replace(/-/g, "_").toLowerCase() === normalized
  );
}

/** Get list of available repos */
export function getAvailableRepos(): readonly string[] {
  return AVAILABLE_REPOS;
}

/** Clear the data cache */
export function clearRepoSpofCache(): void {
  repoDataCache.clear();
}
