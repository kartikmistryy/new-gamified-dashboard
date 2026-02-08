'use client';

import { usePathname } from 'next/navigation';
import { getStrictContext } from '@/lib/get-strict-context';
import {
  extractOrgId,
  extractTeamId,
  extractUserId,
  extractRepoId,
  getOrgPath,
  getTeamPath,
  getUserPath,
  getRepoPath,
} from '@/lib/routes';

interface RouteParamsContextValue {
  orgId: string | null;
  teamId: string | null;
  userId: string | null;
  repoId: string | null;
  getOrgUrl: (tab?: string) => string;
  getTeamUrl: (teamId: string, tab?: string) => string;
  getUserUrl: (userId: string, tab?: string) => string;
  getRepoUrl: (repoId: string, tab?: string) => string;
}

const [RouteParamsContext, useRouteParams] =
  getStrictContext<RouteParamsContextValue>('RouteParams');

export { useRouteParams };

export function RouteParamsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const orgId = extractOrgId(pathname);
  const teamId = extractTeamId(pathname);
  const userId = extractUserId(pathname);
  const repoId = extractRepoId(pathname);

  const value: RouteParamsContextValue = {
    orgId,
    teamId,
    userId,
    repoId,
    getOrgUrl: (tab) => getOrgPath(orgId!, tab),
    getTeamUrl: (tid, tab) => getTeamPath(orgId!, tid, tab),
    getUserUrl: (uid, tab) => getUserPath(orgId!, uid, tab),
    getRepoUrl: (rid, tab) => getRepoPath(orgId!, rid, tab),
  };

  return (
    <RouteParamsContext.Provider value={value}>
      {children}
    </RouteParamsContext.Provider>
  );
}
