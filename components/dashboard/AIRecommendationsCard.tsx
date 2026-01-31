"use client";

import * as React from "react";
import {
  Sparkles,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
  Bot,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAIRecommendations } from "@/lib/orgDashboard/utils";
import type { ChartDataPoint } from "@/lib/orgDashboard/types";

type AIRecommendationsCardProps = {
  gaugeValue: number;
  chartData: ChartDataPoint[];
};

function formatMarketCloseDate(): string {
  const today = new Date();
  const month = today.toLocaleString("en-US", { month: "short" });
  const day = today.getDate();
  return `Key updates from the market close on ${month} ${day}`;
}

function formatTimestamp(): string {
  const today = new Date();
  const month = today.toLocaleString("en-US", { month: "short" });
  const day = today.getDate();
  const hours = today.getHours();
  const minutes = today.getMinutes();
  const displayMinutes = minutes.toString().padStart(2, "0");
  return `Updated: ${month} ${day} ${hours}:${displayMinutes} ET`;
}

export function AIRecommendationsCard({
  gaugeValue,
  chartData,
}: AIRecommendationsCardProps) {
  const recommendations = getAIRecommendations(gaugeValue, chartData);

  return (
    <Card className="rounded-lg overflow-hidden border border-gray-200 bg-linear-to-br from-purple-50/40 via-pink-50/30 to-purple-50/40 shadow-sm py-0">
      <CardContent className="px-5 pt-5 pb-5">
        {/* Header */}
        <div className="flex items-start gap-3 mb-5">
          <div className="relative shrink-0">
            <div className="size-10 rounded-full p-1 bg-linear-to-br from-blue-400 via-purple-400 to-purple-500">
              <div className="size-full rounded-full bg-white flex items-center justify-center">
                <Bot className="size-5 text-blue-500" aria-hidden />
              </div>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-gray-900 tracking-tight mb-0.5">
              {formatMarketCloseDate()}
            </h3>
            <p className="text-xs text-gray-500">{formatTimestamp()}</p>
          </div>
        </div>

        {/* Trading Data Section */}
        <div className="mb-4">
          <h4 className="font-semibold text-base text-gray-900 mb-3">
            Trading Data
          </h4>
          <div className="space-y-4">
            {recommendations.map((rec, i) => (
              <div key={i} className="space-y-2">
                <p className="text-sm text-gray-900 leading-relaxed">
                  <span className={`font-bold ${rec.sentimentColor}`}>
                    {rec.sentiment}:
                  </span>{" "}
                  {rec.text}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto py-1 px-3 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium border border-gray-200"
                >
                  {rec.cta}
                  <ChevronRight className="size-3 ml-1" aria-hidden />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 pt-4 border-t border-gray-200 w-full">
          <span className="flex flex-row gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="size-9 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-200 bg-gray-50"
              aria-label="Helpful"
            >
              <ThumbsUp className="size-4" aria-hidden />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-9 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-200 bg-gray-50"
              aria-label="Not helpful"
            >
              <ThumbsDown className="size-4" aria-hidden />
            </Button>
          </span>
          <Button className="rounded-lg bg-linear-to-r from-pink-400 via-purple-400 to-purple-500 text-white hover:opacity-90 border-0 font-medium text-sm px-4 h-9 shadow-sm flex items-center gap-2">
            <Sparkles className="size-4" aria-hidden />
            Ask AI
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
