"use client";

import { DashboardSection } from "@/components/dashboard/shared/DashboardSection";
import { RoadmapProgressSection } from "@/components/dashboard/userDashboard/RoadmapProgressSection";
import { SkillGraph } from "@/components/skillmap/SkillGraph";
import { OrgSkillsTableSection } from "@/components/dashboard/orgDashboard/OrgSkillsTableSection";

export function OrgSkillGraphPageClient() {
  return (
    <div className="flex flex-col gap-12 px-6 pb-12 bg-white text-gray-900 min-h-screen">
      <DashboardSection title="Organization Skills Graph" className="py-6">
        <div className="flex justify-center">
          <div className="h-[780px] w-[850px] flex items-center justify-center">
            <SkillGraph width={700} height={700} />
          </div>
        </div>
      </DashboardSection>

      <DashboardSection title="Skills" className="py-6">
        <OrgSkillsTableSection />
      </DashboardSection>

      <DashboardSection title="" className="py-6">
        <RoadmapProgressSection />
      </DashboardSection>
    </div>
  );
}
