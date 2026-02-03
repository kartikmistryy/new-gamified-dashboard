"use client";

import { Eye, EyeOff } from "lucide-react";

type VisibilityToggleButtonProps = {
  isVisible: boolean;
  onToggle: () => void;
  label?: string;
};

export function VisibilityToggleButton({
  isVisible,
  onToggle,
  label = isVisible ? "Hide" : "Show",
}: VisibilityToggleButtonProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="inline-flex items-center justify-center size-8 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
      aria-label={label}
    >
      {isVisible ? (
        <Eye className="size-5 shrink-0" aria-hidden />
      ) : (
        <EyeOff className="size-5 shrink-0" aria-hidden />
      )}
    </button>
  );
}
