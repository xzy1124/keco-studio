# Implementation Plan: Tiptap Image Upload

**Branch**: `001-tiptap-image-upload` | **Date**: 2025-01-10 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/001-tiptap-image-upload/spec.md`

## Summary

Add image upload to Tiptap in a Next.js + Supabase app. Provide a demo flow that uses a slash command `/image` to pick a local file, upload to a Supabase Storage public bucket, and insert into the editor via a reusable `image.ts` plugin for future extensions (resize/align/caption later).

## Technical Context

**Language/Version**: TypeScript 5.9+ (strict)  
**Primary Dependencies**: Next.js (App Router), React 19, @tiptap/react 2.x, @supabase/supabase-js 2.x  
**Storage**: Supabase Storage (public bucket for demo, e.g., `tiptap-images`)  
**Testing**: Manual E2E demo (two accounts not required)  
**Target Platform**: Web (Next.js client components)  
**Project Type**: Web application (Next.js App Router)  
**Performance Goals**: 90% of ≤5 MB uploads render in editor within 3 seconds; visible progress/loading during upload  
**Constraints**: TypeScript strict, .module.css only, follow RLS/Storage policies, avoid hydration issues  
**Scale/Scope**: Demo scope; small number of uploads; no CDN required

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Pixel-Perfect Responsive Delivery  
✅ PASS — Uses existing editor UI; minimal UI additions (slash command flow).

### II. App Router & Supabase Integrity  
✅ PASS — Client-side upload via Supabase Storage; respects storage rules; no RLS bypass.

### III. Typed Minimal & Documented Code  
✅ PASS — TS strict; minimal new deps (none beyond existing); plugin isolated.

### IV. Resilient Async & Error Handling  
✅ PASS — Plan includes progress/loading, validation (type/size), and upload error surfacing; no broken image insertion on failure.

### V. Simplicity & Single Responsibility  
✅ PASS — Encapsulate image schema/command in `image.ts`; UI upload logic in page/editor.

**Gate Status**: PASS with action on error handling; to be verified after design.

## Project Structure

### Documentation (this feature)

```text
specs/001-tiptap-image-upload/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── contracts/
    └── api.md
```

### Source Code (repository root)

```text
src/
├── components/
│   └── editor/
│       ├── PredefineEditor.tsx          # integrate image upload command + plugin
│       ├── PredefineEditor.module.css
│       └── plugins/
│           └── image.ts                 # new Tiptap image node/plugin
├── lib/
│   └── services/
│       └── imageUploadService.ts        # upload to Supabase Storage
```

**Structure Decision**: Single Next.js project; add plugin file under editor/plugins and service under lib/services; reuse existing Supabase client/context.

## Complexity Tracking

> No constitution violations anticipated.

