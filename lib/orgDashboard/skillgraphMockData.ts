import type { SkillgraphTeamRow, SkillgraphSkillRow } from "./types";
import { DASHBOARD_COLORS, DASHBOARD_BG_CLASSES } from "./colors";

const WIDELY_KNOWN = [
  { name: "Node.js", color: DASHBOARD_COLORS.skillGreen },
  { name: "Next.js", color: DASHBOARD_COLORS.skillBlue },
  { name: "Tailwind", color: DASHBOARD_COLORS.skillBlue },
];

const PROFICIENT = [
  { name: "Node.js", color: DASHBOARD_COLORS.skillGreen },
  { name: "iOS Dev", color: DASHBOARD_COLORS.skillLavender },
  { name: "Kubernetes", color: DASHBOARD_COLORS.skillOrange },
];

const TEAM_DISTRIBUTIONS = {
  frontendHeavy: [
    { domain: "Frontend", value: 18 },
    { domain: "Backend", value: 6 },
    { domain: "DevOps", value: 4 },
    { domain: "Mobile", value: 2 },
    { domain: "Cloud", value: 3 },
  ],
  designLean: [
    { domain: "Frontend", value: 10 },
    { domain: "Backend", value: 4 },
    { domain: "DevOps", value: 3 },
    { domain: "Mobile", value: 5 },
    { domain: "Cloud", value: 4 },
  ],
  aiMlHeavy: [
    { domain: "Frontend", value: 6 },
    { domain: "Backend", value: 10 },
    { domain: "DevOps", value: 7 },
    { domain: "Mobile", value: 3 },
    { domain: "Cloud", value: 8 },
  ],
  mobileHeavy: [
    { domain: "Frontend", value: 8 },
    { domain: "Backend", value: 6 },
    { domain: "DevOps", value: 4 },
    { domain: "Mobile", value: 16 },
    { domain: "Cloud", value: 5 },
  ],
  webBalanced: [
    { domain: "Frontend", value: 12 },
    { domain: "Backend", value: 9 },
    { domain: "DevOps", value: 6 },
    { domain: "Mobile", value: 4 },
    { domain: "Cloud", value: 7 },
  ],
};

/** Mock skillgraph teams: domain count, skill count, top 3 widely known and proficient skills. */
export const SKILLGRAPH_TEAM_ROWS: SkillgraphTeamRow[] = [
  {
    teamName: "Frontend Development",
    teamColor: DASHBOARD_BG_CLASSES.danger,
    domainCount: 5,
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
    domainCount: 10,
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
    domainCount: 20,
    skillCount: 200,
    top3WidelyKnown: WIDELY_KNOWN,
    top3Proficient: PROFICIENT,
    domainDistribution: TEAM_DISTRIBUTIONS.aiMlHeavy,
    details: [
      { domain: "AI/ML", skill: "PyTorch", usage: 94, progress: 86 },
      { domain: "AI/ML", skill: "LLMs", usage: 92, progress: 82 },
      { domain: "Cloud", skill: "MLOps", usage: 76, progress: 70 },
    ],
  },
  {
    teamName: "Mobile App Development",
    teamColor: DASHBOARD_BG_CLASSES.blueLight,
    domainCount: 40,
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
    domainCount: 10,
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
    domainName: "Backend",
    skillCount: 50,
    domainCount: 5,
    domainDistribution: TEAM_DISTRIBUTIONS.webBalanced,
    details: [
      { team: "Web Development", usage: 88, ownership: 74, progress: 78 },
      { team: "Mobile App Development", usage: 72, ownership: 58, progress: 61 },
      { team: "AI / ML Development", usage: 70, ownership: 55, progress: 60 },
    ],
  },
  {
    domainName: "Frontend",
    skillCount: 100,
    domainCount: 10,
    domainDistribution: TEAM_DISTRIBUTIONS.frontendHeavy,
    details: [
      { team: "Frontend Development", usage: 95, ownership: 82, progress: 86 },
      { team: "UI/UX Design", usage: 90, ownership: 76, progress: 80 },
      { team: "Web Development", usage: 88, ownership: 74, progress: 78 },
    ],
  },
  {
    domainName: "Mobile",
    skillCount: 200,
    domainCount: 20,
    domainDistribution: TEAM_DISTRIBUTIONS.mobileHeavy,
    details: [
      { team: "Mobile App Development", usage: 92, ownership: 79, progress: 84 },
      { team: "Frontend Development", usage: 70, ownership: 60, progress: 62 },
      { team: "Web Development", usage: 62, ownership: 52, progress: 55 },
    ],
  },
  {
    domainName: "DevOps",
    skillCount: 400,
    domainCount: 40,
    domainDistribution: TEAM_DISTRIBUTIONS.aiMlHeavy,
    details: [
      { team: "AI / ML Development", usage: 86, ownership: 70, progress: 76 },
      { team: "Web Development", usage: 78, ownership: 64, progress: 69 },
      { team: "Frontend Development", usage: 72, ownership: 58, progress: 63 },
    ],
  },
  {
    domainName: "Cloud",
    skillCount: 100,
    domainCount: 10,
    domainDistribution: TEAM_DISTRIBUTIONS.aiMlHeavy,
    details: [
      { team: "AI / ML Development", usage: 84, ownership: 68, progress: 73 },
      { team: "Web Development", usage: 76, ownership: 61, progress: 66 },
      { team: "UI/UX Design", usage: 68, ownership: 55, progress: 59 },
    ],
  },
  {
    domainName: "Testing",
    skillCount: 70,
    domainCount: 7,
    domainDistribution: TEAM_DISTRIBUTIONS.webBalanced,
    details: [
      { team: "Web Development", usage: 74, ownership: 60, progress: 65 },
      { team: "Frontend Development", usage: 70, ownership: 56, progress: 60 },
      { team: "Mobile App Development", usage: 66, ownership: 52, progress: 57 },
    ],
  },
  {
    domainName: "AI & ML",
    skillCount: 90,
    domainCount: 9,
    domainDistribution: TEAM_DISTRIBUTIONS.aiMlHeavy,
    details: [
      { team: "AI / ML Development", usage: 94, ownership: 82, progress: 88 },
      { team: "Web Development", usage: 70, ownership: 58, progress: 61 },
      { team: "Frontend Development", usage: 68, ownership: 55, progress: 59 },
    ],
  },
];
