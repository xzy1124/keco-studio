# API Contracts: Project & Library

## Authentication
- All endpoints require authenticated user; apply Supabase RLS aligned to owner_id.

## Endpoints

### POST /api/projects
- **Purpose**: Create project and default Resource library in one transaction.
- **Request Body**:
  ```json
  { "name": "string", "description": "string | optional" }
  ```
- **Responses**:
  - 201: `{ "id": "uuid", "name": "string", "description": "string|null", "created_at": "iso", "default_library_id": "uuid" }`
  - 400: validation error (empty/duplicate name)
  - 500: server/storage error

### GET /api/projects
- **Purpose**: List projects for current user.
- **Responses**:
  - 200: `[ { "id": "uuid", "name": "string", "description": "string|null", "created_at": "iso" } ]`

### POST /api/projects/{projectId}/libraries
- **Purpose**: Create library under project.
- **Request Body**:
  ```json
  { "name": "string", "description": "string | optional" }
  ```
- **Responses**:
  - 201: `{ "id": "uuid", "project_id": "uuid", "name": "string", "description": "string|null", "created_at": "iso" }`
  - 400: validation/duplicate name
  - 404: project not found or not owned

### GET /api/projects/{projectId}/libraries
- **Purpose**: List libraries for a project.
- **Responses**:
  - 200: `[ { "id": "uuid", "project_id": "uuid", "name": "string", "description": "string|null", "created_at": "iso" } ]`
  - 404: project not found or not owned

### GET /api/libraries/{libraryId}
- **Purpose**: Fetch library metadata (for editor header) and content reference.
- **Responses**:
  - 200: `{ "id": "uuid", "project_id": "uuid", "name": "string", "description": "string|null", "created_at": "iso", "content_doc_id": "string" }`
  - 404: library not found or not owned

## Validation Rules (shared)
- `name`: required, trimmed, non-empty; max length 128 (recommended); unique per owner (project) as defined.
- `description`: optional; max length 512 (recommended).

## Error Model
- `{ "error": "code", "message": "human readable" }`
