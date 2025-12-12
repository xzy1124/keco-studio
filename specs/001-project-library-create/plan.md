# Implementation Plan: Project & Library Creation

**Branch**: `001-project-library-create` | **Date**: 2025-12-12 | **Spec**: specs/001-project-library-create/spec.md
**Input**: Feature specification from `/specs/001-project-library-create/spec.md`

## Summary
- Deliver project and library creation flows with modal UIs aligned to Figma: new project modal (name + description), new library modal (name + description), single default Resource library on project creation, library selection opens editor pane.
- Persist projects and libraries (Supabase/Postgres), enforce uniqueness (project name per user, library name per project), surface validation and error states inline.
- Keep App Router + Supabase RLS integrity; CSS modules; typed React/TS; ensure fast load (<2s) for library selection and near-instant modal submission feedback.

## Technical Context
**Language/Version**: TypeScript, Next.js 14 App Router, React 18. 
**Primary Dependencies**: Supabase client (existing), Next.js/React, CSS modules, TipTap editor (already used). 
**Storage**: Supabase Postgres with migrations; RLS enforced. 
**Testing**: React Testing Library + Vitest/Jest for components; lightweight Playwright/E2E optional for modal flows. 
**Target Platform**: Web (Next.js, App Router) on Linux. 
**Project Type**: Web app (single repo, frontend + Supabase backend). 
**Performance Goals**: Library selection renders editor pane <2s (p95); project/library creation response <2s (p95); minimal bundle impact (lazy-load where possible). 
**Constraints**: Pixel-perfect to Figma (F2C MCP); CSS modules only; TS strict; handle async errors gracefully; respect Supabase RLS. 
**Scale/Scope**: Tens–hundreds of projects per user; hundreds of libraries per project; single active editor view per library.

## Constitution Check
- I. Pixel-Perfect Responsive Delivery: plan to match Figma via CSS modules and F2C MCP references. 
- II. App Router & Supabase Integrity: stay in App Router, use Supabase with migrations/RLS. 
- III. Typed Minimal & Documented Code: TS strict, no new heavy deps, document non-obvious logic. 
- IV. Resilient Async & Error Handling: inline validation, error surfacing for Supabase/network. 
- V. Simplicity & Single Responsibility: small modal components, shared hooks/services, avoid duplication.
GATE: All principles addressed; proceed.

## Project Structure
### Documentation (this feature)
```text
specs/001-project-library-create/
├── plan.md
├── spec.md
├── research.md
├── data-model.md
├── quickstart.md
└── contracts/
```

### Source Code (repository root)
```text
src/
├── app/
│   ├── (dashboard)/[projectId]/page.tsx           # project view (post-space removal)
│   ├── (dashboard)/[projectId]/[libraryId]/page.tsx # library editor view
│   └── api/ (if needed for server actions/endpoints)
├── components/
│   ├── layout/                                    # Sidebar, TopBar
│   ├── projects/                                  # new project modal, list
│   └── libraries/                                 # new library modal, list, empty states
├── lib/
│   ├── services/                                  # supabase data access
│   └── types/
└── supabase/
    └── migrations/                                # project & library tables, constraints
```

**Structure Decision**: Single Next.js App Router project with feature-specific UI components under `components/projects` and `components/libraries`; data access in `lib/services`; migrations in `supabase/migrations`.

## Complexity Tracking
No constitution violations requiring justification.

## Phase 0: Research (resolve unknowns)
- No outstanding NEEDS CLARIFICATION; research focuses on defaults and patterns. 
- Decisions captured in `research.md` (default Resource-only library, validation rules, duplication rules, UX states).

## Phase 1: Design & Contracts
- `data-model.md`: Project and Library schemas, uniqueness rules, default creation flow. 
- `contracts/`: REST contract for project/library create/list/fetch; includes payloads and errors. 
- `quickstart.md`: How to run migrations, launch app, and manually test modal flows.
- Agent context: update via `.specify/scripts/bash/update-agent-context.sh cursor-agent` after artifacts are generated.

## Phase 2: (handled by /speckit.tasks)
- Break down implementation tasks once planning is approved.
