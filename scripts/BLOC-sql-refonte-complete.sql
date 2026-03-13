-- ================================================================
-- BLOC — SQL REFONTE COMPLÈTE v2
-- À exécuter dans : Supabase > SQL Editor > New Query > Run
-- ================================================================
-- Ce script est IDEMPOTENT (safe à ré-exécuter plusieurs fois).
-- Il ajoute/complète le schéma existant sans rien casser.
-- ================================================================

-- ── Extensions ────────────────────────────────────────────────────
create extension if not exists pgcrypto;
create extension if not exists pg_trgm; -- pour la recherche full-text

-- ================================================================
-- 1. TABLE PROFILES — Ajout des colonnes manquantes
-- ================================================================

alter table public.profiles
  add column if not exists account_type   text,     -- "student" | "professor" | "school"
  add column if not exists role           text,     -- alias de account_type (rétrocompatibilité)
  add column if not exists display_name   text,
  add column if not exists school_name    text,
  add column if not exists push_enabled   boolean   not null default true,
  add column if not exists notification_enabled boolean not null default true,
  add column if not exists analytics_enabled boolean not null default true,
  add column if not exists avatar_config  jsonb,
  add column if not exists avatar_changed_at timestamptz,
  add column if not exists is_first_login boolean   not null default false,
  add column if not exists ecole          text,
  add column if not exists updated_at     timestamptz not null default now();

-- Trigger updated_at sur profiles
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ================================================================
-- 2. TABLE POSTS — Ajout type image/video + reposts
-- ================================================================

-- Supprimer l'ancienne contrainte type si elle existe
alter table public.posts
  drop constraint if exists posts_type_check;

alter table public.posts
  add column if not exists image_url  text,
  add column if not exists video_url  text,
  add column if not exists is_trend   boolean not null default false,
  add constraint posts_type_check
    check (type in ('text','pdf','qcm','image','video'));

