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
  },
  {
    teamName: "UI/UX Design",
    teamColor: DASHBOARD_BG_CLASSES.excellent,
    domainCount: 10,
    skillCount: 100,
    top3WidelyKnown: WIDELY_KNOWN,
    top3Proficient: PROFICIENT,
    domainDistribution: TEAM_DISTRIBUTIONS.designLean,
  },
  {
    teamName: "AI / ML Development",
    teamColor: DASHBOARD_BG_CLASSES.blueLight,
    domainCount: 20,
    skillCount: 200,
    top3WidelyKnown: WIDELY_KNOWN,
    top3Proficient: PROFICIENT,
    domainDistribution: TEAM_DISTRIBUTIONS.aiMlHeavy,
  },
  {
    teamName: "Mobile App Development",
    teamColor: DASHBOARD_BG_CLASSES.blueLight,
    domainCount: 40,
    skillCount: 400,
    top3WidelyKnown: WIDELY_KNOWN,
    top3Proficient: PROFICIENT,
    domainDistribution: TEAM_DISTRIBUTIONS.mobileHeavy,
  },
  {
    teamName: "Web Development",
    teamColor: DASHBOARD_BG_CLASSES.blueLight,
    domainCount: 10,
    skillCount: 100,
    top3WidelyKnown: WIDELY_KNOWN,
    top3Proficient: PROFICIENT,
    domainDistribution: TEAM_DISTRIBUTIONS.webBalanced,
  },
];

export const SKILLGRAPH_SKILL_ROWS: SkillgraphSkillRow[] = [
  { domainName: "Backend", skillCount: 50, domainCount: 5, domainDistribution: TEAM_DISTRIBUTIONS.webBalanced },
  { domainName: "Frontend", skillCount: 100, domainCount: 10, domainDistribution: TEAM_DISTRIBUTIONS.frontendHeavy },
  { domainName: "Mobile", skillCount: 200, domainCount: 20, domainDistribution: TEAM_DISTRIBUTIONS.mobileHeavy },
  { domainName: "DevOps", skillCount: 400, domainCount: 40, domainDistribution: TEAM_DISTRIBUTIONS.aiMlHeavy },
  { domainName: "Cloud", skillCount: 100, domainCount: 10, domainDistribution: TEAM_DISTRIBUTIONS.aiMlHeavy },
  { domainName: "Testing", skillCount: 70, domainCount: 7, domainDistribution: TEAM_DISTRIBUTIONS.webBalanced },
  { domainName: "AI & ML", skillCount: 90, domainCount: 9, domainDistribution: TEAM_DISTRIBUTIONS.aiMlHeavy },
];
