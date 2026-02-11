# Routing System

Understanding how navigation and routes work in the application.

## 🗺️ Route Structure

The app uses **Next.js App Router** with file-based routing.

### Complete Route Map

```
/                                          Home page
│
└─ /org/[orgId]                           Organization Dashboard
   ├─ /                                   Overview tab
   ├─ /design                             Design tab
   ├─ /performance                        Performance tab
   ├─ /skillgraph                        Skillgraph tab
   ├─ /spof                              SPOF tab
   │
   ├─ /team/[teamId]                     Team Dashboard
   │  ├─ /                               Overview tab
   │  ├─ /design                         Design tab
   │  ├─ /performance                    Performance tab
   │  ├─ /skillgraph                    Skillgraph tab
   │  └─ /spof                          SPOF tab
   │
   ├─ /repository/[repoId]               Repository Dashboard
   │  ├─ /                               Overview tab
   │  ├─ /design                         Design tab
   │  ├─ /performance                    Performance tab
   │  ├─ /skillgraph                    Skillgraph tab
   │  └─ /spof                          SPOF tab
   │
   └─ /user/[userId]                     User Dashboard
      ├─ /                               Overview tab (not implemented yet)
      ├─ /skillgraph                    Skillgraph tab
      └─ /spof                          SPOF tab
```

## 📁 File → URL Mapping

### How It Works

```
File Path                                          URL
──────────────────────────────────────────────────────────────────────
app/page.tsx                                    → /
app/org/[orgId]/page.tsx                       → /org/123
app/org/[orgId]/design/page.tsx                → /org/123/design
app/org/[orgId]/team/[teamId]/page.tsx         → /org/123/team/456
app/org/[orgId]/team/[teamId]/performance/page.tsx → /org/123/team/456/performance
```

### Dynamic Routes

**Dynamic segments** use brackets: `[paramName]`

```typescript
// File: app/org/[orgId]/team/[teamId]/page.tsx

// URL: /org/123/team/456
// Params: { orgId: "123", teamId: "456" }

export default async function TeamPage({
  params
}: {
  params: Promise<{ orgId: string; teamId: string }>;
}) {
  const { orgId, teamId } = await params;
  // Use orgId and teamId here
}
```

## 🎨 Layout System

### Layout Hierarchy

Layouts **wrap** their children and **nest**:

```
app/layout.tsx                              (Root - all pages)
  └─> app/org/[orgId]/layout.tsx           (Org - sidebar navigation)
      └─> app/org/[orgId]/team/[teamId]/layout.tsx  (Team - breadcrumbs)
          └─> app/org/[orgId]/team/[teamId]/performance/page.tsx
```

### Layout Responsibilities

#### Root Layout (`app/layout.tsx`)
```typescript
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <TimeRangeProvider>          {/* Global state */}
          {children}
        </TimeRangeProvider>
      </body>
    </html>
  );
}
```

**Provides**:
- HTML structure
- Global contexts (TimeRange)
- Global styles
- Metadata

#### Org Layout (`app/org/[orgId]/layout.tsx`)
```typescript
export default function OrgLayout({ children, params }) {
  return (
    <div className="flex">
      <DashboardSidebar orgId={params.orgId} />  {/* Navigation */}
      <main>{children}</main>
    </div>
  );
}
```

**Provides**:
- Sidebar navigation
- RouteParams context
- Org-level wrapper

#### Entity Layouts (Team/Repo/User)
```typescript
export default function TeamLayout({ children, params }) {
  return (
    <div>
      <Breadcrumbs teamId={params.teamId} />     {/* Navigation trail */}
      {children}
    </div>
  );
}
```

**Provides**:
- Breadcrumb navigation
- Entity-level context
- Entity-specific wrappers

## 🧭 Navigation Components

### Sidebar Navigation

**Location**: `components/dashboard/layout/DashboardSidebar.tsx`

**Structure**:
```tsx
<Sidebar>
  <OrgSelector />                    {/* Switch organizations */}

  <NavSection title="Organization">
    <NavItem href="/org/[orgId]">Overview</NavItem>
    <NavItem href="/org/[orgId]/performance">Performance</NavItem>
    ...
  </NavSection>

  <NavSection title="Teams">
    <NavItem href="/org/[orgId]/team/[teamId]">Team Alpha</NavItem>
    ...
  </NavSection>
</Sidebar>
```

