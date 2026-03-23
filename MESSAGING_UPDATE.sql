-- ================================================================
-- BLOC — Messagerie v2 : statut message + présence utilisateur
-- Supabase > SQL Editor > New Query > Coller > Run
-- ================================================================

-- 1. Colonne statut sur messages (envoyé → reçu → vu)
alter table public.messages
  add column if not exists status text not null default 'sent'
    check (status in ('sent','delivered','read'));

-- 2. Colonne reply_to_id (déjà peut-être là)
alter table public.messages
  add column if not exists reply_to_id uuid references public.messages(id) on delete set null;

-- 3. Table réactions aux messages
create table if not exists public.message_reactions (
  id         uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.messages(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  emoji      text not null,
  created_at timestamptz not null default now(),
  unique (message_id, user_id, emoji)
);

-- 4. Présence utilisateur dans profiles
alter table public.profiles
  add column if not exists last_seen_at timestamptz default now();

alter table public.profiles
  add column if not exists is_online boolean not null default false;

-- 5. Table conversation_reads (si pas déjà là)
create table if not exists public.conversation_reads (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id         uuid not null references auth.users(id) on delete cascade,
  read_at         timestamptz not null default now(),
  primary key (conversation_id, user_id)
);

-- 6. RLS
alter table public.message_reactions enable row level security;
alter table public.conversation_reads enable row level security;

drop policy if exists "reactions_select" on public.message_reactions;
drop policy if exists "reactions_insert" on public.message_reactions;
drop policy if exists "reactions_delete" on public.message_reactions;
drop policy if exists "reads_select"     on public.conversation_reads;
drop policy if exists "reads_upsert"     on public.conversation_reads;

create policy "reactions_select" on public.message_reactions for select using (true);
create policy "reactions_insert" on public.message_reactions for insert with check (auth.uid() = user_id);
create policy "reactions_delete" on public.message_reactions for delete using (auth.uid() = user_id);
create policy "reads_select"     on public.conversation_reads for select using (auth.uid() = user_id);
create policy "reads_upsert"     on public.conversation_reads for all    using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 7. Fonction mise à jour présence
create or replace function public.update_presence(p_online boolean)
returns void language plpgsql security definer as $$
begin
  update public.profiles
  set is_online = p_online, last_seen_at = now()
  where id = auth.uid();
end;
$$;

-- 8. Marquer messages comme reçus/lus
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

-- 9. Index
create index if not exists idx_messages_status on public.messages(conversation_id, status);
create index if not exists idx_reactions_message on public.message_reactions(message_id);
create index if not exists idx_profiles_online on public.profiles(is_online, last_seen_at);

select 'MESSAGING_UPDATE v2 OK ✅' as result;
