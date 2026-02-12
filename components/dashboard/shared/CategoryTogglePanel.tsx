"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type CategoryOption<T extends string> = {
  key: T;
  label: string;
  color: string;
};

type Developer = {
  id: string;
  name: string;
  team: string;
};

type CategoryTogglePanelProps<T extends string> = {
  /** Title for the panel */
  title?: string;
  /** Available category options for toggling */
  categories: CategoryOption<T>[];
  /** Currently selected category */
  selectedCategory: T;
  /** Callback when category selection changes */
  onCategoryChange: (category: T) => void;
  /** Developers to display in the list (already filtered by parent) */
  developers: Developer[];
  /** Optional className for the container */
  className?: string;
};

/**
 * Panel with category toggle buttons and a filtered developer list.
 * Used for filtering chart data by category (ownership or chaos).
 */
export function CategoryTogglePanel<T extends string>({
  title = "Contributors",
  categories,
  selectedCategory,
  onCategoryChange,
  developers,
  className = "",
}: CategoryTogglePanelProps<T>) {
  return (
    <div className={cn("rounded-[10px] border border-border bg-white flex flex-col", className)}>
      {/* Toggle Buttons */}
      <div className="p-3 border-b border-border">
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => onCategoryChange(cat.key)}
              className={cn(
                "px-2.5 py-1 text-xs font-medium rounded-md transition-colors",
                selectedCategory === cat.key
                  ? "text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
              style={
                selectedCategory === cat.key
                  ? { backgroundColor: cat.color }
                  : undefined
              }
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Developer List */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="px-3 py-2 border-b border-border bg-gray-50">
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            {title} ({developers.length})
          </h4>
        </div>
        <div className="flex-1 overflow-y-auto p-3 max-h-[280px]">
          {developers.length === 0 ? (
            <p className="text-sm text-gray-400 italic text-center py-4">
              No developers in this category
            </p>
          ) : (
            <ul className="space-y-2">
              {developers.map((dev) => (
                <li key={dev.id} className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-medium">
                    {dev.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-700 truncate">{dev.name}</p>
                    <p className="text-xs text-gray-400 truncate">{dev.team}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Pre-configured panels for Ownership and Chaos categories
// =============================================================================

import type { OwnershipCategory, ChaosCategory, OutlierDeveloper } from "@/lib/dashboard/entities/team/types";

const OWNERSHIP_CATEGORIES: CategoryOption<OwnershipCategory>[] = [
  { key: "lower", label: "Lower", color: "#ef4444" },
  { key: "expected", label: "Expected", color: "#22c55e" },
  { key: "higher", label: "Higher", color: "#f59e0b" },
];

const CHAOS_CATEGORIES: CategoryOption<ChaosCategory>[] = [
  { key: "Skilled AI User", label: "Skilled AI", color: "#10b981" },
  { key: "Unskilled AI User", label: "Unskilled AI", color: "#f97316" },
  { key: "Traditional Developer", label: "Traditional", color: "#3b82f6" },
  { key: "Low-Skill Developer", label: "Low-Skill", color: "#ef4444" },
];

type OwnershipTogglePanelProps = {
  selectedCategory: OwnershipCategory;
  onCategoryChange: (category: OwnershipCategory) => void;
  developers: OutlierDeveloper[];
  className?: string;
};

export function OwnershipTogglePanel({
  selectedCategory,
  onCategoryChange,
  developers,
  className,
}: OwnershipTogglePanelProps) {
  const filteredDevelopers = developers.filter(
    (d) => d.ownershipCategory === selectedCategory
  );

  return (
    <CategoryTogglePanel
      title="Contributors"
      categories={OWNERSHIP_CATEGORIES}
      selectedCategory={selectedCategory}
      onCategoryChange={onCategoryChange}
      developers={filteredDevelopers}
      className={className}
    />
  );
}

type ChaosTogglePanelProps = {
  selectedCategory: ChaosCategory;
  onCategoryChange: (category: ChaosCategory) => void;
  developers: OutlierDeveloper[];
  className?: string;
};

export function ChaosTogglePanel({
  selectedCategory,
  onCategoryChange,
  developers,
  className,
}: ChaosTogglePanelProps) {
  const filteredDevelopers = developers.filter(
    (d) => d.chaosCategory === selectedCategory
  );

  return (
    <CategoryTogglePanel
      title="Contributors"
      categories={CHAOS_CATEGORIES}
      selectedCategory={selectedCategory}
      onCategoryChange={onCategoryChange}
      developers={filteredDevelopers}
      className={className}
    />
  );
}
