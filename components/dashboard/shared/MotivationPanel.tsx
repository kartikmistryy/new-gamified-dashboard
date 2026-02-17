"use client";

import type { ChartMotivation } from "@/lib/dashboard/entities/team/types";

type MotivationPanelProps = {
  /** Chart/section title displayed at the top */
  title: string;
  motivation: ChartMotivation;
  className?: string;
};

/**
 * Motivation panel displaying chart title, "Why it matters" and "How it's calculated" sections.
 * Used alongside charts to provide context and explanation.
 */
export function MotivationPanel({ title, motivation, className = "" }: MotivationPanelProps) {
  return (
    <div className={`rounded-[10px] border border-border p-4 space-y-4 bg-white ${className}`}>
      {/* Chart Title */}
      <h3 className="text-base font-semibold text-foreground">
        {title}
      </h3>

      <div>
        <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide mb-1">
          Why it matters
        </h4>
        <p className="text-sm text-muted-foreground">
          {motivation.why}
        </p>
      </div>
      <div>
        <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide mb-1">
          How it's calculated
        </h4>
        <p className="text-sm text-muted-foreground">
          {motivation.how}
        </p>
      </div>
    </div>
  );
}
