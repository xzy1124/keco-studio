# Quick Start: Tiptap Real-Time Collaboration

**Date**: 2025-01-10  
**Feature**: Tiptap Real-Time Collaboration

## Prerequisites

- Supabase project with authentication enabled
- Next.js application running
- Two user accounts for testing (can use different browsers or incognito mode)

## Setup Steps

### 1. Run Database Migration

Create and run the migration to create the `shared_documents` table:

```bash
# Migration file: supabase/migrations/[timestamp]_create_shared_documents.sql
# See data-model.md for full SQL
supabase migration up
```

### 2. Verify Realtime is Enabled

Ensure Supabase Realtime is enabled for the `shared_documents` table (included in migration).

### 3. Update PredefineEditor Component

Extend the existing `PredefineEditor` component to:
- Use `shared_documents` table instead of `predefine_properties`
- Subscribe to Realtime updates
- Apply remote changes to editor

### 4. Add User Identifier Input

Add a simple input field in the main page to allow users to enter another user's identifier (ID or email) for testing.

## Testing Scenarios

### Scenario 1: Basic Real-Time Synchronization

1. **User A**: Open application, login with account A
2. **User B**: Open application in different browser/incognito, login with account B
3. **User A**: Enter User B's identifier in the input field (or use same docId)
4. **User A**: Type some text in the editor
5. **Expected**: User B sees the text appear in their editor within 2 seconds

### Scenario 2: Simultaneous Editing

1. **User A & User B**: Both viewing the same document (same docId)
2. **User A**: Types at the beginning of the document
3. **User B**: Types at the end of the document (simultaneously)
4. **Expected**: Both users see both sets of text correctly positioned

### Scenario 3: Formatting Synchronization

1. **User A & User B**: Both viewing the same document
2. **User A**: Selects text and applies bold formatting
3. **Expected**: User B sees the formatting change within 2 seconds

### Scenario 4: Network Disconnection

1. **User A & User B**: Both editing the same document
2. **User A**: Disconnects network (disable WiFi)
3. **User B**: Makes edits
4. **User A**: Reconnects network
5. **Expected**: User A's editor syncs with User B's changes after reconnection

### Scenario 5: Invalid User Identifier

1. **User A**: Enters invalid user identifier (non-existent UUID or email)
2. **Expected**: System shows error message, does not switch document context

## Manual Testing Checklist

- [ ] Migration runs successfully
- [ ] `shared_documents` table created with correct schema
- [ ] RLS policies allow authenticated users to read/update
- [ ] Realtime subscription receives UPDATE events
- [ ] Editor applies remote changes correctly
- [ ] Own changes are not re-applied (no feedback loop)
- [ ] Simultaneous edits don't corrupt document
- [ ] Network disconnection handled gracefully
- [ ] User identifier validation works (UUID and email)
- [ ] Error messages displayed for invalid inputs

## Debugging Tips

### Check Realtime Connection

```typescript
// In browser console
const channel = supabase.channel('test');
channel.subscribe((status) => {
  console.log('Realtime status:', status);
});
```

### Monitor Database Changes

```sql
-- In Supabase SQL editor
SELECT * FROM shared_documents ORDER BY updated_at DESC LIMIT 10;
```

### Check RLS Policies

```sql
-- Test as authenticated user
SET ROLE authenticated;
SELECT * FROM shared_documents WHERE doc_id = 'test-doc-001';
```

### Verify Subscription

```typescript
// Add logging in PredefineEditor component
channel.on('postgres_changes', (payload) => {
  console.log('Realtime event received:', payload);
});
```

## Common Issues

### Issue: Changes not syncing

**Possible Causes**:
- Realtime subscription not active
- RLS policy blocking access
- Network connection issues
- `doc_id` mismatch between users

**Solutions**:
- Check browser console for subscription errors
- Verify RLS policies allow authenticated users
- Check network tab for failed requests
- Ensure both users use same `doc_id`

### Issue: Own changes being re-applied

**Possible Causes**:
- Not comparing timestamps before applying changes
- Not detecting own changes vs remote changes

**Solutions**:
- Compare `updated_at` timestamps
- Store last known timestamp locally
- Skip applying changes if timestamp is older than local

### Issue: Document corruption with simultaneous edits

**Possible Causes**:
- No conflict resolution logic
- Applying changes without checking position

**Solutions**:
- Implement last-write-wins strategy
- Compare timestamps before applying
- Consider more sophisticated conflict resolution for production

## Next Steps

After validation:
1. Consider implementing Y.js for better conflict resolution
2. Add presence awareness (show other users)
3. Add document sharing UI (P2 feature)
4. Optimize for larger documents and more concurrent users

