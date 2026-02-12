"use client";

import { Fragment, useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import type { CheckpointProgressData, SkillsRoadmapProgressData } from "@/lib/dashboard/entities/roadmap/types";
import {
  sortCheckpointsByPhase,
  filterUnlockedCheckpoints,
} from "@/lib/dashboard/entities/roadmap/orgSkillTableData";
import { DASHBOARD_BG_CLASSES } from "@/lib/dashboard/shared/utils/colors";
import { PeopleStackedBar, ProficiencyProgressBar, BADGE_CLASS, BADGE_BG_OPACITY, PHASE_COLOR_MAP, badgeStyle } from "./PeopleStackedBar";
import { hexToRgba } from "@/lib/dashboard/entities/team/utils/tableUtils";
import { SubCheckpointRows } from "./SubCheckpointRows";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";

// =============================================================================
// CheckpointRows — Nested table rendered inside an expanded L1 row
// =============================================================================

type CheckpointRowsProps = {
  checkpoints: CheckpointProgressData[];
  showAll: boolean;
  /** Role-based: skill roadmaps shown after all checkpoints */
  skillRoadmaps?: SkillsRoadmapProgressData[];
};

export function CheckpointRows({
  checkpoints,
  showAll,
  skillRoadmaps,
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
      <TableBody>
        {sorted.map((cp, idx) => {
          const isExpanded = expandedIds.has(cp.checkpoint.id);
          const phaseColor = PHASE_COLOR_MAP[cp.checkpoint.phase];
          const hasSubCheckpoints = cp.checkpoint.subCheckpoints.length > 0;
          const isNewGroup =
            idx === 0 ||
            sorted[idx - 1].checkpoint.phase !== cp.checkpoint.phase;

          /* tint applied to every cell so it spans the full row */
          const tint = phaseColor
            ? { backgroundColor: hexToRgba(phaseColor, BADGE_BG_OPACITY / 2) }
            : undefined;

          return (
            <Fragment key={cp.checkpoint.id}>
              {/* ── Checkpoint data row ── */}
              <TableRow className={`${DASHBOARD_BG_CLASSES.borderLight} hover:bg-gray-50/80`}>
                <TableCell className="w-32 pr-0 align-middle relative" style={tint}>
                  {isNewGroup && phaseColor ? (
                    <span
                      className={`${BADGE_CLASS} absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2`}
                      style={badgeStyle(phaseColor)}
                    >
                      {cp.checkpoint.phase}
                    </span>
                  ) : null}
                  <div className="flex justify-end">
                    {hasSubCheckpoints ? (
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
                    ) : null}
                  </div>
                </TableCell>
                <TableCell style={tint}>
                  <span className="font-medium text-gray-900">
                    {cp.checkpoint.name}
                  </span>
                </TableCell>
                <TableCell style={tint}>
                  <ProficiencyProgressBar percent={cp.progressPercent} />
                </TableCell>
                <TableCell style={tint}>
                  <PeopleStackedBar counts={cp.developerCounts} />
                </TableCell>
              </TableRow>

              {/* ── Expanded sub-checkpoints ── */}
              {isExpanded && hasSubCheckpoints ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={4} className="p-0" style={tint}>
                    <SubCheckpointRows
                      checkpoint={cp.checkpoint}
                      showAll={showAll}
                      unlockCounts={cp.subCheckpointUnlockCounts}
                    />
                  </TableCell>
                </TableRow>
              ) : null}
            </Fragment>
          );
        })}

        {/* Role-based: Skill Roadmaps with status & people */}
        {skillRoadmaps?.map((sr) => (
          <TableRow
            key={`skill-roadmap-${sr.roadmap.id}`}
            className={`${DASHBOARD_BG_CLASSES.borderLight} bg-muted hover:bg-muted/80`}
          >
            <TableCell />
            <TableCell>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-gray-200 text-gray-700">
                  Skill
                </span>
                <span className="text-sm text-gray-900 font-medium">
                  {sr.roadmap.name}
                </span>
              </div>
            </TableCell>
            <TableCell>
              <ProficiencyProgressBar percent={sr.progressPercent} />
            </TableCell>
            <TableCell>
              <PeopleStackedBar counts={sr.developerCounts} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
