# Feature Specification: Tiptap Real-Time Collaboration

**Feature Branch**: `001-tiptap-collaboration`  
**Created**: 2025-01-10  
**Status**: Draft  
**Input**: User description: "现在一个标签页在Microsoft，一个标签页在Google是可以实现登录不同账号的，在同一个浏览器是不行的。我想实现的功能是：不同账号对同一个tiptap文档协同是不是ok的，现在想问一下怎么在一个账号可以看到另一个账号的titap编辑文档，有什么比较好的方案吗？可以提出我看看"

## Overview

Enable real-time collaborative editing for Tiptap documents, allowing multiple users to simultaneously edit the same document and see each other's changes in real-time. This feature will transform the current single-user editor into a collaborative workspace where multiple authenticated users can work together on shared documents.

## Clarifications

### Session 2025-01-10

- Q: Which user stories should be implemented? → A: Only P1 (Real-Time Collaborative Editing) and new P1 (Simple Document Access for Testing). P2 (Document Sharing) and P3 (Presence Awareness) are deferred to future implementation.
- Q: How should users input another user's identifier to access their document? → A: Input field with validation - user enters ID/email, system validates user exists before switching document
- Q: How should RLS policies be updated to support multi-user collaboration? → A: Create a new shared documents table with different RLS policies
- Q: Should the shared documents table include owner_id field? → A: Yes, include owner_id field to preserve creator information, but all authenticated users can access and edit documents with the same docId

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Real-Time Collaborative Editing (Priority: P1)

Multiple users can simultaneously edit the same Tiptap document and see each other's changes appear in real-time (within 1-2 seconds of the edit being made).

**Why this priority**: This is the core value proposition of the feature. Without real-time synchronization, users cannot effectively collaborate on documents.

**Independent Test**: Can be fully tested by having two users open the same document in different browser tabs/windows and verifying that edits from one user appear in the other user's editor within 2 seconds, without requiring page refresh.

**Acceptance Scenarios**:

1. **Given** User A and User B are both viewing the same document, **When** User A types text, **Then** User B sees the text appear in their editor within 2 seconds
2. **Given** User A and User B are both editing the same document, **When** User A applies bold formatting to selected text, **Then** User B sees the formatting change appear in their editor within 2 seconds
3. **Given** User A and User B are both editing the same document, **When** User A deletes a paragraph, **Then** User B sees the paragraph disappear from their editor within 2 seconds
4. **Given** User A and User B are both editing the same document, **When** both users type simultaneously at different positions, **Then** both users' text appears correctly in both editors without conflicts

---

### User Story 2 - Simple Document Access for Testing (Priority: P1)

Users can easily switch between viewing/editing documents in the shared documents table through a simple UI control, enabling quick verification of collaborative editing functionality across different user sessions.

**Why this priority**: This is essential for testing and validating the collaborative editing feature. Without a way to switch document context, it's impossible to verify that real-time collaboration works correctly across different user accounts.

**Independent Test**: Can be fully tested by having a user enter another user's identifier (ID or email) in a simple input field, then verifying the editor loads and displays the shared document, allowing edits to be made and synchronized with other users viewing the same document.

**Acceptance Scenarios**:

1. **Given** User A is viewing a document, **When** User A enters User B's identifier in a document access control, **Then** the editor validates User B exists and continues displaying the same shared document (same docId)
2. **Given** User A and User B are both viewing the same shared document, **When** User A makes edits, **Then** the edits are saved to the shared document and synchronized in real-time to User B's editor
3. **Given** User A enters an invalid user identifier, **When** User A attempts to load the document, **Then** the system shows an appropriate error message and does not switch the document context
4. **Given** User A is viewing a shared document, **When** User A switches back to their own identifier, **Then** the editor continues displaying the same shared document (no change, as all users see the same shared document)

---

### Edge Cases

