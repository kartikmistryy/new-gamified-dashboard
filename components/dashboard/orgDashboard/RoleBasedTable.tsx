"use client";

import { Fragment, useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import type { RoleRoadmapProgressData, SidePanelContext, ProficiencyLevel } from "@/lib/dashboard/entities/roadmap/types";
import { DASHBOARD_TEXT_CLASSES, DASHBOARD_BG_CLASSES } from "@/lib/dashboard/shared/utils/colors";
import { PeopleCountBadges, ProficiencyProgressBar } from "./PeopleStackedBar";
import { CategoryRows } from "./CategoryRows";
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

type RoleBasedTableProps = {
  data: RoleRoadmapProgressData[];
  showAll: boolean;
  onSkillClick?: (skillRoadmapId: string) => void;
  onSidePanelOpen?: (context: SidePanelContext) => void;
};

/**
 * Role-Based Skills Table — L1 level (R3, R17).
 * Each row is a Role Roadmap. Expanding shows category-grouped content:
 * - Categories with skills grouped inside
 * - "Others" category contains role checkpoints
 * R17: Toggle is coupled with Role Name (no separate toggle column)
 */
export function RoleBasedTable({ data, showAll, onSkillClick, onSidePanelOpen }: RoleBasedTableProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

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
            <TableHead className="text-foreground font-medium">Role Name</TableHead>
            <TableHead className="text-foreground font-medium">Status</TableHead>
            <TableHead className="text-foreground font-medium">People</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center text-gray-500">
                No roles to display.
              </TableCell>
            </TableRow>
          ) : (
            data.map((role, index) => (
              <RoleRow
                key={role.roleRoadmap.id}
                role={role}
                rank={index + 1}
                isExpanded={expandedIds.has(role.roleRoadmap.id)}
                onToggle={() => toggleExpand(role.roleRoadmap.id)}
                showAll={showAll}
                onSkillClick={onSkillClick}
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
// RoleRow — Single role row with expansion logic (R17: toggle in name cell)
// =============================================================================

type RoleRowProps = {
  role: RoleRoadmapProgressData;
  rank: number;
  isExpanded: boolean;
  onToggle: () => void;
  showAll: boolean;
  onSkillClick?: (skillRoadmapId: string) => void;
  onSidePanelOpen?: (context: SidePanelContext) => void;
};

function RoleRow({ role, rank, isExpanded, onToggle, showAll, onSkillClick, onSidePanelOpen }: RoleRowProps) {
  const handleBadgeClick = (level: ProficiencyLevel) => {
    if (onSidePanelOpen) {
      onSidePanelOpen({
        type: "roadmap",
        id: role.roleRoadmap.id,
        name: role.roleRoadmap.name,
        developersByLevel: role.developersByLevel,
      });
    }
  };

  return (
    <Fragment>
      <TableRow
        className={`${DASHBOARD_BG_CLASSES.borderLight} hover:bg-gray-50/80 ${isExpanded ? "bg-muted" : ""}`}
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
        {/* R17: Toggle is now part of name cell */}
        <TableCell>
          <div className="flex items-center gap-1">
            <Button
              className="size-7 text-muted-foreground shrink-0"
              onClick={onToggle}
              aria-expanded={isExpanded}
              aria-label={
                isExpanded
                  ? `Collapse ${role.roleRoadmap.name}`
                  : `Expand ${role.roleRoadmap.name}`
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
            <span className="font-medium text-gray-900">{role.roleRoadmap.name}</span>
          </div>
        </TableCell>
        <TableCell>
          <ProficiencyProgressBar percent={role.progressPercent} />
        </TableCell>
        <TableCell>
          <PeopleCountBadges
            counts={role.developerCounts}
            onBadgeClick={onSidePanelOpen ? handleBadgeClick : undefined}
          />
        </TableCell>
      </TableRow>
      {isExpanded ? (
        <TableRow className="hover:bg-transparent">
          <TableCell colSpan={4} className="p-0">
            {role.categories && role.categories.length > 0 ? (
              // R3: Category-based hierarchy
              <CategoryRows
                categories={role.categories}
                showAll={showAll}
                onSkillClick={onSkillClick}
                onSidePanelOpen={onSidePanelOpen}
              />
            ) : (
              // Fallback to old checkpoint-based display
              <CheckpointRows
                checkpoints={role.checkpoints}
                showAll={showAll}
                skillRoadmaps={role.skillsRoadmaps}
                onSkillClick={onSkillClick}
                onSidePanelOpen={onSidePanelOpen}
              />
            )}
          </TableCell>
        </TableRow>
      ) : null}
    </Fragment>
  );
}
