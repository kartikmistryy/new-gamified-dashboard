/** Mock SPOF score data for distribution chart. */

export type SpofDataPoint = {
  score: number;
  team: string;
};

export type SpofTeamConfig = {
  name: string;
  color: string;
  bgClass: string;
};

/** Team configuration matching the chart colors from the reference image. */
export const SPOF_TEAM_CONFIG: SpofTeamConfig[] = [
  { name: "Backend", color: "#3b82f6", bgClass: "bg-[#3b82f6]" },
  { name: "Frontend", color: "#10b981", bgClass: "bg-[#10b981]" },
  { name: "AI/ML", color: "#f97316", bgClass: "bg-[#f97316]" },
  { name: "DevOps", color: "#8b5cf6", bgClass: "bg-[#8b5cf6]" },
  { name: "Data Engineering", color: "#ef4444", bgClass: "bg-[#ef4444]" },
];

/** Generate right-skewed SPOF scores using exponential distribution. */
function generateSkewedScores(count: number, lambda: number = 1.0): number[] {
  const scores: number[] = [];
  for (let i = 0; i < count; i++) {
    // Exponential distribution for right-skew
    const u = Math.random();
    const score = -Math.log(1 - u) / lambda;
    scores.push(Math.min(score, 6)); // Cap at 6
  }
  return scores;
}

/** Generate mock SPOF data points for all teams. */
export function generateSpofData(): SpofDataPoint[] {
  const data: SpofDataPoint[] = [];

  // Generate different distributions per team to create realistic stacking
  const teamCounts: Record<string, number> = {
    "Backend": 120,
    "Frontend": 100,
    "AI/ML": 80,
    "DevOps": 60,
    "Data Engineering": 50,
  };

  for (const team of SPOF_TEAM_CONFIG) {
    const count = teamCounts[team.name] || 50;
    const scores = generateSkewedScores(count, 0.83); // lambda controls skew

    for (const score of scores) {
      data.push({ score, team: team.name });
    }
  }

  return data;
}

/** Pre-generated SPOF data for consistent rendering. */
export const SPOF_DATA: SpofDataPoint[] = [
  // Backend team - blue (largest group, scores clustered around 0.5-1.5)
  ...Array.from({ length: 25 }, () => ({ score: 0.1 + Math.random() * 0.4, team: "Backend" })),
  ...Array.from({ length: 35 }, () => ({ score: 0.5 + Math.random() * 0.5, team: "Backend" })),
  ...Array.from({ length: 25 }, () => ({ score: 1.0 + Math.random() * 0.5, team: "Backend" })),
  ...Array.from({ length: 15 }, () => ({ score: 1.5 + Math.random() * 0.5, team: "Backend" })),
  ...Array.from({ length: 10 }, () => ({ score: 2.0 + Math.random() * 1.0, team: "Backend" })),
  ...Array.from({ length: 5 }, () => ({ score: 3.0 + Math.random() * 1.5, team: "Backend" })),
  ...Array.from({ length: 3 }, () => ({ score: 4.5 + Math.random() * 1.5, team: "Backend" })),

  // Frontend team - green
  ...Array.from({ length: 20 }, () => ({ score: 0.1 + Math.random() * 0.4, team: "Frontend" })),
  ...Array.from({ length: 30 }, () => ({ score: 0.5 + Math.random() * 0.5, team: "Frontend" })),
  ...Array.from({ length: 20 }, () => ({ score: 1.0 + Math.random() * 0.5, team: "Frontend" })),
  ...Array.from({ length: 12 }, () => ({ score: 1.5 + Math.random() * 0.5, team: "Frontend" })),
  ...Array.from({ length: 8 }, () => ({ score: 2.0 + Math.random() * 1.0, team: "Frontend" })),
  ...Array.from({ length: 4 }, () => ({ score: 3.5 + Math.random() * 1.0, team: "Frontend" })),
  ...Array.from({ length: 2 }, () => ({ score: 5.0 + Math.random() * 1.0, team: "Frontend" })),

  // AI/ML team - orange
  ...Array.from({ length: 15 }, () => ({ score: 0.1 + Math.random() * 0.4, team: "AI/ML" })),
  ...Array.from({ length: 22 }, () => ({ score: 0.5 + Math.random() * 0.5, team: "AI/ML" })),
  ...Array.from({ length: 18 }, () => ({ score: 1.0 + Math.random() * 0.5, team: "AI/ML" })),
  ...Array.from({ length: 10 }, () => ({ score: 1.5 + Math.random() * 0.5, team: "AI/ML" })),
  ...Array.from({ length: 6 }, () => ({ score: 2.0 + Math.random() * 1.0, team: "AI/ML" })),
  ...Array.from({ length: 3 }, () => ({ score: 3.5 + Math.random() * 1.5, team: "AI/ML" })),
  ...Array.from({ length: 2 }, () => ({ score: 5.0 + Math.random() * 1.0, team: "AI/ML" })),

  // DevOps team - purple
  ...Array.from({ length: 12 }, () => ({ score: 0.1 + Math.random() * 0.4, team: "DevOps" })),
  ...Array.from({ length: 18 }, () => ({ score: 0.5 + Math.random() * 0.5, team: "DevOps" })),
  ...Array.from({ length: 12 }, () => ({ score: 1.0 + Math.random() * 0.5, team: "DevOps" })),
  ...Array.from({ length: 8 }, () => ({ score: 1.5 + Math.random() * 0.5, team: "DevOps" })),
  ...Array.from({ length: 5 }, () => ({ score: 2.0 + Math.random() * 1.0, team: "DevOps" })),
  ...Array.from({ length: 3 }, () => ({ score: 3.5 + Math.random() * 1.5, team: "DevOps" })),
  ...Array.from({ length: 2 }, () => ({ score: 5.5 + Math.random() * 0.5, team: "DevOps" })),

  // Data Engineering team - red
  ...Array.from({ length: 10 }, () => ({ score: 0.1 + Math.random() * 0.4, team: "Data Engineering" })),
  ...Array.from({ length: 15 }, () => ({ score: 0.5 + Math.random() * 0.5, team: "Data Engineering" })),
  ...Array.from({ length: 10 }, () => ({ score: 1.0 + Math.random() * 0.5, team: "Data Engineering" })),
  ...Array.from({ length: 6 }, () => ({ score: 1.5 + Math.random() * 0.5, team: "Data Engineering" })),
  ...Array.from({ length: 4 }, () => ({ score: 2.0 + Math.random() * 1.0, team: "Data Engineering" })),
  ...Array.from({ length: 3 }, () => ({ score: 3.5 + Math.random() * 1.5, team: "Data Engineering" })),
  ...Array.from({ length: 2 }, () => ({ score: 5.0 + Math.random() * 1.0, team: "Data Engineering" })),
];

