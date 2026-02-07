"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import type { SkillgraphSkillRow } from "@/lib/orgDashboard/types";
import { DASHBOARD_TEXT_CLASSES } from "@/lib/orgDashboard/colors";
import { VisibilityToggleButton } from "@/components/dashboard/VisibilityToggleButton";
import { getColorForDomain } from "@/components/skillmap/skillGraphUtils";
import { Button } from "@/components/ui/button";
import { hexToRgba } from "@/lib/orgDashboard/tableUtils";

const USAGE_FORMATTER = new Intl.NumberFormat("en-US");

function getTotalSkillCompletionValue(row: SkillgraphSkillRow) {
  const rawValue = row.totalSkillCompletion;
  const fallbackValue =
    row.details?.length
      ? row.details.reduce((sum, detail) => sum + detail.progress, 0) / row.details.length
      : 0;
  const safeValue = Number.isFinite(rawValue) ? rawValue : fallbackValue;
  return Math.round(Math.max(0, Math.min(100, safeValue)));
}

type CreateSkillgraphSkillColumnsOptions = {
  toggleVisibility: (skillName: string) => void;
  visibleDomains: Record<string, boolean>;
  opacityScale: (value: number) => number;
};

export function createSkillgraphSkillColumns({
  toggleVisibility,
  visibleDomains,
  opacityScale,
}: CreateSkillgraphSkillColumnsOptions): ColumnDef<SkillgraphSkillRow>[] {
  return [
    {
      id: "expander",
      header: () => null,
      cell: ({ row }) => (
        <Button
          className="size-7 text-muted-foreground"
          onClick={row.getToggleExpandedHandler()}
          aria-expanded={row.getIsExpanded()}
          aria-label={
            row.getIsExpanded()
              ? `Collapse details for ${row.original.skillName}`
              : `Expand details for ${row.original.skillName}`
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
      id: "view",
      header: "",
      cell: ({ row }) => (
        <VisibilityToggleButton
          isVisible={visibleDomains[row.original.skillName] !== false}
          onToggle={() => toggleVisibility(row.original.skillName)}
        />
      ),
    },
    {
      id: "rank",
      header: "Rank",
      accessorFn: (_row, index) => index + 1,
      enableSorting: true,
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
      header: "Skill",
      accessorKey: "skillName",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div
            className="size-4 rounded shrink-0"
            style={{
              backgroundColor: hexToRgba(
                getColorForDomain(row.original.domainName),
                opacityScale(row.original.totalUsage)
              ),
            }}
            aria-hidden
          />
          <p className="font-medium text-gray-900">{row.original.skillName}</p>
        </div>
      ),
    },
    {
      header: "Domain",
      accessorKey: "domainName",
      cell: ({ row }) => <span className="text-gray-900">{row.original.domainName}</span>,
    },
    {
      header: "Total Skill Usage",
      accessorKey: "totalUsage",
      meta: { className: "text-right" },
      cell: ({ row }) => (
        <span className="text-gray-900 block text-right">
          {USAGE_FORMATTER.format(row.original.totalUsage)}
        </span>
      ),
    },
    {
      header: "Total Skill Completion",
      accessorKey: "totalSkillCompletion",
      sortingFn: (rowA, rowB) => {
        const a = getTotalSkillCompletionValue(rowA.original);
        const b = getTotalSkillCompletionValue(rowB.original);
        return a === b ? 0 : a > b ? 1 : -1;
      },
      meta: { className: "text-right" },
      cell: ({ row }) => {
        const value = getTotalSkillCompletionValue(row.original);
        const color = getColorForDomain(row.original.domainName);
        return (
          <div className="flex items-center justify-end gap-3">
            <div className="h-2 w-[140px] rounded-full" style={{ backgroundColor: hexToRgba(color, 0.2) }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${value}%`, backgroundColor: color }}
                aria-hidden
              />
            </div>
            <span className="text-sm font-medium text-gray-900">
              {value}/100
            </span>
          </div>
        );
      },
    },
    {
      header: "Contributors",
      accessorKey: "contributors",
      meta: { className: "text-right" },
      cell: ({ row }) => (
        <span className="text-gray-900 block text-right">
          {USAGE_FORMATTER.format(row.original.contributors)} people
        </span>
      ),
    },
  ];
}
