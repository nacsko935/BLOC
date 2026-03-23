-- ================================================================
-- BLOC — Messagerie v3 : audio, présence, groupes privés complets
-- Supabase > SQL Editor > New Query > Coller > Run
-- ================================================================

-- 1. Colonne role dans group_members (admin / member)
alter table public.group_members
  add column if not exists role text not null default 'member'
    check (role in ('admin','member'));

-- 2. Colonnes audio/media dans messages (si pas déjà là)
alter table public.messages
  add column if not exists media_url  text;
alter table public.messages
  add column if not exists media_type text check (media_type in ('audio','image','video','file') or media_type is null);
alter table public.messages
  add column if not exists status text not null default 'sent'
    check (status in ('sent','delivered','read'));

-- 3. Colonnes audio/media dans group_messages
alter table public.group_messages
  add column if not exists media_url  text;
alter table public.group_messages
  add column if not exists media_type text check (media_type in ('audio','image','video','file') or media_type is null);

-- 4. Présence utilisateur dans profiles
alter table public.profiles
  add column if not exists last_seen_at timestamptz default now();
alter table public.profiles
  add column if not exists is_online boolean not null default false;

-- 5. Table conversation_reads
create table if not exists public.conversation_reads (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id         uuid not null references auth.users(id) on delete cascade,
  read_at         timestamptz not null default now(),
  primary key (conversation_id, user_id)
);

-- 6. Table message_reactions
create table if not exists public.message_reactions (
  id         uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.messages(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  emoji      text not null,
  created_at timestamptz not null default now(),
  unique (message_id, user_id, emoji)
);

-- 7. Bucket Supabase Storage pour les audios/médias messages
insert into storage.buckets (id, name, public)
values ('messages-media', 'messages-media', true)
on conflict (id) do nothing;

-- Policy lecture publique sur messages-media
drop policy if exists "messages_media_select" on storage.objects;
create policy "messages_media_select" on storage.objects
  for select using (bucket_id = 'messages-media');

drop policy if exists "messages_media_insert" on storage.objects;
create policy "messages_media_insert" on storage.objects
  for insert with check (bucket_id = 'messages-media' and auth.role() = 'authenticated');

drop policy if exists "messages_media_delete" on storage.objects;
create policy "messages_media_delete" on storage.objects
  for delete using (bucket_id = 'messages-media' and auth.uid()::text = (storage.foldername(name))[1]);

-- 8. RLS sur nouvelles tables
alter table public.message_reactions  enable row level security;
alter table public.conversation_reads enable row level security;

drop policy if exists "reactions_all"  on public.message_reactions;
drop policy if exists "reads_all"      on public.conversation_reads;

create policy "reactions_all" on public.message_reactions
  using (true) with check (auth.uid() = user_id);

create policy "reads_all" on public.conversation_reads
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 9. Fonction update_presence
create or replace function public.update_presence(p_online boolean)
returns void language plpgsql security definer as $$
begin
  update public.profiles
  set is_online = p_online, last_seen_at = now()
  where id = auth.uid();
end;
$$;

-- 10. Fonction mark_messages_read
create or replace function public.mark_messages_read(p_conversation_id uuid)
returns void language plpgsql security definer as $$
begin
  update public.messages
  set status = 'read'
  where conversation_id = p_conversation_id
    and sender_id != auth.uid()
    and status != 'read';

  insert into public.conversation_reads (conversation_id, user_id, read_at)
  values (p_conversation_id, auth.uid(), now())
  on conflict (conversation_id, user_id) do update set read_at = now();
end;
$$;

-- 11. Indexes
create index if not exists idx_messages_conv_created on public.messages(conversation_id, created_at asc);
create index if not exists idx_group_messages_group  on public.group_messages(group_id, created_at asc);
create index if not exists idx_reactions_msg         on public.message_reactions(message_id);
create index if not exists idx_profiles_online       on public.profiles(is_online, last_seen_at desc);
create index if not exists idx_group_members_role    on public.group_members(group_id, role);

select 'MESSAGING_V3 OK ✅' as result;

-- ================================================================
-- AJOUT : Invitations groupes privés
-- ================================================================

-- Table invitations groupe
create table if not exists public.group_invitations (
  id         uuid primary key default gen_random_uuid(),
  group_id   uuid not null references public.groups(id) on delete cascade,
  invited_by uuid not null references auth.users(id) on delete cascade,
  invited_user_id uuid not null references auth.users(id) on delete cascade,
  status     text not null default 'pending' check (status in ('pending','accepted','declined')),
  created_at timestamptz not null default now(),
  unique (group_id, invited_user_id)
);

alter table public.group_invitations enable row level security;

-- Lecture : invité ou admin du groupe
drop policy if exists "invitations_select" on public.group_invitations;
create policy "invitations_select" on public.group_invitations
  for select using (
    auth.uid() = invited_user_id
    or auth.uid() = invited_by
    or exists (
      select 1 from public.group_members
      where group_id = group_invitations.group_id
      and user_id = auth.uid()
      and role = 'admin'
    )
  );

-- Création : membres du groupe peuvent inviter
drop policy if exists "invitations_insert" on public.group_invitations;
create policy "invitations_insert" on public.group_invitations
  for insert with check (
    auth.uid() = invited_by
    and exists (
      select 1 from public.group_members
      where group_id = group_invitations.group_id
      and user_id = auth.uid()
    )
  );

-- Update : seulement l'invité peut accepter/décliner
drop policy if exists "invitations_update" on public.group_invitations;
create policy "invitations_update" on public.group_invitations
  for update using (auth.uid() = invited_user_id);

-- Delete : invité ou admin
drop policy if exists "invitations_delete" on public.group_invitations;
create policy "invitations_delete" on public.group_invitations
  for delete using (auth.uid() = invited_user_id or auth.uid() = invited_by);

-- Index
create index if not exists idx_invitations_user   on public.group_invitations(invited_user_id, status);
create index if not exists idx_invitations_group  on public.group_invitations(group_id, status);

select 'INVITATIONS OK ✅' as result;
