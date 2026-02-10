"use client";

import { useMemo } from "react";
import { DashboardSection } from "@/components/dashboard/shared/DashboardSection";
import { SPOFTreemap } from "@/components/dashboard/shared/SPOFTreemap";
import { ModulesTable } from "@/components/dashboard/repoDashboard/ModulesTable";
import { getUserModuleSPOFData } from "@/lib/userDashboard/mockData";
import { useRouteParams } from "@/lib/RouteParamsProvider";

/**
 * User SPOF Page Client Component
 *
 * Shows areas where the user has unique knowledge or high ownership risk.
 * Displays a treemap visualization of all modules the user has contributed to,
 * color-coded by SPOF risk level, followed by a detailed modules table.
 *
 * All modules shown are ones where the current user is either the primary
 * or backup owner.
 */
export function UserSPOFPageClient() {
  const { userId } = useRouteParams();

  // Generate userName consistent with layout
  const userName = useMemo(() => {
    if (!userId) return "User";
    return `User ${userId.slice(0, 8)}`;
  }, [userId]);

  // Generate module SPOF data for the user
  // All modules returned will have the current user as a contributor
  const allModuleData = useMemo(
    () => getUserModuleSPOFData(userId ?? "user-1", userName),
    [userId, userName]
  );

  // Filter to only show modules where user is primary owner
  const primaryOwnerModules = useMemo(
    () => allModuleData.filter((module) => module.primaryOwner.id === (userId ?? "user-1")),
    [allModuleData, userId]
  );

  return (
    <div className="flex flex-col gap-8 px-6 pb-8 bg-white text-gray-900 min-h-screen">
      <DashboardSection title="SPOF">
        <SPOFTreemap modules={primaryOwnerModules} currentUserId={userId ?? "user-1"} />
      </DashboardSection>

      <DashboardSection title="Modules">
        <ModulesTable modules={primaryOwnerModules} currentUserId={userId ?? "user-1"} />
      </DashboardSection>
    </div>
  );
}
