# Research: Fix Predefine Page Bugs and Add Field Drag-and-Drop

**Phase**: 0 (Outline & Research)  
**Date**: December 23, 2025  
**Status**: Complete

## Overview

This document consolidates research findings for fixing React state management race conditions and implementing drag-and-drop field reordering in the predefine page.

## Research Areas

### 1. React useEffect Race Conditions and State Management

**Problem**: Multiple useEffect hooks managing the same state (`isCreatingNewSection`) create race conditions where one effect immediately undoes the state change of another.

**Decision**: Consolidate related state logic and add proper dependency tracking with useRef for flags that shouldn't trigger re-renders.

**Rationale**:
- React 18's concurrent rendering makes race conditions more visible
- useEffect cleanup functions and dependency arrays must be carefully managed
- State derived from props/other state should use proper sequencing
- Initialization flags should use useRef to avoid unnecessary re-renders

**Patterns to Apply**:

1. **Single Source of Truth**: Merge the two conflicting effects into one with clear priority logic
2. **Initialization Flag Pattern**: Use `useRef` for `autoEnterChecked` to prevent re-triggering without causing re-renders
3. **Early Returns**: Check loading state first before any other logic
4. **State Derivation**: Derive `isCreatingNewSection` from sections.length and explicit user actions only

**Alternatives Considered**:
- **useState with additional flags**: Rejected - adds complexity and more potential for race conditions
- **useReducer pattern**: Rejected - overkill for this simple state, would require refactoring entire component
- **State management library (Zustand/Jotai)**: Rejected - introduces dependency for a localized problem

**Implementation Approach**:
```typescript
// Consolidate the two effects into one with clear logic:
useEffect(() => {
  if (sectionsLoading) return; // Early exit during loading
  
  if (sections.length === 0) {
    // Only auto-enter creation mode if we haven't checked yet
    if (!autoEnterChecked.current) {
      autoEnterChecked.current = true;
      setIsCreatingNewSection(true);
    }
  } else {
    // If sections exist, ensure we're not in creation mode (unless explicitly triggered)
    if (!activeSectionId || !sections.find(s => s.id === activeSectionId)) {
      setActiveSectionId(sections[0].id);
    }
  }
}, [sections, sectionsLoading, activeSectionId]);
```

**Key Fix**: Remove the conflicting logic that exits creation mode when sections exist. Instead, rely on explicit user actions (clicking tabs, clicking "Add Section") to toggle creation mode.

### 2. Drag-and-Drop Library Selection

**Problem**: Need a React 18+ compatible, accessible, performant drag-and-drop library that works with Ant Design components and supports keyboard navigation.

**Decision**: Use @dnd-kit/core (with @dnd-kit/sortable) version ^6.1.0

**Rationale**:
- **React 18 Compatible**: Built specifically for React 18+ with concurrent rendering support
- **Accessibility First**: WCAG 2.1 AA compliant, full keyboard navigation, screen reader support
- **Performance**: Virtual lists, minimal re-renders, uses transform instead of position changes
- **Modular**: Tree-shakeable, only import what you need (~15KB gzipped for core + sortable)
- **TypeScript Native**: Written in TypeScript with excellent type definitions
- **Ant Design Compatible**: No conflicts with Ant Design's event handling
- **Active Maintenance**: Regular updates, large community (42k+ GitHub stars)

**Alternatives Considered**:

| Library | Pros | Cons | Reason for Rejection |
|---------|------|------|---------------------|
| react-beautiful-dnd | Beautiful animations, popular | No React 18 support, maintenance mode, 45KB | Not compatible with React 18, larger bundle |
| react-dnd | Mature, backend-agnostic | Complex API, 35KB, older patterns | Overcomplicated for simple list reordering |
| react-sortable-hoc | Lightweight, 12KB | React 16 only, uses findDOMNode (deprecated) | Not compatible with React 18 |
| Custom implementation | No dependency | Accessibility burden, browser quirks, testing | Violates Constitution III (minimal deps justified) |

