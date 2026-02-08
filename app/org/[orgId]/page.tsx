import { OrgOverviewPageClient } from '@/components/dashboard/pages/OrgOverviewPageClient';

// Future: Fetch data server-side
// export default async function OrgOverviewPage({ params }: { params: Promise<{ orgId: string }> }) {
//   const { orgId } = await params;
//   const data = await fetchOrgData(orgId);
//   return <OrgOverviewPageClient data={data} />;
// }

export default function OrgOverviewPage() {
  return <OrgOverviewPageClient />;
}
