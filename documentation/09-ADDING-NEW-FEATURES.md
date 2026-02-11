# Adding New Features

Step-by-step guides for common development tasks.

## 🎯 Overview

This guide walks you through adding new features to the dashboard. Each section provides a complete, real-world example.

---

## 📊 Adding a New Dashboard Tab

**Goal**: Add a "Collaboration" tab to the Team dashboard

### Step 1: Create the Route

```bash
# Create new page file
touch app/org/[orgId]/team/[teamId]/collaboration/page.tsx
```

```typescript
// app/org/[orgId]/team/[teamId]/collaboration/page.tsx

export default async function TeamCollaborationPage({
  params
}: {
  params: Promise<{ orgId: string; teamId: string }>;
}) {
  const { orgId, teamId } = await params;

  return <TeamCollaborationPageClient orgId={orgId} teamId={teamId} />;
}
```

### Step 2: Create the Page Component

```bash
# Create page client component
touch components/dashboard/pages/TeamCollaborationPageClient.tsx
```

```typescript
// components/dashboard/pages/TeamCollaborationPageClient.tsx
"use client";

import { useTeamCollaborationData } from "@/lib/dashboard/entities/member/hooks/useTeamCollaborationData";
import { CollaborationMatrix } from "@/components/dashboard/teamDashboard/CollaborationMatrix";

export function TeamCollaborationPageClient({
  teamId,
  orgId
}: {
  teamId: string;
  orgId: string;
}) {
  const { collaborationData, metrics } = useTeamCollaborationData(teamId);

  return (
    <div className="space-y-6">
      <h1>Team Collaboration</h1>

      <div className="grid grid-cols-3 gap-4">
        <MetricCard title="Total Interactions" value={metrics.total} />
        <MetricCard title="Avg Frequency" value={metrics.avgFrequency} />
        <MetricCard title="Network Density" value={metrics.density} />
      </div>

      <CollaborationMatrix data={collaborationData} />
    </div>
  );
}
```

### Step 3: Create the Data Hook

```bash
# Create hook file
touch lib/dashboard/entities/member/hooks/useTeamCollaborationData.ts
```

```typescript
// lib/dashboard/entities/member/hooks/useTeamCollaborationData.ts

import { useMemo } from "react";
import { generateCollaborationData } from "../mocks/collaborationMockData";

export function useTeamCollaborationData(teamId: string) {
  const collaborationData = useMemo(
    () => generateCollaborationData(teamId),
    [teamId]
  );

  const metrics = useMemo(() => {
    const total = collaborationData.reduce((sum, d) => sum + d.interactions, 0);
    const avgFrequency = total / collaborationData.length;
    const density = calculateNetworkDensity(collaborationData);

    return { total, avgFrequency, density };
  }, [collaborationData]);

  return { collaborationData, metrics };
}
```

### Step 4: Create Mock Data

```bash
# Create mock data file
touch lib/dashboard/entities/member/mocks/collaborationMockData.ts
```

```typescript
// lib/dashboard/entities/member/mocks/collaborationMockData.ts

export type CollaborationDataPoint = {
  member1: string;
  member2: string;
  interactions: number;
  frequency: "high" | "medium" | "low";
};

export function generateCollaborationData(
  teamId: string
): CollaborationDataPoint[] {
  const members = ["Alice", "Bob", "Charlie", "Diana"];
  const data: CollaborationDataPoint[] = [];

  for (let i = 0; i < members.length; i++) {
    for (let j = i + 1; j < members.length; j++) {
      const interactions = Math.floor(Math.random() * 100);
      data.push({
        member1: members[i],
        member2: members[j],
        interactions,
        frequency: interactions > 70 ? "high" : interactions > 40 ? "medium" : "low"
      });
    }
  }

  return data;
}
```

### Step 5: Create the Component

```bash
# Create component
touch components/dashboard/teamDashboard/CollaborationMatrix.tsx
```

```typescript
// components/dashboard/teamDashboard/CollaborationMatrix.tsx

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import type { CollaborationDataPoint } from "@/lib/dashboard/entities/member/mocks/collaborationMockData";

export function CollaborationMatrix({
  data
}: {
  data: CollaborationDataPoint[];
}) {
  return (
    <Card>
      <CardHeader>Collaboration Matrix</CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-2">
          {data.map((point, idx) => (
            <div
              key={idx}
              className="p-4 border rounded"
              style={{
                backgroundColor: getColorForFrequency(point.frequency)
              }}
            >
              <p className="font-semibold">{point.member1} ↔ {point.member2}</p>
              <p>{point.interactions} interactions</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function getColorForFrequency(frequency: string) {
  switch (frequency) {
    case "high": return "#55B685";
    case "medium": return "#E87B35";
    case "low": return "#CA3A31";
  }
}
```

