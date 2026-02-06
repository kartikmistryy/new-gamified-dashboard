"use client";

import { DashboardSection } from "@/components/dashboard/DashboardSection";
import { SkillgraphTeamsTable } from "@/components/dashboard/SkillgraphTeamsTable";
import { SKILLGRAPH_TEAM_ROWS } from "@/lib/orgDashboard/skillgraphMockData";
import { ChartInsights } from "@/components/dashboard/ChartInsights";
import { getChartInsightsMock } from "@/lib/orgDashboard/overviewMockData";
import { SkillGraph } from "@/components/skillmap/SkillGraph";
import { useMemo, useState } from "react";
import { roadmapData } from "@/components/skillmap/data/data";
import type { SkillgraphSkillRow } from "@/lib/orgDashboard/types";

const buildSkillRowsFromRoadmap = (): SkillgraphSkillRow[] => {
  const teams = SKILLGRAPH_TEAM_ROWS.slice(0, 3);
  let lowCompletionCount = 0;
  return roadmapData.flatMap((roadmap, domainIndex) =>
    roadmap.technologies.map((tech, techIndex) => {
      const base = Math.max(1, tech.value || 0);
      const totalUsage = Math.round(base * 25);
      const contributors = Math.max(4, Math.round(base / 3));
      const avgUsage = contributors > 0 ? Math.round(totalUsage / contributors) : totalUsage;
      const details = teams.map((team, index) => {
        const usage = Math.max(20, Math.round(base * (0.7 + index * 0.12)));
        const progress = Math.min(95, 60 + ((domainIndex * 7 + techIndex * 5 + index * 4) % 35));
        return { team: team.teamName, usage, progress };
      });

      const shouldLowerSubskills = lowCompletionCount < 6;
      if (shouldLowerSubskills && details.length) {
        const lowCount = Math.min(2, details.length);
        for (let i = 0; i < lowCount; i += 1) {
          const lowValue = 18 + ((lowCompletionCount + i) % 6) * 2;
          details[i] = { ...details[i], progress: lowValue };
        }
        lowCompletionCount += lowCount;
      }

      const averageProgress = details.length
        ? details.reduce((sum, detail) => sum + detail.progress, 0) / details.length
        : 0;
      const totalSkillCompletion = Math.round(averageProgress);

      return {
        skillName: tech.name,
        domainName: roadmap.name,
        totalUsage,
        avgUsage,
        totalSkillCompletion,
        contributors,
        details,
      };
    })
  );
};

export default function OrgSkillgraphPage() {
  const chartInsights = useMemo(() => getChartInsightsMock(), []);
  const skillRows = useMemo(() => buildSkillRowsFromRoadmap(), []);
  const [skillgraphView, setSkillgraphView] = useState<"team" | "skill">("team");
  const [visibleTeams, setVisibleTeams] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    SKILLGRAPH_TEAM_ROWS.forEach((row) => {
      init[row.teamName] = true;
    });
    return init;
  });
  const [visibleDomains, setVisibleDomains] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    skillRows.forEach((row) => {
      init[row.skillName] = true;
    });
    return init;
  });

  const domainWeights = useMemo(() => {
    const totals: Record<string, number> = {};
    const activeTeams = SKILLGRAPH_TEAM_ROWS.filter((row) => visibleTeams[row.teamName] !== false);
    const sourceRows = activeTeams.length > 0 ? activeTeams : SKILLGRAPH_TEAM_ROWS;
    sourceRows.forEach((row) => {
      row.domainDistribution?.forEach((segment) => {
        totals[segment.domain] = (totals[segment.domain] ?? 0) + segment.value;
      });
    });

    const totalSum = Object.values(totals).reduce((sum, value) => sum + value, 0);
    if (totalSum === 0) {
      const anyHidden = Object.values(visibleDomains).some((value) => value === false);
      return anyHidden ? totals : undefined;
    }
    return totals;
  }, [visibleDomains, visibleTeams]);
  return (
    <div className="flex flex-col gap-12 px-6 pb-12 bg-white text-gray-900 min-h-screen">
      <DashboardSection title="Organization Skills Graph" className="py-6">
        <ChartInsights insights={chartInsights} />
      </DashboardSection>

      <DashboardSection title="" className="py-6">
        <div className="flex justify-center">
          <div className="h-[700px] w-[850px] flex items-center justify-center">
            <SkillGraph width={700} height={700} domainWeights={domainWeights} skillVisibility={visibleDomains} />
          </div>
        </div>
      </DashboardSection>

      <DashboardSection
        title="Teams"
        className="py-6"
        actionLayout="row"
        action={
          <div className="inline-flex rounded-full bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => setSkillgraphView("team")}
              className={`px-4 py-2 text-xs font-semibold shadow-none rounded-full transition ${
                skillgraphView === "team" ? "bg-white text-gray-900" : "text-gray-600"
              }`}
            >
              By Team
            </button>
            <button
              type="button"
              onClick={() => setSkillgraphView("skill")}
              className={`px-4 py-2 text-xs font-semibold shadow-none rounded-full transition ${
                skillgraphView === "skill" ? "bg-white text-gray-900" : "text-gray-600"
              }`}
            >
              By Skill
            </button>
          </div>
        }
      >
        <SkillgraphTeamsTable
          rows={SKILLGRAPH_TEAM_ROWS}
          skillRows={skillRows}
          view={skillgraphView}
          onViewChange={setSkillgraphView}
          visibleTeams={visibleTeams}
          onVisibilityChange={(teamName, visible) =>
            setVisibleTeams((prev) => ({ ...prev, [teamName]: visible }))
          }
          visibleDomains={visibleDomains}
          onDomainVisibilityChange={(domainName, visible) =>
            setVisibleDomains((prev) => ({ ...prev, [domainName]: visible }))
          }
        />
      </DashboardSection>
    </div>
  );
}
