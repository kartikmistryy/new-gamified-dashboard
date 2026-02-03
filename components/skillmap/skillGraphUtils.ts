import { roadmapData } from "./data/data";
import type { SkillData } from "./skillGraphTypes";

export const COLORS = [
  "#91CC75", "#FAC858", "#1975ff", "#EE6666", "#FF994D",
  "#785DB0", "#0CA8DF", "#3FBE95", "#FB628B", "#33dbf5",
];

const DOMAIN_COLORS: Record<string, string> = {
  Frontend: "#7FAED9",
  Backend: "#86C48B",
  DevOps: "#F1A66A",
  Mobile: "#8E7BD8",
};

export const buildSkillData = (): SkillData => {
  const mapTechnology = (tech: typeof roadmapData[number]["technologies"][number]): SkillData => ({
    name: tech.name,
    value: tech.value,
    frequency: tech.frequency,
    children: tech.children ? tech.children.map(mapTechnology) : undefined,
  });

  const roadmaps = roadmapData.map((roadmap) => ({
    name: roadmap.name,
    value: roadmap.value,
    frequency: roadmap.frequency,
    children: roadmap.technologies.map(mapTechnology),
  }));
  const rootValue = roadmaps.reduce((sum, r) => sum + (r.value || 0), 0);
  return { name: "Skills", value: rootValue, children: roadmaps };
};

export const getRoadmapColor = (roadmapName: string): string => {
  if (DOMAIN_COLORS[roadmapName]) return DOMAIN_COLORS[roadmapName];
  const index = roadmapData.findIndex(r => r.name === roadmapName);
  return COLORS[index >= 0 ? index % COLORS.length : 0];
};

export const getColorForDomain = (domainName: string): string => {
  const roadmap = roadmapData.find(r => r.name === domainName);
  return roadmap ? getRoadmapColor(domainName) : COLORS[0];
};

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
  return typeof window !== "undefined" &&
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    typeof (window as any).d3 !== "undefined" &&
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    typeof (window as any).d3.voronoiTreemap !== "undefined";
};
