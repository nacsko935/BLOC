-- BLOC V1 schema (Auth + Profiles + Feed)
-- Run in Supabase SQL Editor

create extension if not exists pgcrypto;

-- Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  full_name text,
  bio text,
  filiere text,
  niveau text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Posts
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  filiere text,
  title text,
  content text not null,
  type text not null default 'text' check (type in ('text','pdf','qcm')),
  attachment_url text,
  created_at timestamptz not null default now()
);

-- Likes
create table if not exists public.post_likes (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

-- Saves
create table if not exists public.post_saves (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

-- Comments
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_posts_created_at on public.posts(created_at desc);
create index if not exists idx_posts_author_id on public.posts(author_id);
create index if not exists idx_comments_post_id on public.comments(post_id);
create index if not exists idx_post_likes_post_id on public.post_likes(post_id);
create index if not exists idx_post_saves_post_id on public.post_saves(post_id);

alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.post_likes enable row level security;
alter table public.post_saves enable row level security;
alter table public.comments enable row level security;

-- Profiles policies
create policy if not exists "profiles_select_auth"
  on public.profiles for select
  to authenticated
  using (true);

create policy if not exists "profiles_upsert_own"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

create policy if not exists "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Posts policies
create policy if not exists "posts_select_auth"
  on public.posts for select
  to authenticated
  using (true);

create policy if not exists "posts_insert_own"
  on public.posts for insert
  to authenticated
  with check (auth.uid() = author_id);

create policy if not exists "posts_update_own"
  on public.posts for update
  to authenticated
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

create policy if not exists "posts_delete_own"
  on public.posts for delete
  to authenticated
  using (auth.uid() = author_id);

-- Likes policies
create policy if not exists "likes_select_auth"
  on public.post_likes for select
  to authenticated
  using (true);

create policy if not exists "likes_insert_own"
  on public.post_likes for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy if not exists "likes_delete_own"
  on public.post_likes for delete
  to authenticated
  using (auth.uid() = user_id);

-- Saves policies
create policy if not exists "saves_select_auth"
  on public.post_saves for select
  to authenticated
  using (true);

create policy if not exists "saves_insert_own"
  on public.post_saves for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy if not exists "saves_delete_own"
  on public.post_saves for delete
  to authenticated
  using (auth.uid() = user_id);

-- Comments policies
create policy if not exists "comments_select_auth"
  on public.comments for select
  to authenticated
  using (true);

create policy if not exists "comments_insert_own"
  on public.comments for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy if not exists "comments_update_own"
  on public.comments for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy if not exists "comments_delete_own"
  on public.comments for delete
  to authenticated
  using (auth.uid() = user_id);

-- Refresh PostgREST schema cache immediately
notify pgrst, 'reload schema';