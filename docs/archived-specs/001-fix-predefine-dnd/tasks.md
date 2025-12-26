# Implementation Tasks: Fix Predefine Page Bugs and Add Field Drag-and-Drop

**Branch**: `001-fix-predefine-dnd`  
**Created**: December 23, 2025  
**Status**: Ready for Implementation

## Task Phases

### Phase 1: Setup & Dependencies

#### TASK-001: Install Drag-and-Drop Dependencies
- **Type**: Setup
- **File**: `package.json`
- **Description**: Install @dnd-kit packages required for drag-and-drop functionality
- **Commands**:
  ```bash
  npm install @dnd-kit/core@^6.1.0 @dnd-kit/sortable@^8.0.0 @dnd-kit/utilities@^3.2.2
  ```
- **Verification**: Run `npm list @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`
- **Status**: [X]

---

### Phase 2: Bug Fixes (State Management)

#### TASK-002: Convert autoEnterChecked to useRef
- **Type**: Core
- **File**: `src/app/(dashboard)/[projectId]/[libraryId]/predefine/page.tsx`
- **Description**: Change `autoEnterChecked` from useState to useRef to prevent re-renders and race conditions
- **Changes**:
  - Line ~50: Replace `const [autoEnterChecked, setAutoEnterChecked] = useState(false);` with `const autoEnterChecked = useRef(false);`
  - Add `useRef` to React imports if not already present
- **Status**: [X]

#### TASK-003: Consolidate Conflicting useEffect Hooks
- **Type**: Core
- **File**: `src/app/(dashboard)/[projectId]/[libraryId]/predefine/page.tsx`
- **Description**: Merge the two conflicting useEffect hooks (lines 75-104) into a single consolidated effect that properly sequences state updates
- **Changes**:
  - Remove the two separate useEffect hooks
  - Add new consolidated useEffect that checks `autoEnterChecked.current` and properly handles initialization
  - Ensure creation mode is only entered when sections.length === 0 on initial load
  - Ensure creation mode is not automatically exited when sections exist (user must explicitly switch tabs)
- **Dependencies**: TASK-002
- **Status**: [X]

#### TASK-004: Test Bug Fix 1 - Page Flash
- **Type**: Test
- **Description**: Verify that navigating to predefine page with existing sections no longer flashes to "New Section" view
- **Manual Test Steps**:
  1. Navigate to a library's predefine page that has existing sections
  2. Observe that existing sections display immediately
  3. Verify no flash to "New Section" tab occurs
- **Status**: [ ]

#### TASK-005: Test Bug Fix 2 - Add Section Button
- **Type**: Test
- **Description**: Verify that "Add Section" button works correctly and stays open
- **Manual Test Steps**:
  1. View predefine settings for a library with existing sections
  2. Click the "Add Section" button
  3. Verify "New Section" tab appears and stays visible
  4. Verify can switch between tabs
  5. Verify can save new section
- **Dependencies**: TASK-003
- **Status**: [ ]

---

### Phase 3: Drag-and-Drop Implementation

#### TASK-006: Update FieldsList Component with DndContext
- **Type**: Core
- **File**: `src/app/(dashboard)/[projectId]/[libraryId]/predefine/components/FieldsList.tsx`
- **Description**: Integrate @dnd-kit/core and @dnd-kit/sortable into FieldsList component
- **Changes**:
  - Import DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent from @dnd-kit/core
  - Import arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy from @dnd-kit/sortable
  - Add local state for optimistic UI updates: `const [localFields, setLocalFields] = useState(fields);`
  - Configure sensors with activation constraints (8px distance)
  - Wrap fields list with DndContext and SortableContext
  - Implement handleDragEnd function to update field order
  - Sync localFields with props when they change
- **Dependencies**: TASK-001
- **Status**: [X]

#### TASK-007: Update FieldItem Component with useSortable Hook
- **Type**: Core
- **File**: `src/app/(dashboard)/[projectId]/[libraryId]/predefine/components/FieldItem.tsx`
- **Description**: Add drag functionality to individual field items
- **Changes**:
  - Import useSortable from @dnd-kit/sortable
  - Import CSS from @dnd-kit/utilities
  - Add `isDraggable?: boolean` to FieldItemProps interface
  - Use useSortable hook with field.id
  - Apply transform and transition styles
  - Add drag handle attributes and listeners to drag handle div
  - Update drag handle cursor style based on isDraggable prop
  - Pass isDraggable prop from FieldsList
- **Dependencies**: TASK-006
- **Status**: [X]

#### TASK-008: Update Field Order Persistence Logic
- **Type**: Core
- **File**: `src/app/(dashboard)/[projectId]/[libraryId]/predefine/components/FieldsList.tsx`
- **Description**: Ensure field order changes are properly propagated to parent component for persistence
- **Changes**:
  - In handleDragEnd, after updating local state, call onChangeField for each field with new order_index
  - Ensure order_index is calculated based on array position
  - Verify that existing saveSchema function will persist the order changes
