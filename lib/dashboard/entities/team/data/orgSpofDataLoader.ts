/**
 * Data loader for Org SPOF page
 * Loads pre-aggregated data from org_spof_data.json (generated from git_analysis.json files)
 */

import orgSpofData from "./org_spof_data.json";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type OrgSpofModuleStatus = "At Risk" | "Needs Attention" | "Healthy";

export type OrgSpofModule = {
  name: string;
  busFactor: number;
  status: OrgSpofModuleStatus;
  owners: string[];
};

export type OrgSpofRepo = {
  id: string;
  name: string;
  totalModules: number;
  repositoryBusFactor: number;
  modules: OrgSpofModule[];
  spofOwnerCount: number;
  uniqueSpofOwnerCount: number;
};

export type OrgSpofTotals = {
  spofModuleCount: number;
  uniqueSpofOwnerCount: number;
  healthDistribution: {
    healthy: number;
    needsAttention: number;
    critical: number;
  };
};

export type OrgSpofData = {
  repos: OrgSpofRepo[];
  totals: OrgSpofTotals;
};

// ---------------------------------------------------------------------------
// Data exports
// ---------------------------------------------------------------------------

/** Typed org SPOF data loaded from JSON */
export const ORG_SPOF_DATA: OrgSpofData = orgSpofData as OrgSpofData;

/** Repos with SPOF data */
export const ORG_SPOF_REPOS = ORG_SPOF_DATA.repos;

/** Org-level totals */
export const ORG_SPOF_TOTALS = ORG_SPOF_DATA.totals;

/** Health distribution for RepoHealthBar */
export const ORG_HEALTH_SEGMENTS = [
  { label: "Healthy", count: ORG_SPOF_TOTALS.healthDistribution.healthy, color: "#22c55e" },
  { label: "Needs Attention", count: ORG_SPOF_TOTALS.healthDistribution.needsAttention, color: "#f59e0b" },
  { label: "Critical", count: ORG_SPOF_TOTALS.healthDistribution.critical, color: "#ef4444" },
];

// ---------------------------------------------------------------------------
// SPOF Risk Level
// ---------------------------------------------------------------------------

export type SpofRiskLevel = "Severe" | "High" | "Medium" | "Low";

/** Calculate SPOF risk level based on at-risk module percentage */
function calculateSpofRiskLevel(): SpofRiskLevel {
  const { healthy, needsAttention, critical } = ORG_SPOF_TOTALS.healthDistribution;
  const total = healthy + needsAttention + critical;
  const atRiskPercent = ((needsAttention + critical) / total) * 100;

  if (atRiskPercent > 50) return "Severe";
  if (atRiskPercent >= 30) return "High";
  if (atRiskPercent >= 15) return "Medium";
  return "Low";
}

/** Current SPOF risk level for the organization */
export const ORG_SPOF_RISK_LEVEL = calculateSpofRiskLevel();

// ---------------------------------------------------------------------------
// Transformed exports for table compatibility
// ---------------------------------------------------------------------------

export type OrgRepoSpofModule = {
  moduleName: string;
  status: OrgSpofModuleStatus;
  owners: string[];
};

export type RepoHealthDistribution = {
  healthy: number;
  needsAttention: number;
  critical: number;
};

export type OrgRepoSpofRow = {
  repoName: string;
  spofModuleCount: number;
  spofOwnerCount: number;
  modules: OrgRepoSpofModule[];
  healthDistribution: RepoHealthDistribution;
};

/** Transform repos to table row format */
export const ORG_REPO_SPOF_ROWS: OrgRepoSpofRow[] = ORG_SPOF_REPOS.map((repo) => {
  const healthDistribution = repo.modules.reduce(
    (acc, m) => {
      if (m.status === "Healthy") acc.healthy++;
      else if (m.status === "Needs Attention") acc.needsAttention++;
      else acc.critical++;
      return acc;
    },
    { healthy: 0, needsAttention: 0, critical: 0 }
  );

  return {
    repoName: repo.name,
    spofModuleCount: repo.spofOwnerCount,
    spofOwnerCount: repo.uniqueSpofOwnerCount,
    modules: repo.modules.map((m) => ({
      moduleName: m.name,
      status: m.status,
      owners: m.owners,
    })),
    healthDistribution,
  };
});

export type OrgRepoSpofFilter = "mostSpofModules" | "mostSpofOwners";

/** Filter tabs for the repo SPOF table */
export const ORG_REPO_SPOF_FILTER_TABS: { key: OrgRepoSpofFilter; label: string }[] = [
  { key: "mostSpofModules", label: "Most SPOF Owners" },
  { key: "mostSpofOwners", label: "Most Unique SPOF Owners" },
];

/** Sort rows descending by the selected metric */
export function sortOrgRepoSpof(
  rows: OrgRepoSpofRow[],
  filter: OrgRepoSpofFilter
): OrgRepoSpofRow[] {
  const key = filter === "mostSpofModules" ? "spofModuleCount" : "spofOwnerCount";
  return [...rows].sort((a, b) => b[key] - a[key]);
}