### Step 6: Add Tab Navigation

Update the team layout to include the new tab:

```typescript
// app/org/[orgId]/team/[teamId]/layout.tsx

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function TeamLayout({ children, params }) {
  return (
    <div>
      <Breadcrumbs />

      <Tabs value={currentTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="design">Design</TabsTrigger>
          <TabsTrigger value="collaboration">Collaboration</TabsTrigger>  {/* NEW */}
          <TabsTrigger value="skillgraph">Skillgraph</TabsTrigger>
          <TabsTrigger value="spof">SPOF</TabsTrigger>
        </TabsList>
      </Tabs>

      {children}
    </div>
  );
}
```

### Step 7: Test

1. Start dev server: `npm run dev`
2. Navigate to: `http://localhost:3000/org/1/team/2/collaboration`
3. Verify the new tab appears and renders correctly

---

## 🎨 Adding a New Chart Type

**Goal**: Add a "Bubble Chart" to show member distribution

### Step 1: Create Chart Types

```bash
# Create types file
touch lib/dashboard/entities/member/charts/bubbleChart/types.ts
```

```typescript
// lib/dashboard/entities/member/charts/bubbleChart/types.ts

export type BubbleDataPoint = {
  x: number;
  y: number;
  size: number;
  label: string;
  color: string;
};
```

### Step 2: Create Data Transformer

```bash
# Create transformer
touch lib/dashboard/entities/member/charts/bubbleChart/transformers.ts
```

```typescript
// lib/dashboard/entities/member/charts/bubbleChart/transformers.ts

import type { MemberPerformanceRow } from "../../types";
import type { BubbleDataPoint } from "./types";

export function transformToBubbleData(
  members: MemberPerformanceRow[]
): BubbleDataPoint[] {
  return members.map(member => ({
    x: member.performanceValue,
    y: member.complexity,
    size: member.linesOfCode / 100,
    label: member.memberName,
    color: member.performanceValue > 80 ? "#55B685" : "#E87B35"
  }));
}
```

### Step 3: Create Chart Component

```bash
# Create component
touch components/dashboard/shared/BubbleChart.tsx
```

```typescript
// components/dashboard/shared/BubbleChart.tsx

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import type { BubbleDataPoint } from "@/lib/dashboard/entities/member/charts/bubbleChart/types";

export function BubbleChart({ data }: { data: BubbleDataPoint[] }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const svg = d3.select(svgRef.current);
    const width = 800;
    const height = 600;

    // Clear previous render
    svg.selectAll("*").remove();

    // Create scales
    const xScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.x) || 100])
      .range([50, width - 50]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.y) || 100])
      .range([height - 50, 50]);

    // Render bubbles
    svg.selectAll("circle")
      .data(data)
      .join("circle")
      .attr("cx", d => xScale(d.x))
      .attr("cy", d => yScale(d.y))
      .attr("r", d => d.size)
      .attr("fill", d => d.color)
      .attr("opacity", 0.7);

    // Render labels
    svg.selectAll("text")
      .data(data)
      .join("text")
      .attr("x", d => xScale(d.x))
      .attr("y", d => yScale(d.y))
      .attr("text-anchor", "middle")
      .text(d => d.label);
  }, [data]);

  return <svg ref={svgRef} width={800} height={600} />;
}
```

### Step 4: Use in Page

```typescript
// components/dashboard/pages/TeamPerformancePageClient.tsx

import { BubbleChart } from "@/components/dashboard/shared/BubbleChart";
import { transformToBubbleData } from "@/lib/dashboard/entities/member/charts/bubbleChart/transformers";

export function TeamPerformancePageClient({ teamId }) {
  const { members } = useTeamPerformanceData(teamId);
  const bubbleData = useMemo(() => transformToBubbleData(members), [members]);

  return (
    <div>
      <BubbleChart data={bubbleData} />
    </div>
  );
}
```

---

## 🏗️ Adding a New Entity

**Goal**: Add a "Project" entity to track projects within teams

### Step 1: Create Entity Structure

```bash
# Create entity folders
mkdir -p lib/dashboard/entities/project/{hooks,mocks,utils,tables,charts}
```

### Step 2: Define Types

