-- ================================================================
-- BLOC — Script SQL COMPLET — UN SEUL FICHIER À EXÉCUTER
-- Supabase > SQL Editor > New Query > Coller > Run
-- ================================================================

-- ── 1. Extensions ────────────────────────────────────────────────
create extension if not exists pgcrypto;

-- ── 2. Tables ────────────────────────────────────────────────────

create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  username   text unique,
  full_name  text,
  bio        text,
  filiere    text,
  niveau     text,
  avatar_url text,
  school     text,
  track      text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.posts (
  id             uuid primary key default gen_random_uuid(),
  author_id      uuid not null references auth.users(id) on delete cascade,
  filiere        text,
  title          text,
  content        text not null,
  type           text not null default 'text' check (type in ('text','pdf','qcm')),
  attachment_url text,
  created_at     timestamptz not null default now()
);

create table if not exists public.post_likes (
  post_id    uuid not null references public.posts(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table if not exists public.post_saves (
  post_id    uuid not null references public.posts(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table if not exists public.comments (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references public.posts(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  content    text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.conversations (
  id            uuid primary key default gen_random_uuid(),
  participant_a uuid not null references auth.users(id) on delete cascade,
  participant_b uuid not null references auth.users(id) on delete cascade,
  created_at    timestamptz not null default now(),
  unique (participant_a, participant_b)
);

create table if not exists public.messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id       uuid not null references auth.users(id) on delete cascade,
  content         text,
  media_url       text,
  media_type      text check (media_type in ('audio','image','video') or media_type is null),
  created_at      timestamptz not null default now()
);

-- ── 3. Index ─────────────────────────────────────────────────────

create index if not exists idx_posts_created_at      on public.posts(created_at desc);
create index if not exists idx_posts_author_id       on public.posts(author_id);
create index if not exists idx_comments_post_id      on public.comments(post_id);
create index if not exists idx_post_likes_post_id    on public.post_likes(post_id);
create index if not exists idx_post_saves_post_id    on public.post_saves(post_id);
create index if not exists idx_messages_conversation on public.messages(conversation_id, created_at asc);

-- ── 4. RLS ───────────────────────────────────────────────────────

alter table public.profiles      enable row level security;
alter table public.posts         enable row level security;
alter table public.post_likes    enable row level security;
alter table public.post_saves    enable row level security;
alter table public.comments      enable row level security;
alter table public.conversations enable row level security;
alter table public.messages      enable row level security;

-- ── 5. Policies ──────────────────────────────────────────────────

do $$ begin

  if not exists (select 1 from pg_policies where policyname='profiles_select_auth' and tablename='profiles') then
    create policy "profiles_select_auth" on public.profiles for select to authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where policyname='profiles_insert_own' and tablename='profiles') then
    create policy "profiles_insert_own" on public.profiles for insert to authenticated with check (auth.uid() = id);
  end if;
  if not exists (select 1 from pg_policies where policyname='profiles_update_own' and tablename='profiles') then
    create policy "profiles_update_own" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
  end if;

  if not exists (select 1 from pg_policies where policyname='posts_select_auth' and tablename='posts') then
    create policy "posts_select_auth" on public.posts for select to authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where policyname='posts_insert_own' and tablename='posts') then
    create policy "posts_insert_own" on public.posts for insert to authenticated with check (auth.uid() = author_id);
  end if;
  if not exists (select 1 from pg_policies where policyname='posts_delete_own' and tablename='posts') then
    create policy "posts_delete_own" on public.posts for delete to authenticated using (auth.uid() = author_id);
  end if;

  if not exists (select 1 from pg_policies where policyname='likes_select_auth' and tablename='post_likes') then
    create policy "likes_select_auth" on public.post_likes for select to authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where policyname='likes_insert_own' and tablename='post_likes') then
    create policy "likes_insert_own" on public.post_likes for insert to authenticated with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where policyname='likes_delete_own' and tablename='post_likes') then
    create policy "likes_delete_own" on public.post_likes for delete to authenticated using (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies where policyname='saves_select_auth' and tablename='post_saves') then
    create policy "saves_select_auth" on public.post_saves for select to authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where policyname='saves_insert_own' and tablename='post_saves') then
    create policy "saves_insert_own" on public.post_saves for insert to authenticated with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where policyname='saves_delete_own' and tablename='post_saves') then
    create policy "saves_delete_own" on public.post_saves for delete to authenticated using (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies where policyname='comments_select_auth' and tablename='comments') then
    create policy "comments_select_auth" on public.comments for select to authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where policyname='comments_insert_own' and tablename='comments') then
    create policy "comments_insert_own" on public.comments for insert to authenticated with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where policyname='comments_delete_own' and tablename='comments') then
    create policy "comments_delete_own" on public.comments for delete to authenticated using (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies where policyname='conversations_select' and tablename='conversations') then
    create policy "conversations_select" on public.conversations for select to authenticated
      using (auth.uid() = participant_a or auth.uid() = participant_b);
  end if;
  if not exists (select 1 from pg_policies where policyname='conversations_insert' and tablename='conversations') then
    create policy "conversations_insert" on public.conversations for insert to authenticated
      with check (auth.uid() = participant_a or auth.uid() = participant_b);
  end if;

  if not exists (select 1 from pg_policies where policyname='messages_select' and tablename='messages') then
    create policy "messages_select" on public.messages for select to authenticated using (
      exists (
        select 1 from public.conversations c
        where c.id = conversation_id
        and (c.participant_a = auth.uid() or c.participant_b = auth.uid())
      )
    );
  end if;
  if not exists (select 1 from pg_policies where policyname='messages_insert' and tablename='messages') then
    create policy "messages_insert" on public.messages for insert to authenticated
      with check (auth.uid() = sender_id);
  end if;

