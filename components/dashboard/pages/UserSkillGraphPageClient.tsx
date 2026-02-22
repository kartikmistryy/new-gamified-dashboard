"use client";

import { DashboardSection } from "@/components/dashboard/shared/DashboardSection";
import { SkillGraph } from "@/components/skillmap/SkillGraph";
import { useMemo, useState, Fragment } from "react";
import { useRouteParams } from "@/lib/dashboard/shared/contexts/RouteParamsProvider";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { flexRender } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { SortableTableHeader } from "@/components/dashboard/shared/SortableTableHeader";
import { SkillgraphDetailTable } from "@/components/dashboard/userDashboard/SkillgraphDetailTable";
import { buildUserSkillRowsFromRoadmap } from "@/lib/dashboard/entities/user/charts/skillgraph/userSkillGraphUtils";
import { useUserSkillTable } from "@/lib/dashboard/entities/user/charts/skillgraph/useUserSkillTable";

export function UserSkillGraphPageClient() {
  const { userId } = useRouteParams();

  const skillRows = useMemo(() => {
    if (!userId) return [];
    return buildUserSkillRowsFromRoadmap(userId);
  }, [userId]);

  const { table } = useUserSkillTable(skillRows);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  if (!userId) {
    return null;
  }

  return (
    <div className="flex flex-col gap-12 px-6 pb-12 bg-white text-gray-900 min-h-screen">
      {/* Skills Graph Visualization */}
      <DashboardSection title="Skills Distribution" className="py-6">
        <div className="flex justify-center">
          <div className="h-[780px] w-[850px] flex items-center justify-center">
            <SkillGraph width={700} height={700} />
          </div>
        </div>
      </DashboardSection>

      {/* Skills Table */}
      <DashboardSection title="Skills" className="py-6">
        <div className="w-full">
          <div className="rounded-sm border-none overflow-hidden bg-white">
            <Table>
              <TableHeader className="border-0">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="border-none hover:bg-transparent">
                    {headerGroup.headers.map((header) => (
                      <SortableTableHeader key={header.id} header={header} />
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((row) => (
                    <Fragment key={row.id}>
                      <TableRow
                        className={`border-[#E5E5E5] hover:bg-gray-50/80 ${row.getIsExpanded() ? "bg-muted" : ""}`}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell
                            key={cell.id}
                            className={`align-middle [&:has([aria-expanded])]:w-px [&:has([aria-expanded])]:py-0 ${
                              (cell.column.columnDef.meta as { className?: string })?.className ?? ""
                            }`}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                      {row.getIsExpanded() ? (
                        <TableRow className="hover:bg-transparent">
                          <TableCell colSpan={row.getVisibleCells().length} className="p-0">
                            <SkillgraphDetailTable
                              details={row.original.details}
                              rowId={row.id}
                              detailHeaderLabel="Sub-Skill"
                            />
                          </TableCell>
                        </TableRow>
                      ) : null}
                    </Fragment>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={table.getHeaderGroups()[0]?.headers.length ?? 1} className="h-24 text-center">
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {(() => {
            const totalRows = table.getRowModel().rows.length;
            const totalPages = Math.ceil(totalRows / PAGE_SIZE);
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
                  Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, totalRows)} of {totalRows} skills
                </p>
              </div>
            );
          })()}
        </div>
      </DashboardSection>
    </div>
  );
}
