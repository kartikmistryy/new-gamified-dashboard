"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import type { SkillgraphSkillRow } from "@/lib/dashboard/entities/team/types";
import { SkillgraphProgressBar } from "@/components/dashboard/userDashboard/SkillgraphProgressBar";
import { TeamAvatar } from "@/components/shared/TeamAvatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type SortKey = "team" | "usage" | "progress";
type SortDir = "asc" | "desc";

type SkillgraphDetailTableProps = {
  details: SkillgraphSkillRow["details"];
  rowId: string;
  detailHeaderLabel?: string;
};

export function SkillgraphDetailTable({
  details,
  rowId,
  detailHeaderLabel = "Team",
}: SkillgraphDetailTableProps) {
  const [sortState, setSortState] = useState<{ key: SortKey; dir: SortDir } | null>(null);

  const sortedDetails = (() => {
    if (!details?.length || !sortState) return details ?? [];

    return [...details].sort((a, b) => {
      const { key, dir } = sortState;
      const aVal = a[key];
      const bVal = b[key];
      if (aVal === bVal) return 0;
      const order = aVal > bVal ? 1 : -1;
      return dir === "asc" ? order : -order;
    });
  })();

  const handleSort = (key: SortKey) => {
    setSortState((prev) => {
      if (prev?.key === key) {
        return { key, dir: prev.dir === "asc" ? "desc" : "asc" };
      }
      return { key, dir: "asc" };
    });
  };

  return (
    <Table className="table-fixed">
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          {(["team", "usage", "progress"] as const).map((key) => {
            const isSorted = sortState?.key === key;
            const label = key === "team" ? detailHeaderLabel : key === "usage" ? "Skill Usage" : "Skill Completion";
            return (
              <TableHead key={key} className="w-1/3">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-left text-foreground font-medium text-sm"
                  onClick={() => handleSort(key)}
                >
                  {label}
                  {isSorted ? (
                    sortState?.dir === "asc" ? (
                      <ArrowUp className="size-3.5 text-muted-foreground" aria-hidden />
                    ) : (
                      <ArrowDown className="size-3.5 text-muted-foreground" aria-hidden />
                    )
                  ) : (
                    <ArrowUpDown className="size-3.5 text-muted-foreground opacity-60" aria-hidden />
                  )}
                </button>
              </TableHead>
            );
          })}
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedDetails.length > 0 ? (
          sortedDetails.map((detail, index) => (
            <TableRow key={`${detail.team}-${index}`} className="border-0 hover:bg-gray-50/70">
              <TableCell className="font-medium text-gray-900 w-1/3">
                {detail.team}
              </TableCell>
              <TableCell className="text-gray-700 w-1/3">{detail.usage}</TableCell>
              <TableCell className="w-1/3">
                <SkillgraphProgressBar value={detail.progress} />
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow className="border-0 hover:bg-transparent">
            <TableCell colSpan={3} className="h-14 text-center text-sm text-gray-500">
              No details available.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
