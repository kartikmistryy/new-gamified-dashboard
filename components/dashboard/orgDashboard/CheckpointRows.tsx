"use client";

import { Fragment, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { CheckpointProgressData } from "@/lib/dashboard/entities/roadmap/types";
import {
  sortCheckpointsByPhase,
  filterUnlockedCheckpoints,
} from "@/lib/dashboard/entities/roadmap/orgSkillTableData";
import { PeopleStackedBar, StatusBadge } from "./PeopleStackedBar";
import { SubCheckpointRows } from "./SubCheckpointRows";
import { Button } from "@/components/ui/button";
import { TableRow, TableCell } from "@/components/ui/table";

// =============================================================================
// Phase Badge Colors
// =============================================================================

const PHASE_STYLES: Record<string, string> = {
  Basic: "text-amber-700 bg-amber-50",
  Intermediate: "text-blue-700 bg-blue-50",
  Advanced: "text-emerald-700 bg-emerald-50",
};

// =============================================================================
// CheckpointRows — L2 rows (checkpoint + sub-checkpoint expansion)
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
    <>
      {sorted.map((cp) => {
        const isExpanded = expandedIds.has(cp.checkpoint.id);
        const phaseStyle = PHASE_STYLES[cp.checkpoint.phase] ?? "";

        return (
          <Fragment key={cp.checkpoint.id}>
            <TableRow className="bg-gray-50/80 border-0 hover:bg-gray-100/60">
              <TableCell className="w-12 py-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6 text-muted-foreground"
                  onClick={() => toggleExpand(cp.checkpoint.id)}
                  aria-expanded={isExpanded}
                  aria-label={
                    isExpanded
                      ? `Collapse ${cp.checkpoint.name}`
                      : `Expand ${cp.checkpoint.name}`
                  }
                >
                  {isExpanded ? (
                    <ChevronUp className="size-3.5 opacity-60" aria-hidden />
                  ) : (
                    <ChevronDown className="size-3.5 opacity-60" aria-hidden />
                  )}
                </Button>
              </TableCell>
              <TableCell className="pl-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">
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
            {isExpanded && (
              <SubCheckpointRows checkpoint={cp.checkpoint} showAll={showAll} />
            )}
          </Fragment>
        );
      })}

      {/* Role-based: Skill Roadmap labels displayed after all checkpoints */}
      {skillRoadmapLabels?.map((label) => (
        <TableRow
          key={`skill-label-${label}`}
          className="bg-blue-50/40 border-0 hover:bg-blue-50/60"
        >
          <TableCell className="w-12" />
          <TableCell colSpan={3} className="pl-4 py-2">
            <span className="text-sm text-blue-700 font-medium">
              Skill Roadmap: {label}
            </span>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}
