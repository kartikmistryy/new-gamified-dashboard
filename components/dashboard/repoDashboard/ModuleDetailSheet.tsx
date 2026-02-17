"use client";

import { UserAvatar } from "@/components/shared/UserAvatar";
import { OwnerCell } from "@/components/dashboard/repoDashboard/ModuleTableComponents";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { ModuleSPOFData } from "@/lib/dashboard/entities/user/types";
import { getOwnershipColor } from "@/lib/dashboard/entities/user/utils/moduleTableUtils";
import {
  getSpofScoreColor,
  getContributorColor,
} from "@/lib/dashboard/entities/user/sheets/moduleDetailSheetUtils";

type ModuleDetailSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  module: ModuleSPOFData | null;
};

/** Module Detail Sheet - displays module details, owners, and capability breakdown */
export function ModuleDetailSheet({ open, onOpenChange, module }: ModuleDetailSheetProps) {
  if (!module) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[600px] overflow-y-auto p-4">
        <SheetHeader className="p-0">
          <SheetTitle className="text-2xl font-bold text-gray-900">{module.name}</SheetTitle>
          <div className="flex flex-col items-start gap-2 mt-2">
            {module.description && (
              <div>
                <p className="text-sm text-gray-700 leading-relaxed">{module.description}</p>
              </div>
            )}
            {module.activeContributors && (
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium text-gray-600">Active Contributors:</span>
                <span className="font-semibold text-gray-900">{module.activeContributors}</span>
              </div>
            )}
            <div className="flex flex-col gap-3 mt-1">
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Primary Owner</span>
                <div className="mt-1.5 w-[260px]">
                  <OwnerCell
                    name={module.primaryOwner.name}
                    percent={module.primaryOwner.ownershipPercent}
                    color={getOwnershipColor(module.scoreRange)}
                  />
                </div>
              </div>
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Backup Owner{module.backupOwners.length !== 1 ? "s" : ""}
                </span>
                {module.backupOwners.length === 0 ? (
                  <p className="text-sm text-gray-400 mt-1.5">—</p>
                ) : module.backupOwners.length === 1 ? (
                  <div className="mt-1.5 w-[260px]">
                    <OwnerCell
                      name={module.backupOwners[0].name}
                      percent={module.backupOwners[0].ownershipPercent}
                      color="#94A3B8"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 min-w-0 mt-1.5">
                    <div className="flex -space-x-2 shrink-0">
                      {module.backupOwners.slice(0, 3).map((owner) => (
                        <UserAvatar key={owner.id} userName={owner.name} className="size-8 border-2 border-white" size={32} />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {module.backupOwners.slice(0, 2).map((o) => o.name).join(", ")}
                      {module.backupOwners.length > 2 && (
                        <span className="text-gray-400"> +{module.backupOwners.length - 2}</span>
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </SheetHeader>

        <div className="flex flex-col gap-6 py-6">
          {module.capabilities && module.capabilities.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">FUNCTIONS</h3>
              <div className="flex flex-col gap-3">
                {module.capabilities.map((capability) => {
                  const borderColor = getSpofScoreColor(capability.spofScore);
                  const hasBorder = borderColor !== "transparent";

                  return (
                    <div
                      key={capability.id}
                      className="bg-gray-50 rounded-lg p-4 transition-all hover:shadow-sm"
                      style={hasBorder ? { borderLeft: `4px solid ${borderColor}` } : undefined}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">{capability.name}</h4>
                          <p className="text-xs text-gray-500 mb-2">{capability.description}</p>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <span className="font-medium">{capability.fileCount}</span>
                          <span>Files</span>
                        </div>
                      </div>

                      {capability.contributors.length > 0 && (
                        <div className="flex flex-col gap-2 mt-3">
                          {capability.contributors.map((contributor, index) => {
                            const contributorColor = getContributorColor(index);

                            return (
                              <div key={`${capability.id}-${contributor.name}`} className="flex items-center gap-3">
                                <UserAvatar userName={contributor.name} className="size-6 shrink-0" size={24} />
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
