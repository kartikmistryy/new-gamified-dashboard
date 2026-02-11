# Quick Start Guide

Get up and running with the codebase in minutes.

## 🚀 Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open browser
# Navigate to http://localhost:3000
```

## 📍 First Steps

### 1. Understand the Structure

The codebase is organized into clear sections:

```
├── app/                    # Next.js App Router pages
├── components/             # React components
├── lib/                    # Business logic & utilities
├── documentation/          # You are here!
```

### 2. Explore a Dashboard Page

Let's trace how the **Team Performance** page works:

**URL**: `/org/[orgId]/team/[teamId]/performance`

**Files involved**:
```
app/org/[orgId]/team/[teamId]/performance/page.tsx
  └─> components/dashboard/pages/TeamPerformancePageClient.tsx
       ├─> lib/dashboard/entities/member/hooks/useTeamPerformanceData.ts
       ├─> lib/dashboard/entities/member/mocks/performanceMockData.ts
       ├─> lib/dashboard/entities/member/tables/performanceTableColumns.tsx
       └─> components/dashboard/shared/PerformanceChart.tsx
```

### 3. Key Directories Explained

#### `/app` - Routing & Layouts
- Uses Next.js App Router (file-system based routing)
- `page.tsx` = route page
- `layout.tsx` = shared layout wrapper

#### `/components` - UI Components
- Organized by feature/entity
- `shared/` = reusable across entities
- `dashboard/[entity]/` = entity-specific components

#### `/lib` - Business Logic
- `dashboard/shared/` = Cross-entity utilities
- `dashboard/entities/` = Entity-specific logic
- Organized by **intent**: types, mocks, utils, hooks, tables, charts

## 🎯 Common Tasks

### View a Dashboard Page

1. Start dev server: `npm run dev`
2. Navigate to: `http://localhost:3000/org/1/team/1/performance`
3. Observe mock data rendering

### Find Component for a Page

```typescript
// 1. Look in app/org/[orgId]/team/[teamId]/performance/page.tsx
// 2. It imports: TeamPerformancePageClient
// 3. Find it in: components/dashboard/pages/TeamPerformancePageClient.tsx
```

### Find Data Source

```typescript
// In TeamPerformancePageClient.tsx:
import { useTeamPerformanceData } from "@/lib/dashboard/entities/member/hooks/useTeamPerformanceData";

// That hook uses:
import { generateMemberPerformanceTimeSeries } from "../mocks/performanceMockData";
```

### Modify a Table

```typescript
// Tables are defined in: lib/dashboard/entities/[entity]/tables/
// Example: lib/dashboard/entities/member/tables/performanceTableColumns.tsx

// Import in page:
import { PERFORMANCE_MEMBER_COLUMNS } from "@/lib/dashboard/entities/member/tables/performanceTableColumns";
```

## 🗺️ Navigation Flow

```
User visits URL
  ↓
Next.js matches route in /app
  ↓
Loads page.tsx + layout.tsx
  ↓
Server component renders
  ↓
Client components ("use client") hydrate
  ↓
Hooks fetch/generate data
  ↓
Components render with data
```

## 🔑 Key Patterns

### 1. Entity-Based Organization

Each dashboard entity (org/team/repo/user) has the same structure:

```
lib/dashboard/entities/[entity]/
├── types.ts              # TypeScript types
├── mocks/               # Mock data generators
├── utils/               # Helper functions
├── tables/              # Table configurations
├── charts/              # Chart-specific code
└── hooks/               # React hooks
```

### 2. Shared Code

Code used by multiple entities lives in `shared/`:

```
lib/dashboard/shared/
├── contexts/            # React contexts (TimeRange, RouteParams)
├── charts/              # Chart utilities
├── utils/               # Utility functions (colors, constants)
└── components/          # Reusable UI components
```

### 3. Import Aliases

Use path aliases for clean imports:

```typescript
// ✅ Good
import { DASHBOARD_COLORS } from "@/lib/dashboard/shared/utils/colors";

// ❌ Bad
import { DASHBOARD_COLORS } from "../../../lib/dashboard/shared/utils/colors";
```

## 🎨 Styling

We use **Tailwind CSS**:

```tsx
// Inline classes
<div className="flex items-center gap-4 p-4">

// Use centralized colors
import { DASHBOARD_COLORS } from "@/lib/dashboard/shared/utils/colors";
<div style={{ color: DASHBOARD_COLORS.blue }}>
```

## 📊 Data Flow

```
Mock Data Generator (lib/entities/[entity]/mocks/)
  ↓
React Hook (lib/entities/[entity]/hooks/)
  ↓
Page Component (components/dashboard/pages/)
  ↓
Child Components (components/dashboard/[entity]/ or shared/)
  ↓
Rendered UI
```

## 🧩 Component Pattern

```typescript
// 1. Server Component (page.tsx)
export default async function Page() {
  return <ClientComponent />;
}

// 2. Client Component (marked with "use client")
"use client";

export function ClientComponent() {
  const data = useCustomHook();
  return <UI data={data} />;
}
```

## 📝 Next Steps

Now that you're set up:

1. **[Architecture Overview](./02-ARCHITECTURE-OVERVIEW.md)** - Understand the big picture
2. **[Folder Structure](./03-FOLDER-STRUCTURE.md)** - Detailed directory guide
3. **[Page Rendering Flow](./05-PAGE-RENDERING-FLOW.md)** - Deep dive into rendering

## 🐛 Troubleshooting

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules
npm install

# Rebuild
npm run build
```

### Import Errors

- Check path alias starts with `@/`
- Verify file exists at the path
- Ensure TypeScript types are imported with `import type`

### Type Errors

- Run `npm run type-check` to see all errors
- Check that types are imported from the correct entity
- Ensure all required props are provided

---

**Ready to dive deeper?** Continue to [Architecture Overview](./02-ARCHITECTURE-OVERVIEW.md)
