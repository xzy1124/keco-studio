# Feature Specification: Tiptap Image Upload

**Feature Branch**: `001-tiptap-image-upload`  
**Created**: 2025-01-10  
**Status**: Draft  
**Input**: User description (translated from Chinese):  
“The project uses Next + Supabase + Tiptap. Now we need to add an image upload feature to Tiptap (first trying local/demo only).  
How would you implement this image upload feature? For a small demo to see the effect, do we need to upload images to an external OSS?  
Can we implement the image upload as a plugin file `image.ts` and integrate it into Tiptap, so that it’s easy to extend Tiptap with more features later?”

## Overview

Add an image upload capability to Tiptap in a Next.js + Supabase app. Provide a simple demo flow to pick a local image, upload it to Supabase Storage, and insert it into the editor via a reusable Tiptap image plugin (`image.ts`) that supports future extensions.

## Clarifications

### Session 2025-01-10

- Q: Upload entry and interaction? → A: Use a slash command `/image` to open the file picker; show progress/loading during upload; on success insert the image at the current selection.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Insert Image into Editor (Priority: P1)

User selects an image from local device, uploads it to storage, and sees it rendered in the Tiptap editor at the current cursor position.

**Why this priority**: Core value of adding images to rich text; enables immediate demo value.

**Independent Test**: Select a valid image (≤5 MB, JPG/PNG/WebP), upload succeeds, image appears in editor within 3 seconds.

**Acceptance Scenarios**:
1. **Given** user focuses the editor, **When** user selects an image file, **Then** the image uploads and renders in place within 3 seconds.
2. **Given** upload is in progress, **When** user waits, **Then** a loading/progress state is shown until completion.
3. **Given** upload fails (network/error), **When** user selects image, **Then** an error message is shown and no broken image is inserted.
4. **Given** user selects an oversized or unsupported format, **When** upload is attempted, **Then** validation blocks the upload with an error message.
5. **Given** user types slash command `/image`, **When** the file picker opens and a valid image is chosen, **Then** it uploads and renders at the current selection with progress feedback.

### User Story 2 - Reuse Image Plugin for Future Extensions (Priority: P2)

Developers can integrate a standalone Tiptap image plugin (`image.ts`) that encapsulates schema, commands, and rendering, allowing later features (resize/align/caption) without rewriting upload logic.

**Why this priority**: Ensures maintainability and future extensibility for editor features.

**Independent Test**: Plugin can be imported and used in another Tiptap instance to insert an image via a command with a supplied URL.

**Acceptance Scenarios**:
1. **Given** another Tiptap instance uses `image.ts`, **When** calling the insert image command with a URL, **Then** image renders correctly.
2. **Given** plugin is included, **When** schema initializes, **Then** editor loads without schema errors or hydration issues.

### User Story 3 - Local Demo without External OSS Requirement (Priority: P3)

Provide a minimal demo flow that works using Supabase Storage (public bucket) without requiring external OSS services.

**Why this priority**: Reduces setup friction; fast proof-of-concept.

**Independent Test**: With only Supabase Storage configured, user can upload and view images in the editor.

**Acceptance Scenarios**:
1. **Given** Supabase Storage bucket exists, **When** user uploads an image, **Then** file stored in bucket and renders via public URL.
2. **Given** demo environment, **When** bucket or creds missing, **Then** meaningful error is shown guiding setup.

### Edge Cases

- Upload interrupted mid-transfer (network drop).
- Unsupported file types or files > 5 MB.
- Duplicate filenames (name collision).
- Slow network causing long upload timeouts.
- Supabase Storage permission or missing bucket.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to select local image files (JPG/PNG/WebP) up to 5 MB.
- **FR-002**: System MUST upload images to Supabase Storage (public bucket for demo) and obtain a public URL.
- **FR-003**: System MUST insert the uploaded image into Tiptap at the current selection using an image plugin.
- **FR-004**: System MUST display upload progress or loading state during upload, including when triggered via `/image` slash command.
- **FR-005**: System MUST show clear error messages on validation failure (type/size), upload failure, or missing bucket/credentials.
- **FR-006**: System MUST encapsulate image schema/command/render logic in a reusable Tiptap plugin file (e.g., `image.ts`).
- **FR-007**: System SHOULD allow providing an existing image URL to insert without uploading (for future reuse scenarios).

