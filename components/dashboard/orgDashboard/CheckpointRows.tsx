"use client";

import { Fragment, useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import type { CheckpointProgressData } from "@/lib/dashboard/entities/roadmap/types";
import {
  sortCheckpointsByPhase,
  filterUnlockedCheckpoints,
} from "@/lib/dashboard/entities/roadmap/orgSkillTableData";
import { DASHBOARD_BG_CLASSES } from "@/lib/dashboard/shared/utils/colors";
import { PeopleStackedBar, StatusBadge } from "./PeopleStackedBar";
import { SubCheckpointRows } from "./SubCheckpointRows";
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

const PHASE_STYLES: Record<string, string> = {
  Basic: "text-amber-700 bg-amber-50",
  Intermediate: "text-blue-700 bg-blue-50",
  Advanced: "text-emerald-700 bg-emerald-50",
};

// =============================================================================
// CheckpointRows — Nested table rendered inside an expanded L1 row
// =============================================================================

type CheckpointRowsProps = {
  checkpoints: CheckpointProgressData[];
  showAll: boolean;
  /** Role-based: skill roadmap names shown after all checkpoints */
  skillRoadmapLabels?: string[];
};

export function CheckpointRows({
  checkpoints,
  showAll,
  skillRoadmapLabels,
}: CheckpointRowsProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const filtered = showAll ? checkpoints : filterUnlockedCheckpoints(checkpoints);
  const sorted = sortCheckpointsByPhase(filtered);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-muted/30!">
          <TableHead />
          <TableHead>Checkpoint</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>People</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((cp) => {
          const isExpanded = expandedIds.has(cp.checkpoint.id);
          const phaseStyle = PHASE_STYLES[cp.checkpoint.phase] ?? "";

          return (
            <Fragment key={cp.checkpoint.id}>
              <TableRow
                className={`${DASHBOARD_BG_CLASSES.borderLight} hover:bg-gray-50/80 ${isExpanded ? "bg-muted" : ""}`}
              >
                <TableCell className={EXPANDER_CELL}>
                  <Button
                    className="size-7 text-muted-foreground"
                    onClick={() => toggleExpand(cp.checkpoint.id)}
                    aria-expanded={isExpanded}
                    aria-label={
                      isExpanded
                        ? `Collapse ${cp.checkpoint.name}`
                        : `Expand ${cp.checkpoint.name}`
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
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">
                      {cp.checkpoint.name}
                    </span>
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded font-medium ${phaseStyle}`}
                    >
                      {cp.checkpoint.phase}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge level={cp.proficiencyLevel} />
                </TableCell>
                <TableCell>
                  <PeopleStackedBar counts={cp.developerCounts} />
                </TableCell>
              </TableRow>
              {isExpanded ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={4} className="p-0">
                    <SubCheckpointRows
                      checkpoint={cp.checkpoint}
                      showAll={showAll}
                    />
                  </TableCell>
                </TableRow>
              ) : null}
            </Fragment>
          );
        })}

        {/* Role-based: Skill Roadmap labels displayed after all checkpoints */}
        {skillRoadmapLabels?.map((label) => (
          <TableRow
            key={`skill-label-${label}`}
            className={`${DASHBOARD_BG_CLASSES.borderLight} hover:bg-blue-50/60`}
          >
            <TableCell />
            <TableCell colSpan={3} className="py-2">
              <span className="text-sm text-blue-700 font-medium">
                Skill Roadmap: {label}
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
