-- Sanity checks for launch readiness (read-only)

with checks as (
  select
    'table_posts_exists'::text as check_name,
    case when to_regclass('public.posts') is not null then 'OK' else 'KO' end as status,
    'public.posts must exist'::text as details
  union all
  select
    'table_messages_exists',
    case when to_regclass('public.messages') is not null then 'OK' else 'KO' end,
    'public.messages must exist'
  union all
  select
    'table_push_tokens_exists',
    case when to_regclass('public.push_tokens') is not null then 'OK' else 'KO' end,
    'public.push_tokens must exist'
  union all
  select
    'table_app_config_exists',
    case when to_regclass('public.app_config') is not null then 'OK' else 'KO' end,
    'public.app_config must exist'
  union all
  select
    'rls_profiles_enabled',
    case when exists (
      select 1
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public'
        and c.relname = 'profiles'
        and c.relrowsecurity = true
    ) then 'OK' else 'KO' end,
    'RLS must be enabled on profiles'
  union all
  select
    'rls_push_tokens_enabled',
    case when exists (
      select 1
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public'
        and c.relname = 'push_tokens'
        and c.relrowsecurity = true
    ) then 'OK' else 'KO' end,
    'RLS must be enabled on push_tokens'
  union all
  select
    'idx_messages_conversation_created',
    case when exists (
      select 1
      from pg_indexes
      where schemaname = 'public'
        and tablename = 'messages'
        and indexdef ilike '%(conversation_id, created_at%'
    ) then 'OK' else 'KO' end,
    'Index on messages(conversation_id, created_at) required'
  union all
  select
    'idx_posts_filiere_created',
    case when exists (
      select 1
      from pg_indexes
      where schemaname = 'public'
        and tablename = 'posts'
        and indexdef ilike '%(filiere, created_at%'
    ) then 'OK' else 'KO' end,
    'Index on posts(filiere, created_at) required'
)
select * from checks
order by check_name;
