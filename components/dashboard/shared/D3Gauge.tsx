"use client";

import { useEffect, useRef, useState, useId } from "react";
import { arc as d3Arc } from "d3-shape";
import {
  defaultGaugeSpec,
  type GaugeSpec,
  gaugeDegToD3Rad,
  getIndicatorXY,
  getSegmentAngleRangeDeg,
} from "@/lib/gauge";
import { createChartTooltip, type D3TooltipController } from "@/lib/chartTooltip";
import { DASHBOARD_COLORS } from "@/lib/orgDashboard/colors";

const INDICATOR_ANIMATION_MS = 350;

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function D3Gauge({
  value,
  label,
  labelColor,
  valueDisplay,
  spec = defaultGaugeSpec,
}: {
  value: number;
  label: string;
  labelColor?: string;
  /** When set, shown instead of rounded value (e.g. "28/100"). */
  valueDisplay?: string;
  spec?: GaugeSpec;
}) {
  const W = 360;
  const H = 220;
  const cx = W / 2;
  const cy = 190;
  const outerRadius = 160;
  const innerRadius = 132;

  const bandThickness = outerRadius - innerRadius;
  const dotOversize = 2;
  const dotCircleR = bandThickness / 2 + dotOversize;
  const dotStrokeWidth = 4;
  const dotFillR = Math.max(0, dotCircleR - dotStrokeWidth / 2);

  const arcGen = d3Arc()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius)
    .cornerRadius(999);

  const dotRadius = (innerRadius + outerRadius) / 2;
  const targetDot = getIndicatorXY({
    value,
    spec,
    cx,
    cy,
    radius: dotRadius,
  });

  const [animatedDot, setAnimatedDot] = useState(targetDot);
  const posRef = useRef(targetDot);
  const tooltipId = useId().replace(/:/g, "");
  const tooltipRef = useRef<D3TooltipController | null>(null);

  useEffect(() => {
    const target = getIndicatorXY({
      value,
      spec,
      cx,
      cy,
      radius: dotRadius,
    });
    const start = { x: posRef.current.x, y: posRef.current.y };
    const distance = Math.hypot(start.x - target.x, start.y - target.y);
    if (distance < 0.5) {
      posRef.current = target;
      const rafId = requestAnimationFrame(() => setAnimatedDot(target));
      return () => cancelAnimationFrame(rafId);
    }
    const startTime = performance.now();
    let rafId: number;
    function tick(now: number) {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / INDICATOR_ANIMATION_MS, 1);
      const eased = easeOutCubic(t);
      const newPos = {
        x: start.x + (target.x - start.x) * eased,
        y: start.y + (target.y - start.y) * eased,
      };
      posRef.current = newPos;
      setAnimatedDot(newPos);
      if (t < 1) rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [value, cx, cy, dotRadius, spec]);

  useEffect(() => {
    tooltipRef.current = createChartTooltip(`gauge-tooltip-${tooltipId}`);
    return () => tooltipRef.current?.destroy();
  }, [tooltipId]);

  /** Value and label at bottom of gauge */
  const valueY = H - 44;
  const labelY = H - 16;

  /** Angular gap (degrees) between each colored segment */
  const SEGMENT_GAP_DEG = 2.5;
  const halfGap = SEGMENT_GAP_DEG / 2;

  return (
    <svg
      role="img"
      aria-label="D3 gauge chart"
      viewBox={`0 0 ${W} ${H}`}
      width={W}
      height={H}
      className="block"
    >
      <g transform={`translate(${cx}, ${cy})`}>
        {spec.segments.map((seg) => {
          const { startDeg, endDeg } = getSegmentAngleRangeDeg(seg, spec);
          const startAngle = gaugeDegToD3Rad(startDeg + halfGap);
          const endAngle = gaugeDegToD3Rad(endDeg - halfGap);

          const d = arcGen({ startAngle, endAngle, innerRadius, outerRadius });
          if (!d) return null;

          const rangeLabel = `${seg.start}–${seg.end}`;
          return (
            <path
              key={seg.key}
              d={d}
              fill={seg.color}
              onMouseEnter={(event) => {
                const tooltip = tooltipRef.current;
                if (!tooltip) return;
                tooltip.show(
                  `<div style="font-weight:600; color:${DASHBOARD_COLORS.gray950};">${seg.key.replace(/-/g, " ")}</div>` +
                    `<div style="color:${DASHBOARD_COLORS.blueChart};">Range: ${rangeLabel}</div>`,
                  event.clientX + 12,
                  event.clientY + 12
                );
              }}
              onMouseMove={(event) => {
                tooltipRef.current?.move(event.clientX + 12, event.clientY + 12);
              }}
              onMouseLeave={() => tooltipRef.current?.hide()}
            />
          );
        })}
      </g>

      <circle
        cx={animatedDot.x}
        cy={animatedDot.y}
        r={dotFillR}
        fill={DASHBOARD_COLORS.gray900}
        stroke={DASHBOARD_COLORS.chartBackground}
        strokeWidth={dotStrokeWidth}
        onMouseEnter={(event) => {
          const tooltip = tooltipRef.current;
          if (!tooltip) return;
          tooltip.show(
            `<div style="font-weight:600; color:${DASHBOARD_COLORS.gray950};">${label}</div>` +
              `<div style="color:${DASHBOARD_COLORS.blueChart};">Value: ${valueDisplay ?? Math.round(value)}</div>`,
            event.clientX + 12,
            event.clientY + 12
          );
        }}
        onMouseMove={(event) => {
          tooltipRef.current?.move(event.clientX + 12, event.clientY + 12);
        }}
        onMouseLeave={() => tooltipRef.current?.hide()}
      />

      <text
        x={cx}
        y={valueY - 35}
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-slate-900"
        style={{ fontSize: 44, fontWeight: 700 }}
      >
        {valueDisplay ?? Math.round(value)}
      </text>
      <text
        x={cx}
        y={labelY - 20}
        textAnchor="middle"
        dominantBaseline="alphabetic"
        className="fill-slate-700"
        style={{ fontSize: 16, fontWeight: 500, fill: labelColor }}
      >
        {label}
      </text>
    </svg>
  );
}
