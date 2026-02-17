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
  filterUnlockedCheckpoints,
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

// =============================================================================
// CategoryRows — Category-based hierarchy (R3)
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
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedSkills, setExpandedSkills] = useState<Set<string>>(new Set());
  const [expandedCheckpoints, setExpandedCheckpoints] = useState<Set<string>>(new Set());

  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  };

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

  // Filter categories based on showAll
  const filteredCategories = categories.filter((cat) => {
    if (showAll) return true;
    return getTotalPeople(cat.developerCounts) > 0;
  });

  return (
    <Table>
      <TableBody>
        {filteredCategories.map((cat) => {
          const isExpanded = expandedCategories.has(cat.category);
          const color = CATEGORY_COLORS[cat.category] ?? "#6B7280";
          // Others category is collapsed by default
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

          return (
            <Fragment key={cat.category}>
              {/* Category header row */}
              <TableRow className={`${DASHBOARD_BG_CLASSES.borderLight} bg-gray-50/80 hover:bg-gray-100/80`}>
                <TableCell className="w-10">
                  <Button
                    className="size-7 text-muted-foreground"
                    onClick={() => toggleCategory(cat.category)}
                    aria-expanded={isExpanded}
                    aria-label={isExpanded ? `Collapse ${cat.category}` : `Expand ${cat.category}`}
                    size="icon"
                    variant="ghost"
                  >
                    {isExpanded ? (
                      <ChevronUpIcon className="opacity-60" aria-hidden />
                    ) : (
                      <ChevronDownIcon className="opacity-60" aria-hidden />
                    )}
                  </Button>
                </TableCell>
                <TableCell>
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
                <TableCell>
                  <ProficiencyProgressBar percent={cat.progressPercent} />
                </TableCell>
                <TableCell>
                  <PeopleCountBadges
                    counts={cat.developerCounts}
                    onBadgeClick={onSidePanelOpen ? handleCategoryBadgeClick : undefined}
                  />
                </TableCell>
              </TableRow>

              {/* Expanded: Skills or Checkpoints */}
              {isExpanded && (
                <>
                  {/* Skills in this category */}
                  {cat.skills
                    .filter((s) => showAll || getTotalPeople(s.developerCounts) > 0)
                    .map((skill) => (
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

                  {/* Checkpoints in "Others" category (no phase badge per R6) */}
                  {cat.checkpoints
                    ?.filter((cp) => showAll || getTotalPeople(cp.developerCounts) > 0)
                    .map((cp) => (
                      <CheckpointRowSimple
                        key={cp.checkpoint.id}
                        checkpoint={cp}
                        isExpanded={expandedCheckpoints.has(cp.checkpoint.id)}
                        onToggle={() => toggleCheckpoint(cp.checkpoint.id)}
                        showAll={showAll}
                        onSidePanelOpen={onSidePanelOpen}
                      />
                    ))}
                </>
              )}
            </Fragment>
          );
        })}
      </TableBody>
    </Table>
  );
}

// =============================================================================
// SkillRow — Skill-based roadmap row within a category
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

  return (
    <>
      <TableRow
        className={`${DASHBOARD_BG_CLASSES.borderLight} pl-8 hover:bg-gray-50/80 ${isExpanded ? "bg-muted/50" : ""}`}
      >
        <TableCell className="w-10 pl-8">
          {hasCheckpoints ? (
            <Button
              className="size-6 text-muted-foreground"
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
          ) : null}
        </TableCell>
        <TableCell>
          <span
            className={`text-sm text-gray-900 font-medium ${onSkillClick ? "cursor-pointer underline-offset-2 hover:underline" : ""}`}
            onClick={onSkillClick ? () => onSkillClick(skill.roadmap.id) : undefined}
          >
            {skill.roadmap.name}
          </span>
        </TableCell>
        <TableCell>
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
        skill.checkpoints
          .filter((cp) => showAll || getTotalPeople(cp.developerCounts) > 0)
          .map((cp) => (
            <CheckpointRowSimple
              key={cp.checkpoint.id}
              checkpoint={cp}
              isExpanded={expandedCheckpoints.has(cp.checkpoint.id)}
              onToggle={() => onToggleCheckpoint(cp.checkpoint.id)}
              showAll={showAll}
              onSidePanelOpen={onSidePanelOpen}
              indent={2}
            />
          ))}
    </>
  );
}

// =============================================================================
// CheckpointRowSimple — Checkpoint without phase badge (R6)
// =============================================================================

type CheckpointRowSimpleProps = {
  checkpoint: CheckpointProgressData;
  isExpanded: boolean;
  onToggle: () => void;
  showAll: boolean;
  onSidePanelOpen?: (context: SidePanelContext) => void;
  indent?: number;
};

function CheckpointRowSimple({
  checkpoint,
  isExpanded,
  onToggle,
  showAll,
  onSidePanelOpen,
  indent = 1,
}: CheckpointRowSimpleProps) {
  const cp = checkpoint;
  const hasSubCheckpoints = cp.checkpoint.subCheckpoints.length > 0;
  const paddingClass = indent === 2 ? "pl-16" : "pl-8";

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
        <TableCell className={`w-10 ${paddingClass}`}>
          {hasSubCheckpoints ? (
            <Button
              className="size-5 text-muted-foreground"
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
          ) : null}
        </TableCell>
        <TableCell>
          <span className="text-sm text-gray-600">{cp.checkpoint.name}</span>
        </TableCell>
        <TableCell>
          <ProficiencyProgressBar percent={cp.progressPercent} />
        </TableCell>
        <TableCell>
          <PeopleCountBadges
            counts={cp.developerCounts}
            onBadgeClick={onSidePanelOpen ? handleBadgeClick : undefined}
          />
        </TableCell>
      </TableRow>

      {/* Sub-checkpoints */}
      {isExpanded && hasSubCheckpoints && (
        <TableRow className="hover:bg-transparent">
          <TableCell colSpan={4} className={`p-0 ${paddingClass}`}>
            <SubCheckpointRows
              checkpoint={cp.checkpoint}
              showAll={showAll}
              unlockCounts={cp.subCheckpointUnlockCounts}
            />
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