/** Calculate statistics for the SPOF data. */
export function calculateSpofStats(data: SpofDataPoint[]) {
  if (data.length === 0) {
    return { mean: 0, std: 1, median: 0, skewType: "N/A", n: 0 };
  }
  const scores = data.map(d => d.score);
  const n = scores.length;
  const mean = scores.reduce((a, b) => a + b, 0) / n;
  const variance = scores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n;
  const std = Math.sqrt(variance) || 1;
  const median = [...scores].sort((a, b) => a - b)[Math.floor(n / 2)];
  const skewType = median < mean ? "Right-Skewed" : "Bell-Shaped";

  return { mean, std, median, skewType, n };
}

/** SPOF team row type for the table. */
export type SpofTeamRow = {
  teamName: string;
  teamColor: string;
  domainCount: number;
  skillCount: number;
  memberCount: number;
  avgSpofScore: number;
  highRiskCount: number;
  lowRiskCount: number;
  repoHealthHealthyCount: number;
  repoHealthNeedsAttentionCount: number;
  repoHealthCriticalCount: number;
};

/** Calculate team-level statistics from SPOF data. */
export function calculateTeamStats(data: SpofDataPoint[]): SpofTeamRow[] {
  const teamData: Record<string, { scores: number[]; color: string }> = {};

  // Initialize with team colors
  for (const team of SPOF_TEAM_CONFIG) {
    teamData[team.name] = { scores: [], color: team.color };
  }

  // Aggregate scores per team
  for (const point of data) {
    if (teamData[point.team]) {
      teamData[point.team].scores.push(point.score);
    }
  }

  // Calculate stats per team
  const rows: SpofTeamRow[] = [];
  for (const [teamName, { scores, color }] of Object.entries(teamData)) {
    if (scores.length === 0) continue;

    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    // High risk: scores > 2.2 (µ+1σ threshold from reference)
    const highRiskCount = scores.filter(s => s > 2.2).length;
    // Low risk: scores < 0.2 (µ-1σ threshold from reference)
    const lowRiskCount = scores.filter(s => s < 0.2).length;
    // Repo health buckets derived from SPOF score ranges for consistent mock distribution.
    const repoHealthHealthyCount = scores.filter(s => s <= 1.2).length;
    const repoHealthNeedsAttentionCount = scores.filter(s => s > 1.2 && s <= 2.6).length;
    const repoHealthCriticalCount = scores.filter(s => s > 2.6).length;

    rows.push({
      teamName,
      teamColor: color,
      domainCount: Math.max(3, Math.round(scores.length / 20)),
      skillCount: Math.max(10, Math.round(scores.length / 2)),
      memberCount: scores.length,
      avgSpofScore: avgScore,
      highRiskCount,
      lowRiskCount,
      repoHealthHealthyCount,
      repoHealthNeedsAttentionCount,
      repoHealthCriticalCount,
    });
  }

  return rows;
}

