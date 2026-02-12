"use client";

import { Fragment, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { SkillsRoadmapProgressData } from "@/lib/dashboard/entities/roadmap/types";
import { DASHBOARD_TEXT_CLASSES } from "@/lib/dashboard/shared/utils/colors";
import { PeopleStackedBar, StatusBadge } from "./PeopleStackedBar";
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

type SkillBasedTableProps = {
  data: SkillsRoadmapProgressData[];
  showAll: boolean;
};

/**
 * Skill-Based Skills Table — L1 level.
 * Each row is a Skills Roadmap. Expanding shows Checkpoint rows (L2).
 */
export function SkillBasedTable({ data, showAll }: SkillBasedTableProps) {
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
            <TableHead className="w-12 text-foreground font-medium">Rank</TableHead>
            <TableHead className="text-foreground font-medium">Skill Name</TableHead>
            <TableHead className="text-foreground font-medium">Status</TableHead>
            <TableHead className="text-foreground font-medium">People</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center text-gray-500">
                No skills to display.
              </TableCell>
            </TableRow>
          ) : (
            data.map((skill, index) => {
              const isExpanded = expandedIds.has(skill.roadmap.id);
              const rank = index + 1;

              return (
                <Fragment key={skill.roadmap.id}>
                  <TableRow className="border-[#E5E5E5] hover:bg-gray-50/80">
                    <TableCell className="w-12">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 text-muted-foreground"
                          onClick={() => toggleExpand(skill.roadmap.id)}
                          aria-expanded={isExpanded}
                          aria-label={
                            isExpanded
                              ? `Collapse ${skill.roadmap.name}`
                              : `Expand ${skill.roadmap.name}`
                          }
                        >
                          {isExpanded ? (
                            <ChevronUp className="opacity-60" aria-hidden />
                          ) : (
                            <ChevronDown className="opacity-60" aria-hidden />
                          )}
                        </Button>
                        <span
                          className={
                            rank <= 3
                              ? "text-foreground font-bold"
                              : DASHBOARD_TEXT_CLASSES.rankMuted
                          }
                        >
                          {rank}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-gray-900">
                        {skill.roadmap.name}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge level={skill.proficiencyLevel} />
                    </TableCell>
                    <TableCell>
                      <PeopleStackedBar counts={skill.developerCounts} />
                    </TableCell>
                  </TableRow>
                  {isExpanded && (
                    <CheckpointRows
                      checkpoints={skill.checkpoints}
                      showAll={showAll}
                    />
                  )}
                </Fragment>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
