# Data Model: Project & Library

## Entities

### Project
- **Fields**: id (uuid, pk), owner_id (uuid, fk profiles.id), name (text, required, unique per owner), description (text, optional), created_at (timestamptz), updated_at (timestamptz).
- **Constraints**: (owner_id, name) unique; name trimmed non-empty.
- **Behavior**: On create, also create default Library "Resource" in same transaction; owner_id derived from current user.

### Library
- **Fields**: id (uuid, pk), project_id (uuid, fk projects.id), name (text, required), description (text, optional), created_at (timestamptz), updated_at (timestamptz).
- **Constraints**: (project_id, name) unique; name trimmed non-empty.
- **Behavior**: Created via project default creation or user modal; selecting loads content in editor.

## Relationships
- Project 1:N Library (project_id fk).

## Derived/Business Rules
- Default library: exactly one "Resource" created with project.
- Deletion scope: not defined in spec; leave out-of-scope for now.
- Access: authenticated user only; RLS must enforce owner-based access.

## Indexing
- Unique indexes on (owner_id, name) for projects and (project_id, name) for libraries.
- Foreign key indexes on owner_id and project_id.

## State Transitions
- Project: draft (creation), active (default) — no additional states defined; deletion/archive out-of-scope.
- Library: created -> editable (default); deletion/archive out-of-scope.
