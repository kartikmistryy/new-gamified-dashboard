"use client";

import { Fragment, useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import type {
  CategoryProgressData,
  CheckpointProgressData,
  SkillsRoadmapProgressData,
  SidePanelContext,
  ProficiencyLevel,
} from "@/lib/dashboard/entities/roadmap/types";
import {
  getTotalPeople,
} from "@/lib/dashboard/entities/roadmap/orgSkillTableData";
import { DASHBOARD_BG_CLASSES } from "@/lib/dashboard/shared/utils/colors";
import { PeopleCountBadges, ProficiencyProgressBar, BADGE_CLASS, badgeStyle } from "./PeopleStackedBar";
import { SubCheckpointRows } from "./SubCheckpointRows";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";

// Category badge colors
const CATEGORY_COLORS: Record<string, string> = {
  "Programming Languages": "#8B5CF6",
  "Frontend Technologies": "#EC4899",
  "Backend Frameworks & Platforms": "#14B8A6",
  "Mobile & Cross-Platform": "#F59E0B",
  "Databases & Data Storage": "#3B82F6",
  "DevOps & Cloud Infrastructure": "#10B981",
  "CS Fundamentals & System Design": "#6366F1",
  "Emerging Technology": "#EF4444",
  "Others": "#6B7280",
};

// Indentation levels (toggle is now part of name cell)
const INDENT = {
  category: "pl-6",
  skill: "pl-12",
  checkpoint: "pl-16",
  subCheckpoint: "pl-20",
};

// =============================================================================
// CategoryRows — Category-based hierarchy (R3, R11-R13, R16-R18)
// Categories are always expanded (R11)
// All levels sorted by proficiency (R13)
// Others category always last (R16)
// Toggle coupled with name (R17)
// =============================================================================

type CategoryRowsProps = {
  categories: CategoryProgressData[];
  showAll: boolean;
  onSkillClick?: (skillRoadmapId: string) => void;
  onSidePanelOpen?: (context: SidePanelContext) => void;
};

export function CategoryRows({
  categories,
  showAll,
  onSkillClick,
  onSidePanelOpen,
}: CategoryRowsProps) {
  const [expandedSkills, setExpandedSkills] = useState<Set<string>>(new Set());
  const [expandedCheckpoints, setExpandedCheckpoints] = useState<Set<string>>(new Set());

  const toggleSkill = (id: string) => {
    setExpandedSkills((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleCheckpoint = (id: string) => {
    setExpandedCheckpoints((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // R13 + R16: Sort categories by proficiency, but "Others" always last
  const sortedCategories = [...categories]
    .filter((cat) => showAll || getTotalPeople(cat.developerCounts) > 0)
    .sort((a, b) => {
      // R16: Others always last
      if (a.category === "Others") return 1;
      if (b.category === "Others") return -1;
      // R13: Sort by proficiency
      return b.progressPercent - a.progressPercent;
    });

  return (
    <Table>
      <TableBody>
        {sortedCategories.map((cat) => {
          const color = CATEGORY_COLORS[cat.category] ?? "#6B7280";
          const isOthers = cat.category === "Others";

          const handleCategoryBadgeClick = (level: ProficiencyLevel) => {
            if (onSidePanelOpen) {
              onSidePanelOpen({
                type: "roadmap",
                id: `category:${cat.category}`,
                name: cat.category,
                developersByLevel: cat.developersByLevel,
              });
            }
          };

          // R13: Sort skills by proficiency
          const sortedSkills = [...cat.skills]
            .filter((s) => showAll || getTotalPeople(s.developerCounts) > 0)
            .sort((a, b) => b.progressPercent - a.progressPercent);

          // R13: Sort checkpoints by proficiency
          const sortedCheckpoints = [...(cat.checkpoints ?? [])]
            .filter((cp) => showAll || getTotalPeople(cp.developerCounts) > 0)
            .sort((a, b) => b.progressPercent - a.progressPercent);

          return (
            <Fragment key={cat.category}>
              {/* Category header row - R11: No toggle, always expanded */}
              <TableRow className={`${DASHBOARD_BG_CLASSES.borderLight} bg-gray-50/80 hover:bg-gray-100/80`}>
                <TableCell className={INDENT.category}>
                  <div className="flex items-center gap-2">
                    <span
                      className={`${BADGE_CLASS} px-2 py-0.5`}
                      style={badgeStyle(color)}
                    >
                      {cat.category}
                    </span>
                    {isOthers && (
                      <span className="text-xs text-gray-400">(Role Checkpoints)</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className={INDENT.category}>
                  <ProficiencyProgressBar percent={cat.progressPercent} />
                </TableCell>
                <TableCell>
                  <PeopleCountBadges
                    counts={cat.developerCounts}
                    onBadgeClick={onSidePanelOpen ? handleCategoryBadgeClick : undefined}
                  />
                </TableCell>
              </TableRow>

              {/* R11: Skills always shown (no toggle needed) */}
              {sortedSkills.map((skill) => (
                <SkillRow
                  key={skill.roadmap.id}
                  skill={skill}
                  isExpanded={expandedSkills.has(skill.roadmap.id)}
                  onToggle={() => toggleSkill(skill.roadmap.id)}
                  showAll={showAll}
                  onSkillClick={onSkillClick}
                  onSidePanelOpen={onSidePanelOpen}
                  expandedCheckpoints={expandedCheckpoints}
                  onToggleCheckpoint={toggleCheckpoint}
                />
              ))}

              {/* Checkpoints in "Others" category */}
              {sortedCheckpoints.map((cp) => (
                <CheckpointRowSimple
                  key={cp.checkpoint.id}
                  checkpoint={cp}
                  isExpanded={expandedCheckpoints.has(cp.checkpoint.id)}
                  onToggle={() => toggleCheckpoint(cp.checkpoint.id)}
                  showAll={showAll}
                  onSidePanelOpen={onSidePanelOpen}
                  indent="skill"
                />
              ))}
            </Fragment>
          );
        })}
      </TableBody>
    </Table>
  );
}

// =============================================================================
// SkillRow — Skill-based roadmap row within a category (R17: toggle in name cell)
// =============================================================================

type SkillRowProps = {
  skill: SkillsRoadmapProgressData;
  isExpanded: boolean;
  onToggle: () => void;
  showAll: boolean;
  onSkillClick?: (skillRoadmapId: string) => void;
  onSidePanelOpen?: (context: SidePanelContext) => void;
  expandedCheckpoints: Set<string>;
  onToggleCheckpoint: (id: string) => void;
};

function SkillRow({
  skill,
  isExpanded,
  onToggle,
  showAll,
  onSkillClick,
  onSidePanelOpen,
  expandedCheckpoints,
  onToggleCheckpoint,
}: SkillRowProps) {
  const handleBadgeClick = (level: ProficiencyLevel) => {
    if (onSidePanelOpen) {
      onSidePanelOpen({
        type: "roadmap",
        id: skill.roadmap.id,
        name: skill.roadmap.name,
        developersByLevel: skill.developersByLevel,
      });
    }
  };

  const hasCheckpoints = skill.checkpoints.length > 0;

  // R13: Sort checkpoints by proficiency
  const sortedCheckpoints = [...skill.checkpoints]
    .filter((cp) => showAll || getTotalPeople(cp.developerCounts) > 0)
    .sort((a, b) => b.progressPercent - a.progressPercent);

  return (
    <>
      <TableRow
        className={`${DASHBOARD_BG_CLASSES.borderLight} hover:bg-gray-50/80 ${isExpanded ? "bg-muted/50" : ""}`}
      >
        {/* R17: Toggle is now part of name cell with indentation */}
        <TableCell className={INDENT.skill}>
          <div className="flex items-center gap-1">
            {hasCheckpoints ? (
              <Button
                className="size-6 text-muted-foreground shrink-0"
                onClick={onToggle}
                aria-expanded={isExpanded}
                size="icon"
                variant="ghost"
              >
                {isExpanded ? (
                  <ChevronUpIcon className="w-4 h-4 opacity-60" aria-hidden />
                ) : (
                  <ChevronDownIcon className="w-4 h-4 opacity-60" aria-hidden />
                )}
              </Button>
            ) : (
              <span className="size-6 shrink-0" />
            )}
            <span
              className={`text-sm text-gray-900 font-medium ${onSkillClick ? "cursor-pointer underline-offset-2 hover:underline" : ""}`}
              onClick={onSkillClick ? () => onSkillClick(skill.roadmap.id) : undefined}
            >
              {skill.roadmap.name}
            </span>
          </div>
        </TableCell>
        <TableCell className={INDENT.skill}>
          <ProficiencyProgressBar percent={skill.progressPercent} />
        </TableCell>
        <TableCell onClick={(e) => e.stopPropagation()}>
          <PeopleCountBadges
            counts={skill.developerCounts}
            onBadgeClick={onSidePanelOpen ? handleBadgeClick : undefined}
          />
        </TableCell>
      </TableRow>

      {/* Expanded: Skill checkpoints */}
      {isExpanded &&
        sortedCheckpoints.map((cp) => (
          <CheckpointRowSimple
            key={cp.checkpoint.id}
            checkpoint={cp}
            isExpanded={expandedCheckpoints.has(cp.checkpoint.id)}
            onToggle={() => onToggleCheckpoint(cp.checkpoint.id)}
            showAll={showAll}
            onSidePanelOpen={onSidePanelOpen}
            indent="checkpoint"
          />
        ))}
    </>
  );
}

// =============================================================================
// CheckpointRowSimple — Checkpoint without phase badge (R6, R17, R18)
// =============================================================================

type CheckpointRowSimpleProps = {
  checkpoint: CheckpointProgressData;
  isExpanded: boolean;
  onToggle: () => void;
  showAll: boolean;
  onSidePanelOpen?: (context: SidePanelContext) => void;
  indent?: "skill" | "checkpoint";
};

function CheckpointRowSimple({
  checkpoint,
  isExpanded,
  onToggle,
  showAll,
  onSidePanelOpen,
  indent = "skill",
}: CheckpointRowSimpleProps) {
  const cp = checkpoint;
  const hasSubCheckpoints = cp.checkpoint.subCheckpoints.length > 0;
  const indentClass = indent === "checkpoint" ? INDENT.checkpoint : INDENT.skill;

  const handleBadgeClick = (level: ProficiencyLevel) => {
    if (onSidePanelOpen) {
      onSidePanelOpen({
        type: "checkpoint",
        id: cp.checkpoint.id,
        name: cp.checkpoint.name,
        developersByLevel: cp.developersByLevel,
      });
    }
  };

  return (
    <>
      <TableRow className={`${DASHBOARD_BG_CLASSES.borderLight} hover:bg-gray-50/60`}>
        {/* R17: Toggle is now part of name cell with indentation */}
        <TableCell className={indentClass}>
          <div className="flex items-center gap-1">
            {hasSubCheckpoints ? (
              <Button
                className="size-5 text-muted-foreground shrink-0"
                onClick={onToggle}
                aria-expanded={isExpanded}
                size="icon"
                variant="ghost"
              >
                {isExpanded ? (
                  <ChevronUpIcon className="w-3 h-3 opacity-60" aria-hidden />
                ) : (
                  <ChevronDownIcon className="w-3 h-3 opacity-60" aria-hidden />
                )}
              </Button>
            ) : (
              <span className="size-5 shrink-0" />
            )}
            <span className="text-sm text-gray-600">{cp.checkpoint.name}</span>
          </div>
        </TableCell>
        <TableCell className={indentClass}>
          <ProficiencyProgressBar percent={cp.progressPercent} />
        </TableCell>
        <TableCell>
          <PeopleCountBadges
            counts={cp.developerCounts}
            onBadgeClick={onSidePanelOpen ? handleBadgeClick : undefined}
          />
        </TableCell>
      </TableRow>

      {/* R18: Sub-checkpoints aligned with parent checkpoint */}
      {isExpanded && hasSubCheckpoints && (
        <TableRow className="hover:bg-transparent">
          <TableCell colSpan={3} className="p-0">
            <SubCheckpointRows
              checkpoint={cp.checkpoint}
              showAll={showAll}
              unlockCounts={cp.subCheckpointUnlockCounts}
              indentClass={indent === "checkpoint" ? INDENT.subCheckpoint : INDENT.checkpoint}
            />
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