end $$;

-- ── 6. Storage bucket médias ─────────────────────────────────────

insert into storage.buckets (id, name, public)
values ('bloc-media', 'bloc-media', true)
on conflict (id) do nothing;

do $$ begin
  if not exists (select 1 from pg_policies where policyname='media_upload_auth' and tablename='objects' and schemaname='storage') then
    create policy "media_upload_auth" on storage.objects for insert to authenticated with check (bucket_id = 'bloc-media');
  end if;
  if not exists (select 1 from pg_policies where policyname='media_select_public' and tablename='objects' and schemaname='storage') then
    create policy "media_select_public" on storage.objects for select using (bucket_id = 'bloc-media');
  end if;
end $$;

-- ── 7. Comptes bots dans auth.users ──────────────────────────────
-- On crée de vrais comptes auth avec des emails fictifs @bloc.internal
-- Mot de passe hashé inutilisable = les bots ne peuvent pas se connecter

do $$
declare
  bot_ids uuid[] := array[
    'b0000000-0000-0000-0000-000000000001'::uuid,
    'b0000000-0000-0000-0000-000000000002'::uuid,
    'b0000000-0000-0000-0000-000000000003'::uuid,
    'b0000000-0000-0000-0000-000000000004'::uuid,
    'b0000000-0000-0000-0000-000000000005'::uuid
  ];
  bot_emails text[] := array[
    'bloc.team@bloc.internal',
    'prof.martin@bloc.internal',
    'nadia.selmi@bloc.internal',
    'samir.ds@bloc.internal',
    'leila.qcm@bloc.internal'
  ];
  i int;
