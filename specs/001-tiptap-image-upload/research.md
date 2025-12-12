# Research: Tiptap Image Upload

**Date**: 2025-01-10  
**Feature**: Tiptap Image Upload  
**Approach**: Supabase Storage + Tiptap image plugin

## Decisions

### 1) Storage Target
**Decision**: Use Supabase Storage public bucket (e.g., `tiptap-images`) for demo.  
**Rationale**: No extra infra; easy to obtain public URL; fits Next+Supabase stack.  
**Alternatives**: External OSS (AliOSS/S3) — deferred; Signed URLs — for prod hardening later.

### 2) Upload Mechanism
**Decision**: Client-side upload via Supabase JS Storage API (`storage.from(bucket).upload`).  
**Rationale**: Minimal latency; no server proxy needed for demo.  
**Alternatives**: Server proxy for validation/signatures (for prod security) — deferred.

### 3) Trigger & UX
**Decision**: Slash command `/image` opens file picker; show progress/loading; insert after upload.  
**Rationale**: Minimal UI change; easy to extend; aligns with spec clarification.

### 4) Validation
**Decision**: Enforce MIME/type whitelist (jpeg/png/webp) and size ≤ 5 MB before upload.  
**Rationale**: Prevents broken uploads and large files in demo bucket.  
**Alternatives**: Client image compression — deferred.

### 5) Image Node/Plugin
**Decision**: Implement reusable `image.ts` Tiptap node with attrs `{ src, alt?, title? }` and insert command.  
**Rationale**: Encapsulates schema/render; enables future features (resize/align/caption).  
**Alternatives**: Inline HTML img — risks schema mismatch/hydration issues.

### 6) URL Handling
**Decision**: Use public bucket URLs (`getPublicUrl`) for demo rendering.  
**Rationale**: Simplifies rendering; no token handling needed.  
**Alternatives**: Signed URLs for private buckets — deferred to prod.

### 7) Error/Progress Handling
**Decision**: Show progress/loading state; surface validation and upload errors; avoid inserting on failure.  
**Rationale**: Meets SC-002 (no broken images) and FR-004/FR-005.

## Best Practices
- Debounce or disable multiple concurrent uploads from the same picker action.
- Generate unique object keys (e.g., `uuid/filename`) to avoid collisions.
- Keep plugin schema stable to avoid hydration errors.
- Guard rendering with `src` existence; avoid inserting partial nodes on failure.

## Open Questions Resolved
1. Upload trigger: slash `/image` (clarified).
2. OSS requirement: not required; Supabase Storage is sufficient for demo.
3. Plugin form: standalone `image.ts` for schema/commands/render.

## References
- Supabase Storage JS: https://supabase.com/docs/reference/javascript/storage-from-upload
- Tiptap Node extensions: https://tiptap.dev/api/nodes

