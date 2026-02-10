/** Modules Table Column Definitions */

import type { ColumnDef } from "@tanstack/react-table";
import { Badge as UiBadge } from "@/components/ui/badge";
import type { ModuleSPOFData } from "./types";
import { DASHBOARD_TEXT_CLASSES } from "@/lib/orgDashboard/colors";
import { hexToRgba } from "@/lib/orgDashboard/tableUtils";
import { getRiskBadgeStyle, getOwnershipColor } from "./moduleTableUtils";
import { OwnerCell } from "@/components/dashboard/ModuleTableComponents";

export function createModuleColumns(): ColumnDef<ModuleSPOFData, unknown>[] {
  return [
    {
      id: "rank",
      header: "Rank",
      cell: ({ row }) => {
        const rank = row.index + 1;
        return (
          <span className={rank <= 3 ? "text-foreground font-bold" : DASHBOARD_TEXT_CLASSES.rankMuted}>
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
          <span className="font-medium text-gray-900">{row.original.name}</span>
        </div>
      ),
      meta: { className: "py-4" },
    },
    {
      id: "primaryOwner",
      header: "Primary Owner",
      accessorFn: (row) => row.primaryOwner.ownershipPercent,
      cell: ({ row }) => {
        const ownershipColor = getOwnershipColor(row.original.scoreRange);
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
  ];
}
