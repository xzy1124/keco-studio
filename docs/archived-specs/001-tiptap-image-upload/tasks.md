# Tasks: Tiptap Image Upload

**Feature**: Tiptap Image Upload  
**Branch**: `001-tiptap-image-upload`  
**Date**: 2025-01-10

## Overview

Add image upload via slash command `/image`, uploading to Supabase Storage public bucket, inserting into Tiptap using a reusable `image.ts` plugin. Organize tasks by user story for independent delivery.

## User Stories

- **US1**: Insert Image into Editor (P1)
- **US2**: Reuse Image Plugin for Future Extensions (P2)
- **US3**: Local Demo without External OSS Requirement (P3)

## Dependencies

```
Phase 1 (Setup) → Phase 2 (Foundational) → Phase 3 (US1) → Phase 4 (US2) → Phase 5 (US3) → Phase 6 (Polish)
```

**Story Dependencies**:
- US1 is core; US2 builds on plugin export; US3 depends on storage setup but shares code with US1.

## Implementation Strategy

**MVP**: Phases 1-3 (setup, services/plugins, slash upload flow).  
**Full Scope**: All phases (reuse plugin, demo readiness, polish).

---

## Phase 1: Setup

**Goal**: Ensure storage bucket and env are configured for demo.

**Independent Test**: Bucket exists and is public; env vars set.

### Tasks
- [X] T001 Verify/create Supabase Storage bucket `tiptap-images` (public) and document in quickstart (no code change)
- [X] T002 Add env variable hint for `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET` in `quickstart.md` (already noted; verify and adjust if needed)

---

## Phase 2: Foundational

**Goal**: Provide upload service and image plugin scaffolding.

**Independent Test**: Service can upload/get URL; plugin registers without schema errors.

### Tasks
- [X] T003 [P] Create upload service `src/lib/services/imageUploadService.ts` (validate type/size ≤5MB; upload; get public URL; return {url,path})
- [X] T004 [P] Create Tiptap image plugin `src/components/editor/plugins/image.ts` (schema attrs src/alt/title; command insertImage)

---

## Phase 3: User Story 1 - Insert Image into Editor

**Goal**: Slash `/image` opens picker, uploads, shows progress, inserts image at cursor.

**Independent Test**: Select valid image, upload completes, image renders within 3s; invalid/failed uploads show errors and do not insert.

### Tasks
- [X] T005 [US1] Wire slash command `/image` in editor (e.g., in `src/components/editor/PredefineEditor.tsx` or command config) to open file picker
- [X] T006 [US1] Add file validation (type jpeg/png/webp, size ≤5MB) before upload in upload flow (PredefineEditor)
- [X] T007 [US1] Integrate upload service call and progress/loading state in `src/components/editor/PredefineEditor.tsx`
- [X] T008 [US1] On success, use plugin command to insert image at current selection with public URL (PredefineEditor)
- [X] T009 [US1] On failure (validation/upload), surface user-friendly error and skip insertion (PredefineEditor)

---

## Phase 4: User Story 2 - Reuse Image Plugin

**Goal**: Plugin is reusable; can insert by URL in other instances.

**Independent Test**: Import plugin elsewhere and run insertImage({src}) without schema errors.

### Tasks
- [X] T010 [US2] Export plugin insertion command/API from `src/components/editor/plugins/image.ts` for reuse
- [X] T011 [US2] Add minimal doc/comments in plugin describing attrs and insert command usage

---

## Phase 5: User Story 3 - Local Demo without External OSS

**Goal**: Demo works with Supabase Storage only; meaningful errors for missing bucket/creds.

**Independent Test**: With only Supabase Storage configured, upload + render succeed; missing bucket shows clear guidance.

### Tasks
- [X] T012 [US3] Add bucket/creds missing error path in upload service (clear message)
- [X] T013 [US3] Ensure public URL generation via `getPublicUrl` and guard against empty URL before insertion

---

## Phase 6: Polish & Cross-Cutting

**Goal**: Robust UX and code quality.

**Independent Test**: No broken images; progress/errors visible; code lint/strict passes.

### Tasks
- [X] T014 Add unique key generation for uploads (e.g., uuid prefix) in upload service
- [X] T015 Add loading/progress UI indicator styling in `src/components/editor/PredefineEditor.tsx` (or related CSS)
- [X] T016 Add dev-only console logging around upload progress/errors (optional, guard by NODE_ENV)
- [ ] T017 Verify TS strict compliance and lint for new files (types/service/plugin/editor changes)
- [ ] T018 Manual test matrix: valid upload, oversize, invalid type, upload fail (network), missing bucket/creds

---

## Parallel Execution Opportunities

- After Phase 1: T003 and T004 can run in parallel (different files).
- Phase 3: T005-T009 mostly in same file; keep sequential to avoid conflicts.
- Phase 4: T010-T011 in parallel (same file but complementary; sequential if needed).
- Phase 6: T014-T018 largely parallel (distinct concerns), but run lint check after code changes.

---

## Task Summary

- Total tasks: 18  
- Phase 1: 2  
- Phase 2: 2  
- Phase 3 (US1): 5  
- Phase 4 (US2): 2  
- Phase 5 (US3): 2  
- Phase 6 (Polish): 5  
- MVP scope: Phases 1-3 (9 tasks)  
- Full scope: All phases (18 tasks)

---

## Implementation Strategy

1) MVP: bucket/env check → upload service + plugin → slash upload flow with progress/error handling.  
2) Reuse: expose plugin command for URL insertion.  
3) Demo hardening: clear error for missing bucket/creds; guard empty URLs.  
4) Polish: unique keys, styling, logging, TS/lint, manual tests.

