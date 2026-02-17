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
      <div className="p-2 border-b border-border">
        <div className="flex gap-1">
          {categories.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => onCategoryChange(cat.key)}
              className={cn(
                "px-2 py-1 text-[11px] font-medium rounded-md transition-colors whitespace-nowrap",
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
                  <p className="text-sm text-gray-700 truncate">{dev.name}</p>
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
  { key: "higher", label: "Higher", color: "#f59e0b" },
  { key: "expected", label: "Expected", color: "#22c55e" },
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

// =============================================================================
// Chaos Toggle Panel - 2x2 design (Skill level + AI-Powered toggle)
// =============================================================================

type SkillLevel = "unskilled" | "skilled";

/** Map skill level + AI-powered to chaos category */
function getChaosCategory(skill: SkillLevel, aiPowered: boolean): ChaosCategory {
  if (aiPowered) {
    return skill === "skilled" ? "Skilled AI User" : "Unskilled AI User";
  }
  return skill === "skilled" ? "Traditional Developer" : "Low-Skill Developer";
}

/** Get color for skill button based on AI-powered state */
function getSkillColor(skill: SkillLevel, aiPowered: boolean): string {
  if (aiPowered) {
    return skill === "skilled" ? "#10b981" : "#f97316"; // green / orange
  }
  return skill === "skilled" ? "#3b82f6" : "#ef4444"; // blue / red
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
  // Derive current state from selectedCategory
  const isAiPowered = selectedCategory === "Skilled AI User" || selectedCategory === "Unskilled AI User";
  const currentSkill: SkillLevel =
    selectedCategory === "Skilled AI User" || selectedCategory === "Traditional Developer"
      ? "skilled"
      : "unskilled";

  const handleSkillChange = (skill: SkillLevel) => {
    onCategoryChange(getChaosCategory(skill, isAiPowered));
  };

  const handleAiToggle = (aiPowered: boolean) => {
    onCategoryChange(getChaosCategory(currentSkill, aiPowered));
  };

  const filteredDevelopers = developers.filter(
    (d) => d.chaosCategory === selectedCategory
  );

  return (
    <div className={cn("rounded-[10px] border border-border bg-white flex flex-col", className)}>
      {/* AI-Powered Toggle */}
      <div className="px-3 py-2 border-b border-border flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500">AI-Powered</span>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => handleAiToggle(true)}
            className={cn(
              "px-2 py-0.5 text-[10px] font-medium rounded transition-colors",
              isAiPowered
                ? "bg-emerald-500 text-white"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            )}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => handleAiToggle(false)}
            className={cn(
              "px-2 py-0.5 text-[10px] font-medium rounded transition-colors",
              !isAiPowered
                ? "bg-red-500 text-white"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            )}
          >
            No
          </button>
        </div>
      </div>

      {/* Skill Toggle Buttons */}
      <div className="p-2 border-b border-border">
        <div className="flex gap-1">
          {(["unskilled", "skilled"] as const).map((skill) => {
            const isSelected = currentSkill === skill;
            const color = getSkillColor(skill, isAiPowered);
            return (
              <button
                key={skill}
                type="button"
                onClick={() => handleSkillChange(skill)}
                className={cn(
                  "px-2 py-1 text-[11px] font-medium rounded-md transition-colors whitespace-nowrap capitalize",
                  isSelected
                    ? "text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
                style={isSelected ? { backgroundColor: color } : undefined}
              >
                {skill}
              </button>
            );
          })}
        </div>
      </div>

      {/* Developer List */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="px-3 py-2 border-b border-border bg-gray-50">
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Contributors ({filteredDevelopers.length})
          </h4>
        </div>
        <div className="flex-1 overflow-y-auto p-3 max-h-[280px]">
          {filteredDevelopers.length === 0 ? (
            <p className="text-sm text-gray-400 italic text-center py-4">
              No developers in this category
            </p>
          ) : (
            <ul className="space-y-2">
              {filteredDevelopers.map((dev) => (
                <li key={dev.id} className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-medium">
                    {dev.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                  <p className="text-sm text-gray-700 truncate">{dev.name}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
