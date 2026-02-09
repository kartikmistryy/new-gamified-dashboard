"use client";

import { UserAvatar } from "@/components/shared/UserAvatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { ModuleSPOFData } from "@/lib/userDashboard/types";

type ModuleDetailSheetProps = {
  /** Whether the sheet is open. */
  open: boolean;
  /** Callback when the sheet should close. */
  onOpenChange: (open: boolean) => void;
  /** Module data to display. */
  module: ModuleSPOFData | null;
};

/**
 * Get team load color based on pressure level
 */
function getTeamLoadColor(teamLoad?: string): string {
  switch (teamLoad) {
    case "High Pressure":
      return "#DD524C"; // red
    case "Medium Pressure":
      return "#E87B35"; // orange
    case "Low Pressure":
      return "#55B685"; // green
    default:
      return "#94A3B8"; // gray
  }
}

/**
 * Get SPOF score color for capability highlighting
 */
function getSpofScoreColor(score?: number): string {
  if (!score) return "transparent";
  if (score >= 7.0) return "#DD524C"; // red
  if (score >= 5.0) return "#E87B35"; // orange
  return "transparent";
}

/**
 * Module Detail Sheet Component
 *
 * Displays detailed information about a module including:
 * - Module name and importance
 * - Description
 * - Primary owner and active contributors
 * - Team load indicator
 * - Capabilities breakdown with contributor ownership
 *
 * Opens from the right side when a module row is clicked.
 */
export function ModuleDetailSheet({
  open,
  onOpenChange,
  module,
}: ModuleDetailSheetProps) {
  if (!module) return null;

  const teamLoadColor = getTeamLoadColor(module.teamLoad);
  const teamLoadPercentage =
    module.teamLoad === "High Pressure" ? 80 :
    module.teamLoad === "Medium Pressure" ? 50 :
    module.teamLoad === "Low Pressure" ? 30 : 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[600px] overflow-y-auto p-4">
        <SheetHeader className="p-0">
          <SheetTitle className="text-2xl font-bold text-gray-900">
            {module.name}
          </SheetTitle>
          <div className="flex flex-col items-start gap-2 mt-2">
            <span className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">Importance:</span>
              <span className="text-sm font-bold text-blue-600">
                {module.spofScore}%
              </span>
            </span>
            {module.description && (
              <div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {module.description}
                </p>
              </div>
            )}
                      {/* Owner and Contributors Info */}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-600">Primary Owner:</span>
              <span className="font-semibold text-gray-900">
                {module.primaryOwner.name}
              </span>
            </div>
            {module.activeContributors && (
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-600">Active Contributors:</span>
                <span className="font-semibold text-gray-900">
                  {module.activeContributors}
                </span>
              </div>
            )}
            </div>
          </div>
        </SheetHeader>

        <div className="flex flex-col gap-6 py-6">
          {/* Description */}




          {/* Team Load */}
          {module.teamLoad && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  TEAM LOAD
                </span>
                <span
                  className="text-xs font-semibold"
                  style={{ color: teamLoadColor }}
                >
                  {module.teamLoad}
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${teamLoadPercentage}%`,
                    backgroundColor: teamLoadColor,
                  }}
                />
              </div>
            </div>
          )}

          {/* Capabilities Section */}
          {module.capabilities && module.capabilities.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
                CAPABILITIES
              </h3>
              <div className="flex flex-col gap-3">
                {module.capabilities.map((capability) => {
                  const borderColor = getSpofScoreColor(capability.spofScore);
                  const hasBorder = borderColor !== "transparent";

                  return (
                    <div
                      key={capability.id}
                      className="bg-gray-50 rounded-lg p-4 transition-all hover:shadow-sm"
                      style={
                        hasBorder
                          ? {
                              borderLeft: `4px solid ${borderColor}`,
                            }
                          : undefined
                      }
                    >
                      {/* Capability Header */}
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">
                            {capability.name}
                          </h4>
                          <div className="flex items-center gap-4 text-xs text-gray-600">
                            <span>
                              <span className="font-medium">Imp:</span> {capability.importance}%
                            </span>
                            <span>
                              <span className="font-medium">Bus Factor:</span> {capability.busFactor}
                            </span>
                            <span>
                              <span className="font-medium">Backup:</span> {capability.backupCount}
                            </span>
                            <span>
                              <span className="font-medium">Top Owner:</span> {capability.topOwnerPercent}%
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <span className="font-medium">{capability.fileCount}</span>
                          <span>Files</span>
                        </div>
                      </div>

                      {/* Contributors */}
                      {capability.contributors.length > 0 && (
                        <div className="flex flex-col gap-2 mt-3">
                          {capability.contributors.map((contributor, index) => {
                            const contributorColor =
                              index === 0 ? "#3b82f6" : // blue for top contributor
                              index === 1 ? "#10b981" : // green for second
                              "#94a3b8"; // gray for others

                            return (
                              <div
                                key={`${capability.id}-${contributor.name}`}
                                className="flex items-center gap-3"
                              >
                                <UserAvatar
                                  userName={contributor.name}
                                  className="size-6 shrink-0"
                                  size={24}
                                />
                                <div className="flex-1 flex items-center gap-2">
                                  <span className="text-sm text-gray-700 font-medium min-w-[100px]">
                                    {contributor.name}
                                  </span>
                                  <div className="flex-1 flex items-center gap-2">
                                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                      <div
                                        className="h-full rounded-full transition-all"
                                        style={{
                                          width: `${contributor.ownershipPercent}%`,
                                          backgroundColor: contributorColor,
                                        }}
                                      />
                                    </div>
                                    <span className="text-xs text-gray-600 font-medium min-w-[35px] text-right">
                                      {contributor.ownershipPercent}%
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
