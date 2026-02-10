"use client";

import { useMemo, useRef, useEffect, useId, useCallback } from "react";
import dynamic from "next/dynamic";
import type { PlotData, Layout, Config } from "plotly.js";
import {
  type ChaosPoint,
  type ChaosCategory,
  type ChaosTimeRangeKey,
  CATEGORY_COLORS,
  categorizeChaos,
  median,
  generateSyntheticChaosPoints,
} from "@/lib/orgDashboard/chaosMatrixData";
import { getTeamAvatarUrl } from "@/components/shared/TeamAvatar";
import {
  buildChaosMatrixTraces,
  buildChaosMatrixLayout,
  CHAOS_MATRIX_CONFIG,
  type StackedPoint,
} from "@/lib/orgDashboard/chaosMatrixConfig";

// Dynamically import Plotly to avoid SSR issues
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

export type { ChaosTimeRangeKey };

type CategorizedPoint = ChaosPoint & { category: ChaosCategory };

type ChaosMatrixChartProps = {
  /** Data points to visualize. If not provided, synthetic data will be generated. */
  data?: ChaosPoint[];
  /** Time range key for generating synthetic data */
  range?: ChaosTimeRangeKey;
  /** Optional visibility map keyed by team/member name; hidden items are filtered out. */
  visibleTeams?: Record<string, boolean>;
  /** Optional team/member names for synthetic data generation */
  teamNames?: string[];
  /** Label for the secondary identifier in tooltips (e.g., "Team", "Person") */
  tooltipTeamLabel?: string;
  /** Render mode: "circles" for simple dots, "avatars" for profile images */
  renderMode?: "circles" | "avatars";
};

/**
 * Unified Chaos Matrix component using Plotly.js
 *
 * Visualizes the relationship between Median Weekly KP and Churn Rate,
 * categorizing developers/teams into four quadrants:
 * - Skilled AI User (high KP, low churn)
 * - Unskilled AI User (high KP, high churn)
 * - Traditional Developer (low KP, low churn)
 * - Low-Skill Developer (low KP, high churn)
 *
 * @example
 * // Organization view with simple circles
 * <ChaosMatrixChart
 *   range={timeRange}
 *   visibleTeams={visibleTeams}
 *   teamNames={teamNames}
 *   renderMode="circles"
 * />
 *
 * @example
 * // Team/Repo view with avatar images
 * <ChaosMatrixChart
 *   data={chaosMatrixData}
 *   range={timeRange}
 *   teamNames={memberNames}
 *   tooltipTeamLabel="Person"
 *   renderMode="avatars"
 * />
 */
