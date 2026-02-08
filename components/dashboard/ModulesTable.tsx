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
              <TableHead className="text-foreground font-medium">
                Module
              </TableHead>
              <TableHead className="text-foreground font-medium">
                Primary Owner
              </TableHead>
              <TableHead className="text-right text-foreground font-medium">
                %
              </TableHead>
              <TableHead className="text-foreground font-medium">
                Backup Owner
              </TableHead>
              <TableHead className="text-right text-foreground font-medium">
                %
              </TableHead>
              <TableHead className="text-foreground font-medium">
                Risk
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedModules.map((module, index) => {
              const rank = index + 1;
              const riskBadge = getRiskBadgeStyle(module.scoreRange);

              return (
                <TableRow
                  key={module.id}
                  className="border-none hover:bg-gray-50 transition-colors"
                >
                  {/* Rank */}
                  <TableCell>
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
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <UiBadge variant="outline" className="text-xs">
                        {module.repoName}
                      </UiBadge>
                      <span className="font-medium text-gray-900">
                        {module.name}
                      </span>
                    </div>
                  </TableCell>

                  {/* Primary Owner */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <UserAvatar
                        userName={module.primaryOwner.name}
                        className="size-6"
                      />
                      <span className="text-gray-700">
                        {module.primaryOwner.name}
                      </span>
                    </div>
                  </TableCell>

                  {/* Primary Owner % */}
                  <TableCell className="text-right">
                    <span className="text-gray-700">
                      {module.primaryOwner.ownershipPercent}%
                    </span>
                  </TableCell>

                  {/* Backup Owner */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <UserAvatar
                        userName={module.backupOwner.name}
                        className="size-6"
                      />
                      <span className="text-gray-700">
                        {module.backupOwner.name}
                      </span>
                    </div>
                  </TableCell>

                  {/* Backup Owner % */}
                  <TableCell className="text-right">
                    <span className="text-gray-700">
                      {module.backupOwner.ownershipPercent}%
                    </span>
                  </TableCell>

                  {/* Risk Badge */}
                  <TableCell>
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
