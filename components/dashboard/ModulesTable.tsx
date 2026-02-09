"use client";
"use no memo";

import { useState, useMemo } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge as UiBadge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { SortableTableHeader } from "./SortableTableHeader";
import { ModuleDetailSheet } from "./ModuleDetailSheet";
import type { ModuleSPOFData } from "@/lib/userDashboard/types";
import { DASHBOARD_TEXT_CLASSES, DASHBOARD_COLORS } from "@/lib/orgDashboard/colors";
import { hexToRgba } from "@/lib/orgDashboard/tableUtils";
import {
  filterModules,
  sortModulesByRisk,
  type ModuleFilter,
} from "@/lib/userDashboard/userSpofHelpers";

type ModulesTableProps = {
  /** Array of module SPOF data to display. */
  modules: ModuleSPOFData[];
  /** Current user ID for owner-based filtering. */
  currentUserId?: string;
};

/**
 * Get risk badge styling based on SPOF score range.
 * Uses dashboard color constants for consistency.
 *
 * @param scoreRange - SPOF score range category
 * @returns Object with badge text and color
 */
function getRiskBadgeStyle(scoreRange: ModuleSPOFData["scoreRange"]) {
  switch (scoreRange) {
    case "high":
      return {
        text: "High Risk",
        color: DASHBOARD_COLORS.danger,
      };
    case "medium":
      return {
        text: "Medium Risk",
        color: DASHBOARD_COLORS.warning,
      };
    case "low":
      return {
        text: "Low Risk",
        color: DASHBOARD_COLORS.excellent,
      };
  }
}

/**
 * Owner Cell Component with Progress Bar
 *
 * Displays owner info with avatar, name, and ownership percentage as a progress bar.
 *
 * @param name - Owner name
 * @param percent - Ownership percentage
 * @param color - Color for the progress bar
 */
function OwnerCell({ name, percent, color }: { name: string; percent: number; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <UserAvatar userName={name} className="size-8 shrink-0" />
      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
        <span className="text-sm text-gray-900 font-medium truncate">
          {name}
        </span>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${percent}%`,
                backgroundColor: color,
              }}
            />
          </div>
          <span className="text-xs text-gray-600 font-medium min-w-[35px] text-right">
            {percent}%
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Modules Table Component
 *
 * Displays a sortable, filterable table of modules with ownership and SPOF risk information.
 *
 * Features:
 * - Filter tabs for risk levels and ownership roles
 * - Risk badges with color-coded severity
 * - Owner avatars and ownership percentages
 * - Repository badges for module organization
 * - Automatic ranking based on SPOF score
 *
 * @example
 * ```tsx
 * <ModulesTable
 *   modules={userModules}
 *   currentUserId={userId}
 * />
 * ```
 */
export function ModulesTable({ modules, currentUserId }: ModulesTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selectedModule, setSelectedModule] = useState<ModuleSPOFData | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Filter and sort modules
  const displayedModules = useMemo(() => {
    const filtered = filterModules(modules, "all", currentUserId);
    return sortModulesByRisk(filtered);
  }, [modules, currentUserId]);

  // Handle row click
  const handleRowClick = (module: ModuleSPOFData) => {
    setSelectedModule(module);
    setIsSheetOpen(true);
  };

  const columns = useMemo<ColumnDef<ModuleSPOFData, unknown>[]>(() => [
    {
      id: "rank",
      header: "Rank",
      cell: ({ row }) => {
        const rank = row.index + 1;
        return (
          <span
            className={
              rank <= 3
                ? "text-foreground font-bold"
                : DASHBOARD_TEXT_CLASSES.rankMuted
            }
          >
            {rank}
          </span>
        );
      },
      enableSorting: false,
      meta: { className: "w-14 py-4" },
    },
    {
      id: "module",
      header: "Module",
      accessorFn: (row) => row.name,
      cell: ({ row }) => (
        <div className="flex flex-col gap-1.5 w-full">
          <UiBadge variant="outline" className="text-xs w-fit">
            {row.original.repoName}
          </UiBadge>
          <span className="font-medium text-gray-900">
            {row.original.name}
          </span>
        </div>
      ),
      meta: { className: "py-4" },
    },
    {
      id: "primaryOwner",
      header: "Primary Owner",
      accessorFn: (row) => row.primaryOwner.ownershipPercent,
      cell: ({ row }) => {
        const ownershipColor =
          row.original.scoreRange === "high" ? "#DD524C" :
          row.original.scoreRange === "medium" ? "#E87B35" :
          "#55B685";
        return (
          <OwnerCell
            name={row.original.primaryOwner.name}
            percent={row.original.primaryOwner.ownershipPercent}
            color={ownershipColor}
          />
        );
      },
      meta: { className: "w-[260px] py-4" },
    },
    {
      id: "backupOwner",
      header: "Backup Owner",
      accessorFn: (row) => row.backupOwner.ownershipPercent,
      cell: ({ row }) => (
        <OwnerCell
          name={row.original.backupOwner.name}
          percent={row.original.backupOwner.ownershipPercent}
          color="#94A3B8"
        />
      ),
      meta: { className: "w-[260px] py-4" },
    },
    {
      id: "risk",
      header: "Risk",
      accessorFn: (row) => {
        const riskOrder = { high: 3, medium: 2, low: 1 };
        return riskOrder[row.scoreRange];
      },
      cell: ({ row }) => {
        const riskBadge = getRiskBadgeStyle(row.original.scoreRange);
        return (
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium"
            style={{
              backgroundColor: hexToRgba(riskBadge.color, 0.25),
              color: riskBadge.color,
            }}
          >
            {riskBadge.text}
          </span>
        );
      },
      meta: { className: "w-[140px] pl-6 py-4" },
    },
  ], []);

  const table = useReactTable({
    data: displayedModules,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
  });

  return (
    <>
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
              {table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.original.id}
                  onClick={() => handleRowClick(row.original)}
                  className="border-none hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={(cell.column.columnDef.meta as { className?: string })?.className}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <ModuleDetailSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        module={selectedModule}
      />
    </>
  );
}
