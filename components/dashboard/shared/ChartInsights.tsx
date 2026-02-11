"use client";

import { Sparkles } from "lucide-react";
import type { ChartInsight } from "@/lib/dashboard/entities/team/types";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

export type ChartInsightsProps = {
  insights: ChartInsight[];
  /**
   * Rendering variant:
   * - "bullets" (default): renders insights as a bullet list (<ul>/<li>)
   * - "paragraphs": renders insights as separate paragraphs, matching the Figma metric-section style
   * - "topicWithBullets": first insight as bold topic sentence, rest as bullet points
   */
  variant?: "bullets" | "paragraphs" | "topicWithBullets";
  /**
   * Icon display style:
   * - "inline" (default): Sparkles icon inline next to the heading text
   * - "button": Sparkles icon inside a bordered outline button (matches Figma metric cards)
   */
  iconStyle?: "inline" | "button";
  /** Additional class names for the outer Card. */
  className?: string;
};

export function ChartInsights({
  insights,
  variant = "bullets",
  iconStyle = "inline",
  className,
}: ChartInsightsProps) {
  if (insights.length === 0) return null;

  const iconElement =
    iconStyle === "button" ? (
      <span className="inline-flex size-9 items-center justify-center rounded-lg border border-border bg-white shadow-xs">
        <Sparkles className="size-5 text-foreground" aria-hidden />
      </span>
    ) : (
      <Sparkles className="size-5 text-foreground" aria-hidden />
    );

  const defaultClasses = "w-full rounded-[10px] bg-muted h-full shadow-none border-none";
  const widthConstraint = className ? "" : "max-w-2xl mx-auto";

  return (
    <Card className={`${defaultClasses} ${widthConstraint} ${className ?? ""}`}>
      <CardTitle className="px-6">
        <h2
          id="chart-insights-heading"
          className="flex items-center gap-2 text-lg font-semibold text-foreground"
        >
          {iconElement}
          Chart Insights
        </h2>
      </CardTitle>
      <CardContent>
        {variant === "topicWithBullets" ? (
          <div className="space-y-3">
            {/* First insight as topic sentence */}
            {insights.length > 0 && (
              <p className="text-sm font-medium text-foreground">
                {insights[0].text}
              </p>
            )}
            {/* Rest as bullet points */}
            {insights.length > 1 && (
              <ul className="list-disc space-y-1.5 pl-5 text-muted-foreground">
                {insights.slice(1).map(({ id, text }) => (
                  <li key={id} className="text-sm">
                    {text}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : variant === "paragraphs" ? (
          <div className="space-y-3 text-sm text-muted-foreground">
            {insights.map(({ id, text }) => (
              <p key={id}>{text}</p>
            ))}
          </div>
        ) : (
          <ul className="list-disc space-y-2 pl-5 text-foreground">
            {insights.map(({ id, text }) => (
              <li key={id} className="text-sm">
                {text}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
