"use client";

import { cn } from "@/lib/utils";

type SkillgraphProgressBarProps = {
  value: number;
  className?: string;
  showValue?: boolean;
};

export function SkillgraphProgressBar({
  value,
  className,
  showValue = true,
}: SkillgraphProgressBarProps) {
  const safeValue = Math.max(0, Math.min(100, value));

  return (
    <div className={cn("flex items-center gap-3 w-[150px]", className)}>
      <div className="h-2 w-full rounded-full bg-emerald-100">
        <div
          className="h-full rounded-full bg-emerald-500 transition-[width]"
          style={{ width: `${safeValue}%` }}
          aria-hidden
        />
      </div>
      {showValue ? (
        <span className="w-12 text-right text-xs font-medium text-gray-700">
          {safeValue}%
        </span>
      ) : null}
    </div>
  );
}
