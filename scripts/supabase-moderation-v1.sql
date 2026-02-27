-- Moderation baseline

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users(id) on delete cascade,
  target_type text not null check (target_type in ('post','comment','user')),
  target_id text not null,
  reason text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.blocks (
  blocker_id uuid not null references auth.users(id) on delete cascade,
  blocked_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id)
);

create table if not exists public.hidden_posts (
  user_id uuid not null references auth.users(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);

create index if not exists idx_reports_reporter on public.reports(reporter_id);
create index if not exists idx_blocks_blocker on public.blocks(blocker_id);
create index if not exists idx_hidden_posts_user on public.hidden_posts(user_id);

alter table public.reports enable row level security;
alter table public.blocks enable row level security;
alter table public.hidden_posts enable row level security;

drop policy if exists "reports_insert_own" on public.reports;
create policy "reports_insert_own"
on public.reports
for insert to authenticated
with check (reporter_id = auth.uid());

drop policy if exists "reports_select_own" on public.reports;
create policy "reports_select_own"
on public.reports
for select to authenticated
using (reporter_id = auth.uid());

drop policy if exists "blocks_select_own" on public.blocks;
create policy "blocks_select_own"
on public.blocks
for select to authenticated
using (blocker_id = auth.uid());

drop policy if exists "blocks_insert_own" on public.blocks;
create policy "blocks_insert_own"
on public.blocks
for insert to authenticated
with check (blocker_id = auth.uid());

drop policy if exists "blocks_delete_own" on public.blocks;
create policy "blocks_delete_own"
on public.blocks
for delete to authenticated
using (blocker_id = auth.uid());

drop policy if exists "hidden_posts_select_own" on public.hidden_posts;
create policy "hidden_posts_select_own"
on public.hidden_posts
for select to authenticated
using (user_id = auth.uid());

drop policy if exists "hidden_posts_insert_own" on public.hidden_posts;
create policy "hidden_posts_insert_own"
on public.hidden_posts
for insert to authenticated
with check (user_id = auth.uid());

drop policy if exists "hidden_posts_delete_own" on public.hidden_posts;
create policy "hidden_posts_delete_own"
on public.hidden_posts
for delete to authenticated
using (user_id = auth.uid());

notify pgrst, 'reload schema';