/** Modules Table Column Definitions */

import type { ColumnDef } from "@tanstack/react-table";
import type { ModuleSPOFData } from "../types";
import { DASHBOARD_TEXT_CLASSES } from "@/lib/dashboard/shared/utils/colors";
import { hexToRgba } from "@/lib/dashboard/entities/team/utils/tableUtils";
import { getStatusBadgeStyle, getOwnershipColor } from "../utils/moduleTableUtils";
import { OwnerCell } from "@/components/dashboard/repoDashboard/ModuleTableComponents";
import { UserAvatar } from "@/components/shared/UserAvatar";

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
        <span className="font-medium text-gray-900">{row.original.name}</span>
      ),
      meta: { className: "py-4" },
    },
    {
      id: "status",
      header: "Status",
      accessorFn: (row) => {
        const riskOrder = { high: 3, medium: 2, low: 1 };
        return riskOrder[row.scoreRange];
      },
      cell: ({ row }) => {
        const badge = getStatusBadgeStyle(row.original.scoreRange);
        return (
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium"
            style={{
              backgroundColor: hexToRgba(badge.color, 0.25),
              color: badge.color,
            }}
          >
            {badge.text}
          </span>
        );
      },
      meta: { className: "w-[140px] pl-6 py-4" },
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
      id: "backupOwners",
      header: "Backup Owners",
      accessorFn: (row) => row.backupOwners[0]?.ownershipPercent ?? 0,
      cell: ({ row }) => {
        const backups = row.original.backupOwners;
        if (backups.length === 0) {
          return <span className="text-sm text-gray-400">—</span>;
        }
        if (backups.length === 1) {
          return (
            <OwnerCell
              name={backups[0].name}
              percent={backups[0].ownershipPercent}
              color="#94A3B8"
            />
          );
        }
        return (
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex -space-x-2 shrink-0">
              {backups.slice(0, 3).map((owner) => (
                <UserAvatar key={owner.id} userName={owner.name} className="size-8 border-2 border-white" size={32} />
              ))}
            </div>
            <span className="text-sm font-medium text-gray-900 truncate">
              {backups.slice(0, 2).map((o) => o.name).join(", ")}
              {backups.length > 2 && (
                <span className="text-gray-400"> +{backups.length - 2}</span>
              )}
            </span>
          </div>
        );
      },
      meta: { className: "w-[260px] py-4" },
    },
  ];
}
