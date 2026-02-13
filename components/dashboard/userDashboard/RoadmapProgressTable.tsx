"use client";

import { Fragment, useState, useMemo } from "react";
import { ChevronDownIcon, ChevronRightIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  ROLE_ROADMAPS,
  SKILLS_ROADMAPS,
  calculateRoleRoadmapProgress,
  calculateSkillsRoadmapProgress,
  getProficiencyLevel,
} from "@/lib/dashboard/entities/roadmap";
import type { RoleRoadmap } from "@/lib/dashboard/entities/roadmap";
import type {
  RoadmapViewMode,
  RoadmapFilterMode,
  SkillsRoadmapProgressData,
  CheckpointProgressData,
  SidePanelContext,
  RoadmapDeveloper,
  CheckpointPhase,
} from "@/lib/dashboard/entities/roadmap";

// =============================================================================
// Phase Badge Component
// =============================================================================

type PhaseBadgeProps = {
  phase: CheckpointPhase;
};

function PhaseBadge({ phase }: PhaseBadgeProps) {
  const colors = {
    Basic: "bg-emerald-100 text-emerald-700",
    Intermediate: "bg-blue-100 text-blue-700",
    Advanced: "bg-purple-100 text-purple-700",
  };

  return (
    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${colors[phase]}`}>
      {phase}
    </span>
  );
}

// =============================================================================
// Progress Bar Component (3-stage segmented style)
// =============================================================================

const PROFICIENCY_LEVELS = [
  { key: "basic", label: "Basic", color: "#F59E0B" },
  { key: "proficient", label: "Proficient", color: "#3B82F6" },
  { key: "advanced", label: "Advanced", color: "#8B5CF6" },
] as const;

const LEVEL_MAP = Object.fromEntries(
  PROFICIENCY_LEVELS.map((l) => [l.key, l])
) as Record<string, (typeof PROFICIENCY_LEVELS)[number]>;

function hexToRgba(hex: string, alpha: number): string {
  const r = Number.parseInt(hex.slice(1, 3), 16);
  const g = Number.parseInt(hex.slice(3, 5), 16);
  const b = Number.parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

type ProgressBarProps = {
  percent: number;
  className?: string;
};

function ProgressBar({ percent, className = "" }: ProgressBarProps) {
  if (percent <= 0) {
    return <span className="text-sm text-gray-400">—</span>;
  }

  const clamped = Math.max(0, Math.min(100, percent));

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex h-2 w-[100px] gap-0.5 shrink-0">
        {PROFICIENCY_LEVELS.map(({ key, color }, i) => {
          const stageMax = i === 0 ? 33 : i === 1 ? 66 : 100;
          const stageMin = i === 0 ? 0 : i === 1 ? 33 : 66;
          const stageRange = stageMax - stageMin;
          const fillPct =
            clamped <= stageMin
              ? 0
              : clamped >= stageMax
                ? 100
                : ((clamped - stageMin) / stageRange) * 100;

          return (
            <div
              key={key}
              className="flex-1 rounded-sm overflow-hidden"
              style={{ backgroundColor: hexToRgba(color, 0.2) }}
            >
              <div
                className="h-full rounded-sm transition-all"
                style={{ width: `${fillPct}%`, backgroundColor: color }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =============================================================================
// Developer Count Badge (Clickable)
// =============================================================================

type CountBadgeProps = {
  count: number;
  level: "basic" | "intermediate" | "advanced";
  onClick: () => void;
};

function CountBadge({ count, level, onClick }: CountBadgeProps) {
  const colors = {
    basic: "bg-amber-100 text-amber-700 hover:bg-amber-200",
    intermediate: "bg-blue-100 text-blue-700 hover:bg-blue-200",
    advanced: "bg-purple-100 text-purple-700 hover:bg-purple-200",
  };

  if (count === 0) {
    return <span className="text-gray-400 text-sm w-12 text-center">-</span>;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${colors[level]}`}
    >
      {count}
    </button>
  );
}

// =============================================================================
// Sub-checkpoint Labels (Shaded/Lit)
// =============================================================================

