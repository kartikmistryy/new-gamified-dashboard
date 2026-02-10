"use client";

import { useEffect, useMemo, useRef } from "react";
import type { Config, Data, Layout } from "plotly.js";
import {
  buildContributorMetricsTraces,
  buildContributorMetricsLayout,
  CONTRIBUTOR_METRICS_CONFIG,
  DEFAULT_HEIGHT,
  MINI_HEIGHT,
  type ContributorMetricDataPoint,
} from "@/lib/dashboard/contributorMetricsPlotly";

export type { ContributorMetricDataPoint };

type ContributorMetricsChartProps = {
  data: ContributorMetricDataPoint[];
  contributorName?: string;
  contributorColor?: string;
  title?: string;
  subtitle?: string;
  showMiniVersion?: boolean;
  height?: number;
  orgMedian?: number;
  teamMedian?: number;
};

/** Contributor Metrics Chart - cumulative performance with additions/deletions */
export function ContributorMetricsChart({
  data,
  contributorName = "Contributor",
  contributorColor = "#3b82f6",
  title,
  subtitle,
  showMiniVersion = false,
  height: propHeight,
  orgMedian,
  teamMedian,
}: ContributorMetricsChartProps) {
  const plotRef = useRef<HTMLDivElement | null>(null);
  const chartHeight = propHeight ?? (showMiniVersion ? MINI_HEIGHT : DEFAULT_HEIGHT);

  const traces = useMemo<Data[]>(
    () => buildContributorMetricsTraces(data, contributorName, contributorColor, showMiniVersion, orgMedian, teamMedian),
    [data, contributorName, contributorColor, showMiniVersion, orgMedian, teamMedian]
  );

  const layout = useMemo<Partial<Layout>>(
    () => buildContributorMetricsLayout(chartHeight, showMiniVersion, orgMedian, teamMedian),
    [chartHeight, showMiniVersion, orgMedian, teamMedian]
  );

  useEffect(() => {
    let cancelled = false;

    async function renderPlot() {
      if (!plotRef.current) return;

      // @ts-expect-error - plotly.js-dist-min doesn't have type definitions
      const Plotly = (await import("plotly.js-dist-min")) as unknown as typeof import("plotly.js");
      if (cancelled || !plotRef.current) return;

      if (traces.length === 0) {
        Plotly.purge(plotRef.current);
        plotRef.current.innerHTML = "";
        return;
      }

      await Plotly.react(plotRef.current, traces, layout, CONTRIBUTOR_METRICS_CONFIG);
    }

    void renderPlot();

    return () => {
      cancelled = true;
    };
  }, [traces, layout]);

  useEffect(() => {
    const plotElement = plotRef.current;
    return () => {
      void (async () => {
        if (!plotElement) return;
        // @ts-expect-error - plotly.js-dist-min doesn't have type definitions
        const Plotly = (await import("plotly.js-dist-min")) as unknown as typeof import("plotly.js");
        Plotly.purge(plotElement);
      })();
    };
  }, []);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg bg-gray-50 p-8">
        <p className="text-sm text-gray-500">No data available</p>
      </div>
    );
  }

  return (
    <div className={`w-full max-w-full overflow-hidden ${showMiniVersion ? "" : ""}`}>
      <div
        ref={plotRef}
        className="w-full max-w-full overflow-hidden"
        style={{ height: `${chartHeight}px` }}
        role="img"
        aria-label="Contributor metrics with additions and deletions"
      />
    </div>
  );
}
