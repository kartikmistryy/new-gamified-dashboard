"use client";

import { LockOpen, Lock } from "lucide-react";
import type { Checkpoint, SubCheckpointUnlockCount } from "@/lib/dashboard/entities/roadmap/types";
import { getSubCheckpointUnlockCounts } from "@/lib/dashboard/entities/roadmap/utils/progressUtils";
import { DASHBOARD_BG_CLASSES } from "@/lib/dashboard/shared/utils/colors";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type SubCheckpointRowsProps = {
  checkpoint: Checkpoint;
  showAll: boolean;
  /** Pre-computed unlock counts (graph-sourced data). Falls back to mock if absent. */
  unlockCounts?: SubCheckpointUnlockCount[];
};

/**
 * L3 nested table: Sub-checkpoints inside an expanded checkpoint.
 * Shows unlock status (locked/unlocked icon) and unlock count.
 */
export function SubCheckpointRows({ checkpoint, showAll, unlockCounts }: SubCheckpointRowsProps) {
  const subData = unlockCounts ?? getSubCheckpointUnlockCounts(checkpoint);
  const filtered = showAll ? subData : subData.filter((s) => s.unlockedByCount > 0);

  if (filtered.length === 0) {
    return (
      <Table>
        <TableBody>
          <TableRow className="border-0 hover:bg-transparent">
            <TableCell className="py-2 text-sm text-gray-400 italic">
              No sub-checkpoints to display.
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-muted/30!">
          <TableHead>Sub-Checkpoint</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>People</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filtered.map((item) => {
          const isUnlocked = item.unlockedByCount > 0;
          return (
            <TableRow
              key={item.subCheckpoint.id}
              className={`${DASHBOARD_BG_CLASSES.borderLight} hover:bg-gray-50/50`}
            >
              <TableCell className="text-sm text-gray-700">
                {item.subCheckpoint.name}
              </TableCell>
              <TableCell>
                {isUnlocked ? (
                  <span className="inline-flex items-center gap-1.5 text-purple-600 text-sm font-medium">
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
      </TableBody>
    </Table>
  );
}
