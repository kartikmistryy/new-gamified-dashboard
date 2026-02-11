/** Collaboration Network Graph - D3 Scale Configuration */

import { scaleLinear, scaleSequential, interpolateViridis } from "d3";

/** Create D3 color scale for node borders based on normalized DOA */
export function createColorScale() {
  return scaleSequential(interpolateViridis).domain([0.05, 1]);
}

/** Create D3 scale for edge width based on collaboration strength */
export function createEdgeWidthScale() {
  return scaleLinear().domain([0.35, 1]).range([1.4, 5.6]).clamp(true);
}

/** Calculate node radius based on degree */
export function calculateNodeRadius(degree: number): number {
  return 9 + Math.min(7, degree * 1.2);
}
