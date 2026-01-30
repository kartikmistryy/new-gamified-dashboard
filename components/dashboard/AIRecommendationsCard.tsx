"use client";

import { Sparkles, ChevronRight, ThumbsUp, ThumbsDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getAIRecommendations } from "@/lib/orgDashboard/utils";
import { INDUSTRY_AVERAGE_GAUGE } from "@/lib/orgDashboard/constants";
import type { ChartDataPoint } from "@/lib/orgDashboard/types";

type AIRecommendationsCardProps = {
  gaugeValue: number;
  chartData: ChartDataPoint[];
};

export function AIRecommendationsCard({
  gaugeValue,
  chartData,
}: AIRecommendationsCardProps) {
  const recommendations = getAIRecommendations(gaugeValue, chartData);

  return (
    <div className="rounded-2xl p-[2px] bg-linear-to-r from-sky-400 via-violet-500 to-fuchsia-500 shadow-md">
      <Card className="rounded-[14px] overflow-hidden border-0 bg-[#F5F3FF] shadow-none">
        <div className="px-5 pt-5 pb-1">
          <div className="flex items-center gap-3 flex-wrap">
            <Sparkles
              className="size-5 text-violet-600 shrink-0"
              aria-hidden
            />
            <h3 className="font-bold text-gray-900 tracking-tight">
              AI Recommendations
            </h3>
            <span className="rounded-md bg-sky-100 px-2 py-0.5 text-xs font-semibold text-sky-700">
              BETA
            </span>
            <p className="text-xs text-gray-600 w-full mt-0.5 ml-8">
              Based on score ({gaugeValue}) and chart trend
            </p>
          </div>
        </div>
        <CardContent className="px-5 pt-3 pb-5">
          <p className="text-sm text-gray-800 leading-snug mb-4">
            {gaugeValue >= INDUSTRY_AVERAGE_GAUGE ? (
              <>
                Overall score is{" "}
                <strong className="text-gray-900">{gaugeValue}</strong> —{" "}
                <strong className="text-green-700">
                  {Math.round(gaugeValue - INDUSTRY_AVERAGE_GAUGE)} pts above
                </strong>{" "}
                industry average.
              </>
            ) : (
              <>
                Overall score is{" "}
                <strong className="text-gray-900">{gaugeValue}</strong> —{" "}
                <strong className="text-red-600">
                  {Math.abs(
                    Math.round(gaugeValue - INDUSTRY_AVERAGE_GAUGE),
                  )}{" "}
                  pts below
                </strong>{" "}
                industry average.
              </>
            )}
          </p>
          <div className="space-y-3">
            {recommendations.map((rec, i) => (
              <div
                key={i}
                className={cn(
                  "border-l-4 rounded-r-lg bg-white/60 pl-4 pr-4 py-3 transition-colors hover:bg-white/80",
                  rec.borderAccent,
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <span
                      className={cn(
                        "inline-flex rounded-md px-2 py-0.5 text-xs font-medium mb-1.5",
                        rec.sentimentColor,
                        rec.sentimentColor === "text-red-600" && "bg-red-50",
                        rec.sentimentColor === "text-green-600" && "bg-green-50",
                        rec.sentimentColor === "text-amber-600" && "bg-amber-50",
                        rec.sentimentColor === "text-gray-600" && "bg-gray-100",
                      )}
                    >
                      {rec.sentiment}
                    </span>
                    <p className="text-sm text-gray-800 leading-snug">
                      {rec.text}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="shrink-0 text-violet-600 hover:text-violet-800 hover:bg-violet-50 rounded-lg -mr-1 font-medium"
                  >
                    {rec.cta}
                    <ChevronRight className="size-4 ml-0.5" aria-hidden />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between gap-4 mt-5 pt-4 border-t border-violet-200/60">
            <a
              href="#"
              className="text-sm font-medium text-violet-600 hover:text-violet-800 underline underline-offset-2"
            >
              View Details
            </a>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="size-8 rounded-full text-gray-500 hover:text-green-600 hover:bg-green-50/80"
                aria-label="Helpful"
              >
                <ThumbsUp className="size-4" aria-hidden />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 rounded-full text-gray-500 hover:text-red-600 hover:bg-red-50/80"
                aria-label="Not helpful"
              >
                <ThumbsDown className="size-4" aria-hidden />
              </Button>
              <Button className="rounded-xl bg-gray-900 text-white hover:bg-gray-800 border-0 font-medium text-sm px-4 h-9 shadow-sm">
                Ask AI
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
