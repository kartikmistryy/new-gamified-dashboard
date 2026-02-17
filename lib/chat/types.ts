/**
 * ChatbotContext types for optimized LLM consumption.
 *
 * These types represent a token-optimized version of the SkillGraphTableData,
 * designed to fit within ~4,500 tokens while preserving queryable information.
 *
 * @see .planning-with-files.tmp/12_skillsgraph_chatbot/02_chatbot/METHODOLOGY.md
 */

/** Shorthand proficiency level: Basic, Intermediate, Advanced */
export type ShortLevel = "B" | "I" | "A";

/** Shorthand roadmap type: role or skill */
export type ShortType = "r" | "s";

/** Single expertise entry for an engineer */
export interface EngineerExpertise {
  /** Roadmap name (e.g., "React", "AI Engineer") */
  roadmap: string;
  /** Roadmap type: "r" for role, "s" for skill */
  type: ShortType;
  /** Proficiency level: "B" (basic), "I" (intermediate), "A" (advanced) */
  level: ShortLevel;
  /** Progress percentage (0-100) */
  pct: number;
}

/** Condensed engineer data for chatbot context */
export interface ChatbotEngineer {
  /** Engineer's display name */
  name: string;
  /** List of roadmaps with progress */
  expertise: EngineerExpertise[];
}

/** Roadmap info with skill/role mapping */
export interface RoadmapInfo {
  /** Shortened group name */
  group: string;
  /** Related skills (for roles) or related roles (for skills) */
  skills?: string[];
  roles?: string[];
}

/** Aggregate statistics for quick queries */
export interface ContextSummary {
  /** Top skills by average proficiency */
  topSkills: Array<{ name: string; avgPct: number; count: number }>;
  /** Top roles by average proficiency */
  topRoles: Array<{ name: string; avgPct: number; count: number }>;
  /** Roadmaps with <30% average proficiency (skill gaps) */
  skillGaps: string[];
}

/**
 * Optimized context for chatbot LLM consumption.
 *
 * Token budget: ~4,500 tokens (84% reduction from raw data)
 */
export interface ChatbotContext {
  /** Total number of engineers in the organization */
  teamSize: number;

  /** Roadmap catalog with skill-role mappings */
  roadmaps: {
    /** Role roadmaps with their related skills */
    roles: Record<string, RoadmapInfo>;
    /** Skill roadmaps with their related roles */
    skills: Record<string, RoadmapInfo>;
  };

  /** Engineer capabilities (the core queryable data) */
  engineers: ChatbotEngineer[];

  /** Pre-computed aggregates for common queries */
  summary: ContextSummary;
}

/**
 * Convert full proficiency level to shorthand.
 */
export function toShortLevel(level: "basic" | "intermediate" | "advanced" | null): ShortLevel | null {
  if (level === "basic") return "B";
  if (level === "intermediate") return "I";
  if (level === "advanced") return "A";
  return null;
}

/**
 * Get proficiency level from percentage.
 */
export function getLevelFromPct(pct: number): ShortLevel | null {
  if (pct >= 70) return "A";
  if (pct >= 40) return "I";
  if (pct > 0) return "B";
  return null;
}

/**
 * Shortened group names to save tokens.
 */
export const GROUP_SHORT: Record<string, string> = {
  "Web Development": "Web Dev",
  "AI & Machine Learning": "AI & ML",
  "DevOps & Security": "DevOps",
  "Frontend Technologies": "Frontend",
  "Programming Languages": "Languages",
  "Backend Frameworks & Platforms": "Backend",
  "CS Fundamentals & System Design": "CS",
  "DevOps & Cloud Infrastructure": "DevOps",
  "Databases & Data Storage": "Databases",
  "Mobile & Cross-Platform": "Mobile",
  "Mobile Development": "Mobile",
  "Emerging Technology": "Emerging",
  "Data & Analytics": "Data",
  "Design & Architecture": "Design",
  "Management & Leadership": "Management",
  "Game Development": "Game Dev",
  "Specialized Support Roles": "Specialized",
};

/**
 * Get shortened group name.
 */
export function shortenGroup(group: string): string {
  return GROUP_SHORT[group] ?? group;
}
