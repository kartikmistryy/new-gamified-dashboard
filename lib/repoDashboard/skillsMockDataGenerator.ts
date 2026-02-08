import { DASHBOARD_COLORS } from "@/lib/orgDashboard/colors";

/** Simple deterministic noise function based on seed */
export function noise(seed: number): number {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

/** Simple hash function to convert string to number seed */
export function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

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
