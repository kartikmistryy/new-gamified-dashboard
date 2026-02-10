"use client";

import { useEffect, useMemo, useRef } from "react";
import type { Config, Data, Layout } from "plotly.js";

export type ContributorMetricDataPoint = {
  week: string;
  cumulative: number;
  additions: number;
  deletions: number;
};

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

const DEFAULT_HEIGHT = 360;
const MINI_HEIGHT = 160;

/**
 * Generates date strings from week labels for x-axis.
 * Parses "Jan '24" format and creates ISO dates.
 */
function parseWeekToDate(week: string, index: number, totalWeeks: number): string {
  const today = new Date();
  const weeksBack = totalWeeks - 1 - index;
  const date = new Date(today);
  date.setDate(date.getDate() - weeksBack * 7);
  return date.toISOString().split("T")[0];
}

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

  const traces = useMemo<Data[]>(() => {
    if (data.length === 0) return [];

    const x = data.map((point, index) => parseWeekToDate(point.week, index, data.length));
    const cumulative = data.map((point) => point.cumulative);
    const additions = data.map((point) => point.additions);
    const deletions = data.map((point) => -Math.abs(point.deletions));

    const output: Data[] = [];

    // Cumulative line
    output.push({
      type: "scatter",
      mode: "lines",
      x,
      y: cumulative,
      name: contributorName,
      line: {
        color: contributorColor,
        width: showMiniVersion ? 2 : 3,
      },
      hovertemplate: `${contributorName}: %{y:,.0f}<extra></extra>`,
    });

    // Addition bars (green)
    output.push({
      type: "bar",
      x,
      y: additions,
      base: cumulative,
      name: `${contributorName} Add`,
      showlegend: false,
      marker: {
        color: "#3A9C45",
        opacity: 0.5,
      },
      hovertemplate: `Add: +%{y:,.0f}<extra></extra>`,
    } as any);

    // Deletion bars (red, negative)
    output.push({
      type: "bar",
      x,
      y: deletions,
      base: cumulative,
      name: `${contributorName} Delete`,
      showlegend: false,
      marker: {
        color: "#D65249",
        opacity: 0.5,
      },
      hovertemplate: `Delete: %{y:,.0f}<extra></extra>`,
    } as any);

    // Org median horizontal line (purple)
    if (orgMedian !== undefined) {
      output.push({
        type: "scatter",
        mode: "lines",
        x,
        y: Array(x.length).fill(orgMedian),
        name: "Org Median",
        line: {
          color: "#8b5cf6",
          width: 1.5,
          dash: "dash",
        },
        hovertemplate: `Org Median: %{y:,.0f}<extra></extra>`,
        showlegend: true,
      });
    }

    // Team median horizontal line (amber)
    if (teamMedian !== undefined) {
      output.push({
        type: "scatter",
        mode: "lines",
        x,
        y: Array(x.length).fill(teamMedian),
        name: "Team Median",
        line: {
          color: "#f59e0b",
          width: 1.5,
          dash: "dash",
        },
        hovertemplate: `Team Median: %{y:,.0f}<extra></extra>`,
        showlegend: true,
      });
    }

    return output;
  }, [data, contributorName, contributorColor, showMiniVersion, orgMedian, teamMedian]);

  const layout = useMemo<Partial<Layout>>(
    () => ({
      autosize: true,
      height: chartHeight,
      paper_bgcolor: "#ffffff",
      plot_bgcolor: "#f9fafb",
      margin: showMiniVersion
        ? { t: 10, r: 10, b: 30, l: 40 }
        : { t: 20, r: 20, b: 44, l: 60 },
      barmode: "overlay",
      hovermode: "x unified",
      hoverlabel: {
        bgcolor: "#ffffff",
        font: {
          color: "#1f2937",
          family: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
          size: 12
        },
        bordercolor: "#e5e7eb",
      },
      showlegend: orgMedian !== undefined || teamMedian !== undefined,
      legend: {
        x: 1,
        xanchor: "right",
        y: 1,
        yanchor: "top",
        bgcolor: "rgba(255, 255, 255, 0.9)",
        bordercolor: "#e5e7eb",
        borderwidth: 1,
        font: {
          size: 11,
          color: "#374151",
        },
      },
      xaxis: {
        title: { text: "" },
        tickformat: showMiniVersion ? "%b" : "%b %-d<br>%Y",
        hoverformat: "%b %-d, %Y",
        showgrid: true,
        gridcolor: "#e2e8f0",
        gridwidth: 1,
        showline: false,
        zeroline: false,
        zerolinecolor: "#cbd5e1",
        tickfont: { color: "#6b7280", size: showMiniVersion ? 10 : 14 },
      },
      yaxis: {
        title: {
          text: showMiniVersion ? "" : "Cumulative DiffDelta",
          font: { size: 14, color: "#374151" }
        },
        tickformat: "~s",
        showgrid: true,
        gridcolor: "#e2e8f0",
        gridwidth: 1,
        zeroline: false,
        zerolinecolor: "#cbd5e1",
        tickfont: { color: "#6b7280", size: showMiniVersion ? 10 : 14 },
      },
      font: {
        family: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
        color: "#1e293b",
      },
    }),
    [chartHeight, showMiniVersion, orgMedian, teamMedian]
  );

  const config = useMemo<Partial<Config>>(
    () => ({
      responsive: true,
      displayModeBar: false,
      scrollZoom: false,
    }),
    []
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

      await Plotly.react(plotRef.current, traces, layout, config);
    }

    void renderPlot();

    return () => {
      cancelled = true;
    };
  }, [traces, layout, config]);

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