- What happens when two users edit the same character position simultaneously?
- How does the system handle network disconnections during editing?
- What happens when a user's session expires while editing?
- How are conflicts resolved when users make incompatible edits (e.g., one deletes a paragraph while another edits it)?
- What happens when a document is deleted while users are editing it?
- How does the system handle very large documents with many concurrent editors?
- What happens when a user loses internet connection and reconnects?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow multiple authenticated users to simultaneously edit the same document
- **FR-002**: System MUST synchronize document changes between all active editors within 2 seconds
- **FR-003**: System MUST preserve all edits from all users without data loss
- **FR-004**: System MUST handle concurrent edits to the same document position without corrupting the document
- **FR-005**: System MUST provide a simple input field UI control to switch between viewing/editing documents owned by different users
- **FR-006**: System MUST allow users to enter another user's identifier (ID or email) to access that user's document
- **FR-010**: System MUST validate that the entered user identifier exists before switching to that user's document
- **FR-011**: System MUST display an appropriate error message when an invalid user identifier is entered
- **FR-007**: System MUST handle network disconnections gracefully and resynchronize when connection is restored
- **FR-008**: System MUST maintain document consistency across all connected clients
- **FR-009**: System MUST handle document updates even when some users are temporarily offline

### Key Entities *(include if feature involves data)*

- **Shared Document**: Represents a collaborative Tiptap document stored in a new shared documents table, with unique identifier (docId), content (JSON format), owner_id (creator identifier), creation/update timestamps, accessible by all authenticated users for reading and editing
- **Document Change**: Represents an individual edit operation (insert, delete, format) made by a user, including timestamp and user identifier

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Document changes appear in all connected editors within 2 seconds of being made
- **SC-002**: System supports at least 2 concurrent editors on the same document without performance degradation (for testing/validation purposes)
- **SC-003**: 95% of edits are successfully synchronized without conflicts or data loss
- **SC-004**: Users can successfully collaborate on documents even after temporary network disconnections (reconnection within 30 seconds)
- **SC-005**: Users can switch to viewing another user's document in under 2 actions (entering identifier and confirming)

## Technical Approach

**Selected Approach**: Supabase Realtime + Manual Synchronization

**Description**: Use Supabase Realtime to listen for database changes, manually apply changes to Tiptap editor using editor commands.

**Rationale**: This approach is selected for experimental/validation purposes. It provides:
- Simple implementation with existing Supabase infrastructure
- No additional dependencies beyond what's already in use
- Full control over synchronization logic
- Works well with existing RLS policies

**Implementation Notes**:
- System will use Supabase Realtime subscriptions to listen for changes to the new shared documents table
- When changes are detected, the system will apply them to the Tiptap editor using editor commands
- Manual conflict resolution logic will be implemented to handle concurrent edits
- Edge cases around simultaneous edits will need careful handling
- The shared documents table will have RLS policies allowing all authenticated users to read and update documents with the same docId

## Assumptions

- Users are authenticated via Supabase Auth
- A new shared documents table will be created with RLS policies that allow all authenticated users to read and update documents with the same docId
- The existing `predefine_properties` table will remain unchanged for backward compatibility
- Network latency is acceptable (under 500ms for most users)
- Documents are text-based with formatting (not binary files)
- Maximum document size is reasonable (under 1MB of content)
- Users expect near-instantaneous updates (under 2 seconds)

## Dependencies

- Existing Tiptap editor implementation
- Supabase database with `predefine_properties` table
- New shared documents table (to be created) with appropriate RLS policies
- Supabase Realtime enabled for the new shared documents table
- User authentication system

## Out of Scope

- **Document Sharing and Access Control (P2)**: Formal document sharing with permission management - deferred to future implementation
- **Presence Awareness (P3)**: Displaying other users' presence, cursor positions, and selections - deferred to future implementation
- Offline editing with full sync when reconnected (may be added later)
- Version history and document revision tracking
- Comments and annotations on documents
- Document templates
- Export/import functionality for collaborative documents
- Mobile app support (web-only for now)