- **Dependencies**: TASK-006
- **Status**: [X]

#### TASK-009: Ensure FieldForm Remains Non-Draggable
- **Type**: Core
- **File**: `src/app/(dashboard)/[projectId]/[libraryId]/predefine/components/FieldsList.tsx`
- **Description**: Verify that FieldForm component is not included in SortableContext and remains fixed at bottom
- **Changes**:
  - Ensure FieldForm is rendered outside SortableContext but inside DndContext
  - Verify FieldForm is always the last element in the fields list container
- **Dependencies**: TASK-006
- **Status**: [X]

#### TASK-010: Disable Drag During Save Operations
- **Type**: Core
- **File**: `src/app/(dashboard)/[projectId]/[libraryId]/predefine/components/FieldsList.tsx`
- **Description**: Disable drag-and-drop operations when saving is in progress
- **Changes**:
  - Pass `disabled` prop to SortableContext
  - Ensure disabled prop is passed from parent component (already exists)
- **Dependencies**: TASK-006
- **Status**: [X]

---

### Phase 4: Testing & Validation

#### TASK-011: Test Drag-and-Drop Functionality
- **Type**: Test
- **Description**: Verify drag-and-drop works correctly for all scenarios
- **Manual Test Steps**:
  1. Open predefine settings for a section with multiple fields
  2. Drag a field to a different position
  3. Verify field order updates immediately
  4. Verify drag handle shows grab cursor
  5. Verify can drag the first "name" field
  6. Verify empty FieldForm stays at bottom
  7. Save the changes
  8. Refresh page
  9. Verify field order persists
- **Dependencies**: TASK-007, TASK-008, TASK-009
- **Status**: [ ]

#### TASK-012: Test Keyboard Accessibility
- **Type**: Test
- **Description**: Verify keyboard navigation works for drag-and-drop
- **Manual Test Steps**:
  1. Tab to field item
  2. Press Space to activate drag
  3. Use Arrow keys to move field
  4. Press Space to drop
  5. Press Escape to cancel
- **Dependencies**: TASK-007
- **Status**: [ ]

#### TASK-013: Test Edge Cases
- **Type**: Test
- **Description**: Verify edge cases are handled correctly
- **Manual Test Steps**:
  1. Verify dragging is disabled when saving
  2. Verify single field can be "dragged" (no visual effect)
  3. Verify rapid "Add Section" clicks don't cause issues
  4. Verify drag works with mandatory name field
- **Dependencies**: TASK-010
- **Status**: [ ]

#### TASK-014: Run Linter and Build Checks
- **Type**: Validation
- **Description**: Ensure code passes linting and builds successfully
- **Commands**:
  ```bash
  npm run lint
  npm run build
  ```
- **Status**: [ ]

---

### Phase 5: Documentation & Cleanup

#### TASK-015: Update Component Documentation
- **Type**: Polish
- **File**: `src/app/(dashboard)/[projectId]/[libraryId]/predefine/components/FieldsList.tsx`
- **Description**: Add JSDoc comments explaining drag-and-drop functionality
- **Status**: [ ]

#### TASK-016: Create E2E Test File
- **Type**: Test
- **File**: `tests/e2e/predefine-drag-drop.spec.ts`
- **Description**: Create Playwright E2E tests for bug fixes and drag-and-drop
- **Test Cases**:
  - Test page flash bug fix
  - Test add section button fix
  - Test field reordering via drag-and-drop
  - Test field order persistence
- **Status**: [ ]

---

## Execution Summary

**Total Tasks**: 16  
**Setup Tasks**: 1  
**Core Implementation Tasks**: 7  
**Test Tasks**: 5  
**Validation Tasks**: 1  
**Documentation Tasks**: 2

**Estimated Time**: 4-6 hours
- Bug fixes: ~2 hours
- Drag-and-drop: ~2-3 hours  
- Testing: ~1-2 hours

## Task Dependencies Graph

```
TASK-001 (Setup)
    ↓
TASK-002 → TASK-003 → TASK-004, TASK-005 (Bug Fixes)
    ↓
TASK-006 → TASK-007 → TASK-008, TASK-009, TASK-010 (Drag-and-Drop)
    ↓
TASK-011, TASK-012, TASK-013 (Testing)
    ↓
TASK-014 (Validation)
    ↓
TASK-015, TASK-016 (Documentation)
```

## Notes

- All tasks must be completed sequentially within their phase
- Bug fixes (Phase 2) should be tested before moving to drag-and-drop (Phase 3)
- FieldForm component should remain outside SortableContext to prevent dragging
- Order persistence uses existing order_index column in database
- No database migrations required