-- Table reposts
create table if not exists public.post_reposts (
  post_id    uuid not null references public.posts(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create index if not exists idx_post_reposts_post_id on public.post_reposts(post_id);

-- ================================================================
-- 3. TABLE FOLLOWS
-- ================================================================

create table if not exists public.follows (
  follower_id  uuid not null references auth.users(id) on delete cascade,
  following_id uuid not null references auth.users(id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (follower_id, following_id)
);

create index if not exists idx_follows_follower   on public.follows(follower_id);
create index if not exists idx_follows_following  on public.follows(following_id);

-- ================================================================
-- 4. NOTIFICATIONS
-- ================================================================

create table if not exists public.notifications (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  from_user_id uuid references auth.users(id) on delete set null,
  type         text not null check (type in (
    'message','follow','repost','like','comment','mention','reaction'
  )),
  title        text not null,
  body         text not null default '',
  read         boolean not null default false,
  target_id    uuid,   -- post_id, message_id, etc.
  created_at   timestamptz not null default now()
);

create index if not exists idx_notifications_user_id    on public.notifications(user_id, created_at desc);
create index if not exists idx_notifications_unread     on public.notifications(user_id) where read = false;

-- ================================================================
-- 5. MESSAGES — Ajout reply_to_id + statut vu
-- ================================================================

alter table public.messages
  add column if not exists reply_to_id uuid references public.messages(id) on delete set null,
  add column if not exists deleted     boolean not null default false,
  add column if not exists read_by     uuid[]; -- tableau des user_ids qui ont lu

-- Table lecture des conversations
create table if not exists public.conversation_reads (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id         uuid not null references auth.users(id) on delete cascade,
  read_at         timestamptz not null default now(),
  primary key (conversation_id, user_id)
);

-- ================================================================
-- 6. RÉACTIONS AUX MESSAGES (DM)
-- ================================================================

create table if not exists public.message_reactions (
  id         uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.messages(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  emoji      text not null,
  created_at timestamptz not null default now(),
  unique (message_id, user_id, emoji)
);

create index if not exists idx_msg_reactions_msg on public.message_reactions(message_id);

-- ================================================================
-- 7. RÉACTIONS AUX MESSAGES DE GROUPE
-- ================================================================

alter table public.group_messages
  add column if not exists reply_to_id uuid references public.group_messages(id) on delete set null,
  add column if not exists deleted     boolean not null default false;

create table if not exists public.group_message_reactions (
  id               uuid primary key default gen_random_uuid(),
  group_message_id uuid not null references public.group_messages(id) on delete cascade,
  user_id          uuid not null references auth.users(id) on delete cascade,
  emoji            text not null,
  created_at       timestamptz not null default now(),
  unique (group_message_id, user_id, emoji)
);

create index if not exists idx_gmsg_reactions_msg on public.group_message_reactions(group_message_id);

-- ================================================================
-- 8. HISTORIQUE COURS — Tables pour l'IA locale
-- ================================================================

create table if not exists public.course_documents (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text not null,
  file_url    text,
  raw_text    text,           -- texte extrait
  filiere     text,
  created_at  timestamptz not null default now()
);

create table if not exists public.course_summaries (
  id              uuid primary key default gen_random_uuid(),
  document_id     uuid not null references public.course_documents(id) on delete cascade,
  user_id         uuid not null references auth.users(id) on delete cascade,
  summary         text not null,
  key_points      jsonb,      -- string[]
  word_count      integer,
  created_at      timestamptz not null default now()
);

create table if not exists public.course_flashcards (
  id          uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.course_documents(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  front       text not null,
  back        text not null,
  known       boolean not null default false,
  created_at  timestamptz not null default now()
);

create table if not exists public.course_qcm (
  id           uuid primary key default gen_random_uuid(),
  document_id  uuid not null references public.course_documents(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  question     text not null,
  options      jsonb not null,     -- string[4]
  correct_idx  integer not null,
  explanation  text,
  created_at   timestamptz not null default now()
);

create table if not exists public.course_qcm_results (
  id           uuid primary key default gen_random_uuid(),
  document_id  uuid not null references public.course_documents(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  score        integer not null,   -- 0..100
  total        integer not null,
  answers      jsonb,              -- {questionId: chosenIndex}
  completed_at timestamptz not null default now()
);

create index if not exists idx_course_docs_user   on public.course_documents(user_id, created_at desc);
create index if not exists idx_course_flash_doc   on public.course_flashcards(document_id);
create index if not exists idx_course_qcm_doc     on public.course_qcm(document_id);
create index if not exists idx_course_results_doc on public.course_qcm_results(document_id);

-- ================================================================
-- 9. TENDANCES
-- ================================================================

create table if not exists public.trends (
  id          uuid primary key default gen_random_uuid(),
  author_id   uuid not null references auth.users(id) on delete cascade,
  title       text not null,
  content     text not null,
  filiere     text,
  category    text check (category in ('tutoriel','video','conseil','autre')) default 'autre',
  image_url   text,
  video_url   text,
  likes_count integer not null default 0,
  views_count integer not null default 0,
  created_at  timestamptz not null default now()
);

create table if not exists public.trend_likes (
  trend_id   uuid not null references public.trends(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (trend_id, user_id)
);

create table if not exists public.trend_comments (
  id          uuid primary key default gen_random_uuid(),
  trend_id    uuid not null references public.trends(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  content     text not null,
  created_at  timestamptz not null default now()
);

create index if not exists idx_trends_created_at on public.trends(created_at desc);
create index if not exists idx_trend_likes       on public.trend_likes(trend_id);

-- ================================================================
-- 10. MODÉRATION
-- ================================================================

create table if not exists public.blocks (
  blocker_id uuid not null references auth.users(id) on delete cascade,
  blocked_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id)
);

create table if not exists public.hidden_posts (
  user_id    uuid not null references auth.users(id) on delete cascade,
  post_id    uuid not null references public.posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);

create table if not exists public.reports (
  id          uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users(id) on delete cascade,
  target_type text not null check (target_type in ('post','comment','user','message')),
  target_id   uuid not null,
  reason      text not null,
  created_at  timestamptz not null default now()
);

-- ================================================================
-- 11. INDEX PERFORMANCE
-- ================================================================

-- Recherche full-text profiles
create index if not exists idx_profiles_username_trgm
  on public.profiles using gin (username gin_trgm_ops);
create index if not exists idx_profiles_fullname_trgm
  on public.profiles using gin (full_name gin_trgm_ops);

-- Recherche full-text posts
create index if not exists idx_posts_content_trgm
  on public.posts using gin (content gin_trgm_ops);
create index if not exists idx_posts_title_trgm
  on public.posts using gin (title gin_trgm_ops);

-- Performances messagerie
create index if not exists idx_messages_conv_created on public.messages(conversation_id, created_at asc);
create index if not exists idx_messages_sender       on public.messages(sender_id);

-- Performances feed
create index if not exists idx_posts_filiere_created on public.posts(filiere, created_at desc);
create index if not exists idx_post_likes_user       on public.post_likes(user_id);
create index if not exists idx_post_saves_user       on public.post_saves(user_id);

-- ================================================================
-- 12. RLS (Row Level Security)
-- ================================================================

-- Activer RLS sur les nouvelles tables
alter table public.follows               enable row level security;
alter table public.notifications         enable row level security;
alter table public.post_reposts          enable row level security;
alter table public.message_reactions     enable row level security;
alter table public.group_message_reactions enable row level security;
alter table public.conversation_reads    enable row level security;
alter table public.course_documents      enable row level security;
alter table public.course_summaries      enable row level security;
alter table public.course_flashcards     enable row level security;
alter table public.course_qcm            enable row level security;
alter table public.course_qcm_results    enable row level security;
alter table public.trends                enable row level security;
alter table public.trend_likes           enable row level security;
alter table public.trend_comments        enable row level security;
alter table public.blocks                enable row level security;
alter table public.hidden_posts          enable row level security;
alter table public.reports               enable row level security;

-- ── Politiques FOLLOWS ────────────────────────────────────────────
do $$ begin
  if not exists (select 1 from pg_policies where policyname='follows_select' and tablename='follows') then
    create policy "follows_select" on public.follows for select to authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where policyname='follows_insert' and tablename='follows') then
    create policy "follows_insert" on public.follows for insert to authenticated
      with check (follower_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where policyname='follows_delete' and tablename='follows') then
    create policy "follows_delete" on public.follows for delete to authenticated
      using (follower_id = auth.uid());
  end if;
end $$;

-- ── Politiques NOTIFICATIONS ──────────────────────────────────────
do $$ begin
  if not exists (select 1 from pg_policies where policyname='notifs_select' and tablename='notifications') then
    create policy "notifs_select" on public.notifications for select to authenticated
      using (user_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where policyname='notifs_insert' and tablename='notifications') then
    create policy "notifs_insert" on public.notifications for insert to authenticated
      with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname='notifs_update' and tablename='notifications') then
    create policy "notifs_update" on public.notifications for update to authenticated
      using (user_id = auth.uid());
  end if;
end $$;

-- ── Politiques POST_REPOSTS ───────────────────────────────────────
do $$ begin
  if not exists (select 1 from pg_policies where policyname='reposts_select' and tablename='post_reposts') then
    create policy "reposts_select" on public.post_reposts for select to authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where policyname='reposts_insert' and tablename='post_reposts') then
    create policy "reposts_insert" on public.post_reposts for insert to authenticated
      with check (user_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where policyname='reposts_delete' and tablename='post_reposts') then
    create policy "reposts_delete" on public.post_reposts for delete to authenticated
      using (user_id = auth.uid());
  end if;
end $$;

-- ── Politiques MESSAGE_REACTIONS ─────────────────────────────────
do $$ begin
  if not exists (select 1 from pg_policies where policyname='msg_react_select' and tablename='message_reactions') then
    create policy "msg_react_select" on public.message_reactions for select to authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where policyname='msg_react_insert' and tablename='message_reactions') then
    create policy "msg_react_insert" on public.message_reactions for insert to authenticated
      with check (user_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where policyname='msg_react_delete' and tablename='message_reactions') then
    create policy "msg_react_delete" on public.message_reactions for delete to authenticated
      using (user_id = auth.uid());
  end if;
end $$;

-- ── Politiques GROUP_MESSAGE_REACTIONS ───────────────────────────
do $$ begin
  if not exists (select 1 from pg_policies where policyname='gmsg_react_select' and tablename='group_message_reactions') then
    create policy "gmsg_react_select" on public.group_message_reactions for select to authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where policyname='gmsg_react_insert' and tablename='group_message_reactions') then
    create policy "gmsg_react_insert" on public.group_message_reactions for insert to authenticated
      with check (user_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where policyname='gmsg_react_delete' and tablename='group_message_reactions') then
    create policy "gmsg_react_delete" on public.group_message_reactions for delete to authenticated
      using (user_id = auth.uid());
  end if;
end $$;

-- ── Politiques CONVERSATION_READS ────────────────────────────────
do $$ begin
  if not exists (select 1 from pg_policies where policyname='conv_reads_all' and tablename='conversation_reads') then
    create policy "conv_reads_all" on public.conversation_reads for all to authenticated
      using (user_id = auth.uid()) with check (user_id = auth.uid());
  end if;
end $$;

-- ── Politiques COURSE_DOCUMENTS ──────────────────────────────────
do $$ begin
  if not exists (select 1 from pg_policies where policyname='course_docs_own' and tablename='course_documents') then
    create policy "course_docs_own" on public.course_documents for all to authenticated
      using (user_id = auth.uid()) with check (user_id = auth.uid());
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where policyname='course_summaries_own' and tablename='course_summaries') then
    create policy "course_summaries_own" on public.course_summaries for all to authenticated
      using (user_id = auth.uid()) with check (user_id = auth.uid());
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where policyname='course_flash_own' and tablename='course_flashcards') then
    create policy "course_flash_own" on public.course_flashcards for all to authenticated
      using (user_id = auth.uid()) with check (user_id = auth.uid());
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where policyname='course_qcm_own' and tablename='course_qcm') then
    create policy "course_qcm_own" on public.course_qcm for all to authenticated
      using (user_id = auth.uid()) with check (user_id = auth.uid());
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where policyname='course_qcm_results_own' and tablename='course_qcm_results') then
    create policy "course_qcm_results_own" on public.course_qcm_results for all to authenticated
      using (user_id = auth.uid()) with check (user_id = auth.uid());
  end if;
