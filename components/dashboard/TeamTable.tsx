"use client";

import * as React from "react";
import Image from "next/image";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DICEBEAR_BASE } from "@/lib/orgDashboard/constants";
import type { TeamRow, TeamSortColumn } from "@/lib/orgDashboard/types";

type TeamTableProps = {
  rows: TeamRow[];
};

export function TeamTable({ rows }: TeamTableProps) {
  const [teamSort, setTeamSort] = React.useState<{
    column: TeamSortColumn;
    direction: "asc" | "desc";
  }>({ column: null, direction: "asc" });

  const sortedRows = React.useMemo(() => {
    const { column, direction } = teamSort;
    if (!column) return [...rows];
    return [...rows].sort((a, b) => {
      const aVal = a[column];
      const bVal = b[column];
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return direction === "asc" ? cmp : -cmp;
    });
  }, [rows, teamSort]);

  const handleSort = React.useCallback(
    (column: Exclude<TeamSortColumn, null>) => {
      setTeamSort((prev) => {
        if (prev.column === column) {
          return {
            column,
            direction: prev.direction === "asc" ? "desc" : "asc",
          };
        }
        return { column, direction: "asc" as const };
      });
    },
    [],
  );

  return (
    <div className="rounded-md border border-gray-200 overflow-hidden bg-white -mt-8">
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow className="border-gray-200 hover:bg-transparent">
            <TableHead className="text-gray-500 font-medium w-12">#</TableHead>
            <TableHead className="text-gray-500 font-medium">Team</TableHead>
            <TableHead className="text-gray-500 font-medium text-right">
              <Button
                variant="ghost"
                size="sm"
                className="h-auto w-full justify-end gap-1 font-medium text-gray-500 hover:text-gray-900 hover:bg-transparent -mr-2"
                onClick={() => handleSort("codeQuality")}
              >
                Code Quality{" "}
                {teamSort.column === "codeQuality" ? (
                  teamSort.direction === "asc" ? (
                    <ArrowUp className="size-3.5" aria-hidden />
                  ) : (
                    <ArrowDown className="size-3.5" aria-hidden />
                  )
                ) : (
                  <ArrowUpDown className="size-3.5" aria-hidden />
                )}
              </Button>
            </TableHead>
            <TableHead className="text-gray-500 font-medium text-right">
              <Button
                variant="ghost"
                size="sm"
                className="h-auto w-full justify-end gap-1 font-medium text-gray-500 hover:text-gray-900 hover:bg-transparent -mr-2"
                onClick={() => handleSort("karmaPoints")}
              >
                Karma Points{" "}
                {teamSort.column === "karmaPoints" ? (
                  teamSort.direction === "asc" ? (
                    <ArrowUp className="size-3.5" aria-hidden />
                  ) : (
                    <ArrowDown className="size-3.5" aria-hidden />
                  )
                ) : (
                  <ArrowUpDown className="size-3.5" aria-hidden />
                )}
              </Button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedRows.map((row, index) => (
            <TableRow
              key={row.teamId}
              className="border-gray-100 hover:bg-gray-50/80"
            >
              <TableCell className="font-semibold text-gray-900">
                {index + 1}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Image
                    src={`${DICEBEAR_BASE}?seed=${row.teamId}`}
                    alt=""
                    className="rounded-full object-cover border border-gray-200 shrink-0"
                    width={40}
                    height={40}
                    unoptimized
                  />
                  <div>
                    <p className="font-semibold text-gray-900">{row.name}</p>
                    <p className="text-xs text-gray-500">#{row.teamId}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <span
                  className={cn(
                    "font-medium",
                    row.codeQuality <= 25 && "text-red-600",
                    row.codeQuality > 25 &&
                      row.codeQuality <= 50 &&
                      "text-amber-600",
                    row.codeQuality > 50 &&
                      row.codeQuality <= 75 &&
                      "text-yellow-600",
                    row.codeQuality > 75 && "text-green-600",
                  )}
                >
                  {row.codeQuality}%
                </span>
              </TableCell>
              <TableCell className="text-right font-medium text-gray-900">
                {row.karmaPoints.toLocaleString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
