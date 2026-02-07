import type { SkillgraphTeamRow, SkillgraphSkillRow } from "./types";
import { DASHBOARD_BG_CLASSES } from "./colors";
import { WIDELY_KNOWN, PROFICIENT, TEAM_DISTRIBUTIONS } from "./skillgraphMockDataConstants";

/** Mock skillgraph teams: domain count, skill count, top 3 widely known and proficient skills. */
export const SKILLGRAPH_TEAM_ROWS: SkillgraphTeamRow[] = [
  {
    teamName: "Frontend Development",
    teamColor: DASHBOARD_BG_CLASSES.danger,
    totalUsage: 3100,
    skillCount: 50,
    top3WidelyKnown: WIDELY_KNOWN,
    top3Proficient: PROFICIENT,
    domainDistribution: TEAM_DISTRIBUTIONS.frontendHeavy,
    details: [
      { domain: "Frontend", skill: "TypeScript", usage: 95, progress: 88 },
      { domain: "Frontend", skill: "React", usage: 90, progress: 84 },
      { domain: "DevOps", skill: "CI/CD", usage: 72, progress: 66 },
    ],
  },
  {
    teamName: "UI/UX Design",
    teamColor: DASHBOARD_BG_CLASSES.excellent,
    totalUsage: 1900,
    skillCount: 100,
    top3WidelyKnown: WIDELY_KNOWN,
    top3Proficient: PROFICIENT,
    domainDistribution: TEAM_DISTRIBUTIONS.designLean,
    details: [
      { domain: "Frontend", skill: "Figma", usage: 92, progress: 81 },
      { domain: "Frontend", skill: "Design Systems", usage: 86, progress: 78 },
      { domain: "Cloud", skill: "Asset Pipelines", usage: 70, progress: 62 },
    ],
  },
  {
    teamName: "AI / ML Development",
    teamColor: DASHBOARD_BG_CLASSES.blueLight,
    totalUsage: 2400,
    skillCount: 200,
    top3WidelyKnown: WIDELY_KNOWN,
    top3Proficient: PROFICIENT,
    domainDistribution: TEAM_DISTRIBUTIONS.aiMlHeavy,
    details: [
      { domain: "AI & ML", skill: "PyTorch", usage: 94, progress: 86 },
      { domain: "AI & ML", skill: "LLMs", usage: 92, progress: 82 },
      { domain: "Cloud", skill: "MLOps", usage: 76, progress: 70 },
    ],
  },
  {
    teamName: "Mobile App Development",
    teamColor: DASHBOARD_BG_CLASSES.blueLight,
    totalUsage: 1010,
    skillCount: 400,
    top3WidelyKnown: WIDELY_KNOWN,
    top3Proficient: PROFICIENT,
    domainDistribution: TEAM_DISTRIBUTIONS.mobileHeavy,
    details: [
      { domain: "Mobile", skill: "Swift", usage: 90, progress: 80 },
      { domain: "Mobile", skill: "Kotlin", usage: 88, progress: 77 },
      { domain: "Backend", skill: "APIs", usage: 75, progress: 64 },
    ],
  },
  {
    teamName: "Web Development",
    teamColor: DASHBOARD_BG_CLASSES.blueLight,
    totalUsage: 3000,
    skillCount: 100,
    top3WidelyKnown: WIDELY_KNOWN,
    top3Proficient: PROFICIENT,
    domainDistribution: TEAM_DISTRIBUTIONS.webBalanced,
    details: [
      { domain: "Frontend", skill: "Next.js", usage: 91, progress: 83 },
      { domain: "Backend", skill: "Node.js", usage: 87, progress: 76 },
      { domain: "DevOps", skill: "Nginx", usage: 72, progress: 63 },
    ],
  },
];

export const SKILLGRAPH_SKILL_ROWS: SkillgraphSkillRow[] = [
  {
    skillName: "React",
    domainName: "Frontend",
    totalUsage: 3200,
    avgUsage: 160,
    totalSkillCompletion: 28,
    contributors: 48,
    details: [
      { team: "Frontend Development", usage: 95, progress: 86 },
      { team: "UI/UX Design", usage: 88, progress: 79 },
      { team: "Web Development", usage: 90, progress: 82 },
    ],
  },
  {
    skillName: "TypeScript",
    domainName: "Frontend",
    totalUsage: 2900,
    avgUsage: 145,
    totalSkillCompletion: 24,
    contributors: 44,
    details: [
      { team: "Frontend Development", usage: 92, progress: 84 },
      { team: "Web Development", usage: 88, progress: 79 },
      { team: "UI/UX Design", usage: 70, progress: 63 },
    ],
  },
  {
    skillName: "Node.js",
    domainName: "Backend",
    totalUsage: 2650,
    avgUsage: 132,
    totalSkillCompletion: 22,
    contributors: 39,
    details: [
      { team: "Web Development", usage: 87, progress: 78 },
      { team: "Mobile App Development", usage: 72, progress: 61 },
      { team: "AI / ML Development", usage: 68, progress: 59 },
    ],
  },
  {
    skillName: "Kubernetes",
    domainName: "DevOps",
    totalUsage: 2100,
    avgUsage: 105,
    totalSkillCompletion: 18,
    contributors: 30,
    details: [
      { team: "AI / ML Development", usage: 86, progress: 76 },
      { team: "Web Development", usage: 78, progress: 69 },
      { team: "Frontend Development", usage: 70, progress: 63 },
    ],
  },
  {
    skillName: "Swift",
    domainName: "Mobile",
    totalUsage: 1800,
    avgUsage: 90,
    totalSkillCompletion: 26,
    contributors: 26,
    details: [
      { team: "Mobile App Development", usage: 90, progress: 84 },
      { team: "Frontend Development", usage: 68, progress: 61 },
      { team: "Web Development", usage: 60, progress: 54 },
    ],
  },
  {
    skillName: "PyTorch",
    domainName: "AI & ML",
    totalUsage: 2300,
    avgUsage: 115,
    totalSkillCompletion: 55,
    contributors: 28,
    details: [
      { team: "AI / ML Development", usage: 94, progress: 88 },
      { team: "Web Development", usage: 70, progress: 61 },
      { team: "Frontend Development", usage: 66, progress: 59 },
    ],
  },
];
