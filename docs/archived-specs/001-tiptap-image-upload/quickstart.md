# Quick Start: Tiptap Image Upload

**Date**: 2025-01-10  
**Feature**: Tiptap Image Upload

## Prerequisites
- Supabase project with Storage enabled.
- Public bucket for demo (e.g., `tiptap-images`).
- Next.js app running with Supabase client configured.

## Setup Steps

1) Create bucket (if not existing)
```bash
# In Supabase dashboard or CLI
# Bucket name: tiptap-images (public for demo)
```
```bash
# CLI example (optional)
supabase storage create-bucket tiptap-images --public
```

2) Configure env (already used in app)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=tiptap-images` (defaults to this name if unset)

3) Implement upload service
- Create `src/lib/services/imageUploadService.ts` using Supabase Storage upload and getPublicUrl.

4) Implement Tiptap image plugin
- Add `src/components/editor/plugins/image.ts` for schema/command/render and register in editor.

5) Wire slash command `/image`
- Add slash command to open file picker.
- Validate type/size; show progress/loading; insert on success.

## Demo Flow (Manual Test)

1. Open editor page.
2. Type `/image` → choose a JPG/PNG/WebP ≤ 5 MB.
3. Observe progress/loading.
4. On success, image appears in editor at cursor.
5. On failure or invalid file, see error message and no broken image inserted.

## Troubleshooting
- Bucket missing: ensure `tiptap-images` exists and is public.
- Upload fails: check network and Supabase keys.
- Image not visible: verify `publicUrl` and CORS; confirm Tiptap node uses `src`.

## Next Steps
- Switch to signed URLs for private buckets.
- Add resize/align/caption in the image plugin.
- Add drag-and-drop upload.

