# API Contracts: Tiptap Image Upload

**Date**: 2025-01-10  
**Feature**: Tiptap Image Upload

## Overview

Client-side operations using Supabase JavaScript Storage API. No custom REST endpoints required for demo.

## Operations

### 1) Upload Image to Supabase Storage
**Call**: `supabase.storage.from(bucket).upload(path, file, { contentType })`

**Inputs**:
- `bucket`: e.g., `tiptap-images`
- `path`: unique key (e.g., `${uuid}/${file.name}`)
- `file`: File (validated: type in jpeg/png/webp, size ≤ 5 MB)
- `contentType`: derived from file MIME

**Success Response**:
```ts
{ path: string; fullPath?: string; }
```

**Failure Response**:
```ts
{ error: { message: string; statusCode?: number } }
```

### 2) Get Public URL
**Call**: `supabase.storage.from(bucket).getPublicUrl(path)`

**Inputs**:
- `bucket`, `path`

**Success Response**:
```ts
{ data: { publicUrl: string } }
```

**Failure**: error message if bucket/path invalid.

### 3) Insert Image Node (Tiptap Plugin)
**Call**: `editor.commands.setImage({ src, alt?, title? })` (provided by `image.ts`)

**Inputs**:
- `src`: public URL (required)
- `alt?`, `title?`: optional metadata

**Behavior**:
- Inserts image at current selection.
- Should be gated to run only after upload success or with a valid existing URL.

## Error Handling
- Validate file type/size before upload; reject early with friendly message.
- On upload error, surface `error.message`; do not insert node.
- Missing bucket/creds: show actionable error (e.g., “configure bucket tiptap-images or env vars”).

## Types
```ts
type UploadResult = { path: string };
type ImageNodeAttrs = { src: string; alt?: string; title?: string };
```

## Notes
- Demo uses public bucket; production can switch to signed URLs (same flow, different URL generation).
- No server endpoints needed unless adding server-side validation or signatures.

