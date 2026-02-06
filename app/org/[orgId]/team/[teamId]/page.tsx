"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { getMemberPerformanceRowsForTeam } from "@/lib/teamDashboard/overviewMockData";
import { MemberTable } from "@/components/dashboard/MemberTable";

export default function TeamPage() {
  const params = useParams();
  const teamId = params.teamId as string;

  const memberRows = useMemo(
    () => getMemberPerformanceRowsForTeam(52, teamId, 6),
    [teamId]
  );

  return (
    <div className="flex flex-col gap-8 px-6 pb-8 min-h-screen bg-white text-gray-900">
      <Card className="w-full border-none bg-white p-0 shadow-none">
        <CardContent className="flex w-full flex-col items-stretch space-y-8 px-0">
          <h2 className="text-2xl font-semibold text-foreground">
            Team Members
          </h2>
          <MemberTable rows={memberRows} />
        </CardContent>
      </Card>
    </div>
  );
}
