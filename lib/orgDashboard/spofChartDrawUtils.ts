import * as d3 from "d3";
import type { SpofTeamConfig } from "./spofMockData";
import type { StackedBinData } from "./spofChartTypes";
import type { D3TooltipController } from "@/lib/chartTooltip";
import { formatStackedBarTooltip } from "./spofChartTooltips";

/** Draw shaded regions for standard deviation bounds */
export function drawShadedRegions(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  xScale: d3.ScaleLinear<number, number>,
  innerHeight: number,
  innerWidth: number,
  muMinus1Sigma: number,
  muPlus1Sigma: number
): void {
  g.append("rect")
    .attr("x", 0).attr("y", 0)
    .attr("width", xScale(muMinus1Sigma))
    .attr("height", innerHeight)
    .attr("fill", "rgba(249, 115, 22, 0.1)");

  g.append("rect")
    .attr("x", xScale(muPlus1Sigma)).attr("y", 0)
    .attr("width", innerWidth - xScale(muPlus1Sigma))
    .attr("height", innerHeight)
    .attr("fill", "rgba(16, 185, 129, 0.1)");
}

/** Draw stacked histogram bars */
export function drawStackedBars(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  stackedData: StackedBinData[],
  xScale: d3.ScaleLinear<number, number>,
  yScale: d3.ScaleLinear<number, number>,
  binWidth: number,
  teamColors: Map<string, string>,
  tooltip?: D3TooltipController
): void {
  const barData = stackedData.flatMap((bin) =>
    bin.stacks.map((stack) => ({ bin, stack }))
  );

  const bars = g
    .selectAll<SVGRectElement, { bin: StackedBinData; stack: { team: string; y0: number; y1: number } }>("rect.spof-bar")
    .data(barData, (d) => `${d.stack.team}-${d.bin.x0}-${d.bin.x1}`);

  const mergedBars = bars
    .enter()
    .append("rect")
    .attr("class", "spof-bar")
    .merge(
      bars as unknown as d3.Selection<
        SVGRectElement,
        { bin: StackedBinData; stack: { team: string; y0: number; y1: number } },
        SVGGElement,
        unknown
      >
    )
    .attr("x", (d) => xScale(d.bin.x0) + 1)
    .attr("y", (d) => yScale(d.stack.y1))
    .attr("width", binWidth - 2)
    .attr("height", (d) => yScale(d.stack.y0) - yScale(d.stack.y1))
    .attr("fill", (d) => teamColors.get(d.stack.team) || "#ccc");

  if (tooltip) {
    mergedBars
      .on("mouseenter", (event, d) => {
        const count = d.stack.y1 - d.stack.y0;
        tooltip.show(
          formatStackedBarTooltip(d.stack.team, d.bin.x0, d.bin.x1, count),
          event.clientX + 12,
          event.clientY + 12
        );
      })
      .on("mousemove", (event) => tooltip.move(event.clientX + 12, event.clientY + 12))
      .on("mouseleave", () => tooltip.hide());
  }

  bars.exit().remove();
}

/** Draw normal fit curve */
export function drawNormalCurve(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  normalData: [number, number][],
  xScale: d3.ScaleLinear<number, number>,
  yScale: d3.ScaleLinear<number, number>
): void {
  const lineGenerator = d3.line<[number, number]>().x((d) => xScale(d[0])).y((d) => yScale(d[1])).curve(d3.curveBasis);
  g.append("path").datum(normalData).attr("fill", "none").attr("stroke", "#dc2626")
    .attr("stroke-width", 2).attr("stroke-dasharray", "4,4").attr("d", lineGenerator);
}