```typescript
// lib/dashboard/entities/project/types.ts

export type ProjectRow = {
  projectId: string;
  projectName: string;
  teamId: string;
  status: "active" | "completed" | "archived";
  progress: number;
  startDate: string;
  endDate: string;
  memberCount: number;
};

export type ProjectPerformanceRow = ProjectRow & {
  performanceValue: number;
  trend: "up" | "down" | "flat";
  velocity: number;
};
```

### Step 3: Create Mock Data

```typescript
// lib/dashboard/entities/project/mocks/overviewMockData.ts

import type { ProjectRow } from "../types";

export function generateProjects(teamId: string, count: number): ProjectRow[] {
  return Array.from({ length: count }, (_, i) => ({
    projectId: `project-${i}`,
    projectName: `Project ${String.fromCharCode(65 + i)}`,
    teamId,
    status: Math.random() > 0.5 ? "active" : "completed",
    progress: Math.floor(Math.random() * 100),
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    memberCount: Math.floor(Math.random() * 10) + 2
  }));
}
```

### Step 4: Create Hook

```typescript
// lib/dashboard/entities/project/hooks/useTeamProjects.ts

import { useMemo } from "react";
import { generateProjects } from "../mocks/overviewMockData";

export function useTeamProjects(teamId: string) {
  const projects = useMemo(
    () => generateProjects(teamId, 10),
    [teamId]
  );

  const activeProjects = useMemo(
    () => projects.filter(p => p.status === "active"),
    [projects]
  );

  return { projects, activeProjects };
}
```

### Step 5: Create Table Configuration

```typescript
// lib/dashboard/entities/project/tables/projectTableColumns.tsx

import type { ColumnDef } from "@tanstack/react-table";
import type { ProjectRow } from "../types";
import { Badge } from "@/components/ui/badge";

export const PROJECT_COLUMNS: ColumnDef<ProjectRow>[] = [
  {
    accessorKey: "projectName",
    header: "Project",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.status === "active" ? "success" : "default"}>
        {row.original.status}
      </Badge>
    )
  },
  {
    accessorKey: "progress",
    header: "Progress",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="w-32 bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full"
            style={{ width: `${row.original.progress}%` }}
          />
        </div>
        <span>{row.original.progress}%</span>
      </div>
    )
  },
  {
    accessorKey: "memberCount",
    header: "Members",
  }
];
```

### Step 6: Create Component

```typescript
// components/dashboard/teamDashboard/ProjectTable.tsx

import { BaseTeamsTable } from "@/components/dashboard/shared/BaseTeamsTable";
import { PROJECT_COLUMNS } from "@/lib/dashboard/entities/project/tables/projectTableColumns";
import type { ProjectRow } from "@/lib/dashboard/entities/project/types";

export function ProjectTable({ data }: { data: ProjectRow[] }) {
  return (
    <BaseTeamsTable
      data={data}
      columns={PROJECT_COLUMNS}
    />
  );
}
```

### Step 7: Add Route

```typescript
// app/org/[orgId]/team/[teamId]/projects/page.tsx

export default async function TeamProjectsPage({ params }) {
  const { orgId, teamId } = await params;
  return <TeamProjectsPageClient orgId={orgId} teamId={teamId} />;
}
```

```typescript
// components/dashboard/pages/TeamProjectsPageClient.tsx
"use client";

import { useTeamProjects } from "@/lib/dashboard/entities/project/hooks/useTeamProjects";
import { ProjectTable } from "@/components/dashboard/teamDashboard/ProjectTable";

export function TeamProjectsPageClient({ teamId }) {
  const { projects, activeProjects } = useTeamProjects(teamId);

  return (
    <div className="space-y-6">
      <h1>Team Projects</h1>

      <div className="grid grid-cols-2 gap-4">
        <MetricCard title="Total Projects" value={projects.length} />
        <MetricCard title="Active Projects" value={activeProjects.length} />
      </div>

      <ProjectTable data={projects} />
    </div>
  );
}
```

---

## 🎯 Adding a Filter Feature

**Goal**: Add filtering to the Member Performance table

### Step 1: Add Filter State

```typescript
// components/dashboard/teamDashboard/MemberTable.tsx

import { useState, useMemo } from "react";

export function MemberTable({ data }: { data: MemberPerformanceRow[] }) {
  const [filter, setFilter] = useState<"all" | "high" | "low">("all");

  const filteredData = useMemo(() => {
    if (filter === "all") return data;
    if (filter === "high") return data.filter(m => m.performanceValue > 80);
    if (filter === "low") return data.filter(m => m.performanceValue < 50);
    return data;
  }, [data, filter]);

  return (
    <div>
      <FilterButtons activeFilter={filter} onFilterChange={setFilter} />
      <Table data={filteredData} />
    </div>
  );
}
```

