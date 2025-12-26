# Tasks: Project & Library Creation

## Dependencies (Story Order)
- US1 (P1): Create project via modal (with default Resource library)
- US2 (P1): Create library within a project
- US3 (P2): Open library to edit content

## Parallel Execution Examples
- UI vs. schema/services can proceed in parallel after data model is agreed: build modals/components while migrations and Supabase services are prepared.
- US2 UI work can parallelize with US1 API once project creation endpoint/DB is in place.
- US3 editor wiring can start once library fetch contract is stubbed.

## Phase 1: Setup
- [ ] T001 Ensure Supabase env vars available in `.env.local` (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)
- [ ] T002 Verify repo dependencies installed (`pnpm install`) and lint/build run

## Phase 2: Foundational
- [X] T003 Add Supabase migrations for `projects` table with (owner_id, name) unique, description optional in `supabase/migrations/`
- [X] T004 Add Supabase migrations for `libraries` table with (project_id, name) unique, description optional in `supabase/migrations/`
- [X] T005 Add RLS policies for projects and libraries (owner scoping) in `supabase/migrations/`
- [X] T006 Seed or ensure transactional creation: project + default Resource library (DB function or server action) in `supabase/migrations/`

## Phase 3: User Story 1 (P1) — Create project via modal
- [X] T007 [US1] Implement project creation service (Supabase insert + default library transaction) in `src/lib/services/projectService.ts`
- [X] T008 [US1] Add API route or server action for POST /api/projects in `src/app/api/projects/route.ts`
- [X] T009 [US1] Build “New Project” modal UI (name required, description optional, inline validation) in `src/components/projects/NewProjectModal.tsx`
- [X] T010 [US1] Wire modal to project list page and refresh/append project with default Resource library visible in `src/app/(dashboard)/projects/page.tsx`
- [X] T011 [US1] Handle error states (validation, network/Supabase) without closing modal in `src/components/projects/NewProjectModal.tsx`
- [ ] T012 [US1] Add tests for modal validation and service happy-path in `tests/unit/projects/new-project-modal.test.tsx`

## Phase 4: User Story 2 (P1) — Create library within a project
- [X] T013 [US2] Implement library creation service (Supabase insert) with duplicate guard in `src/lib/services/libraryService.ts`
- [X] T014 [US2] Add API route or server action for POST /api/projects/[projectId]/libraries in `src/app/api/projects/[projectId]/libraries/route.ts`
- [X] T015 [US2] Build “New Library” modal UI (name required, description optional, inline validation) in `src/components/libraries/NewLibraryModal.tsx`
- [X] T016 [US2] Wire library modal into project view and refresh/append list in `src/app/(dashboard)/[projectId]/page.tsx`
- [X] T017 [US2] Handle duplicate-name and network errors inline without closing modal in `src/components/libraries/NewLibraryModal.tsx`
- [ ] T018 [US2] Add tests for library modal validation and service happy-path in `tests/unit/libraries/new-library-modal.test.tsx`

## Phase 5: User Story 3 (P2) — Open library to edit content
- [X] T019 [US3] Implement library fetch (metadata + content doc id) service in `src/lib/services/libraryService.ts`
- [X] T020 [US3] Add GET /api/libraries/[libraryId] route or server action in `src/app/api/libraries/[libraryId]/route.ts`
- [X] T021 [US3] Wire library selection to load editor pane with correct title/metadata in `src/app/(dashboard)/[projectId]/[libraryId]/page.tsx`
- [X] T022 [US3] Ensure editor shows loading/error/empty states gracefully in `src/app/(dashboard)/[projectId]/[libraryId]/page.tsx`
- [ ] T023 [US3] Add tests for selection -> editor render and error handling in `tests/unit/libraries/library-editor-view.test.tsx`

## Final Phase: Polish & Cross-Cutting
- [ ] T024 Add empty/initial states for project and library lists (no data) in `src/app/(dashboard)/` pages
- [ ] T025 Add basic instrumentation/logging for create/fetch failures (console or lightweight logger) in services `src/lib/services/*.ts`
- [ ] T026 Verify responsiveness and pixel alignment with Figma (F2C MCP) for modals and lists in `src/components/projects` and `src/components/libraries`
- [ ] T027 Update quickstart with latest commands if migrations or routes change in `specs/001-project-library-create/quickstart.md`
- [ ] T028 Run lint/tests/build and fix issues (`pnpm lint && pnpm test && pnpm build`)
