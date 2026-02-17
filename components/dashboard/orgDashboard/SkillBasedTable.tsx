"use client";

import { Fragment, useEffect, useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import type { SkillsRoadmapProgressData, SidePanelContext, ProficiencyLevel } from "@/lib/dashboard/entities/roadmap/types";
import type { SkillCategoryData } from "@/components/skillmap/skillGraphTableTransform";
import { DASHBOARD_TEXT_CLASSES, DASHBOARD_BG_CLASSES } from "@/lib/dashboard/shared/utils/colors";
import { getColorForDomain } from "@/components/skillmap/skillGraphUtils";
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

const EXPANDER_CELL = "align-middle [&:has([aria-expanded])]:w-px [&:has([aria-expanded])]:py-0";

// Category badge colors (same as CategoryRows)
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
 * Skill-Based Skills Table — R9: Category-grouped view.
 * Each row is a Category. Expanding shows skills within that category.
 */
export function SkillBasedTable({
  data,
  categories,
  showAll,
  autoExpandSkillId,
  onAutoExpandConsumed,
  onSidePanelOpen,
}: SkillBasedTableProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedSkills, setExpandedSkills] = useState<Set<string>>(new Set());

  // Auto-expand to show a specific skill
  useEffect(() => {
    if (autoExpandSkillId) {
      // Find the category containing this skill
      for (const cat of categories) {
        const skill = cat.skills.find((s) => s.roadmap.id === autoExpandSkillId);
        if (skill) {
          setExpandedCategories((prev) => new Set(prev).add(cat.category));
          setExpandedSkills((prev) => new Set(prev).add(autoExpandSkillId));
          break;
        }
      }
      onAutoExpandConsumed?.();
    }
  }, [autoExpandSkillId, categories, onAutoExpandConsumed]);

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

  return (
    <div className="rounded-sm border-none overflow-hidden bg-white">
      <Table>
        <TableHeader className="border-0">
          <TableRow className="border-none hover:bg-transparent">
            <TableHead />
            <TableHead className="w-14 text-foreground font-medium">Rank</TableHead>
            <TableHead className="text-foreground font-medium">Category</TableHead>
            <TableHead className="text-foreground font-medium">Status</TableHead>
            <TableHead className="text-foreground font-medium">People</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                No skills to display.
              </TableCell>
            </TableRow>
          ) : (
            categories.map((cat, index) => (
              <CategoryRow
                key={cat.category}
                category={cat}
                rank={index + 1}
                isExpanded={expandedCategories.has(cat.category)}
                onToggle={() => toggleCategory(cat.category)}
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
// CategoryRow — Category row with expansion for skills
// =============================================================================

type CategoryRowProps = {
  category: SkillCategoryData;
  rank: number;
  isExpanded: boolean;
  onToggle: () => void;
  expandedSkills: Set<string>;
  onToggleSkill: (id: string) => void;
  showAll: boolean;
  onSidePanelOpen?: (context: SidePanelContext) => void;
};

function CategoryRow({
  category,
  rank,
  isExpanded,
  onToggle,
  expandedSkills,
  onToggleSkill,
  showAll,
  onSidePanelOpen,
}: CategoryRowProps) {
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

  return (
    <Fragment>
      <TableRow
        className={`${DASHBOARD_BG_CLASSES.borderLight} hover:bg-gray-50/80 ${isExpanded ? "bg-muted" : ""}`}
      >
        <TableCell className={EXPANDER_CELL}>
          <Button
            className="size-7 text-muted-foreground"
            onClick={onToggle}
            aria-expanded={isExpanded}
            aria-label={
              isExpanded
                ? `Collapse ${category.category}`
                : `Expand ${category.category}`
            }
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
        <TableCell>
          <span
            className={`${BADGE_CLASS} px-2 py-0.5`}
            style={badgeStyle(color)}
          >
            {category.category}
          </span>
        </TableCell>
        <TableCell>
          <ProficiencyProgressBar percent={category.progressPercent} />
        </TableCell>
        <TableCell>
          <PeopleCountBadges
            counts={category.developerCounts}
            onBadgeClick={onSidePanelOpen ? handleBadgeClick : undefined}
          />
        </TableCell>
      </TableRow>

      {/* Expanded: Skills within category */}
      {isExpanded && (
        <TableRow className="hover:bg-transparent">
          <TableCell colSpan={5} className="p-0">
            <SkillsWithinCategory
              skills={category.skills}
              showAll={showAll}
              expandedSkills={expandedSkills}
              onToggleSkill={onToggleSkill}
              onSidePanelOpen={onSidePanelOpen}
            />
          </TableCell>
        </TableRow>
      )}
    </Fragment>
  );
}

// =============================================================================
// SkillsWithinCategory — Nested skills table
// =============================================================================

type SkillsWithinCategoryProps = {
  skills: SkillsRoadmapProgressData[];
  showAll: boolean;
  expandedSkills: Set<string>;
  onToggleSkill: (id: string) => void;
  onSidePanelOpen?: (context: SidePanelContext) => void;
};

function SkillsWithinCategory({
  skills,
  showAll,
  expandedSkills,
  onToggleSkill,
  onSidePanelOpen,
}: SkillsWithinCategoryProps) {
  const filteredSkills = showAll
    ? skills
    : skills.filter((s) => getTotalPeople(s.developerCounts) > 0);

  return (
    <Table>
      <TableBody>
        {filteredSkills.map((skill) => {
          const isExpanded = expandedSkills.has(skill.roadmap.id);
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

          return (
            <Fragment key={skill.roadmap.id}>
              <TableRow
                className={`${DASHBOARD_BG_CLASSES.borderLight} pl-8 hover:bg-gray-50/80 ${isExpanded ? "bg-muted/50" : ""}`}
              >
                <TableCell className="w-10 pl-8">
                  {hasCheckpoints ? (
                    <Button
                      className="size-6 text-muted-foreground"
                      onClick={() => onToggleSkill(skill.roadmap.id)}
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
                  <div className="flex items-center gap-3">
                    <div
                      className="size-4 rounded shrink-0"
                      style={{ backgroundColor: getColorForDomain(skill.roadmap.name) }}
                      aria-hidden
                    />
                    <span className="text-sm text-gray-900 font-medium">
                      {skill.roadmap.name}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
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
                  <TableCell colSpan={4} className="p-0 pl-8">
                    <CheckpointRows
                      checkpoints={skill.checkpoints}
                      showAll={showAll}
                      onSidePanelOpen={onSidePanelOpen}
                    />
                  </TableCell>
                </TableRow>
              )}
            </Fragment>
          );
        })}
      </TableBody>
    </Table>
  );
}
