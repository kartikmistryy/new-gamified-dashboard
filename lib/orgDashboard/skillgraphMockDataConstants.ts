import { DASHBOARD_COLORS } from "./colors";

export const WIDELY_KNOWN = [
  { name: "Node.js", color: DASHBOARD_COLORS.skillGreen },
  { name: "Next.js", color: DASHBOARD_COLORS.skillBlue },
  { name: "Tailwind", color: DASHBOARD_COLORS.skillBlue },
];

export const PROFICIENT = [
  { name: "Node.js", color: DASHBOARD_COLORS.skillGreen },
  { name: "iOS Dev", color: DASHBOARD_COLORS.skillLavender },
  { name: "Kubernetes", color: DASHBOARD_COLORS.skillOrange },
];

export const TEAM_DISTRIBUTIONS = {
  frontendHeavy: [
    { domain: "Frontend", value: 18 },
    { domain: "Backend", value: 6 },
    { domain: "DevOps", value: 4 },
    { domain: "AI & ML", value: 2 },
    { domain: "Mobile", value: 2 },
    { domain: "Cloud", value: 3 },
    { domain: "Testing", value: 4 },
    { domain: "Product & Design", value: 3 },
  ],
  designLean: [
    { domain: "Frontend", value: 10 },
    { domain: "Backend", value: 4 },
    { domain: "DevOps", value: 3 },
    { domain: "AI & ML", value: 2 },
    { domain: "Mobile", value: 5 },
    { domain: "Cloud", value: 4 },
    { domain: "Testing", value: 3 },
    { domain: "Product & Design", value: 8 },
  ],
  aiMlHeavy: [
    { domain: "Frontend", value: 6 },
    { domain: "Backend", value: 10 },
    { domain: "DevOps", value: 7 },
    { domain: "AI & ML", value: 12 },
    { domain: "Mobile", value: 3 },
    { domain: "Cloud", value: 8 },
    { domain: "Testing", value: 5 },
    { domain: "Product & Design", value: 2 },
  ],
  mobileHeavy: [
    { domain: "Frontend", value: 8 },
    { domain: "Backend", value: 6 },
    { domain: "DevOps", value: 4 },
    { domain: "AI & ML", value: 2 },
    { domain: "Mobile", value: 16 },
    { domain: "Cloud", value: 5 },
    { domain: "Testing", value: 4 },
    { domain: "Product & Design", value: 3 },
  ],
  webBalanced: [
    { domain: "Frontend", value: 12 },
    { domain: "Backend", value: 9 },
    { domain: "DevOps", value: 6 },
    { domain: "AI & ML", value: 3 },
    { domain: "Mobile", value: 4 },
    { domain: "Cloud", value: 7 },
    { domain: "Testing", value: 5 },
    { domain: "Product & Design", value: 4 },
  ],
};
