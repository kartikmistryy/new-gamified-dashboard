"use client";

import { DashboardSection } from "@/components/dashboard/shared/DashboardSection";
import { SkillGraph } from "@/components/skillmap/SkillGraph";
import { useMemo, Fragment } from "react";
import { useRouteParams } from "@/lib/dashboard/shared/contexts/RouteParamsProvider";
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

  const { table, visibleSkills, domainWeights } = useUserSkillTable(skillRows);

  if (!userId) {
    return null;
  }

  return (
    <div className="flex flex-col gap-12 px-6 pb-12 bg-white text-gray-900 min-h-screen">
      {/* Skills Graph Visualization */}
      <DashboardSection title="Skills Distribution" className="py-6">
        <div className="flex justify-center">
          <div className="h-[700px] w-[850px] flex items-center justify-center">
            <SkillGraph
              width={700}
              height={700}
              domainWeights={domainWeights}
              skillVisibility={visibleSkills}
            />
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
        </div>
      </DashboardSection>
    </div>
  );
}
