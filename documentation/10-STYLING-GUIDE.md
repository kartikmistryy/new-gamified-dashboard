# Styling Guide

Complete guide to styling, colors, themes, and UI patterns in the dashboard.

## 🎨 Color System

### Centralized Colors

**ALL dashboard colors** are defined in one place:

```typescript
// lib/dashboard/shared/utils/colors.ts

export const DASHBOARD_COLORS = {
  // Performance colors
  danger: "#CA3A31",
  warning: "#E87B35",
  good: "#94CA42",
  excellent: "#55B685",

  // Primary colors
  blue: "#3D81FF",
  purple: "#8B5CF6",
  teal: "#14B8A6",

  // Neutral colors
  gray: "#6B7280",
  lightGray: "#E5E7EB",
  darkGray: "#374151",

  // Chart colors
  chart1: "#3D81FF",
  chart2: "#8B5CF6",
  chart3: "#14B8A6",
  chart4: "#F59E0B",
  chart5: "#EF4444"
};
```

**CRITICAL**: Always import from this file. Never hardcode colors.

```typescript
// ✅ Good
import { DASHBOARD_COLORS } from "@/lib/dashboard/shared/utils/colors";
const color = DASHBOARD_COLORS.excellent;

// ❌ Bad
const color = "#55B685";  // Hardcoded!
```

---

### Color Usage Patterns

#### Performance Values

```typescript
export function getPerformanceColor(value: number): string {
  if (value >= 90) return DASHBOARD_COLORS.excellent;  // #55B685
  if (value >= 70) return DASHBOARD_COLORS.good;       // #94CA42
  if (value >= 50) return DASHBOARD_COLORS.warning;    // #E87B35
  return DASHBOARD_COLORS.danger;                       // #CA3A31
}
```

**Usage**:
```typescript
<Badge style={{ backgroundColor: getPerformanceColor(performanceValue) }}>
  {performanceValue}
</Badge>
```

#### Trend Indicators

```typescript
export function getTrendColor(trend: "up" | "down" | "flat"): string {
  switch (trend) {
    case "up": return DASHBOARD_COLORS.excellent;
    case "down": return DASHBOARD_COLORS.danger;
    case "flat": return DASHBOARD_COLORS.gray;
  }
}
```

#### Chart Colors

```typescript
// For multi-series charts
const chartColors = [
  DASHBOARD_COLORS.chart1,  // Blue
  DASHBOARD_COLORS.chart2,  // Purple
  DASHBOARD_COLORS.chart3,  // Teal
  DASHBOARD_COLORS.chart4,  // Amber
  DASHBOARD_COLORS.chart5   // Red
];

// Usage in D3
svg.selectAll("line")
  .data(series)
  .attr("stroke", (d, i) => chartColors[i % chartColors.length]);
```

---

### Background Classes

For Tailwind-compatible background classes:

```typescript
// lib/dashboard/shared/utils/colors.ts

export const DASHBOARD_BG_CLASSES = {
  danger: "bg-red-100 border-red-500",
  warning: "bg-orange-100 border-orange-500",
  good: "bg-lime-100 border-lime-500",
  excellent: "bg-emerald-100 border-emerald-500"
};
```

**Usage**:
```typescript
<div className={DASHBOARD_BG_CLASSES.excellent}>
  Excellent performance!
</div>
```

---

### Badge Variants

```typescript
// lib/dashboard/shared/utils/colors.ts

export const DASHBOARD_BADGE_CLASSES = {
  danger: "bg-red-500 text-white",
  warning: "bg-orange-500 text-white",
  good: "bg-lime-500 text-white",
  excellent: "bg-emerald-500 text-white",
  neutral: "bg-gray-500 text-white"
};
```

**Usage**:
```typescript
export function PerformanceBadge({ value }: { value: number }) {
  const variant = value >= 90 ? "excellent"
    : value >= 70 ? "good"
    : value >= 50 ? "warning"
    : "danger";

  return (
    <span className={`px-2 py-1 rounded ${DASHBOARD_BADGE_CLASSES[variant]}`}>
      {value}
    </span>
  );
}
```

---

## 🎭 Tailwind CSS

### Utility Classes

We use Tailwind's utility-first approach:

```tsx
// Layout
<div className="flex items-center justify-between gap-4">

// Spacing
<div className="p-4 mt-6 mb-8">

// Typography
<h1 className="text-2xl font-bold text-gray-900">

// Colors
<div className="bg-blue-500 text-white">

// Responsive
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
```

### Common Patterns

#### Card Layout

```tsx
<div className="bg-white rounded-lg shadow p-6">
  <h2 className="text-lg font-semibold mb-4">Card Title</h2>
  <p className="text-gray-600">Card content</p>
</div>
```

