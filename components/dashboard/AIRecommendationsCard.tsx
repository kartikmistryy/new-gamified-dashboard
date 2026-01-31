"use client";

import * as React from "react";
import {
  ThumbsUp,
  ThumbsDown,
  MoreVertical,
  ListPlus,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ChartDataPoint } from "@/lib/orgDashboard/types";

type AIRecommendationsCardProps = {
  gaugeValue: number;
  chartData: ChartDataPoint[];
};

/** Folder highlights card: exact copy of the new AI recommendations / graph chart design */
const FOLDER_HIGHLIGHTS_BODY =
  'Records detail financials for "竹梅賽" items, recruitment data for a joint freshman mixer, and apparel pre-orders, centering on ';
const FOLDER_HIGHLIGHTS_HIGHLIGHT = "event logistics and costs.";

export function AIRecommendationsCard({
  gaugeValue: _gaugeValue,
  chartData: _chartData,
}: AIRecommendationsCardProps) {
  return (
    <Card className="rounded-2xl overflow-hidden border border-gray-200 bg-gray-100 shadow-sm py-0">
      <CardContent className="px-5 pt-5 pb-5">
        {/* Title row: list+sparkle icon + "Folder highlights", thumbs up/down, kebab on right */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              <ListPlus className="size-5 text-gray-600 shrink-0" aria-hidden />
            </div>
            <h3 className="font-semibold text-base text-gray-900">
              Folder highlights
            </h3>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="size-8 rounded-md cursor-pointer text-gray-500 hover:text-gray-900 hover:bg-gray-200/80"
              aria-label="Helpful"
            >
              <ThumbsUp className="size-4" aria-hidden />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 rounded-md cursor-pointer text-gray-500 hover:text-gray-900 hover:bg-gray-200/80"
              aria-label="Not helpful"
            >
              <ThumbsDown className="size-4" aria-hidden />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 rounded-md cursor-pointer text-gray-500 hover:text-gray-900 hover:bg-gray-200/80"
              aria-label="More options"
            >
              <MoreVertical className="size-4" aria-hidden />
            </Button>
          </div>
        </div>

        {/* Body: paragraph with light purple background highlight on key phrase */}
        <p className="text-sm text-gray-900 leading-relaxed mb-4">
          {FOLDER_HIGHLIGHTS_BODY}
          <span className="bg-purple-200/60 text-gray-900 px-0.5 py-0.5 rounded">
            {FOLDER_HIGHLIGHTS_HIGHLIGHT}
          </span>
        </p>

        {/* See more: secondary button, light grey bg, subtle border */}
        <Button
          variant="outline"
          size="sm"
          className="h-auto py-2 px-4 rounded-full cursor-pointer bg-white border border-gray-300 text-gray-700 hover:bg-gray-300/80 hover:text-gray-900 font-medium text-sm"
        >
          See more
        </Button>
      </CardContent>
    </Card>
  );
}
