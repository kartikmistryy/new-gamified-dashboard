/**
 * Utility functions for the SkillGraph Voronoi Treemap visualization.
 *
 * Colors are keyed by group name so both Role-Based and Skill-Based views
 * get a consistent, distinguishable palette.
 */

const GROUP_COLORS: Record<string, string> = {
  /* Role-Based groups */
  "Web Development": "#4F8FF7",
  "Mobile Development": "#8E7BD8",
  "DevOps & Security": "#F1A66A",
  "AI & Machine Learning": "#E06C9F",
  "Data & Analytics": "#5EC4B6",
  "Game Development": "#C75C5C",
  "Design & Architecture": "#8FB8D8",
  "Management & Leadership": "#9CB673",
  "Specialized Support Roles": "#B8976F",

  /* Skill-Based groups */
  "Programming Languages": "#4F8FF7",
  "Frontend Technologies": "#7FAED9",
  "Backend Frameworks & Platforms": "#86C48B",
  "Mobile & Cross-Platform": "#8E7BD8",
  "Databases & Data Storage": "#5EC4B6",
  "DevOps & Cloud Infrastructure": "#F1A66A",
  "CS Fundamentals & System Design": "#E06C9F",
  "Emerging Technology": "#FFD166",
};

const FALLBACK_COLORS = [
  "#91CC75", "#FAC858", "#1975ff", "#EE6666", "#FF994D",
  "#785DB0", "#0CA8DF", "#3FBE95", "#FB628B", "#33dbf5",
];

export const getColorForDomain = (name: string): string =>
  GROUP_COLORS[name] ?? FALLBACK_COLORS[Math.abs(hashCode(name)) % FALLBACK_COLORS.length];

/* simple string hash for deterministic fallback color */
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

/* ── D3 script loading ────────────────────────────────── */

export const loadD3Scripts = async (): Promise<boolean> => {
  const scripts = [
    "https://cdn.jsdelivr.net/npm/d3@7",
    "https://cdn.jsdelivr.net/npm/d3-weighted-voronoi@1",
    "https://cdn.jsdelivr.net/npm/d3-voronoi-map@2",
    "https://cdn.jsdelivr.net/npm/d3-voronoi-treemap@1",
  ];

  for (const src of scripts) {
    if (!document.querySelector(`script[src="${src}"]`)) {
      await new Promise<void>((resolve) => {
        const script = document.createElement("script");
        script.src = src;
        script.onload = () => setTimeout(resolve, 50);
        script.onerror = () => resolve();
        document.head.appendChild(script);
      });
    }
  }
  return true;
};

export const checkD3Libs = (): boolean => {
  return (
    typeof window !== "undefined" &&
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    typeof (window as any).d3 !== "undefined" &&
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    typeof (window as any).d3.voronoiTreemap !== "undefined"
  );
};