/** Draw sigma lines and labels */
export function drawSigmaLines(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  xScale: d3.ScaleLinear<number, number>,
  innerHeight: number,
  muMinus1Sigma: number,
  muPlus1Sigma: number
): void {
  // µ-1σ line
  g.append("line")
    .attr("x1", xScale(muMinus1Sigma)).attr("x2", xScale(muMinus1Sigma))
    .attr("y1", 0).attr("y2", innerHeight)
    .attr("stroke", "#f97316").attr("stroke-width", 2).attr("stroke-dasharray", "6,4");

  g.append("text")
    .attr("x", xScale(muMinus1Sigma)).attr("y", -8)
    .attr("text-anchor", "middle").attr("font-size", "11px").attr("fill", "#f97316")
    .text(`μ-1σ (${muMinus1Sigma.toFixed(1)})`);

  // µ+1σ line
  g.append("line")
    .attr("x1", xScale(muPlus1Sigma)).attr("x2", xScale(muPlus1Sigma))
    .attr("y1", 0).attr("y2", innerHeight)
    .attr("stroke", "#10b981").attr("stroke-width", 2).attr("stroke-dasharray", "6,4");

  g.append("text")
    .attr("x", xScale(muPlus1Sigma)).attr("y", -8)
    .attr("text-anchor", "middle").attr("font-size", "11px").attr("fill", "#10b981")
    .text(`μ+1σ (${muPlus1Sigma.toFixed(1)})`);
}

/** Draw chart axes */
export function drawAxes(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  xScale: d3.ScaleLinear<number, number>,
  yScale: d3.ScaleLinear<number, number>,
  innerHeight: number,
  innerWidth: number
): void {
  g.append("g").attr("transform", `translate(0,${innerHeight})`).call(d3.axisBottom(xScale).ticks(7))
    .selectAll("text").attr("font-size", "12px");
  g.append("g").call(d3.axisLeft(yScale).ticks(8)).selectAll("text").attr("font-size", "12px");
  g.append("text").attr("x", innerWidth / 2).attr("y", innerHeight + 45).attr("text-anchor", "middle")
    .attr("font-size", "13px").attr("fill", "#374151").text("Normalized SPOF Score");
  g.append("text").attr("transform", "rotate(-90)").attr("x", -innerHeight / 2).attr("y", -45)
    .attr("text-anchor", "middle").attr("font-size", "13px").attr("fill", "#374151").text("Count");
}

/** Draw chart title */
export function drawTitle(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  width: number,
  skewType: string,
  mean: number,
  std: number,
  teamsText: string
): void {
  svg.append("text").attr("x", width / 2).attr("y", 25).attr("text-anchor", "middle").attr("font-size", "14px")
    .attr("font-weight", "600").attr("fill", "#1f2937")
    .text(`SPOF Score Distribution (${skewType}: μ=${mean.toFixed(1)}, σ=${std.toFixed(1)}) | Teams: ${teamsText}`);
}

/** Draw chart legend */
export function drawLegend(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  visibleTeamConfigs: SpofTeamConfig[],
  width: number,
  margin: { right: number; top: number },
  showNormalFit: boolean,
  mean: number,
  std: number
): void {
  const legend = svg.append("g").attr("transform", `translate(${width - margin.right + 20}, ${margin.top})`);
  if (showNormalFit) {
    legend.append("line").attr("x1", 0).attr("x2", 25).attr("y1", 10).attr("y2", 10)
      .attr("stroke", "#dc2626").attr("stroke-width", 2).attr("stroke-dasharray", "4,4");
    legend.append("text").attr("x", 30).attr("y", 14).attr("font-size", "11px").attr("fill", "#374151")
      .text(`Normal Fit (μ=${mean.toFixed(2)}, σ=${std.toFixed(2)})`);
  }
  const legendOffset = showNormalFit ? 30 : 0;
  visibleTeamConfigs.forEach((team, i) => {
    const y = legendOffset + i * 22;
    legend.append("rect").attr("x", 0).attr("y", y).attr("width", 16).attr("height", 16)
      .attr("fill", team.color).attr("rx", 2);
    legend.append("text").attr("x", 22).attr("y", y + 12).attr("font-size", "11px").attr("fill", "#374151")
      .text(team.name);
  });
}
