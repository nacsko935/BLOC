-- Push notifications minimal schema

create table if not exists public.push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  expo_push_token text not null,
  platform text,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  unique (user_id, expo_push_token)
);

alter table public.push_tokens enable row level security;

create policy if not exists "push_tokens_select_own"
on public.push_tokens
for select to authenticated
using (user_id = auth.uid());

create policy if not exists "push_tokens_insert_own"
on public.push_tokens
for insert to authenticated
with check (user_id = auth.uid());

create policy if not exists "push_tokens_update_own"
on public.push_tokens
for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy if not exists "push_tokens_delete_own"
on public.push_tokens
for delete to authenticated
using (user_id = auth.uid());

notify pgrst, 'reload schema';