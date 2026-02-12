import type { SkillData } from "./skillGraphTypes";

/* ── Raw JSON types ────────────────────────────────────── */

interface RoadmapIndexEntry {
  key: string;
  type: "role" | "skill";
  name: string;
  group: string;
  totalSubCheckpoints: number;
}

interface EngineerIndexEntry {
  file: string;
}

interface EngineerRoadmapRecord {
  completions: Record<string, unknown>;
}

interface EngineerData {
  roadmaps: Record<string, EngineerRoadmapRecord>;
}

/* ── Fetch helpers ─────────────────────────────────────── */

const BASE = "/data/skillgraph";

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}/${path}`);
  if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`);
  return res.json();
}

/* ── Public API ────────────────────────────────────────── */

export type SkillGraphBundle = { role: SkillData; skill: SkillData };

export async function loadAllSkillGraphData(): Promise<SkillGraphBundle> {
  const [roadmapIndex, engineerIndex] = await Promise.all([
    fetchJson<{ roadmaps: RoadmapIndexEntry[] }>("roadmaps/index.json"),
    fetchJson<{ engineers: EngineerIndexEntry[] }>("engineers/index.json"),
  ]);

  const engineers = await Promise.all(
    engineerIndex.engineers.map((eng) =>
      fetchJson<EngineerData>(`engineers/${eng.file}`)
    )
  );

  const stats = aggregateStats(roadmapIndex.roadmaps, engineers);

  return {
    role: buildTree(roadmapIndex.roadmaps, stats, "role", "Roles"),
    skill: buildTree(roadmapIndex.roadmaps, stats, "skill", "Skills"),
  };
}

/* ── Aggregation ───────────────────────────────────────── */

interface RoadmapStat {
  count: number;
  totalRate: number;
}

function aggregateStats(
  roadmaps: RoadmapIndexEntry[],
  engineers: EngineerData[],
): Map<string, RoadmapStat> {
  const stats = new Map<string, RoadmapStat>();

  for (const roadmap of roadmaps) {
    let count = 0;
    let totalRate = 0;

    for (const eng of engineers) {
      const record = eng.roadmaps[roadmap.key];
      if (!record) continue;

      count++;
      const completed = Object.keys(record.completions).length;
      totalRate +=
        roadmap.totalSubCheckpoints > 0
          ? (completed / roadmap.totalSubCheckpoints) * 100
          : 0;
    }

    if (count > 0) {
      stats.set(roadmap.key, { count, totalRate });
    }
  }

  return stats;
}

/* ── Tree builder ──────────────────────────────────────── */

function buildTree(
  roadmaps: RoadmapIndexEntry[],
  stats: Map<string, RoadmapStat>,
  type: "role" | "skill",
  rootName: string,
): SkillData {
  const filtered = roadmaps.filter((r) => r.type === type && stats.has(r.key));

  const groups = new Map<string, SkillData[]>();

  for (const roadmap of filtered) {
    const stat = stats.get(roadmap.key)!;
    const avgRate = Math.round(stat.totalRate / stat.count);

    const leaf: SkillData = {
      name: roadmap.name,
      value: stat.count,
      frequency: avgRate,
    };

    if (!groups.has(roadmap.group)) {
      groups.set(roadmap.group, []);
    }
    groups.get(roadmap.group)!.push(leaf);
  }

  const children: SkillData[] = [];

  for (const [groupName, leaves] of groups) {
    const totalValue = leaves.reduce((s, l) => s + (l.value || 0), 0);
    const weightedFreq =
      totalValue > 0
        ? Math.round(
            leaves.reduce(
              (s, l) => s + (l.frequency || 0) * (l.value || 0),
              0,
            ) / totalValue,
          )
        : 0;

    children.push({
      name: groupName,
      value: totalValue,
      frequency: weightedFreq,
      children: leaves,
    });
  }

  const rootValue = children.reduce((s, c) => s + (c.value || 0), 0);

  return { name: rootName, value: rootValue, children };
}
