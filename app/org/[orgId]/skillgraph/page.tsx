"use client";

import { DashboardSection } from "@/components/dashboard/DashboardSection";
import { SkillgraphTeamsTable } from "@/components/dashboard/SkillgraphTeamsTable";
import { SKILLGRAPH_TEAM_ROWS, SKILLGRAPH_SKILL_ROWS } from "@/lib/orgDashboard/skillgraphMockData";
import { ChartInsights } from "@/components/dashboard/ChartInsights";
import { getChartInsightsMock } from "@/lib/orgDashboard/overviewMockData";
import { SkillGraph } from "@/components/skillmap/SkillGraph";
import { useMemo, useState } from "react";

export default function OrgSkillgraphPage() {
  const chartInsights = useMemo(() => getChartInsightsMock(), []);
  const [visibleTeams, setVisibleTeams] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    SKILLGRAPH_TEAM_ROWS.forEach((row) => {
      init[row.teamName] = true;
    });
    return init;
  });
  const [visibleDomains, setVisibleDomains] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    SKILLGRAPH_SKILL_ROWS.forEach((row) => {
      init[row.domainName] = true;
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

    Object.keys(visibleDomains).forEach((domain) => {
      if (visibleDomains[domain] === false) {
        totals[domain] = 0;
      }
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
            <SkillGraph width={700} height={700} domainWeights={domainWeights} />
          </div>
        </div>
      </DashboardSection>

      <DashboardSection title="Teams" className="py-6">
        <SkillgraphTeamsTable
          rows={SKILLGRAPH_TEAM_ROWS}
          skillRows={SKILLGRAPH_SKILL_ROWS}
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
