"use client";

import { useEffect, useMemo, useRef } from "react";
import type { Config, Data, Layout } from "plotly.js";
import type { MemberPerformanceDataPoint } from "@/lib/teamDashboard/performanceTypes";
import { buildTeamPerformanceComparisonSeries } from "@/lib/teamDashboard/performanceComparisonHelpers";

type TeamPerformanceComparisonChartProps = {
  data: MemberPerformanceDataPoint[];
  height?: number;
  topN?: number;
};

const DEFAULT_HEIGHT = 500;

function truncateName(name: string, maxLength: number = 14): string {
  if (name.length <= maxLength) return name;
  return `${name.slice(0, maxLength - 3)}...`;
}

export function TeamPerformanceComparisonChart({
  data,
  height = DEFAULT_HEIGHT,
  topN,
}: TeamPerformanceComparisonChartProps) {
  const plotRef = useRef<HTMLDivElement | null>(null);

  const series = useMemo(
    () => buildTeamPerformanceComparisonSeries(data, topN ?? Number.MAX_SAFE_INTEGER),
    [data, topN]
  );

  const traces = useMemo<Data[]>(() => {
    if (series.length === 0) return [];

    const output: any[] = [];

    series.forEach((contributor) => {
      const x = contributor.points.map((point) => point.date);
      const cumulative = contributor.points.map((point) => point.cumulative);
      const add = contributor.points.map((point) => point.add);
      const selfDelete = contributor.points.map((point) => -Math.abs(point.selfDelete));

      output.push({
        type: "scatter",
        mode: "lines",
        x,
        y: cumulative,
        name: truncateName(contributor.memberName),
        legendgroup: contributor.memberName,
        line: {
          color: contributor.color,
          width: 3,
        },
        hovertemplate: `${truncateName(contributor.memberName)} : %{y:.2f}<extra></extra>`,
      });

      output.push({
        type: "bar",
        x,
        y: add,
        base: cumulative,
        name: `${truncateName(contributor.memberName)} Add`,
        legendgroup: contributor.memberName,
        showlegend: false,
        marker: {
          color: "#3A9C45",
          opacity: 0.5,
        },
        hovertemplate: `${truncateName(contributor.memberName)} Add : +%{y:.2f}<extra></extra>`,
      });

      output.push({
        type: "bar",
        x,
        y: selfDelete,
        base: cumulative,
        name: `${truncateName(contributor.memberName)} SelfDelete`,
        legendgroup: contributor.memberName,
        showlegend: false,
        marker: {
          color: "#D65249",
          opacity: 0.5,
        },
        hovertemplate: `${truncateName(contributor.memberName)} SelfDelete : %{y:.2f}<extra></extra>`,
      });
    });

    return output;
  }, [series]);

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

  if (data.length < 2 || series.length === 0) {
    return (
      <div className="w-full rounded-xl border border-gray-100 bg-[#e8edf5] p-6">
        <p className="text-sm text-slate-600">Not enough data to render comparison chart.</p>
      </div>
    );
  }

  return (
    <div className="w-full rounded-xl border border-gray-100 bg-[#e8edf5] p-2">
      <div
        ref={plotRef}
        className="h-[500px] w-full"
        role="img"
        aria-label="Team performance comparison chart"
      />
    </div>
  );
}
