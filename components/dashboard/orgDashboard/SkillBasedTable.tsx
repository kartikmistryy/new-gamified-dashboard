"use client";

import { Fragment, useEffect, useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import type { SkillsRoadmapProgressData, SidePanelContext, ProficiencyLevel } from "@/lib/dashboard/entities/roadmap/types";
import type { SkillCategoryData } from "@/components/skillmap/skillGraphTableTransform";
import { DASHBOARD_TEXT_CLASSES, DASHBOARD_BG_CLASSES } from "@/lib/dashboard/shared/utils/colors";
import { getTotalPeople } from "@/lib/dashboard/entities/roadmap/orgSkillTableData";
import { PeopleCountBadges, ProficiencyProgressBar, BADGE_CLASS, badgeStyle } from "./PeopleStackedBar";
import { CheckpointRows } from "./CheckpointRows";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
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

// Indentation levels (toggle is now part of name cell) - R17
const INDENT = {
  category: "",
  skill: "pl-8",
  checkpoint: "pl-14",
};

type SkillBasedTableProps = {
  data: SkillsRoadmapProgressData[];
  /** R9: Skills grouped by category */
  categories: SkillCategoryData[];
  showAll: boolean;
  autoExpandSkillId?: string | null;
  onAutoExpandConsumed?: () => void;
  onSidePanelOpen?: (context: SidePanelContext) => void;
};

/**
 * Skill-Based Skills Table — R9, R11-R13, R16-R17
 * Categories are always expanded (R11)
 * All levels sorted by proficiency (R13)
 * Others category always last (R16)
 * Toggle coupled with name (R17)
 */
export function SkillBasedTable({
  data,
  categories,
  showAll,
  autoExpandSkillId,
  onAutoExpandConsumed,
  onSidePanelOpen,
}: SkillBasedTableProps) {
  const [expandedSkills, setExpandedSkills] = useState<Set<string>>(new Set());

  // Auto-expand to show a specific skill
  useEffect(() => {
    if (autoExpandSkillId) {
      setExpandedSkills((prev) => new Set(prev).add(autoExpandSkillId));
      onAutoExpandConsumed?.();
    }
  }, [autoExpandSkillId, onAutoExpandConsumed]);

  const toggleSkill = (id: string) => {
    setExpandedSkills((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // R16: Sort categories but keep "Others" last
  const sortedCategories = [...categories].sort((a, b) => {
    if (a.category === "Others") return 1;
    if (b.category === "Others") return -1;
    return b.progressPercent - a.progressPercent;
  });

  return (
    <div className="rounded-sm border-none overflow-hidden bg-white">
      <Table className="table-fixed">
        <colgroup>
          <col className="w-14" />
          <col className="w-[40%]" />
          <col className="w-[35%]" />
          <col />
        </colgroup>
        <TableHeader className="border-0">
          <TableRow className="border-none hover:bg-transparent">
            <TableHead className="w-14 text-foreground font-medium">Rank</TableHead>
            <TableHead className="text-foreground font-medium">Category</TableHead>
            <TableHead className="text-foreground font-medium">Status</TableHead>
            <TableHead className="text-foreground font-medium">People</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedCategories.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center text-gray-500">
                No skills to display.
              </TableCell>
            </TableRow>
          ) : (
            sortedCategories.map((cat, index) => (
              <CategorySection
                key={cat.category}
                category={cat}
                rank={index + 1}
                expandedSkills={expandedSkills}
                onToggleSkill={toggleSkill}
                showAll={showAll}
                onSidePanelOpen={onSidePanelOpen}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

// =============================================================================
// CategorySection — Category row + skills (R11: always expanded)
// =============================================================================

type CategorySectionProps = {
  category: SkillCategoryData;
  rank: number;
  expandedSkills: Set<string>;
  onToggleSkill: (id: string) => void;
  showAll: boolean;
  onSidePanelOpen?: (context: SidePanelContext) => void;
};

function CategorySection({
  category,
  rank,
  expandedSkills,
  onToggleSkill,
  showAll,
  onSidePanelOpen,
}: CategorySectionProps) {
  const color = CATEGORY_COLORS[category.category] ?? "#6B7280";

  const handleBadgeClick = (level: ProficiencyLevel) => {
    if (onSidePanelOpen) {
      onSidePanelOpen({
        type: "roadmap",
        id: `category:${category.category}`,
        name: category.category,
        developersByLevel: category.developersByLevel,
      });
    }
  };

  // R13: Sort skills by proficiency
  const sortedSkills = [...category.skills]
    .filter((s) => showAll || getTotalPeople(s.developerCounts) > 0)
    .sort((a, b) => b.progressPercent - a.progressPercent);

  return (
    <Fragment>
      {/* Category row - R11: No toggle button */}
      <TableRow
        className={`${DASHBOARD_BG_CLASSES.borderLight} hover:bg-gray-50/80 bg-gray-50/50`}
      >
        <TableCell className="w-14">
          <span
            className={
              rank <= 3
                ? "text-foreground font-bold"
                : DASHBOARD_TEXT_CLASSES.rankMuted
            }
          >
            {rank}
          </span>
        </TableCell>
        <TableCell className={INDENT.category}>
          <span
            className={`${BADGE_CLASS} px-2 py-0.5`}
            style={badgeStyle(color)}
          >
            {category.category}
          </span>
        </TableCell>
        <TableCell className={INDENT.category}>
          <ProficiencyProgressBar percent={category.progressPercent} />
        </TableCell>
        <TableCell>
          <PeopleCountBadges
            counts={category.developerCounts}
            onBadgeClick={onSidePanelOpen ? handleBadgeClick : undefined}
          />
        </TableCell>
      </TableRow>

      {/* R11: Skills always shown (no toggle needed) */}
      {sortedSkills.map((skill) => (
        <SkillRow
          key={skill.roadmap.id}
          skill={skill}
          isExpanded={expandedSkills.has(skill.roadmap.id)}
          onToggle={() => onToggleSkill(skill.roadmap.id)}
          showAll={showAll}
          onSidePanelOpen={onSidePanelOpen}
        />
      ))}
    </Fragment>
  );
}

// =============================================================================
// SkillRow — Skill row with checkpoint expansion (R17: toggle in name cell)
// =============================================================================

type SkillRowProps = {
  skill: SkillsRoadmapProgressData;
  isExpanded: boolean;
  onToggle: () => void;
  showAll: boolean;
  onSidePanelOpen?: (context: SidePanelContext) => void;
};

function SkillRow({
  skill,
  isExpanded,
  onToggle,
  showAll,
  onSidePanelOpen,
}: SkillRowProps) {
  const hasCheckpoints = skill.checkpoints.length > 0;

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

  // R13: Sort checkpoints by proficiency
  const sortedCheckpoints = [...skill.checkpoints]
    .filter((cp) => showAll || getTotalPeople(cp.developerCounts) > 0)
    .sort((a, b) => b.progressPercent - a.progressPercent);

  return (
    <>
      <TableRow
        className={`${DASHBOARD_BG_CLASSES.borderLight} hover:bg-gray-50/80 ${isExpanded ? "bg-muted/50" : ""}`}
      >
        <TableCell className="w-14" />
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
            <span className="text-sm text-gray-900 font-medium">
              {skill.roadmap.name}
            </span>
          </div>
        </TableCell>
        <TableCell className={INDENT.skill}>
          <ProficiencyProgressBar percent={skill.progressPercent} />
        </TableCell>
        <TableCell>
          <PeopleCountBadges
            counts={skill.developerCounts}
            onBadgeClick={onSidePanelOpen ? handleBadgeClick : undefined}
          />
        </TableCell>
      </TableRow>

      {/* Expanded: Skill checkpoints */}
      {isExpanded && hasCheckpoints && (
        <TableRow className="hover:bg-transparent">
          <TableCell colSpan={4} className="p-0">
            <div className={INDENT.checkpoint}>
              <CheckpointRows
                checkpoints={sortedCheckpoints}
                showAll={showAll}
                onSidePanelOpen={onSidePanelOpen}
              />
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
