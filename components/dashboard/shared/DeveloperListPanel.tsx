"use client";

import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SidePanelContext, RoadmapDeveloper } from "@/lib/dashboard/entities/roadmap";

// =============================================================================
// Developer Avatar
// =============================================================================

type DeveloperAvatarProps = {
  developer: RoadmapDeveloper;
  size?: "sm" | "md";
};

function DeveloperAvatar({ developer, size = "sm" }: DeveloperAvatarProps) {
  const sizeClasses = size === "sm" ? "h-6 w-6 text-xs" : "h-8 w-8 text-sm";
  const initials = developer.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (developer.avatarUrl) {
    return (
      <img
        src={developer.avatarUrl}
        alt={developer.name}
        className={`${sizeClasses} rounded-full object-cover`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses} rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-medium`}
    >
      {initials}
    </div>
  );
}

// =============================================================================
// Developer List Column
// =============================================================================

type DeveloperColumnProps = {
  title: string;
  developers: RoadmapDeveloper[];
  colorClass: string;
};

function DeveloperColumn({ title, developers, colorClass }: DeveloperColumnProps) {
  return (
    <div className="flex-1 min-w-0">
      <h4 className={`text-sm font-medium mb-3 ${colorClass}`}>
        {title} ({developers.length})
      </h4>
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {developers.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No developers</p>
        ) : (
          developers.map((dev) => (
            <div key={dev.id} className="flex items-center gap-2">
              <DeveloperAvatar developer={dev} />
              <span className="text-sm text-gray-700 truncate">{dev.name}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// =============================================================================
// Side Panel Component
// =============================================================================

type DeveloperListPanelProps = {
  context: SidePanelContext;
  onClose: () => void;
};

export function DeveloperListPanel({ context, onClose }: DeveloperListPanelProps) {
  if (!context) return null;

  const typeLabel =
    context.type === "roadmap"
      ? "Roadmap"
      : context.type === "checkpoint"
        ? "Checkpoint"
        : "Sub-checkpoint";

  return (
    <div className="fixed inset-y-0 right-0 w-[550px] bg-white shadow-xl border-l z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">{typeLabel}</p>
          <h3 className="text-lg font-semibold text-gray-900">{context.name}</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <XIcon className="h-5 w-5" />
        </Button>
      </div>

      {/* Content - 3 columns */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex gap-4">
          <DeveloperColumn
            title="Basic"
            developers={context.developersByLevel.basic}
            colorClass="text-amber-600"
          />
          <DeveloperColumn
            title="Proficient"
            developers={context.developersByLevel.proficient}
            colorClass="text-blue-600"
          />
          <DeveloperColumn
            title="Advanced"
            developers={context.developersByLevel.advanced}
            colorClass="text-green-600"
          />
        </div>
      </div>
    </div>
  );
}
