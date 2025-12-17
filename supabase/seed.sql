-- Seed data for local testing
-- Three users:
-- 1) empty account
-- 2) account with one empty project
-- 3) account with one project that has one empty library

begin;

-- Helper to create a user with a known password.
-- Supabase's local auth schema uses `encrypted_password` (bcrypt).
-- The instance_id for local projects is all zeros.

-- User 1: empty account
with u as (
  select
    gen_random_uuid() as id,
    crypt('Password123!', gen_salt('bf')) as enc_pwd
)
insert into auth.users (
  id, instance_id, email, encrypted_password,
  raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, aud, role,
  email_confirmed_at, confirmation_sent_at, last_sign_in_at,
  confirmation_token, recovery_token, email_change_token_new,
  email_change_token_current, email_change, reauthentication_token
)
select
  u.id,
  '00000000-0000-0000-0000-000000000000',
  'seed-empty@example.com',
  u.enc_pwd,
  jsonb_build_object('provider', 'email', 'providers', array['email']),
  jsonb_build_object('username', 'seed-empty'),
  now(), now(),
  'authenticated', 'authenticated',
  now(), now(), now(),
  '', '', '', '', '', ''
from u;

-- User 2: has one empty project
with user2 as (
  insert into auth.users (
    id, instance_id, email, encrypted_password,
    raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, aud, role,
    email_confirmed_at, confirmation_sent_at, last_sign_in_at,
    confirmation_token, recovery_token, email_change_token_new,
    email_change_token_current, email_change, reauthentication_token
  )
  select
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'seed-project@example.com',
    crypt('Password123!', gen_salt('bf')),
    jsonb_build_object('provider', 'email', 'providers', array['email']),
    jsonb_build_object('username', 'seed-project'),
    now(), now(),
    'authenticated', 'authenticated',
    now(), now(), now(),
    '', '', '', '', '', ''
  returning id
)
insert into public.projects (owner_id, name, description)
select id, 'Seed Project A', 'Empty project for seeds'
from user2;

-- User 3: has one project with one empty library
with user3 as (
  insert into auth.users (
    id, instance_id, email, encrypted_password,
    raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, aud, role,
    email_confirmed_at, confirmation_sent_at, last_sign_in_at,
    confirmation_token, recovery_token, email_change_token_new,
    email_change_token_current, email_change, reauthentication_token
  )
  select
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'seed-library@example.com',
    crypt('Password123!', gen_salt('bf')),
    jsonb_build_object('provider', 'email', 'providers', array['email']),
    jsonb_build_object('username', 'seed-library'),
    now(), now(),
    'authenticated', 'authenticated',
    now(), now(), now(),
    '', '', '', '', '', ''
  returning id
),
project3 as (
  insert into public.projects (owner_id, name, description)
  select id, 'Seed Project B', 'Project with one empty library'
  from user3
  returning id
)
insert into public.libraries (project_id, name, description)
select id, 'Seed Library B1', 'Empty library'
from project3;

commit;

