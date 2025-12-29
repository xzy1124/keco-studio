# Implementation Plan: Fix Predefine Page Bugs and Add Field Drag-and-Drop

**Branch**: `001-fix-predefine-dnd` | **Date**: December 23, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-fix-predefine-dnd/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Fix two critical bugs in the predefine page related to React state management race conditions, and add drag-and-drop field reordering capability. The bugs prevent proper page initialization and section creation, while the enhancement enables intuitive field organization through drag-and-drop interactions. The solution involves refactoring useEffect hooks to eliminate race conditions and integrating a drag-and-drop library compatible with React 18+ and the existing Ant Design UI framework.

## Technical Context

**Language/Version**: TypeScript 5.9.3 / JavaScript ES2022  
**Primary Dependencies**: React 18.3.1, Next.js 14.2.18 (App Router), Ant Design 5.22.2, Supabase 2.87.1, Zod 3.22.4  
**Drag-and-Drop Library**: @dnd-kit/core (to be added) - React 18+ compatible, accessible, performant  
**Storage**: Supabase PostgreSQL with RLS policies (table: library_field_definitions)  
**Testing**: Playwright 1.57.0 for E2E tests  
**Target Platform**: Web browsers (Chrome, Firefox, Safari, Edge - modern versions)  
**Project Type**: Web application (Next.js App Router)  
**Performance Goals**: <100ms UI response time for state updates, <200ms for drag-and-drop interactions  
**Constraints**: Must maintain pixel-perfect Figma fidelity, zero hydration errors, all async operations must handle errors  
**Scale/Scope**: Single feature affecting 1 page component, 2 child components, ~600 lines of code to modify

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Initial Check (Before Research)

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Pixel-Perfect Responsive Delivery | ✅ PASS | Drag-and-drop will maintain existing UI design; no Figma changes needed for bug fixes |
| II. App Router & Supabase Integrity | ✅ PASS | Uses existing client components with proper boundaries; Supabase updates respect RLS |
| III. Typed Minimal & Documented Code | ✅ PASS | Adding 1 dependency (@dnd-kit/core); TypeScript strict mode maintained; CSS modules only |
| IV. Resilient Async & Error Handling | ✅ PASS | Existing error handling preserved; drag operations are synchronous UI updates |
| V. Simplicity & Single Responsibility | ✅ PASS | Bug fixes simplify state management; drag-and-drop isolated to FieldsList component |

**Additional Constraints Check**:
- Styling: ✅ Using .module.css only, no global styles added
- Performance: ✅ @dnd-kit/core is tree-shakeable and performant
- Data: ✅ All database updates go through existing saveSchema functions with RLS

**Result**: ✅ **APPROVED** - No violations, minimal new dependency justified for accessibility and performance

### Post-Design Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Pixel-Perfect Responsive Delivery | ✅ PASS | Drag-and-drop uses existing UI components; no visual changes to design |
| II. App Router & Supabase Integrity | ✅ PASS | Client components properly bounded; RLS respected via existing functions |
| III. Typed Minimal & Documented Code | ✅ PASS | @dnd-kit/* dependencies justified in research.md; TypeScript strict maintained |
| IV. Resilient Async & Error Handling | ✅ PASS | Error handling preserved; drag operations are synchronous state updates |
| V. Simplicity & Single Responsibility | ✅ PASS | State management simplified; drag logic isolated to FieldsList |

**Additional Constraints Check**:
- Styling: ✅ Using existing .module.css files, no new global styles
- Performance: ✅ @dnd-kit optimized for minimal re-renders, <100ms response time
- Data: ✅ All updates through saveSchemaIncremental with RLS checks

**Result**: ✅ **APPROVED** - All principles maintained post-design

**Artifacts Generated**:
- ✅ research.md - Technology decisions and alternatives
- ✅ data-model.md - State management and database model
- ✅ quickstart.md - Implementation guide with code examples
- ✅ Agent context updated - New dependencies documented

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── app/
│   └── (dashboard)/
│       └── [projectId]/
│           └── [libraryId]/
│               └── predefine/
│                   ├── page.tsx                    # Main predefine page (STATE MANAGEMENT FIXES)
│                   ├── page.module.css
│                   ├── types.ts                     # Shared types
│                   ├── validation.ts
│                   ├── utils.ts
│                   ├── components/
│                   │   ├── FieldsList.tsx          # DRAG-AND-DROP INTEGRATION
│                   │   ├── FieldsList.module.css
│                   │   ├── FieldItem.tsx            # Individual field (DRAG HANDLE)
│                   │   ├── FieldItem.module.css
│                   │   ├── FieldForm.tsx            # Empty form (NON-DRAGGABLE)
│                   │   ├── FieldForm.module.css
│                   │   ├── NewSectionForm.tsx
│                   │   └── SectionHeader.module.css
│                   └── hooks/
│                       ├── useSchemaData.ts         # Data loading
│                       └── useSchemaSave.ts         # Data persistence
├── components/
│   └── layout/
│       └── Sidebar.tsx                              # Navigation (no changes)
└── lib/
    ├── SupabaseContext.tsx
    └── services/
        └── libraryService.ts

tests/
└── e2e/
    └── predefine-drag-drop.spec.ts                  # NEW TEST FILE
```

**Structure Decision**: Next.js App Router web application. This feature modifies existing client components in the predefine page route. Primary changes are in:
1. `predefine/page.tsx` - Refactor useEffect hooks to fix race conditions
2. `components/FieldsList.tsx` - Integrate @dnd-kit/core for drag-and-drop
3. `components/FieldItem.tsx` - Add drag handle functionality
4. Database schema - No changes (order_index column already exists)

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**Status**: No violations - Complexity tracking not required for this feature.

The implementation adds one dependency (@dnd-kit/core) which is justified by:
- Accessibility requirements (keyboard navigation, screen reader support)
- Performance optimization (virtual lists, minimal re-renders)
- Browser compatibility (abstracts away browser-specific drag APIs)
- Maintenance burden reduction (actively maintained, well-tested library)
