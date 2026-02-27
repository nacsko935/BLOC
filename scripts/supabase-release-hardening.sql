-- Release hardening toggles (global kill switches)

create table if not exists public.app_config (
  key text primary key,
  value text not null default 'false',
  updated_at timestamptz not null default now()
);

insert into public.app_config (key, value)
values
  ('push_global_disabled', 'false'),
  ('analytics_global_disabled', 'false')
on conflict (key) do nothing;

alter table public.app_config enable row level security;

drop policy if exists "app_config_read_auth" on public.app_config;
create policy "app_config_read_auth"
on public.app_config
for select
to authenticated
using (true);

-- No update policy for authenticated users.
-- Service role bypasses RLS and can update during incidents.

notify pgrst, 'reload schema';
