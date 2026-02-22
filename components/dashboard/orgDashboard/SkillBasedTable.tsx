"use client";

import { Fragment, useEffect, useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import type { SkillsRoadmapProgressData } from "@/lib/dashboard/entities/roadmap/types";
import { DASHBOARD_TEXT_CLASSES, DASHBOARD_BG_CLASSES } from "@/lib/dashboard/shared/utils/colors";
import { getColorForDomain } from "@/components/skillmap/skillGraphUtils";
import { PeopleStackedBar, ProficiencyProgressBar } from "./PeopleStackedBar";
import { CheckpointRows } from "./CheckpointRows";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const EXPANDER_CELL = "align-middle [&:has([aria-expanded])]:w-px [&:has([aria-expanded])]:py-0";

type SkillBasedTableProps = {
  data: SkillsRoadmapProgressData[];
  showAll: boolean;
  autoExpandSkillId?: string | null;
  onAutoExpandConsumed?: () => void;
};

/**
 * Skill-Based Skills Table — L1 level.
 * Each row is a Skills Roadmap. Expanding shows a nested Checkpoint table (L2).
 */
export function SkillBasedTable({
  data,
  showAll,
  autoExpandSkillId,
  onAutoExpandConsumed,
}: SkillBasedTableProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    setPage(1);
  }, [data]);

  useEffect(() => {
    if (autoExpandSkillId) {
      setExpandedIds((prev) => new Set(prev).add(autoExpandSkillId));
      onAutoExpandConsumed?.();
    }
  }, [autoExpandSkillId, onAutoExpandConsumed]);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <>
    <div className="rounded-sm border-none overflow-hidden bg-white">
      <Table>
        <TableHeader className="border-0">
          <TableRow className="border-none hover:bg-transparent">
            <TableHead />
            <TableHead className="w-14 text-foreground font-medium">Rank</TableHead>
            <TableHead className="text-foreground font-medium">Skill Name</TableHead>
            <TableHead className="text-foreground font-medium">Status</TableHead>
            <TableHead className="text-foreground font-medium">People</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                No skills to display.
              </TableCell>
            </TableRow>
          ) : (
            data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((skill, index) => {
              const isExpanded = expandedIds.has(skill.roadmap.id);
              const rank = (page - 1) * PAGE_SIZE + index + 1;

              return (
                <Fragment key={skill.roadmap.id}>
                  <TableRow
                    className={`${DASHBOARD_BG_CLASSES.borderLight} hover:bg-gray-50/80 ${isExpanded ? "bg-muted" : ""}`}
                  >
                    <TableCell className={EXPANDER_CELL}>
                      <Button
                        className="size-7 text-muted-foreground"
                        onClick={() => toggleExpand(skill.roadmap.id)}
                        aria-expanded={isExpanded}
                        aria-label={
                          isExpanded
                            ? `Collapse ${skill.roadmap.name}`
                            : `Expand ${skill.roadmap.name}`
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
                    <TableCell className="w-14">
                      <span
                        className={
                          rank <= 3
                            ? "text-foreground font-bold"
                            : DASHBOARD_TEXT_CLASSES.rankMuted
                        }
                      >
                        {rank}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div
                          className="size-4 rounded shrink-0"
                          style={{ backgroundColor: getColorForDomain(skill.roadmap.name) }}
                          aria-hidden
                        />
                        <span className="font-medium text-gray-900">
                          {skill.roadmap.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <ProficiencyProgressBar percent={skill.progressPercent} />
                    </TableCell>
                    <TableCell>
                      <PeopleStackedBar counts={skill.developerCounts} />
                    </TableCell>
                  </TableRow>
                  {isExpanded ? (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={5} className="p-0">
                        <CheckpointRows
                          checkpoints={skill.checkpoints}
                          showAll={showAll}
                        />
                      </TableCell>
                    </TableRow>
                  ) : null}
                </Fragment>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
    {(() => {
      const totalPages = Math.ceil(data.length / PAGE_SIZE);
      if (totalPages <= 1) return <p className="mt-4 text-center text-sm text-gray-400">All Loaded</p>;
      return (
        <div className="mt-4 flex flex-col gap-4 items-center justify-between">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => { e.preventDefault(); setPage((p) => Math.max(1, p - 1)); }}
                  aria-disabled={page === 1}
                  className={page === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                const showPage = p === 1 || p === totalPages || Math.abs(p - page) <= 1;
                const showEllipsisBefore = p === page - 2 && page > 3;
                const showEllipsisAfter = p === page + 2 && page < totalPages - 2;
                if (showEllipsisBefore || showEllipsisAfter) {
                  return <PaginationItem key={`e-${p}`}><PaginationEllipsis /></PaginationItem>;
                }
                if (!showPage) return null;
                return (
                  <PaginationItem key={p}>
                    <PaginationLink href="#" isActive={p === page} onClick={(e) => { e.preventDefault(); setPage(p); }}>{p}</PaginationLink>
                  </PaginationItem>
                );
              })}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => { e.preventDefault(); setPage((p) => Math.min(totalPages, p + 1)); }}
                  aria-disabled={page === totalPages}
                  className={page === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
          <p className="text-sm text-gray-400 w-fit mx-auto shrink-0">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, data.length)} of {data.length} skills
          </p>
        </div>
      );
    })()}
    </>
  );
}
