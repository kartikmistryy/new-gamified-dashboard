"use client";

import { LockOpen, Lock } from "lucide-react";
import type { Checkpoint } from "@/lib/dashboard/entities/roadmap/types";
import { getSubCheckpointUnlockCounts } from "@/lib/dashboard/entities/roadmap/utils/progressUtils";
import { TableRow, TableCell } from "@/components/ui/table";

type SubCheckpointRowsProps = {
  checkpoint: Checkpoint;
  showAll: boolean;
};

/**
 * L3 rows: Sub-checkpoints inside an expanded checkpoint.
 * Shows unlock status (locked/unlocked icon) and unlock count.
 */
export function SubCheckpointRows({ checkpoint, showAll }: SubCheckpointRowsProps) {
  const subData = getSubCheckpointUnlockCounts(checkpoint);
  const filtered = showAll ? subData : subData.filter((s) => s.unlockedByCount > 0);

  if (filtered.length === 0) {
    return (
      <TableRow className="border-0 hover:bg-transparent">
        <TableCell colSpan={4} className="pl-20 py-2 text-sm text-gray-400 italic">
          No sub-checkpoints to display.
        </TableCell>
      </TableRow>
    );
  }

  return (
    <>
      {filtered.map((item) => {
        const isUnlocked = item.unlockedByCount > 0;
        return (
          <TableRow
            key={item.subCheckpoint.id}
            className="border-0 hover:bg-gray-50/50"
          >
            {/* Rank column: empty for L3 */}
            <TableCell className="w-12" />
            <TableCell className="pl-14 text-sm text-gray-700">
              {item.subCheckpoint.name}
            </TableCell>
            <TableCell>
              {isUnlocked ? (
                <span className="inline-flex items-center gap-1.5 text-emerald-600 text-sm font-medium">
                  <LockOpen className="size-3.5" aria-hidden />
                  Unlocked
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-gray-400 text-sm">
                  <Lock className="size-3.5" aria-hidden />
                  Locked
                </span>
              )}
            </TableCell>
            <TableCell className="text-sm text-gray-700">
              {isUnlocked ? `${item.unlockedByCount} people` : "—"}
            </TableCell>
          </TableRow>
        );
      })}
    </>
  );
}
