# Implementation Plan: Library Asset Table View

**Branch**: `001-library-asset-table` | **Date**: 2025-12-18 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/001-library-asset-table/spec.md`

## Summary

- Render a pixel-perfect Library 展示页 for a single library, showing all assets in a table whose first header row is predefine Sections and second header row is Properties under each Section, matching the Figma design.  
- Drive the table header entirely from existing predefine schema (Sections/Properties) and rows from library assets, handling empty/missing values and large datasets with responsive scrolling.  
- Use F2C-mcp against the Figma file (`Keco - Component library`) during development to derive/validate the mapping between Figma library assets and Keco library assets, but keep runtime UI purely Next.js + Supabase.

## Technical Context

**Language/Version**: TypeScript (strict), Next.js 14 App Router, React 18  
**Primary Dependencies**: Next.js/React, Supabase JS client (existing), Ant Design (already used in predefine UI), CSS modules (.module.css), F2C MCP tooling for Figma-assisted design (dev-time only)  
**Storage**: Supabase Postgres (existing library, sections, fields, and assets tables), accessed via existing `useSupabase` context and service hooks  
**Testing**: React Testing Library + Jest/Vitest for table component behavior; manual E2E verification in browser against Figma design; optional Playwright checks for layout regressions  
**Target Platform**: Web (Next.js App Router) running on Linux  
**Project Type**: Web app (single Next.js project with Supabase backend)  
**Performance Goals**: Library 展示页 initial render ≤ 2s p95 for up to 100 assets × 10 properties; horizontal/vertical scrolling remains smooth at 60 fps on target devices  
**Constraints**: Pixel-perfect to Figma via CSS modules; no global CSS; respect Supabase RLS; avoid hydration issues by keeping client/server boundaries clean; no unnecessary new dependencies  
**Scale/Scope**: Single-library view with up to a few hundred assets and tens of properties; no cross-library comparison or advanced filtering in this feature.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Pixel-Perfect Responsive Delivery  
- Plan: Implement Library 展示表格 as a dedicated client component under the dashboard library route, using CSS modules and F2C MCP Figma snapshots to match typography, spacing, and the two-row header layout (Sections row + Properties row), including responsive behavior and hover/active states.

### II. App Router & Supabase Integrity  
- Plan: Keep implementation inside Next.js App Router under `src/app/(dashboard)/[projectId]/[libraryId]/`; reuse existing Supabase context (`useSupabase`) and services to fetch library, sections, and assets; ensure all queries respect existing RLS policies and migrations (no bypass or raw connections).

### III. Typed Minimal & Documented Code  
- Plan: Use typed TS models for `Library`, `SectionConfig`, `FieldConfig`, and `AssetRow` inferred from existing services; avoid adding new heavy UI libs beyond Ant Design; document non-obvious logic such as column grouping, value formatting, and Figma mapping assumptions in code comments.

### IV. Resilient Async & Error Handling  
- Plan: Handle Supabase/network errors when loading sections/assets with explicit loading/empty/error states on the Library 展示页; degrade gracefully when some assets or properties fail to load (e.g., partial data with inline warnings rather than crash).

### V. Simplicity & Single Responsibility  
- Plan: Introduce a focused `LibraryAssetsTable` component responsible only for rendering the header and rows based on predefine + assets; keep data fetching in a thin container (page or hook); reuse predefine types and utilities instead of duplicating schema logic.

**Gate Status (pre-Phase 0)**: PASS — All constitution principles are addressed in the plan; no violations anticipated.

## Project Structure

### Documentation (this feature)

```text
specs/001-library-asset-table/
├── spec.md
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
└── contracts/           # Phase 1 output (/speckit.plan command)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── (dashboard)/
│   │   ├── [projectId]/page.tsx                    # existing project view
│   │   └── [projectId]/[libraryId]/
│   │       ├── page.tsx                            # Library 展示页 (assets table + header)
│   │       └── predefine/                          # 已有 predefine 配置页面
│   │           ├── page.tsx
│   │           └── components/
│   └── api/                                        # (if needed) read-only endpoints for assets/schema
├── components/
│   └── libraries/
│       ├── LibraryAssetsTable.tsx                  # 表格组件（两行表头 + 资产行）
│       └── LibraryAssetsTable.module.css
├── lib/
│   ├── services/
│   │   ├── libraryService.ts                       # 已有 library 读取
│   │   └── libraryAssetsService.ts                 # 新增: 资产 + 属性值读取封装（薄层）
│   └── types/
│       └── libraryAssets.ts                        # TS 类型定义 (Library, Section, Property, AssetRow)
└── tests/
    └── components/
        └── LibraryAssetsTable.test.tsx             # 基本渲染、空状态、缺失值行为
```

**Structure Decision**: Keep a single Next.js App Router project; place Library 展示逻辑 under the existing dashboard library route, with a dedicated `LibraryAssetsTable` component in `components/libraries` and a thin service layer in `lib/services` that reuses Supabase context and existing library schemas.

## Complexity Tracking

> No constitution violations requiring justification are expected for this feature; this section can remain empty unless future scope creep introduces extra projects or architectural patterns.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| - | - | - |

## Phase 0: Research (resolve unknowns)

- Use `research.md` to capture decisions about: where and how to query library assets with their predefine property values, how to map predefine Sections/Properties to table columns, and how to interpret Figma design details (spacing, typography, header grouping).  
- Confirm that runtime integration with F2C MCP is **not** required; it will be used only during development to inspect the Figma file and validate the Library 展示布局 and field mapping.  
- Clarify behavior for edge cases (no assets, missing property values, long text in cells) and record chosen UX patterns.

## Phase 1: Design & Contracts

- `data-model.md`: Define `Library`, `Section`, `Property`, `Asset`, and `AssetPropertyValue` shapes used on the Library 展示页; describe relationships and any derived fields (e.g., display labels, order indices).  
- `contracts/`: Document the UI/data contracts for fetching sections/properties and asset rows (whether via direct Supabase queries or thin `/api` routes), including expected shapes and error models.  
- `quickstart.md`: Describe how to run the app and manually test the Library 展示页, including steps to create sections/properties in predefine and verify the two-row header + asset rows.  
- After these artifacts are created, update the agent context via `.specify/scripts/bash/update-agent-context.sh cursor-agent` so future AI assistance is aware of the new Library 展示模式 and types.

## Phase 2: (handled by /speckit.tasks)

- Once planning is approved, `/speckit.tasks` will break this plan into concrete implementation tasks (UI components, services, tests, and F2C MCP usage notes).