/** Pre-calculated team rows for consistent rendering. */
export const SPOF_TEAM_ROWS: SpofTeamRow[] = calculateTeamStats(SPOF_DATA);

// ---------------------------------------------------------------------------
// Org-level repo SPOF data (expandable table)
// ---------------------------------------------------------------------------

/** Sub-row: a SPOF module within a repo */
export type OrgRepoSpofModule = {
  moduleName: string;
  status: "At Risk" | "Needs Attention" | "Healthy";
  owners: string[];
};

/** Parent row: a repo with expandable modules */
export type OrgRepoSpofRow = {
  repoName: string;
  spofModuleCount: number;
  spofOwnerCount: number;
  modules: OrgRepoSpofModule[];
};

export type OrgRepoSpofFilter = "mostSpofModules" | "mostSpofOwners";

/** Helper to compute SPOF counts from modules */
function computeSpofCounts(modules: OrgRepoSpofModule[]) {
  // Only count modules with SPOF risk (At Risk or Needs Attention)
  const atRiskModules = modules.filter((m) => m.status !== "Healthy");

  // Total SPOF owners = sum of owners across at-risk modules
  const totalSpofOwners = atRiskModules.reduce((sum, m) => sum + m.owners.length, 0);

  // Unique SPOF owners = distinct individuals across at-risk modules
  const uniqueOwners = new Set(atRiskModules.flatMap((m) => m.owners));

  return {
    spofOwnerCount: totalSpofOwners,
    uniqueSpofOwnerCount: uniqueOwners.size,
  };
}

