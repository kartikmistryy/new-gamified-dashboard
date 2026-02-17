/**
 * Transform SkillGraphTableData into an optimized ChatbotContext.
 *
 * This function reduces the data from ~28K tokens to ~4.5K tokens by:
 * 1. Removing timestamps, versions, file paths
 * 2. Flattening nested structures
 * 3. Using shorthand notation
 * 4. Pre-computing summary aggregates
 *
 * @see .planning-with-files.tmp/12_skillsgraph_chatbot/02_chatbot/METHODOLOGY.md
 */

import type { SkillGraphTableData } from "@/components/skillmap/skillGraphTableTransform";
import type {
  SkillGraphRawData,
  RoadmapIndexEntry,
} from "@/components/skillmap/skillGraphDataLoader";
import type {
  ChatbotContext,
  ChatbotEngineer,
  EngineerExpertise,
  RoadmapInfo,
  ContextSummary,
  ShortLevel,
  ShortType,
} from "./types";
import { getLevelFromPct, shortenGroup } from "./types";

/**
 * Build the optimized chatbot context from table data and raw data.
 *
 * @param tableData - Transformed table data (contains progress calculations)
 * @param raw - Raw data (contains roadmap index, engineer index, mappings)
 * @returns ChatbotContext optimized for LLM consumption
 */
export function buildChatbotContext(
  tableData: SkillGraphTableData,
  raw: SkillGraphRawData
): ChatbotContext {
  const { skillBased, roleBased } = tableData;
  const { roadmaps, engineerIndex, engineers, roleSkillMapping } = raw;

  // Build roadmap lookup by key for quick access
  const roadmapByKey = new Map<string, RoadmapIndexEntry>();
  for (const r of roadmaps) {
    roadmapByKey.set(r.key, r);
  }

  // Build progress lookup by roadmap key
  const skillProgressByKey = new Map<string, number>();
  for (const sp of skillBased) {
    skillProgressByKey.set(sp.roadmap.id, sp.progressPercent);
  }
  const roleProgressByKey = new Map<string, number>();
  for (const rp of roleBased) {
    roleProgressByKey.set(rp.roleRoadmap.id, rp.progressPercent);
  }

  // Build roadmap catalog
  const rolesMap: Record<string, RoadmapInfo> = {};
  const skillsMap: Record<string, RoadmapInfo> = {};

  // Role roadmaps with their related skills
  for (const r of roadmaps.filter((x) => x.type === "role")) {
    const skills = roleSkillMapping.get(r.name) ?? [];
    rolesMap[r.name] = {
      group: shortenGroup(r.group),
      skills: skills.slice(0, 10), // Limit to save tokens
    };
  }

  // Skill roadmaps with their related roles (inverse mapping)
  const skillToRoles = new Map<string, string[]>();
  for (const [roleName, skills] of roleSkillMapping) {
    for (const skill of skills) {
      if (!skillToRoles.has(skill)) {
        skillToRoles.set(skill, []);
      }
      skillToRoles.get(skill)!.push(roleName);
    }
  }

  for (const r of roadmaps.filter((x) => x.type === "skill")) {
    skillsMap[r.name] = {
      group: shortenGroup(r.group),
      roles: skillToRoles.get(r.name)?.slice(0, 10) ?? [], // Limit to save tokens
    };
  }

  // Build engineer capabilities
  const chatbotEngineers: ChatbotEngineer[] = [];

  for (let i = 0; i < engineerIndex.length; i++) {
    const engIdx = engineerIndex[i];
    const engData = engineers[i];

    const expertise: EngineerExpertise[] = [];

    // Process each roadmap the engineer has progress in
    for (const roadmapKey of Object.keys(engData.roadmaps)) {
      const roadmapInfo = roadmapByKey.get(roadmapKey);
      if (!roadmapInfo) continue;

      const record = engData.roadmaps[roadmapKey];
      const completedCount = Object.keys(record.completions).length;
      const total = roadmapInfo.totalSubCheckpoints;
      const pct = total > 0 ? Math.round((completedCount / total) * 100) : 0;

      const level = getLevelFromPct(pct);
      if (!level) continue; // Skip if no progress

      const type: ShortType = roadmapInfo.type === "role" ? "r" : "s";

      expertise.push({
        roadmap: roadmapInfo.name,
        type,
        level,
        pct,
      });
    }

    // Sort by percentage descending (most proficient first)
    expertise.sort((a, b) => b.pct - a.pct);

    if (expertise.length > 0) {
      chatbotEngineers.push({
        name: engIdx.name,
        expertise,
      });
    }
  }

  // Build summary aggregates
  const summary = buildSummary(skillBased, roleBased);

  return {
    teamSize: engineerIndex.length,
    roadmaps: {
      roles: rolesMap,
      skills: skillsMap,
    },
    engineers: chatbotEngineers,
    summary,
  };
}

