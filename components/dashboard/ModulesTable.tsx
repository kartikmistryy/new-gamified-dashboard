"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge as UiBadge } from "@/components/ui/badge";
import { Badge } from "@/components/shared/Badge";
import { UserAvatar } from "@/components/shared/UserAvatar";
import type { ModuleSPOFData } from "@/lib/userDashboard/types";
import { DASHBOARD_TEXT_CLASSES, DASHBOARD_COLORS } from "@/lib/orgDashboard/colors";
import { hexToRgba } from "@/lib/orgDashboard/tableUtils";
import {
  MODULE_FILTER_TABS,
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
      <UserAvatar userName={name} className="size-8 flex-shrink-0" />
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
  const [currentFilter, setCurrentFilter] = useState<ModuleFilter>("all");

  // Filter and sort modules
  const displayedModules = useMemo(() => {
    const filtered = filterModules(modules, currentFilter, currentUserId);
    return sortModulesByRisk(filtered);
  }, [modules, currentFilter, currentUserId]);

  return (
    <div className="w-full">
      {/* Filter Tabs */}
      <div className="flex flex-row flex-wrap gap-2 mb-4">
        {MODULE_FILTER_TABS.map((tab) => (
          <Badge
            key={tab.key}
            onClick={() => setCurrentFilter(tab.key)}
            className={`px-3 py-2 rounded-lg cursor-pointer text-xs font-medium transition-colors ${
              currentFilter === tab.key
                ? "bg-gray-100 text-gray-700 hover:bg-gray-100"
                : "bg-transparent text-gray-700 border border-gray-200 hover:bg-gray-100"
            }`}
          >
            {tab.label}
          </Badge>
        ))}
      </div>

      {/* Modules Table */}
      <div className="rounded-sm border-none overflow-hidden bg-white">
        <Table>
          <TableHeader className="border-0">
            <TableRow className="border-none hover:bg-transparent">
              <TableHead className="w-14 text-foreground font-medium">
                Rank
              </TableHead>
              <TableHead className="text-foreground font-medium w-[280px]">
                Module
              </TableHead>
              <TableHead className="text-foreground font-medium w-[280px]">
                Primary Owner
              </TableHead>
              <TableHead className="text-foreground font-medium w-[280px]">
                Backup Owner
              </TableHead>
              <TableHead className="text-foreground font-medium text-right">
                Risk
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedModules.map((module, index) => {
              const rank = index + 1;
              const riskBadge = getRiskBadgeStyle(module.scoreRange);

              // Get color for ownership bars based on risk level
              const ownershipColor =
                module.scoreRange === "high" ? "#DD524C" :
                module.scoreRange === "medium" ? "#E87B35" :
                "#55B685";

              return (
                <TableRow
                  key={module.id}
                  className="border-none hover:bg-gray-50 transition-colors"
                >
                  {/* Rank */}
                  <TableCell className="py-4">
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

                  {/* Module (Repo badge + Module name) */}
                  <TableCell className="py-4">
                    <div className="flex flex-col gap-1.5">
                      <UiBadge variant="outline" className="text-xs w-fit">
                        {module.repoName}
                      </UiBadge>
                      <span className="font-medium text-gray-900">
                        {module.name}
                      </span>
                    </div>
                  </TableCell>

                  {/* Primary Owner with Progress Bar */}
                  <TableCell className="py-4">
                    <OwnerCell
                      name={module.primaryOwner.name}
                      percent={module.primaryOwner.ownershipPercent}
                      color={ownershipColor}
                    />
                  </TableCell>

                  {/* Backup Owner with Progress Bar */}
                  <TableCell className="py-4">
                    <OwnerCell
                      name={module.backupOwner.name}
                      percent={module.backupOwner.ownershipPercent}
                      color="#94A3B8"
                    />
                  </TableCell>

                  {/* Risk Badge */}
                  <TableCell className="py-4 text-right">
                    <span
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium"
                      style={{
                        backgroundColor: hexToRgba(riskBadge.color, 0.25),
                        color: riskBadge.color,
                      }}
                    >
                      {riskBadge.text}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
