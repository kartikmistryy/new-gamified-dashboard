"use client";

import { STATUS_COLORS } from "@/lib/dashboard/shared/utils/colors";
import type { OutlierTrendData } from "@/lib/dashboard/entities/team/mocks/outliersMockData";

const CRIT_HEX = STATUS_COLORS.critical.hex;
const ATT_HEX = STATUS_COLORS.attention.hex;

type StackedAreaProps = { critical: number[]; needsAttention: number[] };

function StackedMiniAreaChart({ critical, needsAttention }: StackedAreaProps) {
  const width = 300;
  const height = 72;
  const pad = 2;
  const total = critical.map((c, i) => c + needsAttention[i]);
  const max = Math.max(...total);
  const range = max || 1;

  const toY = (v: number) => pad + (1 - v / range) * (height - 2 * pad);
  const toX = (i: number) => pad + (i / (critical.length - 1)) * (width - 2 * pad);

  const critPts = critical.map((c, i) => ({ x: toX(i), y: toY(c) }));
  const totalPts = total.map((t, i) => ({ x: toX(i), y: toY(t) }));

  const toLine = (pts: { x: number; y: number }[]) =>
    pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");

  const critArea =
    `${toLine(critPts)} L${critPts[critPts.length - 1].x},${height} L${critPts[0].x},${height} Z`;
  const attArea =
    `${toLine(totalPts)} ${[...critPts].reverse().map((p) => `L${p.x},${p.y}`).join(" ")} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="block w-full h-20" aria-hidden="true">
      <defs>
        <linearGradient id="crit-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={CRIT_HEX} stopOpacity={0.45} />
          <stop offset="100%" stopColor={CRIT_HEX} stopOpacity={0.1} />
        </linearGradient>
        <linearGradient id="att-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={ATT_HEX} stopOpacity={0.4} />
          <stop offset="100%" stopColor={ATT_HEX} stopOpacity={0.08} />
        </linearGradient>
      </defs>
      <path d={critArea} fill="url(#crit-grad)" />
      <path d={attArea} fill="url(#att-grad)" />
      <path d={toLine(critPts)} fill="none" stroke={CRIT_HEX} strokeWidth={1.5} strokeLinejoin="round" />
      <path d={toLine(totalPts)} fill="none" stroke={ATT_HEX} strokeWidth={1.5} strokeLinejoin="round" />
    </svg>
  );
}

function ChangeBadge({ pct }: { pct: number }) {
  if (pct === 0) return null;
  const isUp = pct > 0;
  const color = isUp
    ? `${STATUS_COLORS.critical.text} ${STATUS_COLORS.critical.bg}`
    : `${STATUS_COLORS.healthy.text} ${STATUS_COLORS.healthy.bg}`;
  const label = isUp ? `+${pct}%` : `${pct}%`;
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${color}`}>{label}</span>;
}

type Props = {
  criticalCount: number;
  needsAttentionCount: number;
  criticalLabel?: string;
  needsAttentionLabel?: string;
  trend: OutlierTrendData;
};

export function OverviewOutliersSection({
  criticalCount,
  needsAttentionCount,
  criticalLabel = "Share of Ownership lower than expected",
  needsAttentionLabel = "Share of Ownership higher than expected",
  trend,
}: Props) {
  return (
    <div className="flex flex-col gap-3 flex-1">
      {/* Critical */}
      <div className="flex items-baseline gap-3">
        <span className={`text-3xl font-bold tabular-nums ${STATUS_COLORS.critical.text}`}>{criticalCount}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">Critical</p>
          <p className="text-xs text-gray-500">{criticalLabel}</p>
        </div>
        <ChangeBadge pct={trend.criticalChangePct} />
      </div>

      <div className="h-px bg-gray-100" />

      {/* Needs Attention */}
      <div className="flex items-baseline gap-3">
        <span className={`text-3xl font-bold tabular-nums ${STATUS_COLORS.attention.text}`}>{needsAttentionCount}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">Needs Attention</p>
          <p className="text-xs text-gray-500">{needsAttentionLabel}</p>
        </div>
        <ChangeBadge pct={trend.needsAttentionChangePct} />
      </div>

      {/* Stacked area chart — bleeds to card edges */}
      <div className="-mx-5 -mb-5 mt-auto overflow-hidden rounded-b-lg">
        <StackedMiniAreaChart critical={trend.critical} needsAttention={trend.needsAttention} />
      </div>
    </div>
  );
}