type SubCheckpointLabelsProps = {
  checkpoint: CheckpointProgressData["checkpoint"];
  unlockedCount: number; // Average or representative count for org view
};

function SubCheckpointLabels({ checkpoint, unlockedCount }: SubCheckpointLabelsProps) {
  return (
    <div className="flex flex-wrap gap-1.5 py-2">
      {checkpoint.subCheckpoints.map((sub, idx) => {
        const isUnlocked = idx < unlockedCount;
        return (
          <span
            key={sub.id}
            className={`px-2 py-0.5 rounded text-xs transition-colors ${
              isUnlocked
                ? "bg-indigo-100 text-indigo-700"
                : "bg-gray-100 text-gray-400"
            }`}
          >
            {sub.name}
          </span>
        );
      })}
    </div>
  );
}

// =============================================================================
// Checkpoint Row (Level 2)
// =============================================================================

type CheckpointRowProps = {
  data: CheckpointProgressData;
  onCountClick: (context: SidePanelContext) => void;
  indentLevel: number; // 1 for under skills roadmap at top level, 2 for under skills roadmap nested in role
  showPhaseBadge?: boolean; // Show phase badge (first item in phase section)
};

function CheckpointRow({ data, onCountClick, indentLevel, showPhaseBadge = false }: CheckpointRowProps) {
  const [expanded, setExpanded] = useState(false);
  const avgUnlocked = Math.round(
    (data.progressPercent / 100) * data.checkpoint.subCheckpoints.length
  );

  const handleCountClick = (level: "basic" | "intermediate" | "advanced") => {
    onCountClick({
      type: "checkpoint",
      id: data.checkpoint.id,
      name: data.checkpoint.name,
      developersByLevel: data.developersByLevel,
    });
  };

  // Base indentation for checkpoints
  const baseIndent = indentLevel === 1 ? "pl-12" : "pl-20";

  return (
    <>
      <TableRow className="bg-gray-50/50 hover:bg-gray-100/50">
        <TableCell className={baseIndent}>
          <div className="flex items-center">
            {/* Fixed-width badge area (always takes space for alignment) */}
            <div className="w-20 shrink-0 flex items-center">
              {showPhaseBadge && <PhaseBadge phase={data.checkpoint.phase} />}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 mr-2"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <ChevronDownIcon className="h-4 w-4" />
              ) : (
                <ChevronRightIcon className="h-4 w-4" />
              )}
            </Button>
            <span className="text-sm text-gray-700">{data.checkpoint.name}</span>
          </div>
        </TableCell>
        <TableCell>
          <ProgressBar percent={data.progressPercent} />
        </TableCell>
        <TableCell className="text-center">
          <CountBadge
            count={data.developerCounts.basic}
            level="basic"
            onClick={() => handleCountClick("basic")}
          />
        </TableCell>
        <TableCell className="text-center">
          <CountBadge
            count={data.developerCounts.intermediate}
            level="intermediate"
            onClick={() => handleCountClick("intermediate")}
          />
        </TableCell>
        <TableCell className="text-center">
          <CountBadge
            count={data.developerCounts.advanced}
            level="advanced"
            onClick={() => handleCountClick("advanced")}
          />
        </TableCell>
      </TableRow>
      {expanded && (
        <TableRow className="hover:bg-transparent">
          <TableCell colSpan={5} className={`${indentLevel === 1 ? "pl-20" : "pl-28"} py-1`}>
            <SubCheckpointLabels
              checkpoint={data.checkpoint}
              unlockedCount={avgUnlocked}
            />
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

// =============================================================================
// Skills Roadmap Row (Level 1 in Skills View, Level 2 in Role View)
// =============================================================================

type SkillsRoadmapRowProps = {
  data: SkillsRoadmapProgressData;
  indentLevel: number; // 0 for top-level, 1 for nested under role
  onCountClick: (context: SidePanelContext) => void;
  filterMode: RoadmapFilterMode;
};

function SkillsRoadmapRow({
  data,
  indentLevel,
  onCountClick,
  filterMode,
}: SkillsRoadmapRowProps) {
  const [expanded, setExpanded] = useState(false);
  const paddingLeft = indentLevel === 0 ? "pl-4" : "pl-12";

  const handleCountClick = (level: "basic" | "intermediate" | "advanced") => {
    onCountClick({
      type: "roadmap",
      id: data.roadmap.id,
      name: data.roadmap.name,
      developersByLevel: data.developersByLevel,
    });
  };

  // Group checkpoints by phase, sort by progress within each phase
  const groupedCheckpoints = useMemo(() => {
    let checkpoints = data.checkpoints;
    if (filterMode !== "all") {
      checkpoints = checkpoints.filter((cp) => cp.progressPercent > 0);
    }

    // Group by phase
    const byPhase: Record<CheckpointPhase, CheckpointProgressData[]> = {
      Basic: [],
      Intermediate: [],
      Advanced: [],
    };
    checkpoints.forEach((cp) => {
      byPhase[cp.checkpoint.phase].push(cp);
    });

    // Sort each phase by progress (descending)
    (Object.keys(byPhase) as CheckpointPhase[]).forEach((phase) => {
      byPhase[phase].sort((a, b) => b.progressPercent - a.progressPercent);
    });

    // Flatten with showPhaseBadge flag
    const result: { data: CheckpointProgressData; showPhaseBadge: boolean }[] = [];
    (["Basic", "Intermediate", "Advanced"] as CheckpointPhase[]).forEach((phase) => {
      byPhase[phase].forEach((cp, idx) => {
        result.push({ data: cp, showPhaseBadge: idx === 0 });
      });
    });

    return result;
  }, [data.checkpoints, filterMode]);

  return (
    <>
      <TableRow className={indentLevel > 0 ? "bg-gray-50/30" : "hover:bg-gray-50"}>
        <TableCell className={paddingLeft}>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 mr-2"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <ChevronDownIcon className="h-4 w-4" />
            ) : (
              <ChevronRightIcon className="h-4 w-4" />
            )}
          </Button>
          <span className={`font-medium ${indentLevel === 0 ? "text-gray-900" : "text-gray-700"}`}>
            {data.roadmap.name}
          </span>
        </TableCell>
        <TableCell>
          <ProgressBar percent={data.progressPercent} />
        </TableCell>
        <TableCell className="text-center">
          <CountBadge
            count={data.developerCounts.basic}
            level="basic"
            onClick={() => handleCountClick("basic")}
          />
        </TableCell>
        <TableCell className="text-center">
          <CountBadge
            count={data.developerCounts.intermediate}
            level="intermediate"
            onClick={() => handleCountClick("intermediate")}
          />
        </TableCell>
        <TableCell className="text-center">
          <CountBadge
            count={data.developerCounts.advanced}
            level="advanced"
            onClick={() => handleCountClick("advanced")}
          />
        </TableCell>
      </TableRow>
      {expanded &&
        groupedCheckpoints.map(({ data: checkpoint, showPhaseBadge }) => (
          <CheckpointRow
            key={checkpoint.checkpoint.id}
            data={checkpoint}
            onCountClick={onCountClick}
            indentLevel={indentLevel + 1}
            showPhaseBadge={showPhaseBadge}
          />
        ))}
    </>
  );
}