export function ChaosMatrixChart({
  data,
  range = "max",
  visibleTeams,
  teamNames,
  tooltipTeamLabel = "Team",
  renderMode = "circles",
}: ChaosMatrixChartProps) {
  const plotRef = useRef<HTMLDivElement>(null);
  const svgOverlayRef = useRef<SVGSVGElement>(null);
  const clipId = useId().replace(/:/g, "");

  const { plotData, layout, stackedFiltered, xMin, xMax, yMin, yMax } = useMemo(() => {
    // Get base data (real or synthetic)
    const base = data && data.length > 0 ? data : generateSyntheticChaosPoints(range, teamNames);

    // Calculate median thresholds
    const kpThresh = base.length > 0 ? median(base.map((p) => p.medianWeeklyKp)) : 1000;
    const churnThresh = base.length > 0 ? median(base.map((p) => p.churnRatePct)) : 2;

    // Categorize all points
    const categorized: CategorizedPoint[] = base.map((p) => ({
      ...p,
      category: categorizeChaos(p.medianWeeklyKp, p.churnRatePct, kpThresh, churnThresh),
    }));

    // Filter by visibility
    const filtered = visibleTeams
      ? categorized.filter((p) => visibleTeams[p.team] !== false)
      : categorized;

    // Handle point stacking for overlapping positions
    const buckets = new Map<string, CategorizedPoint[]>();
    filtered.forEach((p) => {
      const key = `${Math.round(p.medianWeeklyKp / 50)}:${Math.round(p.churnRatePct * 10)}`;
      const bucket = buckets.get(key);
      if (bucket) {
        bucket.push(p);
      } else {
        buckets.set(key, [p]);
      }
    });

    // Apply stacking offset to all points
    const stackedFiltered: StackedPoint[] = filtered.map((p) => {
      const key = `${Math.round(p.medianWeeklyKp / 50)}:${Math.round(p.churnRatePct * 10)}`;
      const bucket = buckets.get(key) || [];
      const stackIndex = bucket.findIndex((bp) => bp.name === p.name);
      const stackCount = bucket.length;

      const originalKp = p.medianWeeklyKp;
      const originalChurn = p.churnRatePct;

      // Calculate circular stacking offset
      if (stackCount > 1) {
        const angle = (stackIndex / stackCount) * Math.PI * 2;
        const radius = 50; // offset in KP units
        const radiusChurn = 0.15; // offset in churn % units
        return {
          ...p,
          medianWeeklyKp: p.medianWeeklyKp + Math.cos(angle) * radius,
          churnRatePct: p.churnRatePct + Math.sin(angle) * radiusChurn,
          originalKp,
          originalChurn,
        };
      }
      return { ...p, originalKp, originalChurn };
    });

    // Create separate traces for each category to enable legend
    const categories: ChaosCategory[] = [
      "Skilled AI User",
      "Unskilled AI User",
      "Traditional Developer",
      "Low-Skill Developer",
    ];

    const traces: Partial<PlotData>[] = categories.map((category) => {
      const categoryPoints = stackedFiltered.filter((p) => p.category === category);

      return {
        type: "scatter",
        mode: "markers",
        name: category,
        x: categoryPoints.map((p) => p.medianWeeklyKp),
        y: categoryPoints.map((p) => p.churnRatePct),
        text: categoryPoints.map(
          (p) =>
            `<b>${p.name}</b><br>${tooltipTeamLabel}: ${p.team}<br>KP: ${Math.round(p.originalKp)} · Churn: ${Math.round(p.originalChurn)}%`
        ),
        hovertemplate: "%{text}<extra></extra>",
        marker:
          renderMode === "avatars"
            ? {
                size: 22,
                color: "rgba(0,0,0,0)", // Transparent markers for avatar mode
                opacity: 0,
                line: {
                  color: "rgba(0,0,0,0)",
                  width: 0,
                },
              }
            : {
                size: 8,
                color: CATEGORY_COLORS[category],
              },
        showlegend: true,
        legendgroup: category,
      } as Partial<PlotData>;
    });

    // Build layout using extracted configuration
    const layout = buildChaosMatrixLayout(stackedFiltered, kpThresh, churnThresh);

    return { plotData: traces, layout, stackedFiltered };
  }, [data, range, visibleTeams, teamNames, tooltipTeamLabel, renderMode]);

  // Function to render avatars - extracted for reuse in resize and initial render
  const renderAvatars = useCallback(() => {
    if (renderMode !== "avatars" || !svgOverlayRef.current || !plotRef.current) return;

    // Get the Plotly plot element to sync coordinates
    const plotDiv = plotRef.current.querySelector(".js-plotly-plot") as HTMLElement;
    if (!plotDiv) return;

    // Plotly exposes coordinate conversion via plotDiv._fullLayout
    // This is a private API but commonly used for custom overlays
    const layout = (plotDiv as any)._fullLayout;
    if (!layout || !layout.xaxis || !layout.yaxis) return;

    const xaxis = layout.xaxis;
    const yaxis = layout.yaxis;

    // Convert data coordinates to pixel coordinates
    const dataToPixel = (kp: number, churn: number) => {
      // Use Plotly's internal coordinate conversion
      const px = xaxis.l2p(kp) + xaxis._offset;
      const py = yaxis.l2p(churn) + yaxis._offset;
      return { x: px, y: py };
    };

    // Clear previous overlay content
    const svg = svgOverlayRef.current;
    svg.innerHTML = "";

    // Add defs for clip paths
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    svg.appendChild(defs);

    // Render avatar images
    stackedFiltered.forEach((point, index) => {
      const { x, y } = dataToPixel(point.medianWeeklyKp, point.churnRatePct);
      const avatarUrl = getTeamAvatarUrl(point.name, 64);
      const avatarSize = 22;
      const half = avatarSize / 2;

      // Create clip path for circular avatar
      const clipPath = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
      clipPath.id = `avatar-clip-${clipId}-${index}`;
      const clipCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      clipCircle.setAttribute("cx", x.toString());
      clipCircle.setAttribute("cy", y.toString());
      clipCircle.setAttribute("r", half.toString());
      clipPath.appendChild(clipCircle);
      defs.appendChild(clipPath);

      // Create image element
      const image = document.createElementNS("http://www.w3.org/2000/svg", "image");
      image.setAttribute("href", avatarUrl);
      image.setAttribute("x", (x - half).toString());
      image.setAttribute("y", (y - half).toString());
      image.setAttribute("width", avatarSize.toString());
      image.setAttribute("height", avatarSize.toString());
      image.setAttribute("clip-path", `url(#avatar-clip-${clipId}-${index})`);
      image.setAttribute("preserveAspectRatio", "xMidYMid slice");
      svg.appendChild(image);

      // Create border circle with category-colored stroke
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cx", x.toString());
      circle.setAttribute("cy", y.toString());
      circle.setAttribute("r", half.toString());
      circle.setAttribute("fill", "none");
      circle.setAttribute("stroke", CATEGORY_COLORS[point.category]);
      circle.setAttribute("stroke-width", "2.5");
      svg.appendChild(circle);
    });
  }, [renderMode, stackedFiltered, clipId]);

  // For avatar mode, overlay custom SVG with images
  useEffect(() => {
    if (renderMode !== "avatars") return;

    // Wait for Plotly to finish rendering before overlaying avatars
    // Use a small delay to ensure Plotly's layout is ready
    const timeoutId = setTimeout(renderAvatars, 100);

    // Get the Plotly plot element to attach event listeners
    const plotDiv = plotRef.current?.querySelector(".js-plotly-plot") as HTMLElement;

    if (plotDiv) {
      // Listen for initial plot rendering
      plotDiv.addEventListener("plotly_afterplot", renderAvatars);

      // Listen for interactive events that change the plot view
      // plotly_relayout - fired when axes are changed (zoom, pan, autoscale, axis range changes)
      plotDiv.addEventListener("plotly_relayout", renderAvatars);

      // plotly_redraw - fired when the plot is redrawn
      plotDiv.addEventListener("plotly_redraw", renderAvatars);

      // plotly_restyle - fired when trace properties change (less common but good to have)
      plotDiv.addEventListener("plotly_restyle", renderAvatars);
    }

    return () => {
      clearTimeout(timeoutId);
      if (plotDiv) {
        plotDiv.removeEventListener("plotly_afterplot", renderAvatars);
        plotDiv.removeEventListener("plotly_relayout", renderAvatars);
        plotDiv.removeEventListener("plotly_redraw", renderAvatars);
        plotDiv.removeEventListener("plotly_restyle", renderAvatars);
      }
    };
  }, [renderMode, renderAvatars]);

  // Handle window resize to reflow Plotly chart and re-render avatars
  useEffect(() => {
    let resizeTimeoutId: NodeJS.Timeout;

    const handleResize = () => {
      // Debounce resize handling to avoid excessive re-renders
      clearTimeout(resizeTimeoutId);
      resizeTimeoutId = setTimeout(() => {
        const plotDiv = plotRef.current?.querySelector(".js-plotly-plot") as HTMLElement;
        if (!plotDiv) return;

        // Resize Plotly chart using Plotly.Plots.resize()
        // This is accessible via the plotDiv's Plotly property
        const Plotly = (window as any).Plotly;
        if (Plotly && Plotly.Plots && Plotly.Plots.resize) {
          Plotly.Plots.resize(plotDiv);
        }

        // Re-render avatars after Plotly finishes resizing
        // Small delay to ensure Plotly's layout has updated
        if (renderMode === "avatars") {
          setTimeout(renderAvatars, 50);
        }
      }, 150); // 150ms debounce
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimeoutId);
    };
  }, [renderMode, renderAvatars]);


  return (
    <div className="w-full overflow-visible flex flex-col items-center">
      <div className="relative overflow-visible bg-white" style={{ width: 800, height: 480 }}>
        <div ref={plotRef}>
          <Plot data={plotData} layout={layout} config={CHAOS_MATRIX_CONFIG} />
        </div>
        {renderMode === "avatars" && (
          <svg
            ref={svgOverlayRef}
            className="absolute top-0 left-0 pointer-events-none"
            width={800}
            height={480}
            style={{ zIndex: 10 }}
          />
        )}
      </div>
    </div>
  );
}
