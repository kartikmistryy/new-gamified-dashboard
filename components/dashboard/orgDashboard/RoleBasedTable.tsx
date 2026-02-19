"use client";

import { Fragment, useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import type { RoleRoadmapProgressData } from "@/lib/dashboard/entities/roadmap/types";
import { DASHBOARD_TEXT_CLASSES, DASHBOARD_BG_CLASSES } from "@/lib/dashboard/shared/utils/colors";
import { getColorForDomain } from "@/components/skillmap/skillGraphUtils";
import { PeopleStackedBar, ProficiencyProgressBar } from "./PeopleStackedBar";
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

type RoleBasedTableProps = {
  data: RoleRoadmapProgressData[];
  showAll: boolean;
  onSkillClick?: (skillRoadmapId: string) => void;
};

/**
 * Role-Based Skills Table — L1 level.
 * Each row is a Role Roadmap. Expanding shows a nested table with:
 * 1. All Checkpoints across all skill roadmaps (sorted by phase)
 * 2. Skill Roadmap labels (pure display) after all checkpoints
 */
export function RoleBasedTable({ data, showAll, onSkillClick }: RoleBasedTableProps) {
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
      <Table>
        <TableHeader className="border-0">
          <TableRow className="border-none hover:bg-transparent">
            <TableHead />
            <TableHead className="w-14 text-foreground font-medium">Rank</TableHead>
            <TableHead className="text-foreground font-medium">Role Name</TableHead>
            <TableHead className="text-foreground font-medium">Status</TableHead>
            <TableHead className="text-foreground font-medium">People</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center text-gray-500">
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
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

// =============================================================================
// RoleRow — Single role row with expansion logic
// =============================================================================

type RoleRowProps = {
  role: RoleRoadmapProgressData;
  rank: number;
  isExpanded: boolean;
  onToggle: () => void;
  showAll: boolean;
  onSkillClick?: (skillRoadmapId: string) => void;
};

function RoleRow({ role, rank, isExpanded, onToggle, showAll, onSkillClick }: RoleRowProps) {
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
          <div className="flex items-center gap-3">
            <div
              className="size-4 rounded shrink-0"
              style={{ backgroundColor: getColorForDomain(role.roleRoadmap.name) }}
              aria-hidden
            />
            <span className="font-medium text-gray-900">{role.roleRoadmap.name}</span>
          </div>
        </TableCell>
        <TableCell>
          <ProficiencyProgressBar percent={role.progressPercent} />
        </TableCell>
        <TableCell>
          <PeopleStackedBar counts={role.developerCounts} />
        </TableCell>
      </TableRow>
      {isExpanded ? (
        <TableRow className="hover:bg-transparent">
          <TableCell colSpan={5} className="p-0">
            <CheckpointRows
              checkpoints={role.checkpoints}
              showAll={showAll}
              skillRoadmaps={role.skillsRoadmaps}
              onSkillClick={onSkillClick}
            />
          </TableCell>
        </TableRow>
      ) : null}
    </Fragment>
  );
}
