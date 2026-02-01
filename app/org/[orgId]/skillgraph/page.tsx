"use client";

import { Card, CardContent } from "@/components/ui/card";

export default function OrgSkillgraphPage() {
  return (
    <div className="flex flex-col gap-8 px-6 bg-white text-gray-900 min-h-screen">
      <Card className="bg-white pt-0 pb-0 w-full border-none shadow-none">
        <CardContent className="pt-6">
          <h2 className="text-2xl font-bold text-gray-900">Skills Graph</h2>
          <p className="text-gray-600 mt-2">Skills graph for this organization.</p>
        </CardContent>
      </Card>
    </div>
  );
}
