-- Avatar config support (idempotent)
-- Execute in Supabase SQL Editor on each environment.

alter table if exists public.profiles
  add column if not exists avatar_config jsonb;

comment on column public.profiles.avatar_config is
  'Avatar customizer JSON config (Bitmoji-like options).';

