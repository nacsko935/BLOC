-- Push prod hardening

alter table public.profiles
  add column if not exists notification_enabled boolean not null default true;

alter table public.profiles
  add column if not exists push_enabled boolean not null default true;

alter table public.profiles
  add column if not exists analytics_enabled boolean not null default true;

update public.profiles
set push_enabled = coalesce(push_enabled, notification_enabled, true)
where push_enabled is null;

create table if not exists public.push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  expo_push_token text not null,
  platform text,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  unique (user_id, expo_push_token)
);

create table if not exists public.push_dispatch_logs (
  message_id uuid primary key,
  conversation_id uuid,
  sent_at timestamptz not null default now()
);

create index if not exists idx_push_tokens_user_id on public.push_tokens(user_id);
create index if not exists idx_messages_conversation_created_at on public.messages(conversation_id, created_at desc);

alter table public.push_tokens enable row level security;

drop policy if exists "push_tokens_select_own" on public.push_tokens;
create policy "push_tokens_select_own"
on public.push_tokens
for select to authenticated
using (user_id = auth.uid());

drop policy if exists "push_tokens_insert_own" on public.push_tokens;
create policy "push_tokens_insert_own"
on public.push_tokens
for insert to authenticated
with check (user_id = auth.uid());

drop policy if exists "push_tokens_update_own" on public.push_tokens;
create policy "push_tokens_update_own"
on public.push_tokens
for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "push_tokens_delete_own" on public.push_tokens;
create policy "push_tokens_delete_own"
on public.push_tokens
for delete to authenticated
using (user_id = auth.uid());

-- profiles policies minimal
alter table public.profiles enable row level security;

drop policy if exists "profiles_select_auth" on public.profiles;
create policy "profiles_select_auth"
on public.profiles
for select to authenticated
using (true);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

notify pgrst, 'reload schema';
