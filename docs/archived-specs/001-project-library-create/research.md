# Research Notes: Project & Library Creation

## Decisions

### Default libraries on project creation
- **Decision**: Create exactly one default library: "Resource".
- **Rationale**: Matches clarified requirement; reduces noise and enforces explicit creation of other libraries as needed.
- **Alternatives**: Multiple defaults (Visual/Events/etc.) — rejected per clarification; None — rejected to ensure immediate usable state.

### Validation rules
- **Decision**: Project name required, trimmed, non-empty; description optional. Library name required, trimmed, non-empty; description optional. Enforce unique project name per user and unique library name per project.
- **Rationale**: Prevents duplicates and empty entries; aligns with UX error states.
- **Alternatives**: Allow duplicates — rejected to avoid confusion; optional names — rejected as name is primary identifier.

### Error handling
- **Decision**: Inline validation errors stay in modal; backend errors surfaced inline without closing modal; show retry guidance.
- **Rationale**: Matches Constitution IV (resilient async) and good UX.
- **Alternatives**: Silent failure or toast-only — rejected for clarity.

### Performance targets
- **Decision**: Modal submit feedback <2s p95; library selection to editor <2s p95.
- **Rationale**: Aligns with Success Criteria; keeps UI responsive.
- **Alternatives**: No targets — rejected to keep measurable goals.

### Data persistence
- **Decision**: Use Supabase Postgres tables with RLS; create default library transactionally with project creation.
- **Rationale**: Integrity and rollback if either fails; aligns with Supabase policies.
- **Alternatives**: Two-step create (project then default library) — rejected to avoid partial state.