end $$;

-- ── Politiques TRENDS ────────────────────────────────────────────
do $$ begin
  if not exists (select 1 from pg_policies where policyname='trends_select' and tablename='trends') then
    create policy "trends_select" on public.trends for select to authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where policyname='trends_insert' and tablename='trends') then
    create policy "trends_insert" on public.trends for insert to authenticated
      with check (author_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where policyname='trends_delete' and tablename='trends') then
    create policy "trends_delete" on public.trends for delete to authenticated
      using (author_id = auth.uid());
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where policyname='trend_likes_all' and tablename='trend_likes') then
    create policy "trend_likes_all" on public.trend_likes for all to authenticated
      using (user_id = auth.uid()) with check (user_id = auth.uid());
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where policyname='trend_comments_select' and tablename='trend_comments') then
    create policy "trend_comments_select" on public.trend_comments for select to authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where policyname='trend_comments_own' and tablename='trend_comments') then
    create policy "trend_comments_own" on public.trend_comments for insert to authenticated
      with check (user_id = auth.uid());
  end if;
end $$;

-- ── Politiques BLOCKS ────────────────────────────────────────────
do $$ begin
  if not exists (select 1 from pg_policies where policyname='blocks_own' and tablename='blocks') then
    create policy "blocks_own" on public.blocks for all to authenticated
      using (blocker_id = auth.uid()) with check (blocker_id = auth.uid());
  end if;
