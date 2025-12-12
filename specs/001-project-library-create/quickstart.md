# Quickstart: Project & Library Creation

## Prereqs
- Env vars for Supabase set (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
- Logged-in user for testing.

## Steps
1) Install & build
```bash
pnpm install
pnpm build # or pnpm dev for local
```

2) Run migrations (ensure new project/library tables & constraints)
```bash
pnpm supabase db push   # or apply specific migration files once created
```

3) Start dev server
```bash
pnpm dev
```

4) Manual test
- Open projects view.
- Click “New Project”, enter name + (optional) description, submit.
- Verify project appears with default Resource library.
- Click “New Library” under the project, enter name, submit; verify it appears.
- Select a library; editor pane should load with correct title.

5) Error paths to verify
- Submit project/library with empty name → inline validation blocks submit.
- Duplicate library name within same project → blocked with message.
- Simulated network error → modal stays open with error message and retry guidance.