### Breadcrumbs

**Location**: `components/dashboard/layout/Breadcrumbs.tsx`

**Shows current path**:
```
Organization > Teams > Team Alpha > Performance
```

### Tab Navigation

Each dashboard page has tabs:
```tsx
<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="performance">Performance</TabsTrigger>
    <TabsTrigger value="design">Design</TabsTrigger>
    ...
  </TabsList>
</Tabs>
```

Clicking a tab navigates to that route.

## 🔗 Link Components

### Using Next.js Link

```tsx
import Link from "next/link";

// Static link
<Link href="/org/123/team/456">Team 456</Link>

// Dynamic link (from data)
<Link href={`/org/${orgId}/team/${teamId}`}>
  {teamName}
</Link>
```

### useRouter Hook

```tsx
import { useRouter } from "next/navigation";

function MyComponent() {
  const router = useRouter();

  // Programmatic navigation
  const goToTeam = (teamId: string) => {
    router.push(`/org/123/team/${teamId}`);
  };

  // Go back
  const goBack = () => router.back();
}
```

## 📝 Route Parameters

### Reading Params in Pages

```typescript
// app/org/[orgId]/team/[teamId]/page.tsx

export default async function TeamPage({
  params
}: {
  params: Promise<{ orgId: string; teamId: string }>;
}) {
  const { orgId, teamId } = await params;

  return <TeamPageClient orgId={orgId} teamId={teamId} />;
}
```

### Reading Params in Client Components

```typescript
// components/dashboard/pages/TeamPageClient.tsx
"use client";

import { useRouteParams } from "@/lib/dashboard/shared/contexts/RouteParamsProvider";

export function TeamPageClient() {
  const { orgId, teamId } = useRouteParams();

  // Use orgId and teamId
}
```

### Reading Search Params (Query String)

```typescript
// URL: /org/123/team/456?filter=active&sort=name

import { useSearchParams } from "next/navigation";

export function MyComponent() {
  const searchParams = useSearchParams();

  const filter = searchParams.get("filter");  // "active"
  const sort = searchParams.get("sort");      // "name"
}
```

## 🎭 Server vs Client Components

### Server Components (Default)

```typescript
// app/org/[orgId]/page.tsx
// No "use client" = Server Component

export default async function OrgPage({ params }) {
  // Runs on server
  // Can access databases, file system, etc.

  return <OrgPageClient />;
}
```

**Benefits**:
- SEO friendly
- Fast initial load
- Reduced bundle size

### Client Components

```typescript
// components/dashboard/pages/OrgPageClient.tsx
"use client";  // Required!

export function OrgPageClient() {
  // Runs in browser
  // Can use hooks, state, browser APIs

  const [data, setData] = useState(...);
  const handleClick = () => { ... };

  return <div onClick={handleClick}>...</div>;
}
```

**When to use**:
- Interactive elements (clicks, hovers)
- React hooks (useState, useEffect)
- Browser APIs (localStorage, etc.)

## 🔄 Route Patterns

### Pattern: Entity Dashboard

All entity dashboards follow the same pattern:

```typescript
// 1. Server page component
// app/org/[orgId]/team/[teamId]/performance/page.tsx

export default async function TeamPerformancePage({ params }) {
  const { teamId } = await params;
  return <TeamPerformancePageClient teamId={teamId} />;
}

// 2. Client page component
// components/dashboard/pages/TeamPerformancePageClient.tsx

"use client";

export function TeamPerformancePageClient({ teamId }) {
  const data = useTeamPerformanceData(teamId);
  return (
    <DashboardLayout>
      <PerformanceChart data={data} />
      <PerformanceTable data={data} />
    </DashboardLayout>
  );
}

// 3. Data hook
// lib/dashboard/entities/member/hooks/useTeamPerformanceData.ts

export function useTeamPerformanceData(teamId: string) {
  const data = useMemo(() => generateMockData(teamId), [teamId]);
  return data;
}
```

