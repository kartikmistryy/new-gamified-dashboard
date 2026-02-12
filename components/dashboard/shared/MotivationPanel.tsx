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
      <h3 className="text-sm font-semibold text-foreground">
        {title}
      </h3>

      <div>
        <h4 className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">
          Why it matters
        </h4>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {motivation.why}
        </p>
      </div>
      <div>
        <h4 className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">
          How it's calculated
        </h4>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {motivation.how}
        </p>
      </div>
    </div>
  );
}
