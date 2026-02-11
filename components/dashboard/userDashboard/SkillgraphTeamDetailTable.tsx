"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import type { SkillgraphTeamRow } from "@/lib/dashboard/entities/team/types";
import { SkillgraphProgressBar } from "@/components/dashboard/userDashboard/SkillgraphProgressBar";
import { getColorForDomain } from "@/components/skillmap/skillGraphUtils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type SortKey = "domain" | "skill" | "usage" | "progress";
type SortDir = "asc" | "desc";

type SkillgraphTeamDetailTableProps = {
  details: SkillgraphTeamRow["details"];
  rowId: string;
};

export function SkillgraphTeamDetailTable({
  details,
  rowId,
}: SkillgraphTeamDetailTableProps) {
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

  const columnLabels: Record<SortKey, string> = {
    domain: "Domain",
    skill: "Skill",
    usage: "Skill Usage",
    progress: "Skill Completion",
  };

  return (
    <Table className="table-fixed">
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          {(["domain", "skill", "usage", "progress"] as const).map((key) => {
            const isSorted = sortState?.key === key;
            const label = columnLabels[key];
            return (
              <TableHead key={key} className="w-1/4">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-left"
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
            <TableRow key={`${detail.skill}-${index}`} className="border-0 hover:bg-gray-50/70">
              <TableCell className="text-gray-700 w-1/4">{detail.domain}</TableCell>
              <TableCell className="font-medium text-gray-900 w-1/4">
                <div className="flex items-center gap-2">
                  <div
                    className="size-3.5 rounded-sm shrink-0"
                    style={{ backgroundColor: getColorForDomain(detail.domain) }}
                    aria-hidden
                  />
                  <span>{detail.skill}</span>
                </div>
              </TableCell>
              <TableCell className="text-gray-700 w-1/4">{detail.usage}</TableCell>
              <TableCell className="w-1/4">
                <SkillgraphProgressBar value={detail.progress} />
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow className="border-0 hover:bg-transparent">
            <TableCell colSpan={4} className="h-14 text-center text-sm text-gray-500">
              No details available.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
