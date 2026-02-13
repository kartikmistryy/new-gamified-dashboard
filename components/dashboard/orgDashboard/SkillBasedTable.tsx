"use client";

import { Fragment, useEffect, useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import type { SkillsRoadmapProgressData } from "@/lib/dashboard/entities/roadmap/types";
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

type SkillBasedTableProps = {
  data: SkillsRoadmapProgressData[];
  showAll: boolean;
  autoExpandSkillId?: string | null;
  onAutoExpandConsumed?: () => void;
};

/**
 * Skill-Based Skills Table — L1 level.
 * Each row is a Skills Roadmap. Expanding shows a nested Checkpoint table (L2).
 */
export function SkillBasedTable({
  data,
  showAll,
  autoExpandSkillId,
  onAutoExpandConsumed,
}: SkillBasedTableProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (autoExpandSkillId) {
      setExpandedIds((prev) => new Set(prev).add(autoExpandSkillId));
      onAutoExpandConsumed?.();
    }
  }, [autoExpandSkillId, onAutoExpandConsumed]);

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
            <TableHead className="text-foreground font-medium">Skill Name</TableHead>
            <TableHead className="text-foreground font-medium">Status</TableHead>
            <TableHead className="text-foreground font-medium">People</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                No skills to display.
              </TableCell>
            </TableRow>
          ) : (
            data.map((skill, index) => {
              const isExpanded = expandedIds.has(skill.roadmap.id);
              const rank = index + 1;

              return (
                <Fragment key={skill.roadmap.id}>
                  <TableRow
                    className={`${DASHBOARD_BG_CLASSES.borderLight} hover:bg-gray-50/80 ${isExpanded ? "bg-muted" : ""}`}
                  >
                    <TableCell className={EXPANDER_CELL}>
                      <Button
                        className="size-7 text-muted-foreground"
                        onClick={() => toggleExpand(skill.roadmap.id)}
                        aria-expanded={isExpanded}
                        aria-label={
                          isExpanded
                            ? `Collapse ${skill.roadmap.name}`
                            : `Expand ${skill.roadmap.name}`
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
                          style={{ backgroundColor: getColorForDomain(skill.roadmap.name) }}
                          aria-hidden
                        />
                        <span className="font-medium text-gray-900">
                          {skill.roadmap.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <ProficiencyProgressBar percent={skill.progressPercent} />
                    </TableCell>
                    <TableCell>
                      <PeopleStackedBar counts={skill.developerCounts} />
                    </TableCell>
                  </TableRow>
                  {isExpanded ? (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={5} className="p-0">
                        <CheckpointRows
                          checkpoints={skill.checkpoints}
                          showAll={showAll}
                        />
                      </TableCell>
                    </TableRow>
                  ) : null}
                </Fragment>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
