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

    rows.push({
      teamName,
      teamColor: color,
      domainCount: Math.max(3, Math.round(scores.length / 20)),
      skillCount: Math.max(10, Math.round(scores.length / 2)),
      memberCount: scores.length,
      avgSpofScore: avgScore,
      highRiskCount,
      lowRiskCount,
    });
  }

  return rows;
}

/** Pre-calculated team rows for consistent rendering. */
export const SPOF_TEAM_ROWS: SpofTeamRow[] = calculateTeamStats(SPOF_DATA);