// =============================================================================
// Role Roadmap Row (Level 1 in Role View)
// =============================================================================

type RoleRoadmapRowProps = {
  roleRoadmap: RoleRoadmap;
  onCountClick: (context: SidePanelContext) => void;
  filterMode: RoadmapFilterMode;
};

function RoleRoadmapRow({ roleRoadmap, onCountClick, filterMode }: RoleRoadmapRowProps) {
  const [expanded, setExpanded] = useState(false);
  const data = useMemo(() => calculateRoleRoadmapProgress(roleRoadmap), [roleRoadmap]);

  const handleCountClick = (level: "basic" | "intermediate" | "advanced") => {
    onCountClick({
      type: "roadmap",
      id: data.roleRoadmap.id,
      name: data.roleRoadmap.name,
      developersByLevel: data.developersByLevel,
    });
  };

  const filteredSkillsRoadmaps = useMemo(() => {
    if (filterMode === "all") return data.skillsRoadmaps;
    return data.skillsRoadmaps.filter((sr) => sr.progressPercent > 0);
  }, [data.skillsRoadmaps, filterMode]);

  return (
    <>
      <TableRow className="hover:bg-gray-50">
        <TableCell className="pl-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 mr-2"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <ChevronDownIcon className="h-4 w-4" />
            ) : (
              <ChevronRightIcon className="h-4 w-4" />
            )}
          </Button>
          <span className="font-medium text-gray-900">{data.roleRoadmap.name}</span>
        </TableCell>
        <TableCell>
          <ProgressBar percent={data.progressPercent} />
        </TableCell>
        <TableCell className="text-center">
          <CountBadge
            count={data.developerCounts.basic}
            level="basic"
            onClick={() => handleCountClick("basic")}
          />
        </TableCell>
        <TableCell className="text-center">
          <CountBadge
            count={data.developerCounts.intermediate}
            level="intermediate"
            onClick={() => handleCountClick("intermediate")}
          />
        </TableCell>
        <TableCell className="text-center">
          <CountBadge
            count={data.developerCounts.advanced}
            level="advanced"
            onClick={() => handleCountClick("advanced")}
          />
        </TableCell>
      </TableRow>
      {expanded &&
        filteredSkillsRoadmaps.map((skillsRoadmap) => (
          <SkillsRoadmapRow
            key={skillsRoadmap.roadmap.id}
            data={skillsRoadmap}
            indentLevel={1}
            onCountClick={onCountClick}
            filterMode={filterMode}
          />
        ))}
    </>
  );
}

