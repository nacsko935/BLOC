-- Social search/feed scale hardening (idempotent)
-- Run once in Supabase SQL editor on production.

create extension if not exists pg_trgm;

-- Feed
create index if not exists idx_posts_created_at_desc on public.posts(created_at desc);
create index if not exists idx_posts_author_id on public.posts(author_id);

-- Profiles search
create index if not exists idx_profiles_username_trgm_scale
  on public.profiles using gin (username gin_trgm_ops);
create index if not exists idx_profiles_full_name_trgm_scale
  on public.profiles using gin (full_name gin_trgm_ops);

-- Optional, only if column exists in your env
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'display_name'
  ) then
    execute 'create index if not exists idx_profiles_display_name_trgm_scale
      on public.profiles using gin (display_name gin_trgm_ops)';
  end if;
end $$;

notify pgrst, 'reload schema';

