# Data Model: Tiptap Real-Time Collaboration

**Date**: 2025-01-10  
**Feature**: Tiptap Real-Time Collaboration

## Entities

### Shared Document

**Table**: `shared_documents`

Represents a collaborative Tiptap document that can be edited by multiple authenticated users simultaneously.

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `uuid` | PRIMARY KEY, DEFAULT `gen_random_uuid()` | Unique identifier for the document record |
| `doc_id` | `text` | NOT NULL | Document identifier (shared across users for same document) |
| `owner_id` | `uuid` | NOT NULL, REFERENCES `auth.users(id)` ON DELETE CASCADE | Creator/owner of the document (for audit purposes) |
| `content` | `jsonb` | NOT NULL, DEFAULT `'{}'::jsonb` | Tiptap document content in JSON format |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | Timestamp when document was created |
| `updated_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | Timestamp when document was last updated |

**Unique Constraints**:
- `(doc_id)` - Only one document record per `doc_id` (all users share the same record)

**Indexes**:
- `idx_shared_documents_doc_id` on `doc_id` - For fast lookups by document ID
- `idx_shared_documents_owner_id` on `owner_id` - For queries by owner (optional, for future use)

**Relationships**:
- `owner_id` → `auth.users(id)` - Many-to-one relationship with users table

**State Transitions**:
- **Created**: Document record inserted with initial content
- **Updated**: Content modified by any authenticated user
- **Deleted**: Document record removed (cascade from user deletion if owner)

**Validation Rules**:
- `doc_id` must be non-empty string
- `content` must be valid JSON (Tiptap JSONContent format)
- `owner_id` must reference existing user in `auth.users`

**RLS Policies**:
- **SELECT**: All authenticated users can read documents (no filter)
- **INSERT**: All authenticated users can create documents
- **UPDATE**: All authenticated users can update documents (no filter)
- **DELETE**: Only document owner can delete (optional, not required for MVP)

## Data Flow

### Document Creation
1. User creates/opens document with specific `doc_id`
2. System checks if document exists for that `doc_id`
3. If not exists, INSERT new record with `owner_id` = current user
4. If exists, SELECT existing record

### Document Update
1. User makes edit in Tiptap editor
2. Editor `onUpdate` callback fires
3. Debounce timer (600ms) schedules save
4. UPDATE `shared_documents` table with new `content` and `updated_at`
5. Supabase Realtime broadcasts UPDATE event to all subscribers
6. Other users' editors receive event and apply changes

### Document Synchronization
1. Realtime subscription receives UPDATE event
2. Compare `updated_at` timestamp with local last known timestamp
3. If remote is newer, apply content to editor
4. If local is newer, ignore remote change (last write wins)

## Migration

**File**: `supabase/migrations/[timestamp]_create_shared_documents.sql`

```sql
-- Create shared_documents table for collaborative editing
create extension if not exists "pgcrypto";

create table if not exists public.shared_documents (
  id uuid primary key default gen_random_uuid(),
  doc_id text not null unique,
  owner_id uuid not null references auth.users(id) on delete cascade,
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Updated_at trigger
create or replace function public.update_shared_documents_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_shared_documents_updated_at on public.shared_documents;
create trigger trg_shared_documents_updated_at
before update on public.shared_documents
for each row
execute procedure public.update_shared_documents_updated_at();

-- Enable RLS
alter table public.shared_documents enable row level security;

-- Policies: All authenticated users can read/update documents
create policy shared_documents_select_all on public.shared_documents
  for select using (auth.role() = 'authenticated');

create policy shared_documents_insert_all on public.shared_documents
  for insert with check (auth.role() = 'authenticated');

create policy shared_documents_update_all on public.shared_documents
  for update using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Indexes
create index if not exists idx_shared_documents_doc_id on public.shared_documents(doc_id);
create index if not exists idx_shared_documents_owner_id on public.shared_documents(owner_id);

-- Enable Realtime
alter publication supabase_realtime add table public.shared_documents;
```

## Notes

- The `doc_id` is the shared identifier - all users editing the same document use the same `doc_id`
- The `owner_id` is preserved for audit/tracking purposes but doesn't affect access permissions
- Only one record exists per `doc_id` (unique constraint)
- All authenticated users can read and update any document (no per-user restrictions)
- Content is stored as JSONB for efficient querying and storage