/**
 * Build summary aggregates for quick queries.
 */
function buildSummary(
  skillBased: SkillGraphTableData["skillBased"],
  roleBased: SkillGraphTableData["roleBased"]
): ContextSummary {
  // Top skills by average proficiency (with engineer count)
  const skillStats = skillBased
    .filter((s) => s.progressPercent > 0)
    .map((s) => ({
      name: s.roadmap.name,
      avgPct: s.progressPercent,
      count:
        s.developerCounts.basic +
        s.developerCounts.intermediate +
        s.developerCounts.advanced,
    }))
    .sort((a, b) => b.avgPct - a.avgPct);

  // Top roles by average proficiency
  const roleStats = roleBased
    .filter((r) => r.progressPercent > 0)
    .map((r) => ({
      name: r.roleRoadmap.name,
      avgPct: r.progressPercent,
      count:
        r.developerCounts.basic +
        r.developerCounts.intermediate +
        r.developerCounts.advanced,
    }))
    .sort((a, b) => b.avgPct - a.avgPct);

  // Skill gaps: roadmaps with <30% average proficiency or low adoption
  const allRoadmapStats = [...skillStats, ...roleStats];
  const skillGaps = allRoadmapStats
    .filter((s) => s.avgPct < 30 || s.count < 3)
    .map((s) => s.name)
    .slice(0, 10); // Limit to save tokens

  return {
    topSkills: skillStats.slice(0, 10),
    topRoles: roleStats.slice(0, 10),
    skillGaps,
  };
}

/**
 * Serialize ChatbotContext to a compact JSON string for LLM consumption.
 */
export function serializeChatbotContext(context: ChatbotContext): string {
  return JSON.stringify(context);
}

/**
 * Estimate token count for a ChatbotContext.
 * Uses rough approximation of 4 characters per token.
 */
export function estimateTokenCount(context: ChatbotContext): number {
  const json = serializeChatbotContext(context);
  return Math.ceil(json.length / 4);
}

/**
 * Build the system prompt with context injected.
 */
export function buildSystemPrompt(context: ChatbotContext): string {
  const roleCount = Object.keys(context.roadmaps.roles).length;
  const skillCount = Object.keys(context.roadmaps.skills).length;
  const contextJson = serializeChatbotContext(context);

  return `You are a helpful assistant for an organization's Skills Dashboard. You help users understand team capabilities and make staffing recommendations.

## Your Knowledge

You have access to the organization's skill data:
- ${context.teamSize} engineers
- ${roleCount} role-based roadmaps (career paths)
- ${skillCount} skill-based roadmaps (technologies)

## Context Data

${contextJson}

## Data Format

- Engineers have "expertise" arrays with:
  - "roadmap": name of the skill or role
  - "type": "r" for role, "s" for skill
  - "level": "A" (Advanced, 70%+), "I" (Intermediate, 40-69%), "B" (Basic, <40%)
  - "pct": exact progress percentage

## Guidelines

1. When asked about a project/technology, identify relevant roadmaps (and not the individual checkpoints or engineers)
2. Recommend engineers based on proficiency levels:
   - A (Advanced, 70%+): Can lead and mentor
   - I (Intermediate, 40-69%): Can contribute independently
   - B (Basic, <40%): Learning, needs guidance
3. Mention skill gaps when relevant
4. Be concise but informative
5. If asked about something not in the data, say so clearly

## Response Format

Use bullet points for lists. 
Prioritize high-level answers (role-based roadmaps > skill-based roadmaps > individuals).
The answers should not include abbreviations or shorthand (A, I, B); the context data only uses shorthand for efficiency. You should translate these into clear language in your responses (e.g., "Advanced", "Intermediate", "Basic").
When ask about progress levels, gaps, or other quantifiable info, use the exact percentages from the context.
Always reply in a concise manner unless asked for detail.`;
}
