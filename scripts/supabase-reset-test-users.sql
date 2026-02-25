create schema if not exists supabase_migrations;

create table if not exists supabase_migrations.schema_migrations (
  version text primary key,
  inserted_at timestamptz not null default now()
);

-- Dev reset: supprimer anciens comptes test + donnees associees
-- A executer dans Supabase SQL Editor (role owner/admin)

begin;

-- 1) Choisis la cible: emails de test (ex: @bloc.dev)
with target_users as (
  select id, email
  from auth.users
  where email ilike '%@bloc.dev'
)

-- 2) Supprimer donnees metier liees
, del_likes as (
  delete from public.post_likes pl
  using target_users tu
  where pl.user_id = tu.id
  returning pl.user_id
)
, del_saves as (
  delete from public.post_saves ps
  using target_users tu
  where ps.user_id = tu.id
  returning ps.user_id
)
, del_comments as (
  delete from public.comments c
  using target_users tu
  where c.user_id = tu.id
  returning c.user_id
)
, del_posts as (
  delete from public.posts p
  using target_users tu
  where p.author_id = tu.id
  returning p.author_id
)
, del_profiles as (
  delete from public.profiles pr
  using target_users tu
  where pr.id = tu.id
  returning pr.id
)

-- 3) Supprimer users auth (comptes email)
delete from auth.users au
using target_users tu
where au.id = tu.id;

commit;

-- Variante stricte: supprimer un seul email
-- delete from auth.users where email = 'tonmail@bloc.dev';
