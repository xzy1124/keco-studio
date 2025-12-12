# Data Model: Tiptap Image Upload

**Date**: 2025-01-10  
**Feature**: Tiptap Image Upload

## Entities

### ImageAsset
- Stored in Supabase Storage bucket (e.g., `tiptap-images`).
- Attributes: `path`, `url`, `mime_type`, `size_bytes`, `uploaded_at`.
- Identity: `path` (unique object key); collisions avoided via UUID prefix.
- Lifecycle: uploaded -> read via public URL; deletion not covered in demo.

### ImageNode (Tiptap)
- Tiptap node attributes: `{ src, alt?, title? }`.
- Rendered by `image.ts` plugin; inserted via command after upload (or via existing URL).

## Validation Rules
- Allowed MIME: image/jpeg, image/png, image/webp.
- Max size: 5 MB.
- `src` must be non-empty valid URL.

## State / Flows
- Upload: validate file → upload to bucket → get public URL → insert node with `src`.
- Failure: do not insert node; show error.

## Migrations
- No Postgres schema changes required (uses Supabase Storage).

## Notes
- Public bucket used for demo; production can switch to private + signed URLs without changing plugin contract.

