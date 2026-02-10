/** User Skill Graph Data Generation Utilities */

import { roadmapData } from "@/components/skillmap/data/data";
import type { SkillgraphSkillRow } from "@/lib/orgDashboard/types";

/**
 * Build user-specific skill rows from roadmap data
 * Generates realistic skill proficiency data for an individual user based on their userId
 */
export function buildUserSkillRowsFromRoadmap(userId: string): SkillgraphSkillRow[] {
  const userHash = userId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const userSeed = userHash % 1000;

  const allDomains = [
    "Frontend",
    "Backend",
    "DevOps",
    "AI & ML",
    "Mobile",
    "Cloud",
    "Testing",
    "Product & Design",
    "Data Engineering",
    "Security",
    "Leadership",
  ];

  const userDomains: string[] = [];
  for (let i = 0; i < 4; i++) {
    const domainIndex = (userSeed + i * 17) % allDomains.length;
    const selectedDomain = allDomains[domainIndex];
    if (!userDomains.includes(selectedDomain)) {
      userDomains.push(selectedDomain);
    }
  }

  while (userDomains.length < 4) {
    for (const domain of allDomains) {
      if (!userDomains.includes(domain) && userDomains.length < 4) {
        userDomains.push(domain);
      }
    }
  }

  const userRoadmaps = roadmapData.filter((roadmap) => userDomains.includes(roadmap.name));

  return userRoadmaps.flatMap((roadmap, domainIndex) =>
    roadmap.technologies.map((tech, techIndex) => {
      const baseValue = tech.totalUsage || 200;
      const multiplier = 0.6 + ((userSeed + domainIndex * 13 + techIndex * 7) % 100) / 250;
      const totalUsage = Math.round(baseValue * multiplier);
      const completedProjects = Math.max(1, Math.round(totalUsage / 50));
      const proficiencyLevel = completedProjects >= 8 ? "expert" : completedProjects >= 4 ? "intermediate" : "beginner";

      return {
        skillName: tech.name,
        domainName: roadmap.name,
        domainColor: roadmap.color,
        totalUsage,
        completedProjects,
        proficiencyLevel,
        contributors: 1,
      } satisfies SkillgraphSkillRow;
    })
  );
}