/** Raw module data for each repo */
const RAW_REPO_MODULES: { repoName: string; modules: OrgRepoSpofModule[] }[] = [
  {
    repoName: "novu",
    modules: [
      { moduleName: "Translation Management", status: "At Risk", owners: ["Adam Chmara"] },
      { moduleName: "Activity Feed & Analytics", status: "Needs Attention", owners: ["George Djabarov", "Dima Grossman"] },
      { moduleName: "User, Team & Tenant Management", status: "Needs Attention", owners: ["Richard Fontein", "Himanshu Garg"] },
      { moduleName: "Provider & Channel Integrations", status: "Healthy", owners: ["Richard Fontein", "Dima Grossman", "Sokratis Vidros"] },
      { moduleName: "In-App Notification Center", status: "Healthy", owners: ["Adam Chmara", "Dima Grossman", "George Djabarov", "Paweł Tymczuk"] },
    ],
  },
  {
    repoName: "transformers",
    modules: [
      { moduleName: "Infrastructure", status: "Needs Attention", owners: ["Yih-Dar", "Sylvain Gugger"] },
      { moduleName: "Computer Vision Model Library", status: "Healthy", owners: ["NielsRogge", "Sylvain Gugger", "Yuanyuan Chen", "Cyril Vallez"] },
      { moduleName: "Training & Inference Framework", status: "Healthy", owners: ["NielsRogge", "Arthur", "Sylvain Gugger", "Marc Sun"] },
      { moduleName: "Multimodal Model Library", status: "Healthy", owners: ["Raushan Turganbay", "Cyril Vallez", "Arthur", "Susnato Dhar"] },
    ],
  },
  {
    repoName: "langchain",
    modules: [
      { moduleName: "Pre-built Application Chains", status: "At Risk", owners: ["Mason Daugherty"] },
      { moduleName: "Composable Workflow Engine (LCEL)", status: "Healthy", owners: ["Christophe Bornet", "Mason Daugherty", "Nuno Campos"] },
      { moduleName: "Model Abstraction Layer", status: "Healthy", owners: ["Mason Daugherty", "ccurme", "Bagatur", "Eugene Yurtsev"] },
      { moduleName: "Agent & Tool Framework", status: "Healthy", owners: ["Eugene Yurtsev", "Mason Daugherty", "Christophe Bornet", "Bagatur"] },
    ],
  },
  {
    repoName: "langfuse",
    modules: [
      { moduleName: "Dataset & Experiment Management", status: "At Risk", owners: ["marliessophie"] },
      { moduleName: "Enterprise SSO", status: "At Risk", owners: ["Marc Klingen"] },
      { moduleName: "Data Annotation & Labeling", status: "At Risk", owners: ["marliessophie"] },
      { moduleName: "Automations & Integrations", status: "Needs Attention", owners: ["Marc Klingen", "marliessophie"] },
      { moduleName: "User & Access Management", status: "Needs Attention", owners: ["Marc Klingen", "Max Deichmann"] },
      { moduleName: "Model Evaluation & Scoring", status: "Needs Attention", owners: ["marliessophie", "Steffen Schmitz"] },
      { moduleName: "Observability & Analytics", status: "Healthy", owners: ["Valery Meleshkin", "Michael Fröhlich", "Max Deichmann"] },
    ],
  },
  {
    repoName: "rustdesk",
    modules: [
      { moduleName: "File Transfer & Clipboard Sync", status: "At Risk", owners: ["fufesou"] },
      { moduleName: "Remote Printing", status: "At Risk", owners: ["fufesou"] },
      { moduleName: "Collaborative Whiteboard", status: "At Risk", owners: ["fufesou"] },
      { moduleName: "Plugin & Extension Framework", status: "At Risk", owners: ["fufesou"] },
      { moduleName: "Remote Session Control", status: "Needs Attention", owners: ["fufesou", "Asura"] },
      { moduleName: "Infrastructure", status: "Needs Attention", owners: ["rustdesk", "21pages"] },
      { moduleName: "Client Application Shell", status: "Healthy", owners: ["fufesou", "21pages", "Mr-Update"] },
    ],
  },
  {
    repoName: "twenty",
    modules: [
      { moduleName: "AI Assistant", status: "At Risk", owners: ["Charles Bochet"] },
      { moduleName: "Billing & Subscription Management", status: "Needs Attention", owners: ["Félix Malfait", "Ana Sofia Marin Alexandre"] },
      { moduleName: "Data Import & Export", status: "Healthy", owners: ["Charles Bochet", "Raphaël Bosi", "Etienne"] },
      { moduleName: "Workflow Automation", status: "Healthy", owners: ["Charles Bochet", "martmull", "Thomas Trompette", "Paul Rastoin"] },
      { moduleName: "Sales Pipeline & Contact Management", status: "Healthy", owners: ["Félix Malfait", "Charles Bochet", "Lucas Bordeau", "Abdullah."] },
    ],
  },
];

/** Real repo-level SPOF data with computed counts */
export const ORG_REPO_SPOF_ROWS: OrgRepoSpofRow[] = RAW_REPO_MODULES.map((repo) => {
  const counts = computeSpofCounts(repo.modules);
  return {
    repoName: repo.repoName,
    spofModuleCount: counts.spofOwnerCount,
    spofOwnerCount: counts.uniqueSpofOwnerCount,
    modules: repo.modules,
  };
});

/** Aggregated totals computed from real data. */
export const ORG_SPOF_TOTALS = {
  // Count of modules with SPOF risk (At Risk or Needs Attention)
  totalSpofModules: ORG_REPO_SPOF_ROWS.reduce(
    (sum, r) => sum + r.modules.filter((m) => m.status !== "Healthy").length,
    0
  ),
  // Unique SPOF owners across all at-risk modules
  totalUniqueSpofOwners: new Set(
    ORG_REPO_SPOF_ROWS.flatMap((r) =>
      r.modules.filter((m) => m.status !== "Healthy").flatMap((m) => m.owners)
    ),
  ).size,
};

/** Filter tabs for the repo SPOF table. */
export const ORG_REPO_SPOF_FILTER_TABS: { key: OrgRepoSpofFilter; label: string }[] = [
  { key: "mostSpofModules", label: "Most SPOF Modules" },
  { key: "mostSpofOwners", label: "Most SPOF Owners" },
];

/** Sort rows descending by the selected metric. */
export function sortOrgRepoSpof(
  rows: OrgRepoSpofRow[],
  filter: OrgRepoSpofFilter,
): OrgRepoSpofRow[] {
  const key = filter === "mostSpofModules" ? "spofModuleCount" : "spofOwnerCount";
  return [...rows].sort((a, b) => b[key] - a[key]);
}
