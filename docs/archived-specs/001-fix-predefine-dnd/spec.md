# Feature Specification: Fix Predefine Page Bugs and Add Field Drag-and-Drop

**Feature Branch**: `001-fix-predefine-dnd`  
**Created**: December 23, 2025  
**Status**: Draft  
**Input**: User description: "Fix predefine page flash bug, broken add section button, and add drag-and-drop reordering for field items"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Fix Page Flash on Navigation (Priority: P1)

When a user clicks on a library's predefine setting icon in the sidebar to view an existing predefine configuration with multiple sections, the page should display the existing configuration immediately without flashing to an empty "new section" creation view.

**Why this priority**: This is a critical bug that creates a jarring user experience and suggests broken functionality. Users may think the system lost their data when they see the flash to an empty state.

**Independent Test**: Navigate to predefine settings for a library that already has sections configured. The page should display the existing sections immediately without showing the "New Section" tab first.

**Acceptance Scenarios**:

1. **Given** a library has existing predefine sections configured, **When** user clicks the predefine setting icon from the sidebar, **Then** the page displays the existing sections without flashing to a "New Section" creation view
2. **Given** a library has no predefine sections configured, **When** user navigates to predefine settings, **Then** the page should display the "New Section" creation view immediately
3. **Given** user is viewing predefine settings with existing sections, **When** the page loads data from the database, **Then** the UI should not switch between creation mode and view mode

---

### User Story 2 - Fix Add Section Button (Priority: P1)

When a user is viewing a library's predefine settings that already has one or more sections, they should be able to click the "Add Section" button next to the tabs to create a new section. The system should switch to the new section creation tab and allow the user to configure and save it.

**Why this priority**: This is a critical bug that prevents users from adding additional sections to their library configuration. Without this functionality, users cannot expand their data models after initial setup.

**Independent Test**: View predefine settings for a library with existing sections, click the "Add Section" button, and verify that the new section creation form appears and remains visible.

**Acceptance Scenarios**:

1. **Given** a library has one or more existing sections, **When** user clicks the "Add Section" button, **Then** the system displays the "New Section" tab and switches to it
2. **Given** user has clicked "Add Section" and is viewing the new section form, **When** user fills in section details and saves, **Then** the new section is created and user is switched to view the newly created section
3. **Given** user has clicked "Add Section" and is viewing the new section form, **When** user clicks cancel (if available), **Then** the system returns to viewing the previously active section
4. **Given** user is creating a new section, **When** user switches to an existing section tab, **Then** the new section creation form is hidden and the existing section is displayed

---

### User Story 3 - Drag-and-Drop Field Reordering (Priority: P2)

When a user is configuring predefine settings for a library section, they should be able to drag and drop field items to reorder them. The mandatory first field (name property) should also be draggable. The empty field form at the bottom should always remain at the end and not be movable.

**Why this priority**: This improves user experience by allowing easy reordering of fields without manual editing. While not critical for basic functionality, it significantly improves usability and is expected in modern interfaces.

**Independent Test**: Open predefine settings for a section with multiple fields, drag a field item to a new position, and verify the field order changes persist after saving.

**Acceptance Scenarios**:

1. **Given** a section has multiple fields configured, **When** user drags a field item to a different position, **Then** the field order updates and the change is reflected in the UI immediately
2. **Given** a section has the mandatory "name" field as the first field, **When** user drags the name field to a different position, **Then** the name field moves to the new position (it is draggable)
3. **Given** user is viewing the fields list with the empty FieldForm at the bottom, **When** user attempts to drag fields, **Then** the FieldForm always remains at the bottom and is not movable
4. **Given** user has reordered fields by dragging, **When** user saves the predefine configuration, **Then** the new field order is persisted to the database
5. **Given** user has reordered fields by dragging, **When** user refreshes the page or navigates away and returns, **Then** the fields are displayed in the saved order

---

### Edge Cases

- What happens when the user drags a field while the page is in saving state? The drag operation should be disabled during save.
- How does the system handle race conditions between the auto-enter creation mode effect and the sections loading effect? The system should properly sequence the state updates to prevent unwanted mode switches.
- What happens if the user quickly clicks "Add Section" multiple times? The system should prevent duplicate creation mode activations.
- How does the system handle field reordering when there is only one field? Dragging should work but have no visible effect.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST prevent switching to creation mode when sections exist and loading is complete
- **FR-002**: System MUST only auto-enter new section creation mode when no sections exist after initial data load
- **FR-003**: System MUST not toggle creation mode when the "Add Section" button is clicked while existing sections are displayed
- **FR-004**: System MUST display the "New Section" tab when "Add Section" button is clicked
- **FR-005**: System MUST allow users to drag any field item (including the mandatory first "name" field) to reorder fields within a section
- **FR-006**: System MUST keep the empty FieldForm component fixed at the bottom of the fields list during drag operations
- **FR-007**: System MUST persist field order changes to the database when user saves the predefine configuration
- **FR-008**: System MUST restore field order from database when loading predefine settings
- **FR-009**: System MUST disable drag-and-drop operations when the page is in saving state
- **FR-010**: System MUST prevent state conflicts between different useEffect hooks that manage creation mode
- **FR-011**: System MUST maintain the active section selection when toggling between creation mode and view mode

### Key Entities

- **Section**: Represents a grouping of fields in a library's predefine configuration, with properties: id, name, fields array
- **Field**: Represents a single field definition within a section, with properties: id, label, dataType, required, order_index, and optional configuration (enumOptions, referenceLibraries)
- **Creation Mode State**: Boolean flag (isCreatingNewSection) that determines whether the UI displays new section creation form or existing sections

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users navigating to predefine settings for a library with existing sections see the correct content within 100ms without any visual flashing or mode switching
- **SC-002**: Users can successfully click the "Add Section" button and see the new section creation form appear and remain stable 100% of the time
- **SC-003**: Users can reorder fields using drag-and-drop in under 5 seconds per field
- **SC-004**: Field order changes persist correctly across page refreshes and navigation 100% of the time
- **SC-005**: The empty FieldForm component remains at the bottom during all drag operations without exception
