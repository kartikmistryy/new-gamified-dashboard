# Frontend Codebase Documentation

Welcome to the Gamified Dashboard frontend documentation. This guide will help you understand the architecture, structure, and patterns used throughout the codebase.

## 📚 Documentation Index

### Getting Started
- **[Quick Start Guide](./01-QUICK-START.md)** - Get up and running quickly
- **[Architecture Overview](./02-ARCHITECTURE-OVERVIEW.md)** - High-level system design

### Core Concepts
- **[Folder Structure](./03-FOLDER-STRUCTURE.md)** - Complete directory organization
- **[Routing System](./04-ROUTING-SYSTEM.md)** - How navigation and routes work
- **[Page Rendering Flow](./05-PAGE-RENDERING-FLOW.md)** - How pages are built and rendered

### Features & Components
- **[Dashboard Entities](./06-DASHBOARD-ENTITIES.md)** - Understanding the entity system
- **[Component Architecture](./07-COMPONENT-ARCHITECTURE.md)** - Component patterns and organization
- **[Data Flow & State](./08-DATA-FLOW-STATE.md)** - How data moves through the app

### Development
- **[Adding New Features](./09-ADDING-NEW-FEATURES.md)** - Step-by-step guides
- **[Styling Guide](./10-STYLING-GUIDE.md)** - Colors, themes, and UI patterns
- **[Common Patterns](./11-COMMON-PATTERNS.md)** - Reusable code patterns

## 🎯 Quick Navigation

**New to the codebase?** Start here:
1. [Quick Start Guide](./01-QUICK-START.md)
2. [Architecture Overview](./02-ARCHITECTURE-OVERVIEW.md)
3. [Folder Structure](./03-FOLDER-STRUCTURE.md)

**Adding a feature?** Check:
1. [Dashboard Entities](./06-DASHBOARD-ENTITIES.md)
2. [Adding New Features](./09-ADDING-NEW-FEATURES.md)

**Working on UI?** See:
1. [Component Architecture](./07-COMPONENT-ARCHITECTURE.md)
2. [Styling Guide](./10-STYLING-GUIDE.md)

## 🏗️ Project Overview

This is a **Next.js 16** (App Router) dashboard application built with:
- **TypeScript** for type safety
- **React 19** for UI components
- **Tailwind CSS** for styling
- **shadcn/ui** for component library
- **D3.js / Plotly** for data visualizations

The dashboard displays metrics across 4 entity levels:
- **Organization** (teams within an org)
- **Team** (members within a team)
- **Repository** (contributors to a repo)
- **User** (individual user metrics)

## 📋 Key Concepts

### Entity-Based Architecture
The codebase uses an **intent-based** organization where similar code for different entities (org/team/repo/user) is organized consistently but kept separate to maintain clarity.

### Shared vs Entity-Specific
- **Shared code** (`/lib/dashboard/shared/`) - Used across multiple entities
- **Entity code** (`/lib/dashboard/entities/`) - Specific to one entity type

### Type Safety
TypeScript is used throughout with strict type checking. All data structures, API responses, and component props are fully typed.

## 🔗 Related Documentation

- **[Main README](../README.md)** - Project setup and installation
- **[Lib Folder README](../lib/README.md)** - Business logic organization
- **[Entities README](../lib/dashboard/entities/README.md)** - Entity system details

## 📝 Contributing

When modifying the codebase:
1. Follow existing patterns and conventions
2. Update documentation when adding new features
3. Maintain consistent file organization
4. Keep components focused and single-purpose

## 🆘 Getting Help

If you're stuck or have questions:
1. Search this documentation
2. Check code comments in relevant files
3. Review similar existing implementations
4. Consult with the team

---

**Last Updated**: February 2026
