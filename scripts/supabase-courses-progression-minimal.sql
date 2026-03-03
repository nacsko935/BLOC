-- Minimal progression schema for Courses tab stats
-- Idempotent: safe to run multiple times.

create extension if not exists pgcrypto;

-- =========================
-- goals
-- =========================
create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default '',
  status text not null default 'todo',
  created_at timestamptz not null default now()
);

alter table public.goals add column if not exists user_id uuid;
alter table public.goals add column if not exists title text;
alter table public.goals add column if not exists status text;
alter table public.goals add column if not exists created_at timestamptz;

alter table public.goals alter column created_at set default now();
alter table public.goals alter column title set default '';
alter table public.goals alter column status set default 'todo';

create index if not exists idx_goals_user_status on public.goals(user_id, status);
create index if not exists idx_goals_user_created on public.goals(user_id, created_at desc);

-- =========================
-- streaks
-- =========================
create table if not exists public.streaks (
  user_id uuid primary key references auth.users(id) on delete cascade,
  current_streak integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.streaks add column if not exists user_id uuid;
alter table public.streaks add column if not exists current_streak integer;
alter table public.streaks add column if not exists updated_at timestamptz;

alter table public.streaks alter column current_streak set default 0;
alter table public.streaks alter column updated_at set default now();

-- =========================
-- progress
-- =========================
create table if not exists public.progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  module_id text not null,
  status text not null default 'in_progress',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.progress add column if not exists user_id uuid;
alter table public.progress add column if not exists module_id text;
alter table public.progress add column if not exists status text;
alter table public.progress add column if not exists created_at timestamptz;
alter table public.progress add column if not exists updated_at timestamptz;

alter table public.progress alter column status set default 'in_progress';
alter table public.progress alter column created_at set default now();
alter table public.progress alter column updated_at set default now();

create index if not exists idx_progress_user_status on public.progress(user_id, status);
create unique index if not exists idx_progress_user_module_unique on public.progress(user_id, module_id);

-- =========================
-- enrollments
-- =========================
create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  module_id text not null,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

alter table public.enrollments add column if not exists user_id uuid;
alter table public.enrollments add column if not exists module_id text;
alter table public.enrollments add column if not exists status text;
alter table public.enrollments add column if not exists created_at timestamptz;

alter table public.enrollments alter column status set default 'active';
alter table public.enrollments alter column created_at set default now();

create index if not exists idx_enrollments_user_status on public.enrollments(user_id, status);
create unique index if not exists idx_enrollments_user_module_unique on public.enrollments(user_id, module_id);

-- =========================
-- library_items
-- =========================
create table if not exists public.library_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  title text null,
  created_at timestamptz not null default now()
);

alter table public.library_items add column if not exists user_id uuid;
alter table public.library_items add column if not exists type text;
alter table public.library_items add column if not exists title text;
alter table public.library_items add column if not exists created_at timestamptz;

alter table public.library_items alter column created_at set default now();

create index if not exists idx_library_items_user_type on public.library_items(user_id, type);
create index if not exists idx_library_items_user_created on public.library_items(user_id, created_at desc);

-- =========================
-- RLS: owner-only
-- =========================
alter table public.goals enable row level security;
alter table public.streaks enable row level security;
alter table public.progress enable row level security;
alter table public.enrollments enable row level security;
alter table public.library_items enable row level security;

drop policy if exists goals_select_own on public.goals;
drop policy if exists goals_insert_own on public.goals;
drop policy if exists goals_update_own on public.goals;
drop policy if exists goals_delete_own on public.goals;
create policy goals_select_own on public.goals for select to authenticated using (user_id = auth.uid());
create policy goals_insert_own on public.goals for insert to authenticated with check (user_id = auth.uid());
create policy goals_update_own on public.goals for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy goals_delete_own on public.goals for delete to authenticated using (user_id = auth.uid());

drop policy if exists streaks_select_own on public.streaks;
drop policy if exists streaks_insert_own on public.streaks;
drop policy if exists streaks_update_own on public.streaks;
drop policy if exists streaks_delete_own on public.streaks;
create policy streaks_select_own on public.streaks for select to authenticated using (user_id = auth.uid());
create policy streaks_insert_own on public.streaks for insert to authenticated with check (user_id = auth.uid());
create policy streaks_update_own on public.streaks for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy streaks_delete_own on public.streaks for delete to authenticated using (user_id = auth.uid());

drop policy if exists progress_select_own on public.progress;
drop policy if exists progress_insert_own on public.progress;
drop policy if exists progress_update_own on public.progress;
drop policy if exists progress_delete_own on public.progress;
create policy progress_select_own on public.progress for select to authenticated using (user_id = auth.uid());
create policy progress_insert_own on public.progress for insert to authenticated with check (user_id = auth.uid());
create policy progress_update_own on public.progress for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy progress_delete_own on public.progress for delete to authenticated using (user_id = auth.uid());

drop policy if exists enrollments_select_own on public.enrollments;
drop policy if exists enrollments_insert_own on public.enrollments;
drop policy if exists enrollments_update_own on public.enrollments;
drop policy if exists enrollments_delete_own on public.enrollments;
create policy enrollments_select_own on public.enrollments for select to authenticated using (user_id = auth.uid());
create policy enrollments_insert_own on public.enrollments for insert to authenticated with check (user_id = auth.uid());
create policy enrollments_update_own on public.enrollments for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy enrollments_delete_own on public.enrollments for delete to authenticated using (user_id = auth.uid());

drop policy if exists library_items_select_own on public.library_items;
drop policy if exists library_items_insert_own on public.library_items;
drop policy if exists library_items_update_own on public.library_items;
drop policy if exists library_items_delete_own on public.library_items;
create policy library_items_select_own on public.library_items for select to authenticated using (user_id = auth.uid());
create policy library_items_insert_own on public.library_items for insert to authenticated with check (user_id = auth.uid());
create policy library_items_update_own on public.library_items for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy library_items_delete_own on public.library_items for delete to authenticated using (user_id = auth.uid());

notify pgrst, 'reload schema';