### Step 2: Create Filter Buttons

```typescript
// components/dashboard/shared/FilterButtons.tsx

import { Button } from "@/components/ui/button";

export function FilterButtons({
  activeFilter,
  onFilterChange
}: {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}) {
  return (
    <div className="flex gap-2">
      <Button
        variant={activeFilter === "all" ? "default" : "outline"}
        onClick={() => onFilterChange("all")}
      >
        All
      </Button>
      <Button
        variant={activeFilter === "high" ? "default" : "outline"}
        onClick={() => onFilterChange("high")}
      >
        High Performers (>80)
      </Button>
      <Button
        variant={activeFilter === "low" ? "default" : "outline"}
        onClick={() => onFilterChange("low")}
      >
        Low Performers (<50)
      </Button>
    </div>
  );
}
```

---

## 🔧 Adding a Utility Function

**Goal**: Add a function to calculate team health score

### Step 1: Create Utility File

```bash
# Create utility
touch lib/dashboard/entities/member/utils/healthCalculators.ts
```

### Step 2: Implement Function

```typescript
// lib/dashboard/entities/member/utils/healthCalculators.ts

import type { MemberPerformanceRow } from "../types";

export function calculateTeamHealthScore(
  members: MemberPerformanceRow[]
): number {
  if (!members.length) return 0;

  // Calculate average performance
  const avgPerformance = members.reduce(
    (sum, m) => sum + m.performanceValue,
    0
  ) / members.length;

  // Calculate distribution (penalty for high variance)
  const variance = calculateVariance(members.map(m => m.performanceValue));
  const distributionScore = Math.max(0, 100 - variance);

  // Calculate trend score (bonus for upward trends)
  const upwardTrends = members.filter(m => m.trend === "up").length;
  const trendScore = (upwardTrends / members.length) * 100;

  // Weighted average
  const healthScore =
    avgPerformance * 0.5 +
    distributionScore * 0.3 +
    trendScore * 0.2;

  return Math.round(healthScore);
}

function calculateVariance(values: number[]): number {
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
  return squaredDiffs.reduce((sum, v) => sum + v, 0) / values.length;
}
```

### Step 3: Use in Hook

```typescript
// lib/dashboard/entities/member/hooks/useTeamPerformanceData.ts

import { calculateTeamHealthScore } from "../utils/healthCalculators";

export function useTeamPerformanceData(teamId: string) {
  const members = useMemo(() => getMemberPerformanceRowsForTeam(teamId), [teamId]);

  const healthScore = useMemo(
    () => calculateTeamHealthScore(members),
    [members]
  );

  return { members, healthScore };
}
```

### Step 4: Display in UI

```typescript
// components/dashboard/pages/TeamPerformancePageClient.tsx

export function TeamPerformancePageClient({ teamId }) {
  const { members, healthScore } = useTeamPerformanceData(teamId);

  return (
    <div>
      <MetricCard
        title="Team Health Score"
        value={healthScore}
        variant={healthScore > 80 ? "success" : "warning"}
      />
      <MemberTable data={members} />
    </div>
  );
}
```

---

## 📝 Development Checklist

When adding a new feature:

### Planning
- [ ] Identify which entity it belongs to (team, member, contributor, user)
- [ ] Determine if it's shared or entity-specific
- [ ] Sketch component hierarchy
- [ ] Plan data flow

### Implementation
- [ ] Create types in `lib/dashboard/entities/[entity]/types.ts`
- [ ] Create mock data in `lib/dashboard/entities/[entity]/mocks/`
- [ ] Create utilities in `lib/dashboard/entities/[entity]/utils/`
- [ ] Create hook in `lib/dashboard/entities/[entity]/hooks/`
- [ ] Create table config in `lib/dashboard/entities/[entity]/tables/` (if needed)
- [ ] Create chart logic in `lib/dashboard/entities/[entity]/charts/` (if needed)
- [ ] Create components in `components/dashboard/`
- [ ] Create page component in `components/dashboard/pages/`
- [ ] Create route in `app/org/[orgId]/...`

### Testing
- [ ] Test in development (`npm run dev`)
- [ ] Verify TypeScript compilation (`npm run build`)
- [ ] Test with different data scenarios
- [ ] Test responsive design
- [ ] Test accessibility

### Documentation
- [ ] Add JSDoc comments to complex functions
- [ ] Update relevant documentation files if needed
- [ ] Add examples to this guide if it's a common pattern

---

**Next**: [Styling Guide](./10-STYLING-GUIDE.md) for colors, themes, and UI patterns.
