"use client";

import { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/shared/Badge";
import type {
  OutlierDeveloper,
  OutlierPriority,
} from "@/lib/dashboard/entities/team/types";
import { SPOF_STYLES } from "@/lib/dashboard/entities/team/mocks/outliersMockData";
import {
  DASHBOARD_TEXT_CLASSES,
  STATUS_COLORS,
} from "@/lib/dashboard/shared/utils/colors";

type OutliersTableProps = {
  developers: OutlierDeveloper[];
  className?: string;
};

type ViewMode = "outliers" | "all";

const SECTION_CONFIG: Record<
  OutlierPriority,
  { label: string; rowBg: string; rowHover: string; badgeBg: string; badgeText: string }
> = {
  critical: {
    label: "Lower than expected",
    rowBg: STATUS_COLORS.critical.bg,
    rowHover: "hover:bg-[#ef4444]/10",
    badgeBg: STATUS_COLORS.critical.bg,
    badgeText: STATUS_COLORS.critical.text,
  },
  attention: {
    label: "Higher than expected",
    rowBg: STATUS_COLORS.attention.bg,
    rowHover: "hover:bg-[#f59e0b]/10",
    badgeBg: STATUS_COLORS.attention.bg,
    badgeText: STATUS_COLORS.attention.text,
  },
  normal: {
    label: "As expected",
    rowBg: STATUS_COLORS.healthy.bg,
    rowHover: "hover:bg-[#22c55e]/10",
    badgeBg: STATUS_COLORS.healthy.bg,
    badgeText: STATUS_COLORS.healthy.text,
  },
};

type DeveloperRowProps = {
  dev: OutlierDeveloper;
  globalIndex: number;
  priority: OutlierPriority;
  isFirstInSection: boolean;
};

function DeveloperRow({
  dev,
  globalIndex,
  priority,
  isFirstInSection,
}: DeveloperRowProps) {
  const spofStyle = SPOF_STYLES[dev.spofAssessment];
  const config = SECTION_CONFIG[priority];

  return (
    <TableRow className={cn(config.rowBg, config.rowHover)}>
      {/* Category badge — only on first row of each section */}
      <TableCell className="w-[150px]">
        {isFirstInSection && (
          <span
            className={cn(
              "px-2.5 py-0.5 text-xs font-semibold rounded-full whitespace-nowrap",
              config.badgeBg,
              config.badgeText
            )}
          >
            {config.label}
          </span>
        )}
      </TableCell>

      {/* Rank */}
      <TableCell className="w-14">
        <span
          className={
            globalIndex < 3
              ? "text-foreground font-bold"
              : DASHBOARD_TEXT_CLASSES.rankMuted
          }
        >
          {globalIndex + 1}
        </span>
      </TableCell>

      {/* Name + subtitle */}
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-medium shrink-0">
            {dev.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-gray-900 truncate">{dev.name}</p>
            <p className="text-xs text-gray-400">{dev.chaosCategory}</p>
          </div>
        </div>
      </TableCell>

      {/* SPOF Assessment */}
      <TableCell>
        <span
          className={cn(
            "px-2.5 py-1 text-xs font-medium rounded-full whitespace-nowrap",
            spofStyle.bgColor,
            spofStyle.textColor
          )}
        >
          {spofStyle.label}
        </span>
      </TableCell>
    </TableRow>
  );
}

/**
 * Outliers table showing developers grouped by priority sections.
 * Toggle between "See Outliers" (Critical + Needs Attention) and "See All" (includes Normal).
 */
export function OutliersTable({ developers, className }: OutliersTableProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("outliers");

  const grouped = useMemo(() => {
    const groups: Record<OutlierPriority, OutlierDeveloper[]> = {
      critical: [],
      attention: [],
      normal: [],
    };
    developers.forEach((dev) => {
      groups[dev.priority].push(dev);
    });
    return groups;
  }, [developers]);

  const rows = useMemo(() => {
    const sectionsToShow: OutlierPriority[] =
      viewMode === "outliers"
        ? ["critical", "attention"]
        : ["critical", "attention", "normal"];

    const result: {
      dev: OutlierDeveloper;
      priority: OutlierPriority;
      isFirstInSection: boolean;
      globalIndex: number;
    }[] = [];
    let globalIndex = 0;

    sectionsToShow.forEach((priority) => {
      grouped[priority].forEach((dev, idx) => {
        result.push({ dev, priority, isFirstInSection: idx === 0, globalIndex: globalIndex++ });
      });
    });

    return result;
  }, [grouped, viewMode]);

  return (
    <div className={cn("w-full", className)}>
      {/* Toggle */}
      <div className="flex flex-row flex-wrap items-center gap-2 mb-4">
        <Badge
          onClick={() => setViewMode("outliers")}
          className={`px-3 py-2 rounded-lg cursor-pointer text-xs font-medium transition-colors ${
            viewMode === "outliers"
              ? "bg-gray-100 text-gray-700 hover:bg-gray-100"
              : "bg-transparent text-gray-700 border border-gray-200 hover:bg-gray-100"
          }`}
        >
          See Outliers
        </Badge>
        <Badge
          onClick={() => setViewMode("all")}
          className={`px-3 py-2 rounded-lg cursor-pointer text-xs font-medium transition-colors ${
            viewMode === "all"
              ? "bg-gray-100 text-gray-700 hover:bg-gray-100"
              : "bg-transparent text-gray-700 border border-gray-200 hover:bg-gray-100"
          }`}
        >
          See All
        </Badge>
        <span className="text-gray-300">|</span>
        <span className="text-xs text-gray-500">
          {viewMode === "outliers"
            ? `${grouped.critical.length + grouped.attention.length} outliers`
            : `${developers.length} total`}
        </span>
      </div>

      {/* Table */}
      <div className="rounded-sm border-none overflow-hidden bg-white">
        <Table>
          <TableHeader className="border-0">
            <TableRow className="border-none hover:bg-transparent">
              <TableHead className="w-[150px] text-foreground font-medium">
                Category
              </TableHead>
              <TableHead className="w-14 text-foreground font-medium">Rank</TableHead>
              <TableHead className="text-foreground font-medium">Name</TableHead>
              <TableHead className="text-foreground font-medium">SPOF Assessment</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-gray-400">
                  No developers to display
                </TableCell>
              </TableRow>
            ) : (
              rows.map(({ dev, priority, isFirstInSection, globalIndex }) => (
                <DeveloperRow
                  key={dev.id}
                  dev={dev}
                  globalIndex={globalIndex}
                  priority={priority}
                  isFirstInSection={isFirstInSection}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