#### Grid Layouts

```tsx
// Metrics grid
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  <MetricCard title="Total" value={100} />
  <MetricCard title="Active" value={75} />
  <MetricCard title="Completed" value={25} />
</div>

// Two-column layout
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <LeftSection />
  <RightSection />
</div>
```

#### Flexbox Patterns

```tsx
// Space between
<div className="flex items-center justify-between">
  <h1>Title</h1>
  <Button>Action</Button>
</div>

// Centered content
<div className="flex items-center justify-center h-screen">
  <LoadingSpinner />
</div>

// Vertical stack
<div className="flex flex-col gap-4">
  <Item1 />
  <Item2 />
  <Item3 />
</div>
```

---

## 🧩 Component Styling

### shadcn/ui Components

We use shadcn/ui for base components. These have built-in styles:

```tsx
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

<Button variant="default">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
```

### Custom Component Styling

```tsx
// components/dashboard/shared/MetricCard.tsx

export function MetricCard({
  title,
  value,
  trend
}: {
  title: string;
  value: number;
  trend?: "up" | "down" | "flat";
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <p className="text-sm text-gray-600 mb-2">{title}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-gray-900">{value}</span>
        {trend && (
          <TrendIndicator
            trend={trend}
            className="text-sm"
          />
        )}
      </div>
    </div>
  );
}
```

---

## 📊 Chart Styling

### D3 Charts

```typescript
// D3 SVG styling

svg.selectAll("circle")
  .attr("fill", DASHBOARD_COLORS.blue)
  .attr("stroke", DASHBOARD_COLORS.darkGray)
  .attr("stroke-width", 2)
  .attr("opacity", 0.7);

svg.selectAll("text")
  .attr("font-size", "12px")
  .attr("font-family", "Inter, sans-serif")
  .attr("fill", DASHBOARD_COLORS.darkGray);
```

### Plotly Charts

```typescript
// Plotly configuration

const layout = {
  font: {
    family: "Inter, sans-serif",
    size: 12,
    color: DASHBOARD_COLORS.darkGray
  },
  plot_bgcolor: "white",
  paper_bgcolor: "white",
  margin: { t: 40, r: 40, b: 40, l: 40 }
};

const config = {
  displayModeBar: false,
  responsive: true
};
```

### Custom SVG Charts

```tsx
export function PerformanceChart({ data }) {
  return (
    <svg width={800} height={400} className="bg-white rounded-lg border">
      <g className="chart-container">
        {/* Chart elements */}
      </g>
    </svg>
  );
}
```

---

## 🎯 Responsive Design

### Breakpoints

Tailwind's default breakpoints:

```
sm: 640px   (tablets)
md: 768px   (small laptops)
lg: 1024px  (desktops)
xl: 1280px  (large desktops)
2xl: 1536px (extra large)
```

### Responsive Patterns

#### Responsive Grid

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {items.map(item => <Card key={item.id} />)}
</div>
```

#### Responsive Typography

```tsx
<h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">
  Responsive Heading
</h1>
```

#### Responsive Spacing

```tsx
<div className="p-4 lg:p-8">
  <div className="space-y-4 lg:space-y-8">
    {/* Content */}
  </div>
</div>
```

#### Hide/Show on Breakpoints

```tsx
// Hide on mobile, show on desktop
<div className="hidden lg:block">Desktop only</div>

// Show on mobile, hide on desktop
<div className="block lg:hidden">Mobile only</div>
```

---

## 🎨 Typography

### Font Family

We use **Inter** as the primary font:

```css
/* app/globals.css */

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
```

### Text Styles

```tsx
// Headings
<h1 className="text-3xl font-bold text-gray-900">Page Title</h1>
<h2 className="text-2xl font-semibold text-gray-800">Section Title</h2>
<h3 className="text-xl font-medium text-gray-700">Subsection</h3>

// Body text
<p className="text-base text-gray-600">Regular text</p>
<p className="text-sm text-gray-500">Small text</p>
<p className="text-xs text-gray-400">Extra small text</p>

// Links
<a className="text-blue-600 hover:text-blue-800 underline">Link</a>

// Emphasis
<span className="font-bold text-gray-900">Bold text</span>
<span className="font-semibold text-gray-800">Semibold text</span>
<span className="italic text-gray-600">Italic text</span>
```

---

## 🔲 Spacing System

### Consistent Spacing

Use Tailwind's spacing scale:

```tsx
// Padding
className="p-2"   // 0.5rem = 8px
className="p-4"   // 1rem = 16px
className="p-6"   // 1.5rem = 24px
className="p-8"   // 2rem = 32px

