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

import Link from "next/link";

import { DashboardSection } from "@/components/dashboard/shared/DashboardSection";
import { RepoHealthBar } from "@/components/dashboard/shared/RepoHealthBar";
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
  type SpofRiskLevel,
  ORG_REPO_SPOF_ROWS,
  ORG_SPOF_TOTALS,
  ORG_REPO_SPOF_FILTER_TABS,
  ORG_HEALTH_SEGMENTS,
  ORG_SPOF_RISK_LEVEL,
  sortOrgRepoSpof,
} from "@/lib/dashboard/entities/team/data/orgSpofDataLoader";
import { DASHBOARD_TEXT_CLASSES } from "@/lib/dashboard/shared/utils/colors";
import { getRepoPath } from "@/lib/routes";

// ---------------------------------------------------------------------------
// SPOF Risk Level Colors
// ---------------------------------------------------------------------------

const RISK_LEVEL_COLORS: Record<SpofRiskLevel, string> = {
  Severe: "text-red-600",
  High: "text-orange-500",
  Medium: "text-amber-500",
  Low: "text-green-600",
};

const RISK_LEVELS: SpofRiskLevel[] = ["Severe", "High", "Medium", "Low"];

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
      <Link
        href={getRepoPath("gitroll", row.original.repoName, "spof")}
        className="font-medium text-gray-900 hover:text-blue-600 hover:underline"
      >
        {row.original.repoName}
      </Link>
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
  {
    id: "healthBar",
    header: "Module Health",
    enableSorting: false,
    meta: { className: "w-48" },
    cell: ({ row }) => {
      const { healthy, needsAttention, critical } = row.original.healthDistribution;
      const segments = [
        { label: "Healthy", count: healthy, color: "#22c55e" },
        { label: "Needs Attention", count: needsAttention, color: "#f59e0b" },
        { label: "Critical", count: critical, color: "#ef4444" },
      ];
      return <RepoHealthBar segments={segments} compact />;
    },
  },
];

// ---------------------------------------------------------------------------
// Status badge helper
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "At Risk":
      return <Badge variant="destructive">{status}</Badge>;
    case "Needs Attention":
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

/** Display up to 3 owners with overflow indicator */
function OwnersList({ owners }: { owners: string[] }) {
  const displayOwners = owners.slice(0, 3);
  const overflow = owners.length > 3 ? owners.length - 3 : 0;

  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-1">
        {displayOwners.map((name) => (
          <UserAvatar key={name} userName={name} className="size-6 border-2 border-white" size={24} />
        ))}
      </div>
      {owners.length === 1 && <span className="text-sm">{owners[0]}</span>}
      {owners.length === 2 && <span className="text-sm">{owners.join(", ")}</span>}
      {owners.length >= 3 && (
        <span className="text-sm text-gray-600">
          {displayOwners.join(", ")}
          {overflow > 0 && <span className="text-gray-400"> +{overflow}</span>}
        </span>
      )}
    </div>
  );
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
      {/* 3-column layout: Risk Indicator → Motivation → Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* SPOF Risk Indicator Card */}
        <div className="rounded-[10px] bg-[#F6F5FA] p-6 flex flex-col justify-center">
          <p className="text-sm text-gray-500 mb-3">SPOF Risk is:</p>

          {/* Large risk level display */}
          <div className="flex items-baseline gap-2 mb-4">
            <span className={`text-4xl font-bold ${RISK_LEVEL_COLORS[ORG_SPOF_RISK_LEVEL]}`}>
              {ORG_SPOF_RISK_LEVEL}
            </span>
            <span className="text-sm text-gray-500">
              ({Math.round(((ORG_SPOF_TOTALS.healthDistribution.needsAttention + ORG_SPOF_TOTALS.healthDistribution.critical) /
                (ORG_SPOF_TOTALS.healthDistribution.healthy + ORG_SPOF_TOTALS.healthDistribution.needsAttention + ORG_SPOF_TOTALS.healthDistribution.critical)) * 100)}% at-risk)
            </span>
          </div>

          {/* Risk spectrum bar */}
          <div className="flex h-2 w-full rounded-full overflow-hidden mb-2">
            <div className="h-full bg-red-500" style={{ width: "25%" }} />
            <div className="h-full bg-orange-400" style={{ width: "25%" }} />
            <div className="h-full bg-amber-400" style={{ width: "25%" }} />
            <div className="h-full bg-green-500" style={{ width: "25%" }} />
          </div>

          {/* Risk level labels */}
          <div className="flex justify-between text-xs">
            {RISK_LEVELS.map((level) => (
              <span
                key={level}
                className={level === ORG_SPOF_RISK_LEVEL ? "font-bold text-gray-700" : "text-gray-400"}
              >
                {level}
              </span>
            ))}
          </div>
        </div>

        {/* Motivation Card */}
        <div className="rounded-[10px] p-6 flex flex-col justify-center">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Why It Matters
          </p>
          <p className="text-sm text-gray-700 mb-4">
            Identifies irreplaceable developers whose departure would put critical code at risk.
          </p>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            How It&apos;s Calculated
          </p>
          <p className="text-sm text-gray-700">
            Analyzes file creation (First Authorship), commit history (Deliveries), and knowledge
            distribution (Acceptances). Modules where 1-2 developers hold dominant ownership are
            flagged as at-risk.
          </p>
        </div>

        {/* Stats Card */}
        <div className="rounded-[10px] bg-[#F6F5FA] p-6 flex flex-col justify-center">
          {/* Stat cards — left aligned */}
          <div className="flex items-center gap-6 mb-4">
            {/* SPOF by Module */}
            <div className="flex items-center gap-3">
              <Layers className="size-5 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">SPOF by Module</p>
                <p className="text-xl font-bold text-gray-900">
                  {ORG_SPOF_TOTALS.spofModuleCount}
                </p>
              </div>
            </div>

            {/* Vertical separator */}
            <div className="h-12 w-px bg-gray-300" />

            {/* Unique SPOF Owner */}
            <div className="flex items-center gap-3">
              <Users className="size-5 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Unique SPOF Owner</p>
                <p className="text-xl font-bold text-gray-900">
                  {ORG_SPOF_TOTALS.uniqueSpofOwnerCount}
                </p>
              </div>
            </div>
          </div>

          {/* Repo health bar */}
          <RepoHealthBar segments={ORG_HEALTH_SEGMENTS} />
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
                                      <OwnersList owners={mod.owners} />
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
