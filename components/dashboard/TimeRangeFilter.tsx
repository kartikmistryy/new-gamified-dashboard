"use client";

import { Badge } from "@/components/shared/Badge";

type TimeRangeFilterProps<T extends string> = {
  options: Array<{ id: T; label: string }>;
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
      {options.map((opt) => (
        <Badge
          key={String(opt.id)}
          onClick={() => onChange(opt.id)}
          className={`${paddingClass} ${textClass} rounded-lg cursor-pointer font-medium transition-colors ${
            value === opt.id
              ? "bg-gray-100 text-gray-700 hover:bg-gray-100"
              : "bg-transparent text-gray-700 border border-gray-200 hover:bg-gray-100"
          }`}
        >
          {opt.label}
        </Badge>
      ))}
    </div>
  );
}
