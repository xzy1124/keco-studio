# Research: Tiptap Real-Time Collaboration

**Date**: 2025-01-10  
**Feature**: Tiptap Real-Time Collaboration  
**Approach**: Supabase Realtime + Manual Synchronization

## Decisions

### Decision 1: Supabase Realtime Subscription Pattern

**Decision**: Use Supabase Realtime `channel().on('postgres_changes')` to subscribe to INSERT/UPDATE events on the `shared_documents` table.

**Rationale**:
- Supabase Realtime is already configured in the project
- No additional dependencies required
- Provides real-time database change notifications
- Works seamlessly with existing Supabase client setup

**Alternatives Considered**:
- **Y.js + Provider**: More robust conflict resolution but requires additional dependencies and more complex setup
- **Tiptap Collaboration Extension**: Official solution but requires custom provider for Supabase
- **WebSocket custom implementation**: Too complex for experimental validation

**Implementation Notes**:
- Subscribe to `postgres_changes` events filtered by `doc_id`
- Listen for `UPDATE` events (INSERT handled on initial load)
- Use `eventType: '*'` to catch all changes or filter by specific operations

### Decision 2: Manual Conflict Resolution Strategy

**Decision**: Use "last write wins" with timestamp comparison for conflict resolution.

**Rationale**:
- Simple to implement for experimental validation
- Acceptable for 2-user testing scenarios
- Can be enhanced later if needed
- Avoids complex operational transform logic

**Alternatives Considered**:
- **Operational Transform (OT)**: Too complex for experimental phase
- **CRDT (Y.js)**: Would require switching to Y.js approach
- **Lock-based editing**: Not suitable for real-time collaboration

**Implementation Notes**:
- Compare `updated_at` timestamps when applying changes
- If local change is newer, ignore remote change
- If remote change is newer, apply it to editor
- For simultaneous edits at same position, last write wins

### Decision 3: Document Change Detection

**Decision**: Compare full document JSON content before applying changes to detect if update is needed.

**Rationale**:
- Prevents unnecessary editor updates from own changes
- Simple to implement
- Works with Tiptap's JSON content format

**Alternatives Considered**:
- **Diff-based updates**: More efficient but complex to implement
- **Version numbers**: Would require schema changes
- **Hash comparison**: More efficient but adds complexity

**Implementation Notes**:
- Store last known `updated_at` timestamp
- Only apply changes if `updated_at` is newer than last known
- Compare content JSON to avoid applying identical changes

### Decision 4: User Identifier Input Validation

**Decision**: Query `profiles` table to validate user exists before switching document context.

**Rationale**:
- Simple validation using existing table
- Provides user feedback for invalid inputs
- Aligns with existing user profile system

**Alternatives Considered**:
- **No validation**: Would allow invalid identifiers, poor UX
- **Auth.users table query**: Requires admin access, not suitable for client
- **Email validation only**: Less flexible than supporting both ID and email

**Implementation Notes**:
- Support both UUID (user ID) and email as identifiers
- Query `profiles` table with `eq('id', identifier)` or `eq('email', identifier)`
- Show error message if user not found
- Display validated user's name/email in UI

### Decision 5: RLS Policy Design for Shared Documents

**Decision**: Create RLS policies that allow all authenticated users to SELECT and UPDATE documents with matching `doc_id`, regardless of `owner_id`.

**Rationale**:
- Enables multi-user collaboration on same document
- Maintains security (only authenticated users can access)
- Preserves `owner_id` for audit/creator tracking
- Simple policy logic

**Alternatives Considered**:
- **Temporary RLS bypass**: Security risk, not recommended
- **Service role access**: Bypasses RLS, not suitable for client-side
- **Complex permission table**: Over-engineered for experimental phase

**Implementation Notes**:
- Policy: `SELECT` allowed for all authenticated users where `doc_id` matches
- Policy: `UPDATE` allowed for all authenticated users where `doc_id` matches
- Policy: `INSERT` allowed for all authenticated users (to create new documents)
- No `owner_id` restriction in policies (all users can access same docId)

### Decision 6: Realtime Subscription Lifecycle

**Decision**: Subscribe to Realtime channel when editor mounts, unsubscribe on unmount. Re-subscribe when `docId` changes.

**Rationale**:
- Prevents memory leaks
- Ensures subscriptions are active only when needed
- Aligns with React component lifecycle

**Alternatives Considered**:
- **Global subscription**: Would receive updates for all documents, inefficient
- **Persistent subscription**: Could cause issues with component unmounting

**Implementation Notes**:
- Use `useEffect` with cleanup function
- Subscribe to channel filtered by `doc_id`
- Unsubscribe in cleanup function
- Handle subscription errors gracefully

## Best Practices

### Supabase Realtime Best Practices
- Always unsubscribe in cleanup functions
- Handle connection errors and reconnection
- Filter subscriptions to specific tables/rows when possible
- Use `postgres_changes` for database change events

### Tiptap Editor Best Practices
- Use `editor.commands.setContent()` to update editor content
- Compare content before setting to avoid unnecessary updates
- Use `editor.getJSON()` to get current document state
- Handle editor lifecycle properly (create/destroy)

### React Best Practices
- Use `useEffect` for subscriptions with proper cleanup
- Avoid setting state during render
- Handle async operations with proper error boundaries
- Use refs for values that don't trigger re-renders

## Integration Patterns

### Pattern 1: Realtime Subscription in React Component

```typescript
useEffect(() => {
  if (!editor || !docId) return;
  
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
  
  return () => {
    supabase.removeChannel(channel);
  };
}, [editor, docId, supabase]);
```

### Pattern 2: Conflict Resolution

```typescript
const applyRemoteChange = (remoteContent: JSONContent, remoteUpdatedAt: string) => {
  if (!editor) return;
  
  const localUpdatedAt = lastKnownUpdatedAt.current;
  
  // Only apply if remote is newer
  if (new Date(remoteUpdatedAt) > new Date(localUpdatedAt)) {
    const currentContent = editor.getJSON();
    
    // Avoid applying own changes
    if (JSON.stringify(currentContent) !== JSON.stringify(remoteContent)) {
      editor.commands.setContent(remoteContent);
      lastKnownUpdatedAt.current = remoteUpdatedAt;
    }
  }
};
```

## Open Questions Resolved

1. ✅ **How to detect own changes vs remote changes?**  
   Solution: Compare `updated_at` timestamps and content JSON

2. ✅ **How to handle simultaneous edits?**  
   Solution: Last write wins based on `updated_at` timestamp

3. ✅ **How to validate user identifiers?**  
   Solution: Query `profiles` table for both UUID and email

4. ✅ **What RLS policies are needed?**  
   Solution: Allow all authenticated users to access documents by `doc_id`

5. ✅ **How to manage subscription lifecycle?**  
   Solution: Subscribe on mount, unsubscribe on unmount, re-subscribe on `docId` change

## References

- [Supabase Realtime Documentation](https://supabase.com/docs/guides/realtime)
- [Tiptap React Documentation](https://tiptap.dev/docs/editor/getting-started/react)
- [Supabase RLS Policies](https://supabase.com/docs/guides/auth/row-level-security)