### Pattern: Tab Navigation

Each dashboard has tabs that map to routes:

```typescript
// Overview tab
/org/123/team/456              → Overview content

// Performance tab
/org/123/team/456/performance  → Performance content

// Design tab
/org/123/team/456/design       → Design content
```

**Implementation**:
```tsx
<Tabs value={currentTab}>
  <TabsList>
    <TabsTrigger
      value="overview"
      onClick={() => router.push(`/org/${orgId}/team/${teamId}`)}
    >
      Overview
    </TabsTrigger>
    <TabsTrigger
      value="performance"
      onClick={() => router.push(`/org/${orgId}/team/${teamId}/performance`)}
    >
      Performance
    </TabsTrigger>
  </TabsList>
</Tabs>
```

## 📍 Current Route Detection

### In Components

```typescript
import { usePathname } from "next/navigation";

export function NavItem({ href }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={isActive ? "active" : ""}
    >
      ...
    </Link>
  );
}
```

### Tab Selection

```typescript
function useCurrentTab() {
  const pathname = usePathname();

  if (pathname.endsWith("/performance")) return "performance";
  if (pathname.endsWith("/design")) return "design";
  if (pathname.endsWith("/spof")) return "spof";
  return "overview";
}
```

## 🔐 Route Protection (Future)

When authentication is added:

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const isAuthenticated = checkAuth(request);

  if (!isAuthenticated) {
    return NextResponse.redirect("/login");
  }
}

export const config = {
  matcher: ["/org/:path*"]  // Protect all org routes
};
```

## 🎯 Route Best Practices

### ✅ DO

```typescript
// Use semantic paths
/org/123/team/456/performance  ✓

// Pass params explicitly
<TeamPageClient teamId={teamId} orgId={orgId} />  ✓

// Use Link for navigation
<Link href="/org/123">Go to Org</Link>  ✓
```

### ❌ DON'T

```typescript
// Don't use unclear paths
/dashboard/123/456/perf  ✗

// Don't rely on global param access without context
const teamId = globalParams.teamId;  ✗

// Don't use <a> tags for internal links
<a href="/org/123">Go to Org</a>  ✗
```

## 🔍 Debugging Routes

### Check Current Route

```typescript
"use client";

import { usePathname, useParams } from "next/navigation";

export function RouteDebugger() {
  const pathname = usePathname();
  const params = useParams();

  return (
    <div>
      <p>Path: {pathname}</p>
      <p>Params: {JSON.stringify(params)}</p>
    </div>
  );
}
```

### Verify Layout Nesting

Check React DevTools:
```
<RootLayout>
  <OrgLayout>
    <TeamLayout>
      <TeamPerformancePage>
```

## 📊 Route Loading States

### Suspense Boundaries

```typescript
// app/org/[orgId]/team/[teamId]/loading.tsx

export default function Loading() {
  return <Skeleton />;  // Shown while page loads
}
```

### Streaming

```typescript
import { Suspense } from "react";

export default function Page() {
  return (
    <div>
      <Suspense fallback={<ChartSkeleton />}>
        <PerformanceChart />  {/* Loads independently */}
      </Suspense>

      <Suspense fallback={<TableSkeleton />}>
        <PerformanceTable />  {/* Loads independently */}
      </Suspense>
    </div>
  );
}
```

## 🗺️ Route Generation

### Generating Entity Routes

```typescript
// Generate all team routes
const teams = ["team-1", "team-2", "team-3"];

teams.forEach(teamId => {
  const routes = [
    `/org/123/team/${teamId}`,
    `/org/123/team/${teamId}/performance`,
    `/org/123/team/${teamId}/design`,
    // ...
  ];
});
```

## 📱 Mobile Navigation (Future)

```typescript
// Collapsible sidebar on mobile
const [sidebarOpen, setSidebarOpen] = useState(false);

<MobileSidebar
  open={sidebarOpen}
  onClose={() => setSidebarOpen(false)}
/>
```

---

**Next**: [Page Rendering Flow](./05-PAGE-RENDERING-FLOW.md) for understanding how pages are built.
