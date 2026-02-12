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
  AI_ENGINEER_ROLE,
  SKILLS_ROADMAPS,
  calculateRoleRoadmapProgress,
  calculateSkillsRoadmapProgress,
  getProficiencyColor,
} from "@/lib/dashboard/entities/roadmap";
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
// Progress Bar Component
// =============================================================================

type ProgressBarProps = {
  percent: number;
  className?: string;
};

function ProgressBar({ percent, className = "" }: ProgressBarProps) {
  const clampedPercent = Math.max(0, Math.min(100, percent));
  return (
    <div className={`h-2 w-32 rounded-full bg-gray-200 ${className}`}>
      <div
        className="h-full rounded-full bg-indigo-500 transition-all duration-300"
        style={{ width: `${clampedPercent}%` }}
      />
    </div>
  );
}

// =============================================================================
// Developer Count Badge (Clickable)
// =============================================================================

type CountBadgeProps = {
  count: number;
  level: "basic" | "proficient" | "advanced";
  onClick: () => void;
};

function CountBadge({ count, level, onClick }: CountBadgeProps) {
  const colors = {
    basic: "bg-amber-100 text-amber-700 hover:bg-amber-200",
    proficient: "bg-blue-100 text-blue-700 hover:bg-blue-200",
    advanced: "bg-green-100 text-green-700 hover:bg-green-200",
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
};

function CheckpointRow({ data, onCountClick, indentLevel }: CheckpointRowProps) {
  const [expanded, setExpanded] = useState(false);
  const avgUnlocked = Math.round(
    (data.progressPercent / 100) * data.checkpoint.subCheckpoints.length
  );

  const handleCountClick = (level: "basic" | "proficient" | "advanced") => {
    onCountClick({
      type: "checkpoint",
      id: data.checkpoint.id,
      name: data.checkpoint.name,
      developersByLevel: data.developersByLevel,
    });
  };

  // Indentation: pl-12 for level 1, pl-20 for level 2
  const paddingLeft = indentLevel === 1 ? "pl-12" : "pl-20";

  return (
    <>
      <TableRow className="bg-gray-50/50 hover:bg-gray-100/50">
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
          <span className="text-sm text-gray-700 mr-2">{data.checkpoint.name}</span>
          <PhaseBadge phase={data.checkpoint.phase} />
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <ProgressBar percent={data.progressPercent} />
            <span className="text-sm text-gray-600">{data.progressPercent}%</span>
          </div>
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
            count={data.developerCounts.proficient}
            level="proficient"
            onClick={() => handleCountClick("proficient")}
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

  const handleCountClick = (level: "basic" | "proficient" | "advanced") => {
    onCountClick({
      type: "roadmap",
      id: data.roadmap.id,
      name: data.roadmap.name,
      developersByLevel: data.developersByLevel,
    });
  };

  const filteredCheckpoints = useMemo(() => {
    if (filterMode === "all") return data.checkpoints;
    return data.checkpoints.filter((cp) => cp.progressPercent > 0);
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
          <div className="flex items-center gap-2">
            <ProgressBar percent={data.progressPercent} />
            <span className="text-sm text-gray-600">{data.progressPercent}%</span>
          </div>
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
            count={data.developerCounts.proficient}
            level="proficient"
            onClick={() => handleCountClick("proficient")}
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
        filteredCheckpoints.map((checkpoint) => (
          <CheckpointRow
            key={checkpoint.checkpoint.id}
            data={checkpoint}
            onCountClick={onCountClick}
            indentLevel={indentLevel + 1}
          />
        ))}
    </>
  );
}

// =============================================================================
// Role Roadmap Row (Level 1 in Role View)
// =============================================================================

type RoleRoadmapRowProps = {
  onCountClick: (context: SidePanelContext) => void;
  filterMode: RoadmapFilterMode;
};

function RoleRoadmapRow({ onCountClick, filterMode }: RoleRoadmapRowProps) {
  const [expanded, setExpanded] = useState(false);
  const data = useMemo(() => calculateRoleRoadmapProgress(AI_ENGINEER_ROLE), []);

  const handleCountClick = (level: "basic" | "proficient" | "advanced") => {
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
          <span className="ml-2 text-xs text-gray-500">(Role)</span>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <ProgressBar percent={data.progressPercent} />
            <span className="text-sm text-gray-600">{data.progressPercent}%</span>
          </div>
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
            count={data.developerCounts.proficient}
            level="proficient"
            onClick={() => handleCountClick("proficient")}
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
    return Object.values(SKILLS_ROADMAPS).map(calculateSkillsRoadmapProgress);
  }, []);

  const filteredSkillsRoadmaps = useMemo(() => {
    if (filterMode === "all") return skillsRoadmapsData;
    return skillsRoadmapsData.filter((sr) => sr.progressPercent > 0);
  }, [skillsRoadmapsData, filterMode]);

  return (
    <div className="rounded-lg border bg-white">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[300px]">Roadmap</TableHead>
            <TableHead className="w-[200px]">Progress</TableHead>
            <TableHead className="text-center w-[100px]">
              <span className="text-amber-600">Basic</span>
            </TableHead>
            <TableHead className="text-center w-[100px]">
              <span className="text-blue-600">Proficient</span>
            </TableHead>
            <TableHead className="text-center w-[100px]">
              <span className="text-green-600">Advanced</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {viewMode === "role" ? (
            <RoleRoadmapRow onCountClick={onSidePanelOpen} filterMode={filterMode} />
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
