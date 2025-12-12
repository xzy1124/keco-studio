# Tasks: Tiptap Real-Time Collaboration

**Feature**: Tiptap Real-Time Collaboration  
**Branch**: `001-tiptap-collaboration`  
**Date**: 2025-01-10

## Overview

This feature enables real-time collaborative editing for Tiptap documents using Supabase Realtime + Manual Synchronization. Tasks are organized by user story to enable independent implementation and testing.

## User Stories

- **US1**: Real-Time Collaborative Editing (P1) - Multiple users can simultaneously edit the same document and see changes in real-time
- **US2**: Simple Document Access for Testing (P1) - Users can switch between viewing/editing documents via simple UI control

## Dependencies

```
Phase 1 (Setup) → Phase 2 (Foundational) → Phase 3 (US1) → Phase 4 (US2) → Phase 5 (Polish)
```

**Story Dependencies**:
- US1 and US2 can be developed in parallel after Phase 2
- US2 depends on US1 for full testing (but can be partially tested independently)

## Implementation Strategy

**MVP Scope**: Phase 1 + Phase 2 + Phase 3 (US1) - Core real-time collaboration
**Full Scope**: All phases - Complete feature with testing UI

**Incremental Delivery**:
1. First: Database migration and basic document loading
2. Second: Real-time synchronization
3. Third: User identifier input for testing
4. Fourth: Error handling and polish

---

## Phase 1: Setup

**Goal**: Create database migration for shared documents table

**Independent Test**: Migration runs successfully, table created with correct schema and RLS policies

### Tasks

- [X] T001 Create database migration file `supabase/migrations/[timestamp]_create_shared_documents.sql` with table schema, triggers, RLS policies, indexes, and Realtime enablement per data-model.md

---

## Phase 2: Foundational

**Goal**: Set up foundational code structure and types needed by all user stories

**Independent Test**: Types are defined, shared document operations can be imported

### Tasks

- [X] T002 [P] Create TypeScript type definitions file `src/lib/types/shared-document.ts` with SharedDocument type matching data-model.md schema

- [X] T003 [P] Create shared document service file `src/lib/services/sharedDocumentService.ts` with functions: getDocumentByDocId, createDocument, updateDocumentContent per contracts/api.md

- [X] T004 [P] Create user validation service file `src/lib/services/userValidationService.ts` with function: validateUserIdentifier (supports UUID and email) per contracts/api.md

---

## Phase 3: User Story 1 - Real-Time Collaborative Editing

**Goal**: Multiple users can simultaneously edit the same Tiptap document and see each other's changes in real-time (within 2 seconds)

**Independent Test**: Two users open the same document in different browser tabs, edits from one user appear in the other user's editor within 2 seconds

**Acceptance Criteria**:
- User A types text → User B sees text appear within 2 seconds
- User A applies formatting → User B sees formatting change within 2 seconds
- User A deletes paragraph → User B sees paragraph disappear within 2 seconds
- Both users type simultaneously → Both users' text appears correctly without conflicts

### Tasks

- [X] T005 [US1] Update `src/components/editor/PredefineEditor.tsx` to use `shared_documents` table instead of `predefine_properties` table in load function

- [X] T006 [US1] Update `src/components/editor/PredefineEditor.tsx` to use `shared_documents` table instead of `predefine_properties` table in persist function

- [X] T007 [US1] Modify `src/components/editor/PredefineEditor.tsx` to remove `ownerId` prop dependency, use `docId` only (all users share same document by docId)

- [X] T008 [US1] Add Realtime subscription in `src/components/editor/PredefineEditor.tsx` using useEffect to subscribe to `postgres_changes` events filtered by `doc_id` per research.md Pattern 1

- [X] T009 [US1] Implement conflict resolution logic in `src/components/editor/PredefineEditor.tsx` using last-write-wins strategy with timestamp comparison per research.md Pattern 2

- [X] T010 [US1] Add ref to track last known `updated_at` timestamp in `src/components/editor/PredefineEditor.tsx` to prevent applying own changes

- [X] T011 [US1] Implement content comparison in `src/components/editor/PredefineEditor.tsx` to avoid applying identical changes (compare JSON strings)

- [X] T012 [US1] Add error handling for Realtime subscription errors in `src/components/editor/PredefineEditor.tsx` with connection status callbacks

- [X] T013 [US1] Update `src/components/editor/PredefineEditor.tsx` to handle network disconnections gracefully and resynchronize on reconnection

- [X] T014 [US1] Update `src/app/page.tsx` to pass `docId` prop to PredefineEditor instead of `ownerId` (use fixed docId like "demo-doc-001" for testing)

