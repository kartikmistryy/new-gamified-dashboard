"use client";

import { Sparkles } from "lucide-react";
import type { ChartInsight } from "@/lib/orgDashboard/types";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export type ChartInsightsProps = {
  insights: ChartInsight[];
};

export function ChartInsights({ insights }: ChartInsightsProps) {
  if (insights.length === 0) return null;

  return (
    <Card className="w-full rounded-xl bg-muted h-full max-w-xl mx-auto shadow-none border-none"
    >
      <CardTitle className="px-6">
        <h2
          id="chart-insights-heading"
          className="flex items-center gap-2 text-xl font-semibold text-foreground"
        >
          <Sparkles className="size-5 text-foreground" aria-hidden />
          Chart Insights
        </h2>
      </CardTitle>
      <CardContent>
        <ul className="list-disc space-y-2 pl-5 text-foreground">
          {insights.map(({ id, text }) => (
            <li key={id} className="text-sm">{text}</li>
          ))}
        </ul>
    </CardContent>
    </Card>
  );
}
