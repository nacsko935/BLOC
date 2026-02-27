-- Analytics minimal

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_name text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_analytics_user_created on public.analytics_events(user_id, created_at desc);
create index if not exists idx_analytics_event_name on public.analytics_events(event_name);

alter table public.analytics_events enable row level security;

drop policy if exists "analytics_insert_own" on public.analytics_events;
create policy "analytics_insert_own"
on public.analytics_events
for insert to authenticated
with check (user_id = auth.uid());

drop policy if exists "analytics_select_own" on public.analytics_events;
create policy "analytics_select_own"
on public.analytics_events
for select to authenticated
using (user_id = auth.uid());

notify pgrst, 'reload schema';