// =============================================================================
// Main Table Component
// =============================================================================

type RoadmapProgressTableProps = {
  onSidePanelOpen: (context: SidePanelContext) => void;
  viewMode: RoadmapViewMode;
  filterMode: RoadmapFilterMode;
};

export function RoadmapProgressTable({
  onSidePanelOpen,
  viewMode,
  filterMode,
}: RoadmapProgressTableProps) {
  const skillsRoadmapsData = useMemo(() => {
    const data = Object.values(SKILLS_ROADMAPS).map(calculateSkillsRoadmapProgress);
    return [...data].sort((a, b) => b.progressPercent - a.progressPercent);
  }, []);

  const filteredSkillsRoadmaps = useMemo(() => {
    if (filterMode === "all") return skillsRoadmapsData;
    return skillsRoadmapsData.filter((sr) => sr.progressPercent > 0);
  }, [skillsRoadmapsData, filterMode]);

  const roleRoadmapsData = useMemo(() => {
    const data = ROLE_ROADMAPS.map((role) => ({
      role,
      progress: calculateRoleRoadmapProgress(role),
    }));
    return [...data].sort((a, b) => b.progress.progressPercent - a.progress.progressPercent);
  }, []);

  return (
    <div className="rounded-lg border bg-white">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[300px]">
              <span>Roadmap</span>
              <span className="ml-2 px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 text-xs font-normal">
                {viewMode === "role" ? "Role" : "Skill"}
              </span>
            </TableHead>
            <TableHead className="w-[200px]">Progress</TableHead>
            <TableHead className="text-center w-[100px]">
              <span className="text-amber-600">Basic</span>
            </TableHead>
            <TableHead className="text-center w-[100px]">
              <span className="text-blue-600">Intermediate</span>
            </TableHead>
            <TableHead className="text-center w-[100px]">
              <span className="text-purple-600">Advanced</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {viewMode === "role" ? (
            roleRoadmapsData.map(({ role }) => (
              <RoleRoadmapRow
                key={role.id}
                roleRoadmap={role}
                onCountClick={onSidePanelOpen}
                filterMode={filterMode}
              />
            ))
          ) : (
            filteredSkillsRoadmaps.map((skillsRoadmap) => (
              <SkillsRoadmapRow
                key={skillsRoadmap.roadmap.id}
                data={skillsRoadmap}
                indentLevel={0}
                onCountClick={onSidePanelOpen}
                filterMode={filterMode}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
