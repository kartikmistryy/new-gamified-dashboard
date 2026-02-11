"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Star, Bomb, AlertTriangle, BrickWall, FlaskConical, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import type { OverviewSummaryCardConfig, SummaryCardKey } from "@/lib/dashboard/entities/team/types";
import { Badge } from "@/components/shared/Badge";

const OVERVIEW_ICONS: Record<SummaryCardKey, React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>> = {
  star: Star,
  "key-player": AlertTriangle,
  bottleneck: FlaskConical,
  stable: BrickWall,
  risky: AlertTriangle,
  "time-bomb": Bomb,
};

export type OverviewSummaryCardProps = {
  item: OverviewSummaryCardConfig;
};

function isCssColor(value: string): boolean {
  return value.startsWith("#") || value.startsWith("rgb");
}

const TREND_ICONS = { up: TrendingUp, down: TrendingDown, flat: ArrowRight } as const;

function getTrendDirection(count: number | string): keyof typeof TREND_ICONS {
  // If count is a string, try to parse it as a number, otherwise return "flat"
  const numericCount = typeof count === "number" ? count : parseFloat(String(count).replace(/[^0-9.-]/g, ""));

  // If we couldn't parse a valid number, default to "flat"
  if (isNaN(numericCount)) return "flat";

  if (numericCount >= 8) return "up";
  if (numericCount <= 4) return "down";
  return "flat";
}

export function OverviewSummaryCard({ item }: OverviewSummaryCardProps) {
  const Icon = OVERVIEW_ICONS[item.key];
  const TrendIconComponent = TREND_ICONS[getTrendDirection(item.count)];
  const bgStyle = isCssColor(item.bg) ? { backgroundColor: item.bg } : undefined;
  const bgClass = isCssColor(item.bg) ? "" : item.bg;
  const iconColorStyle = isCssColor(item.iconColor) ? { color: item.iconColor } : undefined;
  const iconColorClass = isCssColor(item.iconColor) ? "" : item.iconColor;
  return (
    <Card
      className={`${bgClass} border-0 shadow-sm overflow-hidden rounded-lg py-0`}
      style={bgStyle}
    >
      <CardContent className="px-3 py-3 flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div
              className={`p-1.5 rounded-md bg-white/60 ${iconColorClass}`}
              style={iconColorStyle}
            >
              <Icon className="size-3" aria-hidden />
            </div>
            <p className="text-sm font-semibold text-gray-900">{item.title}</p>
          </div>
          <Badge
            className={`text-xs font-semibold px-2 py-0.5 rounded-md ${item.badgeColor} shrink-0`}
          >
            {item.priority}
          </Badge>
        </div>
        <p className="text-2xl font-bold text-gray-900">{item.count}</p>
        <span className="flex flex-row justify-between">
          <p className="text-xs text-gray-600 leading-snug">
            {item.descriptionLine1}
            <br />
            {item.descriptionLine2}
          </p>
          <div className="flex justify-end mt-auto bg-white p-1 rounded-sm">
            <TrendIconComponent
              className={`size-4 ${iconColorClass || "text-gray-400"}`}
              style={iconColorStyle}
              aria-hidden
            />
          </div>
        </span>
      </CardContent>
    </Card>
  );
}
