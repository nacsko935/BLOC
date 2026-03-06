-- ─────────────────────────────────────────────────────────────────────────────
-- BLOC — Supabase SQL à exécuter (notifications réelles + avatar lock)
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Table notifications (si elle n'existe pas)
create table if not exists public.notifications (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  from_user_id    uuid references auth.users(id) on delete set null,
  type            text not null check (type in ('follow','like','comment','repost','message','mention')),
  title           text not null,
  body            text not null,
  read            boolean not null default false,
  target_id       text,
  created_at      timestamptz not null default now()
);

-- Index for fast queries per user
create index if not exists notifications_user_id_idx on public.notifications(user_id, created_at desc);

-- Enable Row Level Security
alter table public.notifications enable row level security;

-- Users can only read their own notifications
drop policy if exists "Users read own notifications" on public.notifications;
create policy "Users read own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

-- Anyone authenticated can insert a notification (for follows, likes, etc.)
drop policy if exists "Authenticated can insert notifications" on public.notifications;
create policy "Authenticated can insert notifications"
  on public.notifications for insert
  with check (auth.uid() is not null);

-- Users can update (mark as read) their own notifications
drop policy if exists "Users update own notifications" on public.notifications;
create policy "Users update own notifications"
  on public.notifications for update
  using (auth.uid() = user_id);

-- Enable realtime
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
END $$;

-- 2. Add avatar_changed_at and is_first_login to profiles (if not exists)
alter table public.profiles
  add column if not exists avatar_changed_at timestamptz,
  add column if not exists is_first_login boolean default true;

-- 3. Ensure follows table has correct structure
create table if not exists public.follows (
  follower_id  uuid not null references auth.users(id) on delete cascade,
  following_id uuid not null references auth.users(id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (follower_id, following_id)
);

alter table public.follows enable row level security;

drop policy if exists "Users can follow" on public.follows;
create policy "Users can follow"
  on public.follows for insert
  with check (auth.uid() = follower_id);

drop policy if exists "Users can unfollow" on public.follows;
create policy "Users can unfollow"
  on public.follows for delete
  using (auth.uid() = follower_id);

drop policy if exists "Anyone can read follows" on public.follows;
create policy "Anyone can read follows"
  on public.follows for select
  using (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- DONE - Run this in Supabase SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

-- ── post_likes table for counting likes per author ──────────────────────────
create table if not exists public.post_likes (
  id              uuid primary key default gen_random_uuid(),
  post_id         uuid not null,
  post_author_id  uuid references auth.users(id) on delete cascade,
  user_id         uuid not null references auth.users(id) on delete cascade,
  created_at      timestamptz not null default now(),
  unique(post_id, user_id)
);

alter table public.post_likes enable row level security;

drop policy if exists "Anyone can read post_likes" on public.post_likes;
create policy "Anyone can read post_likes"
  on public.post_likes for select using (true);

drop policy if exists "Authenticated can like" on public.post_likes;
create policy "Authenticated can like"
  on public.post_likes for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can unlike" on public.post_likes;
create policy "Users can unlike"
  on public.post_likes for delete
  using (auth.uid() = user_id);