// Margin
className="mt-4 mb-6"  // Top: 16px, Bottom: 24px

// Gap (for flex/grid)
className="gap-4"      // 16px gap
```

### Component Spacing

```tsx
// Page layout
<div className="container mx-auto px-4 py-8">
  <div className="space-y-6">
    <Section1 />
    <Section2 />
    <Section3 />
  </div>
</div>

// Card spacing
<Card className="p-6">
  <CardHeader className="mb-4">
  <CardContent className="space-y-3">
</Card>
```

---

## 🎭 Interactive States

### Hover Effects

```tsx
// Button hover
<button className="bg-blue-500 hover:bg-blue-600 transition-colors">
  Hover me
</button>

// Card hover
<div className="border hover:shadow-lg transition-shadow">
  Card
</div>

// Link hover
<a className="text-blue-600 hover:text-blue-800 hover:underline">
  Link
</a>
```

### Focus States

```tsx
// Input focus
<input className="border focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none" />

// Button focus
<button className="focus:outline-none focus:ring-2 focus:ring-blue-500">
  Focus me
</button>
```

### Active States

```tsx
// Active tab
<button
  className={`px-4 py-2 ${
    isActive
      ? "bg-blue-500 text-white"
      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
  }`}
>
  Tab
</button>
```

### Disabled States

```tsx
<button
  disabled
  className="bg-gray-300 text-gray-500 cursor-not-allowed opacity-50"
>
  Disabled
</button>
```

---

## 🎨 Design Tokens

### Shadows

```tsx
// Card shadows
className="shadow-sm"    // Subtle
className="shadow"       // Default
className="shadow-md"    // Medium
className="shadow-lg"    // Large
className="shadow-xl"    // Extra large

// Usage
<Card className="shadow-lg hover:shadow-xl transition-shadow">
```

### Borders

```tsx
// Border widths
className="border"       // 1px
className="border-2"     // 2px
className="border-4"     // 4px

// Border colors
className="border-gray-200"
className="border-blue-500"

// Rounded corners
className="rounded"      // 0.25rem
className="rounded-lg"   // 0.5rem
className="rounded-xl"   // 0.75rem
className="rounded-full" // Circle
```

---

## 🎯 Common UI Patterns

### Status Indicators

```tsx
export function StatusBadge({ status }: { status: string }) {
  const styles = {
    active: "bg-green-100 text-green-800 border-green-500",
    pending: "bg-yellow-100 text-yellow-800 border-yellow-500",
    inactive: "bg-gray-100 text-gray-800 border-gray-500"
  };

  return (
    <span className={`px-3 py-1 rounded-full border ${styles[status]}`}>
      {status}
    </span>
  );
}
```

### Loading States

```tsx
export function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
    </div>
  );
}
```

### Empty States

```tsx
export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="text-gray-400 mb-4">
        <IconNoData size={64} />
      </div>
      <p className="text-gray-600 text-lg">{message}</p>
    </div>
  );
}
```

### Error States

```tsx
export function ErrorMessage({ error }: { error: string }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <IconError className="text-red-500" />
        <div>
          <h3 className="font-semibold text-red-800">Error</h3>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
    </div>
  );
}
```

---

## 📝 Styling Checklist

When styling a component:

- [ ] Use centralized colors from `DASHBOARD_COLORS`
- [ ] Use Tailwind utilities for spacing, layout, typography
- [ ] Make it responsive (test on mobile, tablet, desktop)
- [ ] Add hover states for interactive elements
- [ ] Add focus states for accessibility
- [ ] Use consistent spacing (multiples of 4px)
- [ ] Test in light mode (dark mode future)
- [ ] Ensure text contrast meets accessibility standards
- [ ] Use semantic class names for custom CSS

---

## 🎨 Best Practices

### ✅ DO

```tsx
// Use centralized colors
import { DASHBOARD_COLORS } from "@/lib/dashboard/shared/utils/colors";
const color = DASHBOARD_COLORS.excellent;

// Use Tailwind utilities
<div className="flex items-center gap-4 p-6 rounded-lg shadow">

// Make it responsive
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Use consistent spacing
<div className="space-y-4">  // 16px vertical spacing
```

### ❌ DON'T

```tsx
// Don't hardcode colors
const color = "#55B685";  // ✗

// Don't use inline styles for things Tailwind can do
<div style={{ display: "flex", padding: "24px" }}>  // ✗

// Don't forget responsive design
<div className="grid grid-cols-3">  // ✗ Breaks on mobile

// Don't use arbitrary spacing
<div className="mt-3 mb-7 ml-5">  // ✗ Inconsistent
```

---

**Next**: [Common Patterns](./11-COMMON-PATTERNS.md) for reusable code patterns.