end $$;

-- ── Politiques HIDDEN_POSTS ──────────────────────────────────────
do $$ begin
  if not exists (select 1 from pg_policies where policyname='hidden_own' and tablename='hidden_posts') then
    create policy "hidden_own" on public.hidden_posts for all to authenticated
      using (user_id = auth.uid()) with check (user_id = auth.uid());
  end if;
end $$;

-- ── Politiques REPORTS ───────────────────────────────────────────
do $$ begin
  if not exists (select 1 from pg_policies where policyname='reports_insert' and tablename='reports') then
    create policy "reports_insert" on public.reports for insert to authenticated
      with check (reporter_id = auth.uid());
  end if;
end $$;

-- ================================================================
-- 13. TRIGGERS AUTOMATIQUES
-- ================================================================

-- ── Auto-create profile on signup ────────────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, username, full_name, is_first_login, created_at, updated_at)
  values (
    new.id,
    split_part(new.email, '@', 1),
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    true,
    now(),
    now()
  )
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Trigger: notification on like ────────────────────────────────
create or replace function public.notify_on_like()
returns trigger language plpgsql security definer as $$
declare
  v_post record;
  v_liker record;
begin
  select author_id, title into v_post from public.posts where id = new.post_id;
  if v_post.author_id is null or v_post.author_id = new.user_id then return new; end if;
  select full_name, username into v_liker from public.profiles where id = new.user_id;
  insert into public.notifications (user_id, from_user_id, type, title, body, target_id)
  values (
    v_post.author_id, new.user_id, 'like',
    coalesce(v_liker.full_name, v_liker.username, 'Quelqu''un') || ' a aimé ton post',
    coalesce(v_post.title, 'Ton post'),
    new.post_id
  );
  return new;
end; $$;

drop trigger if exists trg_notify_like on public.post_likes;
create trigger trg_notify_like
  after insert on public.post_likes
  for each row execute function public.notify_on_like();

-- ── Trigger: notification on comment ─────────────────────────────
create or replace function public.notify_on_comment()
returns trigger language plpgsql security definer as $$
declare
  v_post record;
  v_commenter record;
begin
  select author_id, title into v_post from public.posts where id = new.post_id;
  if v_post.author_id is null or v_post.author_id = new.user_id then return new; end if;
  select full_name, username into v_commenter from public.profiles where id = new.user_id;
  insert into public.notifications (user_id, from_user_id, type, title, body, target_id)
  values (
    v_post.author_id, new.user_id, 'comment',
    coalesce(v_commenter.full_name, v_commenter.username, 'Quelqu''un') || ' a commenté ton post',
    substring(new.content, 1, 100),
    new.post_id
  );
  return new;
