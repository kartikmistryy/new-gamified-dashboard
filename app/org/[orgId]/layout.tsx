import { RouteParamsProvider } from '@/lib/RouteParamsProvider';

export default function OrgLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteParamsProvider>
      {children}
    </RouteParamsProvider>
  );
}
