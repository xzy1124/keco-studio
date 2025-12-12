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

/*
  Enable Realtime:将表加入 Supabase Realtime 发布集：启用实时数据同步
  这允许客户端订阅和接收表中的实时更新
  将 shared_documents 表加入该发布集后，表的 INSERT/UPDATE/DELETE 操作会被 Realtime 捕获，
  前端可通过 WebSocket 实时监听变更（比如之前你问的 postgres_changes 事件）
*/
alter publication supabase_realtime add table public.shared_documents;

