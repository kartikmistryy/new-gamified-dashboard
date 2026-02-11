"use client";

import { Fragment, useState, useMemo } from "react";
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { ChevronDownIcon, ChevronUpIcon, Layers, Users } from "lucide-react";

import { DashboardSection } from "@/components/dashboard/shared/DashboardSection";
import { RepoHealthBar } from "@/components/dashboard/shared/RepoHealthBar";
import { D3Gauge } from "@/components/dashboard/shared/D3Gauge";
import { FilterBadges } from "@/components/dashboard/shared/FilterBadges";
import { SortableTableHeader } from "@/components/dashboard/shared/SortableTableHeader";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/shared/UserAvatar";

import {
  type OrgRepoSpofRow,
  type OrgRepoSpofFilter,
  ORG_REPO_SPOF_ROWS,
  ORG_SPOF_TOTALS,
  ORG_REPO_SPOF_FILTER_TABS,
  sortOrgRepoSpof,
} from "@/lib/dashboard/entities/team/mocks/spofMockData";
import { DASHBOARD_TEXT_CLASSES } from "@/lib/dashboard/shared/utils/colors";
import { getGaugeColor, getPerformanceGaugeLabel } from "@/lib/dashboard/entities/team/utils/utils";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_SPOF_GAUGE_VALUE = 28;

// ---------------------------------------------------------------------------
// Column definitions
// ---------------------------------------------------------------------------

const repoSpofColumns: ColumnDef<OrgRepoSpofRow>[] = [
  {
    id: "expander",
    header: () => null,
    enableSorting: false,
    cell: ({ row }) => (
      <Button
        className="size-7 text-muted-foreground"
        onClick={row.getToggleExpandedHandler()}
        aria-expanded={row.getIsExpanded()}
        aria-label={
          row.getIsExpanded()
            ? `Collapse details for ${row.original.repoName}`
            : `Expand details for ${row.original.repoName}`
        }
        size="icon"
        variant="ghost"
      >
        {row.getIsExpanded() ? (
          <ChevronUpIcon className="opacity-60" aria-hidden="true" />
        ) : (
          <ChevronDownIcon className="opacity-60" aria-hidden="true" />
        )}
      </Button>
    ),
  },
  {
    id: "rank",
    header: "Rank",
    enableSorting: false,
    meta: { className: "w-14" },
    cell: ({ row }) => {
      const rank = row.index + 1;
      return (
        <span className={rank <= 3 ? "text-foreground font-bold" : DASHBOARD_TEXT_CLASSES.rankMuted}>
          {rank}
        </span>
      );
    },
  },
  {
    id: "repoName",
    header: "Repo",
    accessorKey: "repoName",
    enableSorting: false,
    cell: ({ row }) => (
      <span className="font-medium text-gray-900">{row.original.repoName}</span>
    ),
  },
  {
    header: "# of SPOF Owners",
    accessorKey: "spofModuleCount",
    meta: { className: "text-right" },
    cell: ({ row }) => (
      <span className="block text-right text-gray-900">{row.original.spofModuleCount}</span>
    ),
  },
  {
    header: "# of Unique SPOF Owners",
    accessorKey: "spofOwnerCount",
    meta: { className: "text-right" },
    cell: ({ row }) => (
      <span className="block text-right text-gray-900">{row.original.spofOwnerCount}</span>
    ),
  },
];

// ---------------------------------------------------------------------------
// Status badge helper
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "At Risk":
      return <Badge variant="destructive">{status}</Badge>;
    case "Need Attention":
      return (
        <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200">
          {status}
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
          {status}
        </Badge>
      );
  }
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export function OrgSpofPageClient() {
  // Expandable table state
  const [currentFilter, setCurrentFilter] = useState<OrgRepoSpofFilter>("mostSpofModules");
  const [sorting, setSorting] = useState<SortingState>([
    { id: "spofModuleCount", desc: true },
  ]);

  const sortedRows = useMemo(
    () => sortOrgRepoSpof(ORG_REPO_SPOF_ROWS, currentFilter),
    [currentFilter],
  );

  const table = useReactTable({
    data: sortedRows,
    columns: repoSpofColumns,
    getRowCanExpand: () => true,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
  });

  return (
    <div className="flex flex-col gap-8 px-6 pb-8 bg-white text-gray-900 min-h-screen">
      {/* Gauge + SPOF Overview side by side */}
      <div className="flex flex-row flex-wrap items-stretch gap-8">
          {/* Gauge */}
          <div className="flex shrink-0 min-w-[280px] max-w-[50%]">
            <D3Gauge
              value={DEFAULT_SPOF_GAUGE_VALUE}
              label={getPerformanceGaugeLabel(DEFAULT_SPOF_GAUGE_VALUE)}
              labelColor={getGaugeColor(DEFAULT_SPOF_GAUGE_VALUE)}
              valueDisplay={`${DEFAULT_SPOF_GAUGE_VALUE}/100`}
            />
          </div>

          {/* SPOF Overview card */}
          <div className="flex-1 min-w-[280px] flex items-center">
            <div className="w-full rounded-[10px] bg-[#F6F5FA] p-6">
              {/* Stat cards — left aligned */}
              <div className="flex items-center gap-8">
                {/* SPOF by Module */}
                <div className="flex items-center gap-3">
                  <Layers className="size-6 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">SPOF by Module</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {ORG_SPOF_TOTALS.totalSpofModules}
                    </p>
                  </div>
                </div>

                {/* Vertical separator */}
                <div className="h-16 w-px bg-gray-300" />

                {/* SPOF Owner */}
                <div className="flex items-center gap-3">
                  <Users className="size-6 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">SPOF Owner</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {ORG_SPOF_TOTALS.totalSpofOwners}
                    </p>
                  </div>
                </div>
              </div>

              {/* Repo health bar */}
              <div className="mt-6">
                <RepoHealthBar />
              </div>
            </div>
          </div>
      </div>

      {/* SPOF Repositories — expandable repo-level table */}
      <DashboardSection title="SPOF Repositories">
        <div className="w-full">
          <FilterBadges
            filterTabs={ORG_REPO_SPOF_FILTER_TABS}
            currentFilter={currentFilter}
            onFilterChange={setCurrentFilter}
          />

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
                            <Table>
                              <TableHeader>
                                <TableRow className="hover:bg-muted/30!">
                                  <TableHead className="w-20" />
                                  <TableHead>Module</TableHead>
                                  <TableHead>Status</TableHead>
                                  <TableHead>SPOF Owner</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {row.original.modules.map((mod) => (
                                  <TableRow key={mod.moduleName}>
                                    <TableCell />
                                    <TableCell className="font-medium">{mod.moduleName}</TableCell>
                                    <TableCell>
                                      <StatusBadge status={mod.status} />
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-2">
                                        <UserAvatar userName={mod.ownerName} className="size-5" size={20} />
                                        <span>{mod.ownerName}</span>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableCell>
                        </TableRow>
                      ) : null}
                    </Fragment>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={repoSpofColumns.length} className="h-24 text-center">
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <p className="mt-4 text-center text-sm text-gray-400">All Loaded</p>
        </div>
      </DashboardSection>
    </div>
  );
}
