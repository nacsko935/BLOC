-- Messages + Groups V1 (Supabase)
-- Execute in SQL editor

create extension if not exists pgcrypto;

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('dm','group')),
  title text,
  description text,
  filiere text,
  privacy text not null default 'public' check (privacy in ('public','private')),
  avatar_color text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.conversation_members (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  last_read_at timestamptz,
  primary key (conversation_id, user_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_conversation_members_user on public.conversation_members(user_id);
create index if not exists idx_conversation_members_conversation on public.conversation_members(conversation_id);
create index if not exists idx_messages_conversation_created on public.messages(conversation_id, created_at desc);
create index if not exists idx_messages_sender on public.messages(sender_id);

alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;

-- conversations: readable if member OR public group
create policy if not exists "conversations_select_if_member_or_public"
on public.conversations
for select to authenticated
using (
  exists (
    select 1 from public.conversation_members cm
    where cm.conversation_id = conversations.id and cm.user_id = auth.uid()
  )
  or (type = 'group' and privacy = 'public')
);

create policy if not exists "conversations_insert_auth"
on public.conversations
for insert to authenticated
with check (auth.uid() = created_by);

create policy if not exists "conversations_update_creator"
on public.conversations
for update to authenticated
using (auth.uid() = created_by)
with check (auth.uid() = created_by);

create policy if not exists "conversations_delete_creator"
on public.conversations
for delete to authenticated
using (auth.uid() = created_by);

-- members: user can read own memberships, and memberships of conversations where user is member
create policy if not exists "members_select_if_member"
on public.conversation_members
for select to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1 from public.conversation_members cm2
    where cm2.conversation_id = conversation_members.conversation_id
      and cm2.user_id = auth.uid()
  )
);

create policy if not exists "members_insert_self"
on public.conversation_members
for insert to authenticated
with check (user_id = auth.uid());

create policy if not exists "members_update_self"
on public.conversation_members
for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy if not exists "members_delete_self"
on public.conversation_members
for delete to authenticated
using (user_id = auth.uid());

-- messages: readable/sendable only for conversation members
create policy if not exists "messages_select_if_member"
on public.messages
for select to authenticated
using (
  exists (
    select 1 from public.conversation_members cm
    where cm.conversation_id = messages.conversation_id and cm.user_id = auth.uid()
  )
);

create policy if not exists "messages_insert_if_member"
on public.messages
for insert to authenticated
with check (
  sender_id = auth.uid()
  and exists (
    select 1 from public.conversation_members cm
    where cm.conversation_id = messages.conversation_id and cm.user_id = auth.uid()
  )
);

notify pgrst, 'reload schema';