begin
  for i in 1..5 loop
    if not exists (select 1 from auth.users where id = bot_ids[i]) then
      insert into auth.users (
        id, instance_id, email, encrypted_password,
        email_confirmed_at, created_at, updated_at,
        raw_app_meta_data, raw_user_meta_data,
        is_super_admin, role, aud
      ) values (
        bot_ids[i],
        '00000000-0000-0000-0000-000000000000',
        bot_emails[i],
        crypt('bloc-bot-no-login-' || i::text, gen_salt('bf')),
        now(), now(), now(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{}'::jsonb,
        false, 'authenticated', 'authenticated'
      );
    end if;
  end loop;
end $$;

-- ── 8. Profils bots ───────────────────────────────────────────────

insert into public.profiles (id, username, full_name, bio, filiere, niveau, avatar_url)
values
  ('b0000000-0000-0000-0000-000000000001', 'bloc.team',    'BLOC Team',     'Ressources officielles et annonces BLOC.',             'Général',       'Staff',      null),
  ('b0000000-0000-0000-0000-000000000002', 'prof.martin',  'Prof. Martin',  'Enseignant Réseaux & Systèmes. Fiches, QCM, sujets.',  'Informatique',  'Enseignant', null),
  ('b0000000-0000-0000-0000-000000000003', 'nadia.selmi',  'Nadia Selmi',   'M1 Dev — je partage mes fiches de révision.',          'Développement', 'M1',         null),
  ('b0000000-0000-0000-0000-000000000004', 'samir.ds',     'Samir K.',      'Data Science & IA. Fan de Python.',                   'IA / Data',     'M2',         null),
  ('b0000000-0000-0000-0000-000000000005', 'leila.qcm',    'Leila M.',      'L3 Info — je fabrique des QCM pour m''entraîner.',    'Informatique',  'L3',         null)
on conflict (id) do nothing;

-- ── 9. Posts bots ─────────────────────────────────────────────────

insert into public.posts (id, author_id, filiere, title, content, type, attachment_url, created_at)
values
  ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Général',       'Bienvenue sur BLOC 🎉',                   'BLOC est ta plateforme pour partager des cours, QCM et fiches avec ta communauté étudiante. Commence par créer ta première publication !',           'text', null, now() - interval '24 hours'),
  ('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'Informatique',  'QCM Sécurité Réseaux – Corrigé',          '15 questions sur les firewalls, VPN et protocoles SSL/TLS. Niveau partiel. Corrigé détaillé inclus.',                                                'qcm',  null, now() - interval '22 hours'),
  ('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003', 'Développement', 'Fiche React Native – Hooks essentiels',   'J''ai condensé useState, useEffect, useCallback et useRef en 1 page. Patterns de navigation inclus.',                                                'pdf',  null, now() - interval '18 hours'),
  ('c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000004', 'IA / Data',     'QCM IA Générative – 20 questions',        'Séries de questions sur les prompts, hallucinations et évaluation de modèles. Idéal pour se préparer à l''exam.',                                   'qcm',  null, now() - interval '14 hours'),
  ('c0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000005', 'Informatique',  'QCM SQL – Jointures & Sous-requêtes',     '15 questions pour tester les JOIN, sous-requêtes et agrégations. Niveau partiel L3.',                                                                'qcm',  null, now() - interval '10 hours'),
  ('c0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000002', 'Informatique',  'Sujet blanc Réseaux – Subnetting',        'Exercice corrigé sur le subnetting et le routage statique. 6 pages, niveau L2/L3.',                                                                  'pdf',  null, now() - interval '8 hours'),
  ('c0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000001', 'Général',       'Checklist candidature alternance 📋',     'Template de suivi de candidature + relances RH en 3 étapes. Utilisé par +200 étudiants l''an dernier.',                                             'text', null, now() - interval '6 hours'),
  ('c0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000003', 'Développement', 'Résumé SGBD – Jointures & Transactions',  'Plan compact pour couvrir jointures, index et transactions avant le partiel. 8 pages.',                                                               'pdf',  null, now() - interval '4 hours'),
  ('c0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000004', 'IA / Data',     'Comparatif MongoDB vs PostgreSQL',        'Fiche NoSQL : schéma, requêtes, cas d''usage. Préparation pour le workshop Data.',                                                                   'pdf',  null, now() - interval '2 hours'),
  ('c0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000002', 'Général',       'Méthodo oral technique – Structure STAR', 'Structure STAR + démo live en 7 min pour convaincre un jury. Utilisé en cours de soft skills.',                                                      'text', null, now() - interval '1 hour')
on conflict (id) do nothing;

-- ── 10. Recharger le cache PostgREST ─────────────────────────────

notify pgrst, 'reload schema';

select 'BLOC setup complet ✅ — tables + bots + storage prêts !' as status;
