"use client";

import { useEffect, useMemo, useState } from "react";
import { DashboardSection } from "@/components/dashboard/shared/DashboardSection";
import { RoadmapProgressSection } from "@/components/dashboard/userDashboard/RoadmapProgressSection";
import { SkillGraph } from "@/components/skillmap/SkillGraph";
import { OrgSkillsTableSection } from "@/components/dashboard/orgDashboard/OrgSkillsTableSection";
import {
  loadSkillGraphFullData,
  type SkillGraphFullData,
} from "@/components/skillmap/skillGraphDataLoader";
import { transformToTableData } from "@/components/skillmap/skillGraphTableTransform";
import type { OrgSkillTableTab } from "@/lib/dashboard/entities/roadmap/orgSkillTableData";

export function OrgSkillGraphPageClient() {
  const [fullData, setFullData] = useState<SkillGraphFullData | null>(null);
  const [tab, setTab] = useState<OrgSkillTableTab>("role");
  const [autoExpandSkillId, setAutoExpandSkillId] = useState<string | null>(null);

  const handleSwitchToSkill = (skillRoadmapId: string) => {
    setAutoExpandSkillId(skillRoadmapId);
    setTab("skill");
  };

  useEffect(() => {
    loadSkillGraphFullData().then(setFullData).catch(console.error);
  }, []);

  const tableData = useMemo(
    () => (fullData ? transformToTableData(fullData.raw) : null),
    [fullData],
  );

  return (
    <div className="flex flex-col gap-12 px-6 pb-12 bg-white text-gray-900 min-h-screen">
      <DashboardSection title="Organization Skills Graph" className="py-6">
        <div className="flex justify-center">
          <div className="h-[780px] w-[850px] flex items-center justify-center">
            <SkillGraph width={700} height={700} bundle={fullData?.chart ?? null} />
          </div>
        </div>
      </DashboardSection>

      <DashboardSection
        title="Skills"
        className="py-6"
        actionLayout="row"
        action={
          <div className="inline-flex rounded-full bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => setTab("role")}
              className={`px-4 py-2 text-xs font-semibold shadow-none rounded-full transition ${
                tab === "role" ? "bg-white text-gray-900" : "text-gray-600"
              }`}
            >
              Role-Based
            </button>
            <button
              type="button"
              onClick={() => setTab("skill")}
              className={`px-4 py-2 text-xs font-semibold shadow-none rounded-full transition ${
                tab === "skill" ? "bg-white text-gray-900" : "text-gray-600"
              }`}
            >
              Skill-Based
            </button>
          </div>
        }
      >
        {tableData ? (
          <OrgSkillsTableSection
            tab={tab}
            skillData={tableData.skillBased}
            roleData={tableData.roleBased}
            autoExpandSkillId={autoExpandSkillId}
            onAutoExpandConsumed={() => setAutoExpandSkillId(null)}
            onSwitchToSkill={handleSwitchToSkill}
          />
        ) : (
          <div className="py-8 text-center text-sm text-gray-400">Loading skills data…</div>
        )}
      </DashboardSection>

      {/* Roadmap Progress temporarily hidden for demo - R1 */}
      {/* <DashboardSection title="" className="py-6">
        <RoadmapProgressSection />
      </DashboardSection> */}
    </div>
  );
}
