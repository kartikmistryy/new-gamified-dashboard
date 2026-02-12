"use client";

import type { ChartMotivation } from "@/lib/dashboard/entities/team/types";

type MotivationPanelProps = {
  motivation: ChartMotivation;
  className?: string;
};

/**
 * Motivation panel displaying "Why it matters" and "How it's calculated" sections.
 * Used alongside charts to provide context and explanation.
 */
export function MotivationPanel({ motivation, className = "" }: MotivationPanelProps) {
  return (
    <div className={`rounded-[10px] border border-border p-4 space-y-4 bg-white ${className}`}>
      <div>
        <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide mb-1.5">
          Why it matters
        </h4>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {motivation.why}
        </p>
      </div>
      <div>
        <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide mb-1.5">
          How it's calculated
        </h4>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {motivation.how}
        </p>
      </div>
    </div>
  );
}
