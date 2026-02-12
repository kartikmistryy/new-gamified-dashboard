"use client";

import { useState } from "react";
import { RoadmapProgressTable } from "./RoadmapProgressTable";
import { DeveloperListPanel } from "@/components/dashboard/shared/DeveloperListPanel";
import type {
  RoadmapViewMode,
  RoadmapFilterMode,
  SidePanelContext,
} from "@/lib/dashboard/entities/roadmap";

// =============================================================================
// Toggle Button Group
// =============================================================================

type ToggleOption<T extends string> = {
  value: T;
  label: string;
};

type ToggleGroupProps<T extends string> = {
  options: ToggleOption<T>[];
  value: T;
  onChange: (value: T) => void;
};

function ToggleGroup<T extends string>({
  options,
  value,
  onChange,
}: ToggleGroupProps<T>) {
  return (
    <div className="inline-flex rounded-full bg-gray-100 p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`px-4 py-1.5 text-xs font-medium rounded-full transition-colors ${
            value === option.value
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

// =============================================================================
// View Mode Options
// =============================================================================

const VIEW_MODE_OPTIONS: ToggleOption<RoadmapViewMode>[] = [
  { value: "role", label: "Role View" },
  { value: "skills", label: "Skills View" },
];

const FILTER_MODE_OPTIONS: ToggleOption<RoadmapFilterMode>[] = [
  { value: "all", label: "Show All" },
  { value: "unlocked", label: "Show Unlocked" },
];

// =============================================================================
// Main Section Component
// =============================================================================

export function RoadmapProgressSection() {
  const [viewMode, setViewMode] = useState<RoadmapViewMode>("role");
  const [filterMode, setFilterMode] = useState<RoadmapFilterMode>("all");
  const [sidePanelContext, setSidePanelContext] = useState<SidePanelContext>(null);

  const handleSidePanelOpen = (context: SidePanelContext) => {
    setSidePanelContext(context);
  };

  const handleSidePanelClose = () => {
    setSidePanelContext(null);
  };

  return (
    <div className="space-y-4">
      {/* Header with toggles */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Roadmap Progress</h2>
        <div className="flex items-center gap-3">
          <ToggleGroup
            options={VIEW_MODE_OPTIONS}
            value={viewMode}
            onChange={setViewMode}
          />
          <ToggleGroup
            options={FILTER_MODE_OPTIONS}
            value={filterMode}
            onChange={setFilterMode}
          />
        </div>
      </div>

      {/* Table */}
      <RoadmapProgressTable
        viewMode={viewMode}
        filterMode={filterMode}
        onSidePanelOpen={handleSidePanelOpen}
      />

      {/* Side Panel */}
      {sidePanelContext && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={handleSidePanelClose}
          />
          <DeveloperListPanel
            context={sidePanelContext}
            onClose={handleSidePanelClose}
          />
        </>
      )}
    </div>
  );
}
