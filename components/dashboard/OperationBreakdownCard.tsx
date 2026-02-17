"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { OperationBreakdownCard as OperationBreakdownCardType } from "@/lib/dashboard/entities/team/types";

type Props = OperationBreakdownCardType;

function TrendIndicator({
  direction,
  value,
  upIsGood,
}: {
  direction: "up" | "down" | "flat";
  value: string;
  upIsGood: boolean;
}) {
  const isUp = direction === "up";
  const isDown = direction === "down";
  const Icon = isUp ? TrendingUp : isDown ? TrendingDown : Minus;

  let color = "#9CA3AF"; // flat = gray
  if (isUp) {
    color = upIsGood ? "#55B685" : "#CA3A31";
  } else if (isDown) {
    color = upIsGood ? "#55B685" : "#CA3A31";
  }

  return (
    <div className="flex items-center gap-1" style={{ color }}>
      <Icon size={14} strokeWidth={2} />
      <span className="text-xs font-medium">{value}</span>
    </div>
  );
}

export function OperationBreakdownCard({
  label,
  nLoC,
  trend,
  insight,
}: Props) {
  return (
    <Card className="flex-1 min-w-0 rounded-[10px] border border-border bg-white p-4 shadow-none">
      <CardContent className="p-0 space-y-3">
        {/* Header: Label */}
        <div className="text-sm font-medium text-muted-foreground">{label}</div>

        {/* Value + Trend row */}
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-foreground">
            {nLoC.toLocaleString()}
          </span>
          <span className="text-sm text-muted-foreground">nLoC</span>
          <TrendIndicator
            direction={trend.direction}
            value={trend.value}
            upIsGood={trend.upIsGood}
          />
        </div>

        {/* Insight */}
        <p className="text-xs text-muted-foreground leading-relaxed">{insight}</p>
      </CardContent>
    </Card>
  );
}
