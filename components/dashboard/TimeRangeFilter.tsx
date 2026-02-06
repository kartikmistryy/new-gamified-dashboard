"use client";

import { Badge } from "@/components/shared/Badge";

type TimeRangeFilterProps<T extends string> = {
  options: Array<{ id: T; label: string; disabled?: boolean }>;
  value: T;
  onChange: (value: T) => void;
  size?: "sm" | "default";
  className?: string;
};

export function TimeRangeFilter<T extends string>({
  options,
  value,
  onChange,
  size = "default",
  className = "",
}: TimeRangeFilterProps<T>) {
  const paddingClass = size === "sm" ? "px-2 py-1.5" : "px-3 py-2";
  const textClass = size === "sm" ? "text-xs" : "text-xs";

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {options.map((opt) => {
        const isDisabled = opt.disabled === true;
        return (
          <Badge
            key={String(opt.id)}
            onClick={() => !isDisabled && onChange(opt.id)}
            aria-disabled={isDisabled ? "true" : undefined}
            className={`${paddingClass} ${textClass} rounded-lg font-medium transition-colors ${
              isDisabled
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : value === opt.id
                ? "bg-gray-100 text-gray-700 hover:bg-gray-100 cursor-pointer"
                : "bg-transparent text-gray-700 border border-gray-200 hover:bg-gray-100 cursor-pointer"
            }`}
          >
            {opt.label}
          </Badge>
        );
      })}
    </div>
  );
}
