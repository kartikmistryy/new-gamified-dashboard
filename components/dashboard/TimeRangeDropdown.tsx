"use client";

import { CalendarIcon, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { TimeRangeKey } from "@/lib/shared/types/timeRangeTypes";

interface TimeRangeDropdownProps {
  /** Current time range value */
  value: TimeRangeKey;
  /** Callback when value changes */
  onChange: (value: TimeRangeKey) => void;
  /** Available time range options */
  options?: ReadonlyArray<{ id: TimeRangeKey; label: string; disabled?: boolean }>;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Time Range Dropdown Component
 *
 * A compact dropdown selector for time range filtering using shadcn dropdown menu.
 * Uses radio group for single selection with visual indicator.
 *
 * @example
 * ```tsx
 * const { timeRange, setTimeRange } = useTimeRange();
 * <TimeRangeDropdown value={timeRange} onChange={setTimeRange} />
 * ```
 */
export function TimeRangeDropdown({
  value,
  onChange,
  options = [
    { id: "1m", label: "1 Month" },
    { id: "3m", label: "3 Months" },
    { id: "1y", label: "1 Year" },
    { id: "max", label: "Max" },
  ],
  className = "",
}: TimeRangeDropdownProps) {
  const selectedOption = options.find((opt) => opt.id === value);
  const displayLabel = selectedOption?.label || "Select range";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={`h-9 gap-2 text-xs cursor-pointer rounded-md font-medium ${className}`}
          aria-label="Select time range"
        >
          <CalendarIcon className="h-3.5 w-3.5 text-gray-500" />
          <span className="text-gray-700">{displayLabel}</span>
          <ChevronDown className="h-3.5 w-3.5 text-gray-500" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuRadioGroup value={value} onValueChange={(val) => onChange(val as TimeRangeKey)}>
          {options.map((option) => (
            <DropdownMenuRadioItem
              key={option.id}
              value={option.id}
              disabled={option.disabled}
              className="cursor-pointer"
            >
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
