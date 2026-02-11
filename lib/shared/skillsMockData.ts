/**
 * Shared Skills Mock Data
 *
 * Common skill domains, skill lists, and color mappings used across
 * team, repo, and user dashboards.
 */

import { DASHBOARD_COLORS } from "@/lib/orgDashboard/colors";

// Re-export utilities for convenience
export { noise, hashString } from "./mockDataUtils";

/** 8 standard skill domains */
export const SKILL_DOMAINS = [
  "Frontend",
  "Backend",
  "DevOps",
  "AI & ML",
  "Mobile",
  "Cloud",
  "Testing",
  "Product & Design",
] as const;

export type SkillDomain = typeof SKILL_DOMAINS[number];

/** Common skills mapped by domain */
export const SKILLS_BY_DOMAIN: Record<string, string[]> = {
  Frontend: ["React", "TypeScript", "Next.js", "Tailwind", "Vue.js", "HTML/CSS"],
  Backend: ["Node.js", "Python", "PostgreSQL", "GraphQL", "REST APIs", "Express"],
  DevOps: ["Docker", "Kubernetes", "CI/CD", "Nginx", "Jenkins", "Terraform"],
  "AI & ML": ["PyTorch", "TensorFlow", "LLMs", "Data Science", "MLOps", "NLP"],
  Mobile: ["Swift", "Kotlin", "React Native", "iOS Dev", "Android Dev", "Flutter"],
  Cloud: ["AWS", "Azure", "GCP", "S3", "Lambda", "Cloud Functions"],
  Testing: ["Jest", "Cypress", "Unit Testing", "E2E Testing", "TDD", "Test Automation"],
  "Product & Design": ["Figma", "UX Research", "Wireframing", "Prototyping", "Design Systems", "User Testing"],
};

/** Get color for domain */
export function getDomainColor(domain: string): string {
  const domainColors: Record<string, string> = {
    Frontend: DASHBOARD_COLORS.skillBlue,
    Backend: DASHBOARD_COLORS.skillGreen,
    DevOps: DASHBOARD_COLORS.skillOrange,
    "AI & ML": DASHBOARD_COLORS.skillLavender,
    Mobile: DASHBOARD_COLORS.skillLavender,
    Cloud: DASHBOARD_COLORS.skillBlue,
    Testing: DASHBOARD_COLORS.skillOrange,
    "Product & Design": DASHBOARD_COLORS.skillGreen,
  };
  return domainColors[domain] || DASHBOARD_COLORS.skillBlue;
}
