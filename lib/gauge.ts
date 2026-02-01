/** Gauge segment: value range [start, end] and color */
export type GaugeSegment = {
  key: string;
  color: string;
  start: number;
  end: number;
};

/** Gauge spec: angle range (degrees) and segments by value */
export type GaugeSpec = {
  startAngleDeg: number;
  endAngleDeg: number;
  min: number;
  max: number;
  segments: GaugeSegment[];
};

export const defaultGaugeSpec: GaugeSpec = {
  startAngleDeg: 270,
  endAngleDeg: 450,
  min: 0,
  max: 100,
  segments: [
    { key: "low", color: "#EE6666", start: 0, end: 25 },
    { key: "mid-low", color: "#FD994D", start: 25, end: 50 },
    { key: "mid-high", color: "#FAC858", start: 50, end: 75 },
    { key: "high", color: "#91CC75", start: 75, end: 100 },
  ],
};

/** Convert gauge degrees (0 at 3 o'clock, clockwise) to d3-shape radians (0 at 12 o'clock, clockwise). */
export function gaugeDegToD3Rad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Get angle in degrees for a value given the spec. */
function valueToAngleDeg(value: number, spec: GaugeSpec): number {
  const t = (value - spec.min) / (spec.max - spec.min);
  return spec.startAngleDeg + t * (spec.endAngleDeg - spec.startAngleDeg);
}

/** Get { x, y } for the indicator dot at the given value. */
export function getIndicatorXY({
  value,
  spec,
  cx,
  cy,
  radius,
}: {
  value: number;
  spec: GaugeSpec;
  cx: number;
  cy: number;
  radius: number;
}): { x: number; y: number } {
  const angleDeg = valueToAngleDeg(value, spec);
  const rad = gaugeDegToD3Rad(angleDeg);
  return {
    x: cx + radius * Math.sin(rad),
    y: cy - radius * Math.cos(rad),
  };
}

/** Get start and end angles in degrees for a segment. */
export function getSegmentAngleRangeDeg(
  seg: GaugeSegment,
  spec: GaugeSpec
): { startDeg: number; endDeg: number } {
  return {
    startDeg: valueToAngleDeg(seg.start, spec),
    endDeg: valueToAngleDeg(seg.end, spec),
  };
}