---

## Phase 4: User Story 2 - Simple Document Access for Testing

**Goal**: Users can easily switch between viewing/editing documents through a simple UI control to verify collaborative editing across different user sessions

**Independent Test**: User enters another user's identifier in input field, editor validates user exists and continues displaying shared document

**Acceptance Criteria**:
- User A enters User B's identifier → Editor validates User B exists and continues displaying same shared document
- User A enters invalid identifier → System shows error message, does not switch document context
- User A and User B both viewing same document → User A's edits sync to User B's editor in real-time

### Tasks

- [X] T015 [US2] Add state for user identifier input in `src/app/page.tsx` to store entered identifier value

- [X] T016 [US2] Add input field UI component in `src/app/page.tsx` for entering user identifier (ID or email) with placeholder text

- [X] T017 [US2] Implement user identifier validation handler in `src/app/page.tsx` that calls userValidationService.validateUserIdentifier

- [X] T018 [US2] Add error state and error message display in `src/app/page.tsx` for invalid user identifiers per FR-011

- [X] T019 [US2] Add success state in `src/app/page.tsx` to display validated user's name/email when validation succeeds

- [X] T020 [US2] Update `src/app/page.tsx` to show current user identifier in UI (for reference, not functional requirement)

---

## Phase 5: Polish & Cross-Cutting Concerns

**Goal**: Improve error handling, add loading states, and ensure all edge cases are handled

**Independent Test**: All error scenarios handled gracefully, no console errors, smooth user experience

### Tasks

- [X] T021 Add loading state management in `src/components/editor/PredefineEditor.tsx` for initial document load and Realtime subscription setup

- [X] T022 Add error boundary or error state display in `src/components/editor/PredefineEditor.tsx` for document load failures

- [X] T023 Add connection status indicator in `src/components/editor/PredefineEditor.tsx` to show Realtime connection state (optional, for debugging)

- [X] T024 Add console logging (development only) in `src/components/editor/PredefineEditor.tsx` for Realtime events and conflict resolution decisions

- [X] T025 Verify all async operations in `src/components/editor/PredefineEditor.tsx` have proper error handling per Constitution IV

- [X] T026 Verify all async operations in `src/app/page.tsx` have proper error handling per Constitution IV

- [X] T027 Test edge case: two users editing same character position simultaneously in `src/components/editor/PredefineEditor.tsx` (last write wins should handle)

- [X] T028 Test edge case: network disconnection and reconnection in `src/components/editor/PredefineEditor.tsx` (should resync automatically)

- [X] T029 Test edge case: session expiration during editing (should show appropriate error message)

- [X] T030 Verify TypeScript strict mode compliance for all new code files

- [X] T031 Verify .module.css styling is used (no global styles) for any new UI components

---

## Parallel Execution Opportunities

### After Phase 2 (Foundational tasks can run in parallel):

**Parallel Group 1** (Type definitions and services):
- T002, T003, T004 can be implemented simultaneously (different files, no dependencies)

### After Phase 3 starts (US1 tasks with dependencies):

**Parallel Group 2** (Independent US1 tasks):
- T005, T006, T007 can be implemented in parallel (all modify PredefineEditor but different functions)
- T010, T011 can be implemented in parallel (both add refs/state management)

**Sequential within US1**:
- T008 depends on T005-T007 (needs table switch first)
- T009 depends on T008 (needs subscription first)
- T012, T013 depend on T008 (need subscription first)

### After Phase 4 starts (US2 tasks):

**Parallel Group 3** (US2 tasks):
- T015, T016, T017, T018, T019, T020 can be implemented in parallel (all in page.tsx but different concerns)

### Phase 5 (Polish tasks):

**Parallel Group 4** (All polish tasks):
- T021-T031 can be implemented in parallel (different concerns, no blocking dependencies)

---

## Task Summary

**Total Tasks**: 31
- Phase 1 (Setup): 1 task
- Phase 2 (Foundational): 3 tasks
- Phase 3 (US1): 10 tasks
- Phase 4 (US2): 6 tasks
- Phase 5 (Polish): 11 tasks

**MVP Scope** (Phases 1-3): 14 tasks
**Full Scope** (All phases): 31 tasks

**Parallel Opportunities**: 4 groups identified

**Estimated Complexity**:
- Low: T001-T004, T015-T020, T021-T026, T030-T031 (foundational, UI, polish)
- Medium: T005-T007, T010-T011, T027-T029 (table migration, state management, edge cases)
- High: T008-T009, T012-T013 (Realtime subscription, conflict resolution)

