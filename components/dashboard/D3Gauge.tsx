"use client";

import { useEffect, useRef, useState } from "react";
import { arc as d3Arc } from "d3-shape";
import {
  defaultGaugeSpec,
  type GaugeSpec,
  gaugeDegToD3Rad,
  getIndicatorXY,
  getSegmentAngleRangeDeg,
} from "@/lib/gauge";

const INDICATOR_ANIMATION_MS = 350;

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function D3Gauge({
  value,
  label,
  labelColor,
  spec = defaultGaugeSpec,
}: {
  value: number;
  label: string;
  labelColor?: string;
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

  const textY = cy - innerRadius / 2;

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

          return <path key={seg.key} d={d} fill={seg.color} />;
        })}
      </g>

      <circle
        cx={animatedDot.x}
        cy={animatedDot.y}
        r={dotFillR}
        fill="#111827"
        stroke="#ffffff"
        strokeWidth={dotStrokeWidth}
      />

      <text
        x={cx}
        y={textY}
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-slate-900"
        style={{ fontSize: 44, fontWeight: 700 }}
      >
        {Math.round(value)}
      </text>
      <text
        x={cx}
        y={textY + 44}
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-slate-700"
        style={{ fontSize: 14, fontWeight: 500, fill: labelColor }}
      >
        {label}
      </text>
    </svg>
  );
}
