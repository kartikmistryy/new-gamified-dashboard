import type { SkillData } from "./skillGraphTypes";

/* ── Raw JSON types (exported for table transform) ────── */

export interface RoadmapLevelEntry {
  level: "basic" | "intermediate" | "advanced";
  label: string;
  checkpointCount: number;
  subCheckpointCount: number;
}

export interface RoadmapIndexEntry {
  key: string;
  type: "role" | "skill";
  name: string;
  group: string;
  file: string;
  totalSubCheckpoints: number;
  levels: RoadmapLevelEntry[];
}

/* ── Detail file types (checkpoint definitions) ───────── */

export interface DetailSubCheckpoint {
  id: string;
  title: string;
}

export interface DetailCheckpoint {
  id: string;
  title: string;
  subCheckpoints: DetailSubCheckpoint[];
}

export interface DetailLevel {
  level: "basic" | "intermediate" | "advanced";
  label: string;
  checkpoints: DetailCheckpoint[];
}

export interface DetailRoadmapEntry {
  roadmap: string;
  group: string;
  type: "role" | "skill";
  levels: DetailLevel[];
}

/** Map from roadmap name → detail entry (checkpoint definitions) */
export type RoadmapDetailMap = Map<string, DetailRoadmapEntry>;

export interface EngineerIndexEntry {
  userId: string;
  name: string;
  file: string;
}

export interface EngineerRoadmapRecord {
  completions: Record<string, unknown>;
}

export interface EngineerData {
  userId: string;
  name: string;
  roadmaps: Record<string, EngineerRoadmapRecord>;
}

/** Raw data from JSON files — shared between chart and table */
export interface SkillGraphRawData {
  roadmaps: RoadmapIndexEntry[];
  engineerIndex: EngineerIndexEntry[];
  engineers: EngineerData[];
  /** Roadmap name → full checkpoint definitions */
  detailMap: RoadmapDetailMap;
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

/** Full result containing both chart bundle and raw data for table transforms */
export interface SkillGraphFullData {
  chart: SkillGraphBundle;
  raw: SkillGraphRawData;
}

export async function loadAllSkillGraphData(): Promise<SkillGraphBundle> {
  const full = await loadSkillGraphFullData();
  return full.chart;
}

/** Load everything: chart bundle + raw data for table consumption */
export async function loadSkillGraphFullData(): Promise<SkillGraphFullData> {
  const [roadmapIndex, engineerIdx] = await Promise.all([
    fetchJson<{ roadmaps: RoadmapIndexEntry[] }>("roadmaps/index.json"),
    fetchJson<{ engineers: EngineerIndexEntry[] }>("engineers/index.json"),
  ]);

  // Collect unique detail files and load them in parallel with engineers
  const uniqueFiles = [...new Set(roadmapIndex.roadmaps.map((r) => r.file))];

  const [engineers, ...detailArrays] = await Promise.all([
    Promise.all(
      engineerIdx.engineers.map((eng) =>
        fetchJson<EngineerData>(`engineers/${eng.file}`)
      ),
    ),
    ...uniqueFiles.map((file) =>
      fetchJson<DetailRoadmapEntry[]>(`roadmaps/${file}`)
    ),
  ]);

  // Build name → detail lookup
  const detailMap: RoadmapDetailMap = new Map();
  for (const entries of detailArrays) {
    for (const entry of entries) {
      detailMap.set(entry.roadmap, entry);
    }
  }

  const stats = aggregateStats(roadmapIndex.roadmaps, engineers);

  return {
    chart: {
      role: buildTree(roadmapIndex.roadmaps, stats, "role", "Roles"),
      skill: buildTree(roadmapIndex.roadmaps, stats, "skill", "Skills"),
    },
    raw: {
      roadmaps: roadmapIndex.roadmaps,
      engineerIndex: engineerIdx.engineers,
      engineers,
      detailMap,
    },
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
