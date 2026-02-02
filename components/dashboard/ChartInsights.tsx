"use client";

import { Sparkles } from "lucide-react";
import type { ChartInsight } from "@/lib/orgDashboard/types";

export type ChartInsightsProps = {
  insights: ChartInsight[];
};

export function ChartInsights({ insights }: ChartInsightsProps) {
  if (insights.length === 0) return null;

  return (
    <section
      className="w-full p-4 rounded-xl bg-gray-100/50 max-w-3xl mx-auto"
      aria-labelledby="chart-insights-heading"
    >
      <h2
        id="chart-insights-heading"
        className="mb-4 flex items-center gap-2 text-xl font-semibold text-foreground"
      >
        <Sparkles className="size-5 text-foreground" aria-hidden />
        Chart Insights
      </h2>
      <ul className="list-disc space-y-2 pl-5 text-foreground">
        {insights.map(({ id, text }) => (
          <li key={id} className="text-sm">{text}</li>
        ))}
      </ul>
    </section>
  );
}
