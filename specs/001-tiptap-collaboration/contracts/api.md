# API Contracts: Tiptap Real-Time Collaboration

**Date**: 2025-01-10  
**Feature**: Tiptap Real-Time Collaboration

## Overview

This feature uses Supabase client-side APIs (PostgREST and Realtime) rather than custom REST endpoints. The contracts define the expected Supabase operations and Realtime subscriptions.

## Database Operations

### 1. Get Document by docId

**Operation**: SELECT from `shared_documents` table

**Request**:
```typescript
const { data, error } = await supabase
  .from('shared_documents')
  .select('id, doc_id, owner_id, content, updated_at, created_at')
  .eq('doc_id', docId)
  .maybeSingle();
```

**Response Success**:
```typescript
{
  id: string;           // UUID
  doc_id: string;       // Document identifier
  owner_id: string;     // UUID of creator
  content: JSONContent; // Tiptap JSON content
  updated_at: string;   // ISO timestamp
  created_at: string;   // ISO timestamp
} | null
```

**Response Error**:
```typescript
{
  message: string;
  code?: string;
  details?: string;
}
```

**Behavior**:
- Returns `null` if document doesn't exist (use `maybeSingle()`)
- Returns document if exists
- Subject to RLS policies (all authenticated users can read)

### 2. Create Document

**Operation**: INSERT into `shared_documents` table

**Request**:
```typescript
const { data, error } = await supabase
  .from('shared_documents')
  .insert({
    doc_id: string,
    owner_id: string,    // Current user's ID
    content: JSONContent // Initial content (empty doc or existing)
  })
  .select('id, doc_id, owner_id, content, updated_at, created_at')
  .single();
```

**Response Success**: Same as Get Document response

**Response Error**: Same as Get Document error

**Behavior**:
- Creates new document if `doc_id` doesn't exist
- Fails if `doc_id` already exists (unique constraint)
- Subject to RLS policies (all authenticated users can insert)

### 3. Update Document Content

**Operation**: UPDATE `shared_documents` table

**Request**:
```typescript
const { data, error } = await supabase
  .from('shared_documents')
  .update({
    content: JSONContent, // New content from editor
    // updated_at is automatically set by trigger
  })
  .eq('doc_id', docId)
  .select('updated_at')
  .single();
```

**Response Success**:
```typescript
{
  updated_at: string; // ISO timestamp of update
}
```

**Response Error**: Same as Get Document error

**Behavior**:
- Updates document content
- Automatically updates `updated_at` timestamp via trigger
- Triggers Realtime UPDATE event
- Subject to RLS policies (all authenticated users can update)

### 4. Validate User Identifier

**Operation**: SELECT from `profiles` table

**Request** (by UUID):
```typescript
const { data, error } = await supabase
  .from('profiles')
  .select('id, email, username, full_name')
  .eq('id', identifier)
  .maybeSingle();
```

**Request** (by email):
```typescript
const { data, error } = await supabase
  .from('profiles')
  .select('id, email, username, full_name')
  .eq('email', identifier)
  .maybeSingle();
```

**Response Success**:
```typescript
{
  id: string;
  email: string;
  username?: string;
  full_name?: string;
} | null
```

**Response Error**: Same as Get Document error

**Behavior**:
- Returns user profile if identifier matches (UUID or email)
- Returns `null` if user not found
- Used to validate user before switching document context

## Realtime Subscriptions

### Document Changes Subscription

**Operation**: Subscribe to `postgres_changes` events

**Request**:
```typescript
const channel = supabase
  .channel(`document:${docId}`)
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'shared_documents',
    filter: `doc_id=eq.${docId}`
  }, (payload) => {
    // Handle update
  })
  .subscribe();
```

**Event Payload**:
```typescript
{
  eventType: 'UPDATE';
  new: {
    id: string;
    doc_id: string;
    owner_id: string;
    content: JSONContent;
    updated_at: string;
    created_at: string;
  };
  old: {
    // Previous values
  };
  errors?: string[];
}
```

**Behavior**:
- Receives UPDATE events when document content changes
- Filtered by `doc_id` to only receive relevant updates
- Must unsubscribe on component unmount
- Handles connection errors and reconnection automatically

**Unsubscribe**:
```typescript
supabase.removeChannel(channel);
```

## Error Handling

### Common Error Codes

- `PGRST116`: Row not found (when using `.single()` on non-existent row)
- `23505`: Unique constraint violation (doc_id already exists)
- `42501`: Insufficient privileges (RLS policy violation)
- `PGRST301`: Connection error

### Error Response Format

```typescript
{
  message: string;        // Human-readable error message
  code?: string;         // Error code
  details?: string;      // Additional details
  hint?: string;         // Helpful hint
}
```

## Type Definitions

```typescript
// Tiptap JSONContent type (from @tiptap/core)
type JSONContent = {
  type: string;
  attrs?: Record<string, any>;
  content?: JSONContent[];
  marks?: Array<{
    type: string;
    attrs?: Record<string, any>;
  }>;
  text?: string;
};

// Document response type
type SharedDocument = {
  id: string;
  doc_id: string;
  owner_id: string;
  content: JSONContent;
  updated_at: string;
  created_at: string;
};

// User profile type (for validation)
type UserProfile = {
  id: string;
  email: string;
  username?: string;
  full_name?: string;
};
```

## Notes

- All operations are client-side using Supabase JavaScript client
- RLS policies enforce access control (all authenticated users can access)
- Realtime subscriptions are filtered by `doc_id` for efficiency
- Error handling must be implemented for all async operations
- Timestamps are in ISO 8601 format (timestamptz in PostgreSQL)

