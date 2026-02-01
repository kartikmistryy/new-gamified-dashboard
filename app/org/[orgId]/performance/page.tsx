import { Card, CardContent } from "@/components/ui/card";

export default function OrgPerformancePage() {
  return (
    <div className="flex flex-col gap-8 px-6 bg-white text-gray-900 min-h-screen">
    <Card className="bg-white pt-0 pb-0 w-full border-none shadow-none">
      <CardContent className="pt-6">
        <h2 className="text-2xl font-bold text-gray-900">Performance</h2>
        <p className="text-gray-600 mt-2">Performance metrics for this organization.</p>
      </CardContent>
    </Card>
  </div>
  );
}