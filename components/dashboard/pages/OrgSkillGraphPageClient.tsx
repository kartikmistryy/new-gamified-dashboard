"use client";

import { Fragment, useMemo } from "react";
import { DashboardSection } from "@/components/dashboard/shared/DashboardSection";
import { RoadmapProgressSection } from "@/components/dashboard/userDashboard/RoadmapProgressSection";
import { SkillGraph } from "@/components/skillmap/SkillGraph";
import { flexRender } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { SortableTableHeader } from "@/components/dashboard/shared/SortableTableHeader";
import { SkillgraphDetailTable } from "@/components/dashboard/userDashboard/SkillgraphDetailTable";
import { SKILLGRAPH_SKILL_ROWS } from "@/lib/dashboard/entities/team/mocks/skillgraphMockData";
import { useOrgSkillTable } from "@/lib/dashboard/entities/team/charts/skillgraph/useOrgSkillTable";

export function OrgSkillGraphPageClient() {
  const skillRows = useMemo(() => SKILLGRAPH_SKILL_ROWS, []);
  const { table } = useOrgSkillTable(skillRows);

  return (
    <div className="flex flex-col gap-12 px-6 pb-12 bg-white text-gray-900 min-h-screen">
      <DashboardSection title="Organization Skills Graph" className="py-6">
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
                  table.getRowModel().rows.map((row) => (
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
        </div>
      </DashboardSection>

      <DashboardSection title="" className="py-6">
        <RoadmapProgressSection />
      </DashboardSection>
    </div>
  );
}