end; $$;

drop trigger if exists trg_notify_comment on public.comments;
create trigger trg_notify_comment
  after insert on public.comments
  for each row execute function public.notify_on_comment();

-- ── Trigger: notification on follow ──────────────────────────────
create or replace function public.notify_on_follow()
returns trigger language plpgsql security definer as $$
declare
  v_follower record;
begin
  select full_name, username into v_follower from public.profiles where id = new.follower_id;
  insert into public.notifications (user_id, from_user_id, type, title, body)
  values (
    new.following_id, new.follower_id, 'follow',
    coalesce(v_follower.full_name, v_follower.username, 'Quelqu''un') || ' te suit maintenant',
    'Tu as un nouvel abonné !'
  );
  return new;
end; $$;

drop trigger if exists trg_notify_follow on public.follows;
create trigger trg_notify_follow
  after insert on public.follows
  for each row execute function public.notify_on_follow();

-- ── Trigger: notification on message reaction ─────────────────────
create or replace function public.notify_on_msg_reaction()
returns trigger language plpgsql security definer as $$
declare
  v_msg record;
  v_reactor record;
begin
  select sender_id, content into v_msg from public.messages where id = new.message_id;
  if v_msg.sender_id is null or v_msg.sender_id = new.user_id then return new; end if;
  select full_name, username into v_reactor from public.profiles where id = new.user_id;
  insert into public.notifications (user_id, from_user_id, type, title, body, target_id)
  values (
    v_msg.sender_id, new.user_id, 'reaction',
    coalesce(v_reactor.full_name, v_reactor.username, 'Quelqu''un') || ' a réagi ' || new.emoji || ' à ton message',
    substring(v_msg.content, 1, 60),
    new.message_id
  );
  return new;
end; $$;

drop trigger if exists trg_notify_msg_reaction on public.message_reactions;
create trigger trg_notify_msg_reaction
  after insert on public.message_reactions
  for each row execute function public.notify_on_msg_reaction();

-- ================================================================
-- 14. FONCTION RPC — get_or_create_dm (atomic DM creation)
-- ================================================================

create or replace function public.get_or_create_dm(other_user_id uuid)
returns uuid language plpgsql security definer as $$
declare
  v_my_id  uuid := auth.uid();
  v_a      uuid;
  v_b      uuid;
  v_conv   uuid;
begin
  if v_my_id is null then raise exception 'Not authenticated'; end if;
  if v_my_id = other_user_id then raise exception 'Cannot DM yourself'; end if;
  -- Ordonner les participants pour respecter la contrainte unique
  if v_my_id < other_user_id then v_a := v_my_id; v_b := other_user_id;
  else v_a := other_user_id; v_b := v_my_id; end if;
  -- Chercher une conversation existante
  select id into v_conv from public.conversations
  where participant_a = v_a and participant_b = v_b limit 1;
  -- Créer si inexistante
  if v_conv is null then
    insert into public.conversations (participant_a, participant_b)
    values (v_a, v_b) returning id into v_conv;
  end if;
  return v_conv;
end; $$;

-- ================================================================
-- 15. STORAGE BUCKET (si pas encore créé)
-- ================================================================

insert into storage.buckets (id, name, public)
values ('bloc-media', 'bloc-media', true)
on conflict (id) do nothing;

-- Politiques RLS sur storage.objects (méthode correcte dans Supabase)
-- Upload : tout utilisateur authentifié peut uploader
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'bloc_media_upload'
  ) then
    create policy "bloc_media_upload"
      on storage.objects for insert
      to authenticated
      with check (bucket_id = 'bloc-media');
  end if;
end $$;

-- Lecture publique : tout le monde peut lire
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'bloc_media_select'
  ) then
    create policy "bloc_media_select"
      on storage.objects for select
      to public
      using (bucket_id = 'bloc-media');
  end if;
end $$;

-- Update/Delete : seul le propriétaire du fichier
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'bloc_media_owner'
  ) then
    create policy "bloc_media_owner"
      on storage.objects for all
      to authenticated
      using (bucket_id = 'bloc-media' and owner = auth.uid());
  end if;
end $$;

-- ================================================================
-- 16. SANITY CHECK — vérifier les tables créées
-- ================================================================

select
  schemaname,
  tablename,
  rowsecurity
from pg_tables
where schemaname = 'public'
order by tablename;

-- ================================================================
-- FIN DU SCRIPT
-- ================================================================
