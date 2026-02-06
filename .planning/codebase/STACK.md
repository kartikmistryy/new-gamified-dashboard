# Technology Stack

**Analysis Date:** 2026-02-06

## Languages

**Primary:**
- TypeScript 5.x - All source code (`app/`, `components/`, `lib/`, `hooks/`, `types/`)
- JSX/TSX - React component development

**Secondary:**
- CSS (via Tailwind CSS) - Styling
- JavaScript (ES2017+) - Configuration files (next.config.ts, postcss.config.mjs, eslint.config.mjs)

## Runtime

**Environment:**
- Node.js (version specified in package.json, commonly LTS versions)

**Package Manager:**
- npm - Primary package manager
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- Next.js 16.1.6 - Full-stack React framework with App Router
- React 19.2.3 - UI library
- React DOM 19.2.3 - DOM rendering

**UI Component Libraries:**
- Radix UI (multiple packages) - Accessible, unstyled UI components:
  - `@radix-ui/react-avatar` 1.1.11
  - `@radix-ui/react-dialog` 1.1.15
  - `@radix-ui/react-dropdown-menu` 2.1.16
  - `@radix-ui/react-separator` 1.1.8
  - `@radix-ui/react-slot` 1.2.4
  - `@radix-ui/react-toggle` 1.1.10
  - `@radix-ui/react-toggle-group` 1.1.11
  - `@radix-ui/react-tooltip` 1.2.8

**Data & Visualization:**
- @tanstack/react-table 8.21.3 - Headless table library for complex data grids
- Recharts 3.7.0 - React charting library
- AG Charts Enterprise 13.0.1 - Advanced charting with enterprise features
- D3 7.9.0 - Low-level data visualization primitives
- @types/d3 7.4.3 - TypeScript types for D3

**Animation & Motion:**
- Framer Motion 12.29.2 - Animation library for React

**Icon Library:**
- Lucide React 0.563.0 - SVG icon component library

**Styling & Utilities:**
- Tailwind CSS 4.x - Utility-first CSS framework (with postcss plugin)
- @tailwindcss/postcss 4.x - PostCSS plugin for Tailwind
- tw-animate-css 1.4.0 - Animation utilities for Tailwind
- class-variance-authority 0.7.1 - CSS class composition helper
- clsx 2.1.1 - Conditional className utility
- tailwind-merge 3.4.0 - Merge Tailwind CSS classes intelligently

**Testing:**
- Not configured (no test framework dependencies in package.json)

**Build/Dev Tools:**
- ESLint 9.x - Linting tool
- eslint-config-next 16.1.6 - Next.js ESLint configuration

## Key Dependencies

**Critical:**
- next 16.1.6 - Enables server-side rendering, API routes, image optimization, and production builds
- react 19.2.3 - Core rendering engine
- @tanstack/react-table 8.21.3 - Powers complex data tables (PerformanceTeamsTable, DesignTeamsTable, TeamTable, etc.)

**Data Visualization:**
- recharts 3.7.0 - Used for interactive dashboard charts
- ag-charts-enterprise 13.0.1 - Advanced charting capabilities (likely for complex metrics)
- d3 7.9.0 - Custom D3 visualizations (SPOF gauge charts in `lib/gauge.ts`)

**UI/UX:**
- radix-ui packages - Foundation for accessible, customizable UI components
- framer-motion 12.29.2 - Interactive animations (used in dashboard sections and transitions)
- lucide-react 0.563.0 - Consistent icon system

**Styling:**
- tailwindcss 4.x - Primary CSS framework (see `app/globals.css`, component className usage throughout)
- tailwind-merge 3.4.0 - Merges conflicting Tailwind classes (critical for component prop overrides)
- class-variance-authority 0.7.1 - Creates type-safe component variants

## Configuration

**Environment:**
- No .env files detected - Application uses mock data only
- No environment variables referenced in source code
- Configuration is static and development-only

**Build:**
- `next.config.ts` - Next.js configuration with remote image patterns (see Integrations)
- `tsconfig.json` - TypeScript configuration with path alias `@/*` pointing to project root
- `postcss.config.mjs` - PostCSS configuration using Tailwind CSS plugin
- `components.json` - shadcn/ui configuration (style: "new-york", base color: "neutral")
- `eslint.config.mjs` - ESLint configuration extending Next.js recommended rules

## Platform Requirements

**Development:**
- Node.js (LTS recommended)
- npm or compatible package manager
- TypeScript 5.x support

**Production:**
- Vercel (recommended - Next.js native integration)
- Or any Node.js hosting that supports Next.js (standard server deployment available via `next start`)
- Port 3000 (default Next.js port)

---

*Stack analysis: 2026-02-06*
