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
import type {
  OutlierDeveloper,
  OutlierPriority,
} from "@/lib/dashboard/entities/team/types";
import {
  OWNERSHIP_STYLES,
  CHAOS_STYLES,
  SPOF_STYLES,
} from "@/lib/dashboard/entities/team/mocks/outliersMockData";

type OutliersTableProps = {
  developers: OutlierDeveloper[];
  className?: string;
};

type ViewMode = "outliers" | "all";

const SECTION_CONFIG: Record<OutlierPriority, { label: string; bgColor: string; textColor: string; dotColor: string }> = {
  critical: {
    label: "Critical",
    bgColor: "bg-red-50",
    textColor: "text-red-700",
    dotColor: "bg-red-500",
  },
  attention: {
    label: "Needs Attention",
    bgColor: "bg-amber-50",
    textColor: "text-amber-700",
    dotColor: "bg-amber-500",
  },
  normal: {
    label: "Normal",
    bgColor: "bg-green-50",
    textColor: "text-green-700",
    dotColor: "bg-green-500",
  },
};

type DeveloperRowProps = {
  dev: OutlierDeveloper;
  index: number;
};

function DeveloperRow({ dev, index }: DeveloperRowProps) {
  const ownershipStyle = OWNERSHIP_STYLES[dev.ownershipCategory];
  const chaosStyle = CHAOS_STYLES[dev.chaosCategory];
  const spofStyle = SPOF_STYLES[dev.spofAssessment];

  return (
    <TableRow>
      {/* Rank */}
      <TableCell className="text-center w-[50px]">
        <span
          className={cn(
            "text-sm font-medium",
            index < 3 ? "text-gray-900 font-bold" : "text-gray-400"
          )}
        >
          {index + 1}
        </span>
      </TableCell>

      {/* Name */}
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
            <p className="text-xs text-gray-400">{dev.team}</p>
          </div>
        </div>
      </TableCell>

      {/* Ownership Category */}
      <TableCell>
        <span
          className={cn(
            "px-2.5 py-1 text-xs font-medium rounded-full whitespace-nowrap",
            ownershipStyle.bgColor,
            ownershipStyle.textColor
          )}
        >
          {ownershipStyle.label}
        </span>
      </TableCell>

      {/* Chaos Category */}
      <TableCell>
        <span
          className={cn(
            "px-2.5 py-1 text-xs font-medium rounded-full whitespace-nowrap",
            chaosStyle.bgColor,
            chaosStyle.textColor
          )}
        >
          {dev.chaosCategory}
        </span>
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

type SectionHeaderProps = {
  priority: OutlierPriority;
  count: number;
};

function SectionHeader({ priority, count }: SectionHeaderProps) {
  const config = SECTION_CONFIG[priority];

  return (
    <TableRow className={config.bgColor}>
      <TableCell colSpan={5} className="py-2.5">
        <div className="flex items-center gap-2">
          <div className={cn("w-2 h-2 rounded-full", config.dotColor)} />
          <span className={cn("text-sm font-semibold", config.textColor)}>
            {config.label}
          </span>
          <span className={cn("text-sm", config.textColor)}>({count})</span>
        </div>
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

  // Group developers by priority
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

  // Determine which sections to show based on view mode
  const sectionsToShow: OutlierPriority[] =
    viewMode === "outliers"
      ? ["critical", "attention"]
      : ["critical", "attention", "normal"];

  // Calculate running index for row numbers
  let runningIndex = 0;

  return (
    <div className={cn("w-full", className)}>
      {/* Toggle */}
      <div className="flex items-center gap-2 mb-4">
        <button
          type="button"
          onClick={() => setViewMode("outliers")}
          className={cn(
            "px-4 py-1.5 text-sm font-medium rounded-md transition-colors",
            viewMode === "outliers"
              ? "bg-gray-900 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          )}
        >
          See Outliers
        </button>
        <button
          type="button"
          onClick={() => setViewMode("all")}
          className={cn(
            "px-4 py-1.5 text-sm font-medium rounded-md transition-colors",
            viewMode === "all"
              ? "bg-gray-900 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          )}
        >
          See All
        </button>
        <span className="ml-2 text-sm text-gray-500">
          {viewMode === "outliers"
            ? `${grouped.critical.length + grouped.attention.length} outliers`
            : `${developers.length} total`}
        </span>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-[50px] text-center">#</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Expected Share of Ownership</TableHead>
              <TableHead>Quadrant</TableHead>
              <TableHead>SPOF Assessment</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sectionsToShow.map((priority) => {
              const sectionDevs = grouped[priority];
              if (sectionDevs.length === 0) return null;

              const startIndex = runningIndex;
              runningIndex += sectionDevs.length;

              return (
                <SectionRows
                  key={priority}
                  priority={priority}
                  developers={sectionDevs}
                  startIndex={startIndex}
                />
              );
            })}
            {sectionsToShow.every((p) => grouped[p].length === 0) && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-400">
                  No developers to display
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

type SectionRowsProps = {
  priority: OutlierPriority;
  developers: OutlierDeveloper[];
  startIndex: number;
};

function SectionRows({ priority, developers, startIndex }: SectionRowsProps) {
  return (
    <>
      <SectionHeader priority={priority} count={developers.length} />
      {developers.map((dev, idx) => (
        <DeveloperRow key={dev.id} dev={dev} index={startIndex + idx} />
      ))}
    </>
  );
}
