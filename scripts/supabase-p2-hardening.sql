-- P2 hardening indexes + constraints (idempotent)

create extension if not exists pg_trgm;

create index if not exists idx_posts_created_desc on public.posts(created_at desc);
create index if not exists idx_posts_filiere_created_desc on public.posts(filiere, created_at desc);
create index if not exists idx_comments_post_created on public.comments(post_id, created_at);
create index if not exists idx_post_likes_post_id on public.post_likes(post_id);
create index if not exists idx_post_saves_post_id on public.post_saves(post_id);
create index if not exists idx_conversation_members_user_id on public.conversation_members(user_id);
create index if not exists idx_messages_conversation_created_desc on public.messages(conversation_id, created_at desc);
create index if not exists idx_push_tokens_user on public.push_tokens(user_id);

-- search indexes
create index if not exists idx_profiles_username_trgm on public.profiles using gin (username gin_trgm_ops);
create index if not exists idx_profiles_full_name_trgm on public.profiles using gin (full_name gin_trgm_ops);
create index if not exists idx_conversations_title_trgm on public.conversations using gin (title gin_trgm_ops);
create index if not exists idx_posts_title_trgm on public.posts using gin (title gin_trgm_ops);
create index if not exists idx_posts_content_trgm on public.posts using gin (content gin_trgm_ops);

-- unique-ish safety where needed already handled by PK/composites

notify pgrst, 'reload schema';