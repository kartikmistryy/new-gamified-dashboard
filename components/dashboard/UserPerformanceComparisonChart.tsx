"use client";

import { useEffect, useMemo, useRef } from "react";
import type { Config, Data, Layout } from "plotly.js";

export type UserPerformanceComparisonDataPoint = {
  date: string;
  cumulative: number;
  add: number;
  selfDelete: number;
};

export type ComparisonLine = {
  label: string;
  color: string;
  data: { date: string; value: number }[];
  dashStyle?: "solid" | "dash" | "dot";
};

type UserPerformanceComparisonChartProps = {
  userLine: {
    name: string;
    color: string;
    data: UserPerformanceComparisonDataPoint[];
  };
  comparisonLines?: ComparisonLine[];
  height?: number;
  className?: string;
};

const DEFAULT_HEIGHT = 500;

export function UserPerformanceComparisonChart({
  userLine,
  comparisonLines = [],
  height = DEFAULT_HEIGHT,
  className = "",
}: UserPerformanceComparisonChartProps) {
  const plotRef = useRef<HTMLDivElement | null>(null);

  const traces = useMemo<Data[]>(() => {
    if (userLine.data.length === 0) return [];

    const output: any[] = [];

    // User's cumulative line (main line)
    const x = userLine.data.map((point) => point.date);
    const cumulative = userLine.data.map((point) => point.cumulative);
    const add = userLine.data.map((point) => point.add);
    const selfDelete = userLine.data.map((point) => -Math.abs(point.selfDelete));

    output.push({
      type: "scatter",
      mode: "lines",
      x,
      y: cumulative,
      name: userLine.name,
      legendgroup: "user",
      line: {
        color: userLine.color,
        width: 3,
      },
      hovertemplate: `${userLine.name}: %{y:.2f}<extra></extra>`,
    });

    // Add bars (positive contributions)
    output.push({
      type: "bar",
      x,
      y: add,
      base: cumulative,
      name: "Add",
      legendgroup: "user",
      showlegend: true,
      marker: {
        color: "#3A9C45",
        opacity: 0.5,
      },
      hovertemplate: `Add: +%{y:.2f}<extra></extra>`,
    });

    // Self-delete bars (code removed by user)
    output.push({
      type: "bar",
      x,
      y: selfDelete,
      base: cumulative,
      name: "Self Delete",
      legendgroup: "user",
      showlegend: true,
      marker: {
        color: "#D65249",
        opacity: 0.5,
      },
      hovertemplate: `Self Delete: %{y:.2f}<extra></extra>`,
    });

    // Comparison lines (team median, org median, etc.)
    comparisonLines.forEach((line) => {
      const lineX = line.data.map((point) => point.date);
      const lineY = line.data.map((point) => point.value);

      const dashMap = {
        solid: "solid",
        dash: "dash",
        dot: "dot",
      };

      output.push({
        type: "scatter",
        mode: "lines",
        x: lineX,
        y: lineY,
        name: line.label,
        legendgroup: line.label,
        line: {
          color: line.color,
          width: 2,
          dash: dashMap[line.dashStyle || "solid"],
        },
        hovertemplate: `${line.label}: %{y:.2f}<extra></extra>`,
      });
    });

    return output;
  }, [userLine, comparisonLines]);

  const layout = useMemo<Partial<Layout>>(
    () => ({
      autosize: true,
      height,
      paper_bgcolor: "#e8edf5",
      plot_bgcolor: "#e8edf5",
      margin: { t: 36, r: 20, b: 44, l: 78 },
      barmode: "overlay",
      hovermode: "x unified",
      legend: {
        orientation: "h",
        yanchor: "bottom",
        y: 1.02,
        xanchor: "left",
        x: 0,
        font: { size: 14, color: "#334155" },
      },
      xaxis: {
        title: { text: "" },
        tickformat: "%b %-d<br>%Y",
        hoverformat: "%b %-d, %Y",
        showgrid: false,
        showline: false,
        zeroline: false,
        tickfont: { color: "#334155", size: 14 },
      },
      yaxis: {
        title: { text: "Cumulative DiffDelta", font: { size: 14, color: "#1e293b" } },
        tickformat: "~s",
        gridcolor: "rgba(255,255,255,0.72)",
        gridwidth: 1,
        zeroline: false,
        tickfont: { color: "#334155", size: 14 },
      },
      font: {
        family: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
        color: "#1e293b",
      },
    }),
    [height]
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

  if (userLine.data.length === 0) {
    return (
      <div className="w-full rounded-xl border border-gray-100 bg-[#e8edf5] p-6">
        <p className="text-sm text-slate-600">Not enough data to render comparison chart.</p>
      </div>
    );
  }

  return (
    <div className={`w-full rounded-xl border border-gray-100 bg-[#e8edf5] p-2 ${className}`}>
      <div
        ref={plotRef}
        className="h-[500px] w-full"
        role="img"
        aria-label="User performance comparison chart"
      />
    </div>
  );
}