**Integration Points**:
1. Wrap `FieldsList` with `DndContext` from @dnd-kit/core
2. Use `SortableContext` from @dnd-kit/sortable for the fields array
3. Wrap each `FieldItem` with `useSortable` hook
4. Exclude `FieldForm` from sortable items
5. Handle `onDragEnd` to update field order in state
6. Persist order changes through existing `saveSchema` function

**Example Integration**:
```typescript
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// In FieldsList component:
<DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
  <SortableContext items={fields.map(f => f.id)} strategy={verticalListSortingStrategy}>
    {fields.map(field => (
      <SortableFieldItem key={field.id} field={field} {...props} />
    ))}
  </SortableContext>
  <FieldForm {...formProps} />
</DndContext>
```

### 3. Order Persistence Strategy

**Problem**: Need to persist field order changes to the database while maintaining data integrity.

**Decision**: Use the existing `order_index` column in `library_field_definitions` table, updated through the existing `saveSchemaIncremental` function.

**Rationale**:
- Database schema already has `order_index` column (INTEGER)
- Existing save function already handles field ordering
- No migration needed
- Maintains RLS policies and transaction safety

**Implementation Approach**:
1. On drag end, calculate new order_index values based on array position
2. Update local state immediately for instant UI feedback
3. Persist changes when user clicks "Save" (existing flow)
4. On load, sort fields by order_index (already implemented in `useSchemaData`)

**Edge Cases Handled**:
- Concurrent edits: Last write wins (acceptable for single-user editing)
- Disabled state: Disable drag operations when `saving` prop is true
- Single field: Drag works but has no effect (handled automatically by library)
- Empty list: No drag operations possible (natural behavior)

### 4. Testing Strategy

**Problem**: Need to test drag-and-drop interactions and state management fixes.

**Decision**: Use Playwright for E2E tests with focus on user-visible behavior.

**Test Cases**:
1. **Bug Fix Verification**:
   - Navigate to predefine with existing sections → No flash
   - Click "Add Section" with existing sections → Form appears and stays
   
2. **Drag-and-Drop**:
   - Drag field to new position → Order updates immediately
   - Drag name field → Name field moves (is draggable)
   - Drag field then save → Order persists after page refresh
   - Drag field during save → Drag is disabled

3. **Keyboard Accessibility**:
   - Tab to field item → Focus visible
   - Space/Enter on field → Activate drag mode
   - Arrow keys → Move field up/down
   - Escape → Cancel drag

**Playwright Example**:
```typescript
test('field order persists after drag and save', async ({ page }) => {
  await page.goto('/projectId/libraryId/predefine');
  
  // Drag second field to first position
  const secondField = page.locator('[data-field-id="field-2"]');
  await secondField.dragTo(page.locator('[data-field-id="field-1"]'));
  
  // Verify order changed in UI
  const firstField = page.locator('.fieldsList > *').first();
  await expect(firstField).toHaveAttribute('data-field-id', 'field-2');
  
  // Save and reload
  await page.click('button:has-text("Save")');
  await page.reload();
  
  // Verify order persisted
  const firstFieldAfterReload = page.locator('.fieldsList > *').first();
  await expect(firstFieldAfterReload).toHaveAttribute('data-field-id', 'field-2');
});
```

## Dependencies to Add

```json
{
  "@dnd-kit/core": "^6.1.0",
  "@dnd-kit/sortable": "^8.0.0",
  "@dnd-kit/utilities": "^3.2.2"
}
```

**Bundle Size Impact**: ~15KB gzipped (acceptable per Constitution III)

## Summary

All research tasks are complete with clear implementation paths:

1. ✅ React state management race conditions identified and solution designed
2. ✅ Drag-and-drop library selected (@dnd-kit/core) with justification
3. ✅ Order persistence strategy defined (use existing order_index column)
4. ✅ Testing approach outlined (Playwright E2E tests)

**Next Phase**: Generate data model, contracts, and quickstart guide (Phase 1)

