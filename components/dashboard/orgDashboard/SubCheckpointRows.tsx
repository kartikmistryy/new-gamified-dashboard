"use client";

import { LockOpen, Lock } from "lucide-react";
import type { Checkpoint, SubCheckpointUnlockCount } from "@/lib/dashboard/entities/roadmap/types";
import { getSubCheckpointUnlockCounts } from "@/lib/dashboard/entities/roadmap/utils/progressUtils";
import { BADGE_CLASS, PHASE_COLOR_MAP, badgeStyle } from "./PeopleStackedBar";

type SubCheckpointRowsProps = {
  checkpoint: Checkpoint;
  showAll: boolean;
  /** Pre-computed unlock counts (graph-sourced data). Falls back to mock if absent. */
  unlockCounts?: SubCheckpointUnlockCount[];
  /** R18: Indentation class to align with parent checkpoint */
  indentClass?: string;
};

const LOCKED_STYLE = badgeStyle("#9CA3AF");

/**
 * L3: Sub-checkpoints rendered as compact badges inside an expanded checkpoint.
 * Color matches the parent checkpoint's phase (Basic/Intermediate/Advanced).
 * R18: Aligned with parent checkpoint via indentClass.
 */
export function SubCheckpointRows({ checkpoint, showAll, unlockCounts, indentClass = "pl-20" }: SubCheckpointRowsProps) {
  const subData = unlockCounts ?? getSubCheckpointUnlockCounts(checkpoint);
  const filtered = showAll ? subData : subData.filter((s) => s.unlockedByCount > 0);
  const phaseColor = PHASE_COLOR_MAP[checkpoint.phase] ?? "#6B7280";

  if (filtered.length === 0) {
    return (
      <div className={`${indentClass} py-3 text-sm text-gray-400 italic`}>
        No sub-checkpoints to display.
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap gap-1.5 ${indentClass} pr-4 py-3`}>
      {filtered.map((item) => {
        const isUnlocked = item.unlockedByCount > 0;
        return (
          <span
            key={item.subCheckpoint.id}
            className={`${BADGE_CLASS} gap-1`}
            style={isUnlocked ? badgeStyle(phaseColor) : LOCKED_STYLE}
          >
            {isUnlocked ? (
              <LockOpen className="size-3" aria-hidden />
            ) : (
              <Lock className="size-3" aria-hidden />
            )}
            {item.subCheckpoint.name}
            {isUnlocked && (
              <span style={{ opacity: 0.7 }}>({item.unlockedByCount})</span>
            )}
          </span>
        );
      })}
    </div>
  );
}