### Key Entities *(include if feature involves data)*

- **ImageAsset**: `{ path, url, mime_type, size_bytes, uploaded_at }` stored in Supabase Storage bucket.
- **ImageNode**: Tiptap node with attrs `{ src, alt?, title? }`, rendered by the image plugin.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 90% of uploads under 5 MB complete and render in the editor within 3 seconds on a typical network.
- **SC-002**: 0 broken images inserted when upload fails or validation fails (guarded by errors).
- **SC-003**: Image plugin can be reused in another Tiptap instance with no schema/hydration errors.
- **SC-004**: Users see a visible progress/loading indication during upload attempts.

## Assumptions

- Supabase Storage is available; a public bucket (e.g., `tiptap-images`) can be created for the demo.
- Public read is acceptable for the demo; production can switch to signed URLs or access-controlled buckets.
- No external OSS (e.g., AliOSS, S3) required for the first demo; can be swapped later without changing plugin API.
- Max file size 5 MB; supported types: image/jpeg, image/png, image/webp.

## Out of Scope

- Image transformations (resize, crop, rotate) on server.
- Captions/align/resize UI (reserved for future extensions).
- Drag-and-drop upload (optional later).
- CDN/image optimization pipeline.

# Feature Specification: [FEATURE NAME]

**Feature Branch**: `[###-feature-name]`  
**Created**: [DATE]  
**Status**: Draft  
**Input**: User description: "$ARGUMENTS"

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - [Brief Title] (Priority: P1)

[Describe this user journey in plain language]

**Why this priority**: [Explain the value and why it has this priority level]

**Independent Test**: [Describe how this can be tested independently - e.g., "Can be fully tested by [specific action] and delivers [specific value]"]

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]
2. **Given** [initial state], **When** [action], **Then** [expected outcome]

---

### User Story 2 - [Brief Title] (Priority: P2)

[Describe this user journey in plain language]

**Why this priority**: [Explain the value and why it has this priority level]

**Independent Test**: [Describe how this can be tested independently]

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]

---

### User Story 3 - [Brief Title] (Priority: P3)

[Describe this user journey in plain language]

**Why this priority**: [Explain the value and why it has this priority level]

**Independent Test**: [Describe how this can be tested independently]

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]

---

[Add more user stories as needed, each with an assigned priority]

### Edge Cases

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right edge cases.
-->

- What happens when [boundary condition]?
- How does system handle [error scenario]?

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: System MUST [specific capability, e.g., "allow users to create accounts"]
- **FR-002**: System MUST [specific capability, e.g., "validate email addresses"]  
- **FR-003**: Users MUST be able to [key interaction, e.g., "reset their password"]
- **FR-004**: System MUST [data requirement, e.g., "persist user preferences"]
- **FR-005**: System MUST [behavior, e.g., "log all security events"]

*Example of marking unclear requirements:*

- **FR-006**: System MUST authenticate users via [NEEDS CLARIFICATION: auth method not specified - email/password, SSO, OAuth?]
- **FR-007**: System MUST retain user data for [NEEDS CLARIFICATION: retention period not specified]

### Key Entities *(include if feature involves data)*

- **[Entity 1]**: [What it represents, key attributes without implementation]
- **[Entity 2]**: [What it represents, relationships to other entities]

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: [Measurable metric, e.g., "Users can complete account creation in under 2 minutes"]
- **SC-002**: [Measurable metric, e.g., "System handles 1000 concurrent users without degradation"]
- **SC-003**: [User satisfaction metric, e.g., "90% of users successfully complete primary task on first attempt"]
- **SC-004**: [Business metric, e.g., "Reduce support tickets related to [X] by 50%"]
