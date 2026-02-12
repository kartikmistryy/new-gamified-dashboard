"use client";

import { LockOpen, Lock } from "lucide-react";
import type { Checkpoint, SubCheckpointUnlockCount } from "@/lib/dashboard/entities/roadmap/types";
import { getSubCheckpointUnlockCounts } from "@/lib/dashboard/entities/roadmap/utils/progressUtils";

type SubCheckpointRowsProps = {
  checkpoint: Checkpoint;
  showAll: boolean;
  /** Pre-computed unlock counts (graph-sourced data). Falls back to mock if absent. */
  unlockCounts?: SubCheckpointUnlockCount[];
};

/**
 * L3: Sub-checkpoints rendered as compact badges inside an expanded checkpoint.
 * Unlocked = purple badge with count. Locked = gray badge.
 */
export function SubCheckpointRows({ checkpoint, showAll, unlockCounts }: SubCheckpointRowsProps) {
  const subData = unlockCounts ?? getSubCheckpointUnlockCounts(checkpoint);
  const filtered = showAll ? subData : subData.filter((s) => s.unlockedByCount > 0);

  if (filtered.length === 0) {
    return (
      <div className="px-4 py-3 text-sm text-gray-400 italic">
        No sub-checkpoints to display.
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 px-4 py-3">
      {filtered.map((item) => {
        const isUnlocked = item.unlockedByCount > 0;
        return (
          <span
            key={item.subCheckpoint.id}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
              isUnlocked
                ? "bg-purple-50 text-purple-700"
                : "bg-gray-100 text-gray-400"
            }`}
          >
            {isUnlocked ? (
              <LockOpen className="size-3" aria-hidden />
            ) : (
              <Lock className="size-3" aria-hidden />
            )}
            {item.subCheckpoint.name}
            {isUnlocked && (
              <span className="text-purple-500 font-normal">({item.unlockedByCount})</span>
            )}
          </span>
        );
      })}
    </div>
  );
}
