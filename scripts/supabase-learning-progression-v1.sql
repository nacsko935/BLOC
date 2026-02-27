-- BLOC Learning (Red) + Progression (Green) domain
-- V1 schema + RLS + core functions (idempotent)

create extension if not exists pgcrypto;

-- ---------- Core identity ----------
create table if not exists public.creator_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  is_certified boolean not null default false,
  payout_method text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Learning catalog ----------
create table if not exists public.modules (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  filiere text,
  niveau text,
  subject text,
  duration_minutes int default 0,
  is_public boolean not null default false,
  is_paid boolean not null default false,
  price_cents int not null default 0,
  rating numeric(2,1) default 0,
  review_status text not null default 'draft', -- draft|in_review|approved|rejected
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  title text not null,
  content text,
  position int not null default 0,
  estimated_minutes int default 10,
  created_at timestamptz not null default now()
);

create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  title text not null,
  pass_score int not null default 70,
  is_final boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  prompt text not null,
  position int not null default 0
);

create table if not exists public.quiz_answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.quiz_questions(id) on delete cascade,
  label text not null,
  is_correct boolean not null default false
);

-- ---------- Enrollment / progress ----------
create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  module_id uuid not null references public.modules(id) on delete cascade,
  progress_percent int not null default 0,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  unique(user_id, module_id)
);

create table if not exists public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  module_id uuid not null references public.modules(id) on delete cascade,
  completed boolean not null default false,
  completed_at timestamptz,
  unique(user_id, lesson_id)
);

create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  module_id uuid not null references public.modules(id) on delete cascade,
  score int not null,
  passed boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------- Gamification ----------
create table if not exists public.badges (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  category text not null, -- theme|level|streak|certification
  xp_reward int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.user_badges (
  user_id uuid not null references auth.users(id) on delete cascade,
  badge_id uuid not null references public.badges(id) on delete cascade,
  earned_at timestamptz not null default now(),
  primary key(user_id, badge_id)
);

create table if not exists public.xp_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_name text not null,
  points int not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.streaks (
  user_id uuid primary key references auth.users(id) on delete cascade,
  current_streak int not null default 0,
  best_streak int not null default 0,
  last_active_date date
);

-- ---------- Creator moderation ----------
create table if not exists public.module_submissions (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  creator_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'in_review',
  notes text,
  submitted_at timestamptz not null default now()
);

create table if not exists public.moderation_reviews (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.module_submissions(id) on delete cascade,
  reviewer_id uuid not null references auth.users(id) on delete cascade,
  decision text not null, -- approved|rejected
  comment text,
  created_at timestamptz not null default now()
);

-- ---------- Marketplace ----------
create table if not exists public.marketplace_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  module_id uuid not null references public.modules(id) on delete cascade,
  amount_cents int not null,
  currency text not null default 'EUR',
  status text not null default 'paid', -- pending|paid|failed|refunded
  provider_ref text,
  created_at timestamptz not null default now()
);

create table if not exists public.creator_earnings (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references auth.users(id) on delete cascade,
  order_id uuid not null references public.marketplace_orders(id) on delete cascade,
  module_id uuid not null references public.modules(id) on delete cascade,
  gross_cents int not null,
  platform_fee_cents int not null,
  net_cents int not null,
  created_at timestamptz not null default now()
);

create table if not exists public.payouts (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references auth.users(id) on delete cascade,
  amount_cents int not null,
  status text not null default 'requested', -- requested|processing|paid|rejected
  requested_at timestamptz not null default now(),
  processed_at timestamptz
);

-- ---------- Progression ----------
create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  course_ref text,
  module_id uuid references public.modules(id) on delete set null,
  progress_percent int not null default 0,
  due_date date,
  created_at timestamptz not null default now()
);

create table if not exists public.deadlines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  category text,
  due_at timestamptz not null,
  priority text not null default 'important', -- urgent|important|normal
  created_at timestamptz not null default now()
);

create table if not exists public.recommendations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null, -- tip|next_action
  title text not null,
  body text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.library_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_type text not null, -- ai_content|module|resource|quiz
  item_ref text not null,
  title text,
  created_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.project_members (
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member',
  joined_at timestamptz not null default now(),
  primary key(project_id, user_id)
);

create table if not exists public.project_tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  creator_id uuid not null references auth.users(id) on delete cascade,
  assignee_id uuid references auth.users(id) on delete set null,
  title text not null,
  status text not null default 'todo', -- todo|doing|done
  due_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.project_files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  uploader_id uuid not null references auth.users(id) on delete cascade,
  file_url text not null,
  file_name text not null,
  created_at timestamptz not null default now()
);

-- ---------- Indexes ----------
create index if not exists idx_modules_public on public.modules(is_public, created_at desc);
create index if not exists idx_modules_filters on public.modules(filiere, niveau, subject);
create index if not exists idx_lessons_module on public.lessons(module_id, position);
create index if not exists idx_enrollments_user on public.enrollments(user_id);
create index if not exists idx_lesson_progress_user on public.lesson_progress(user_id, module_id);
create index if not exists idx_goals_user on public.goals(user_id);
create index if not exists idx_deadlines_user_due on public.deadlines(user_id, due_at);
create index if not exists idx_library_user on public.library_items(user_id, created_at desc);
create index if not exists idx_projects_owner on public.projects(owner_id, created_at desc);

-- ---------- RLS ----------
alter table public.creator_profiles enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_answers enable row level security;
alter table public.enrollments enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.badges enable row level security;
alter table public.user_badges enable row level security;
alter table public.xp_events enable row level security;
alter table public.streaks enable row level security;
alter table public.module_submissions enable row level security;
alter table public.moderation_reviews enable row level security;
alter table public.marketplace_orders enable row level security;
alter table public.creator_earnings enable row level security;
alter table public.payouts enable row level security;
alter table public.goals enable row level security;
alter table public.deadlines enable row level security;
alter table public.recommendations enable row level security;
alter table public.library_items enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.project_tasks enable row level security;
alter table public.project_files enable row level security;

-- public catalog read
drop policy if exists "modules_read_public" on public.modules;
create policy "modules_read_public" on public.modules
for select to authenticated
using (
  is_public = true
  or creator_id = auth.uid()
  or exists (
    select 1 from public.marketplace_orders mo
    where mo.module_id = modules.id and mo.user_id = auth.uid() and mo.status = 'paid'
  )
);

drop policy if exists "modules_insert_certified" on public.modules;
create policy "modules_insert_certified" on public.modules
for insert to authenticated
with check (
  creator_id = auth.uid()
  and exists (
    select 1 from public.creator_profiles cp
    where cp.user_id = auth.uid() and cp.is_certified = true
  )
);

drop policy if exists "modules_update_creator" on public.modules;
create policy "modules_update_creator" on public.modules
for update to authenticated
using (creator_id = auth.uid())
with check (creator_id = auth.uid());

-- child learning content readable if module readable
drop policy if exists "lessons_read_if_module_access" on public.lessons;
create policy "lessons_read_if_module_access" on public.lessons
for select to authenticated
using (
  exists (
    select 1 from public.modules m
    where m.id = lessons.module_id
      and (
        m.is_public = true
        or m.creator_id = auth.uid()
        or exists (
          select 1 from public.marketplace_orders mo
          where mo.module_id = m.id and mo.user_id = auth.uid() and mo.status = 'paid'
        )
      )
  )
);

drop policy if exists "quizzes_read_if_module_access" on public.quizzes;
create policy "quizzes_read_if_module_access" on public.quizzes
for select to authenticated
using (
  exists (
    select 1 from public.modules m
    where m.id = quizzes.module_id
      and (
        m.is_public = true
        or m.creator_id = auth.uid()
        or exists (
          select 1 from public.marketplace_orders mo
          where mo.module_id = m.id and mo.user_id = auth.uid() and mo.status = 'paid'
        )
      )
  )
);

drop policy if exists "quiz_questions_read_auth" on public.quiz_questions;
create policy "quiz_questions_read_auth" on public.quiz_questions for select to authenticated using (true);
drop policy if exists "quiz_answers_read_auth" on public.quiz_answers;
create policy "quiz_answers_read_auth" on public.quiz_answers for select to authenticated using (true);
drop policy if exists "badges_read_auth" on public.badges;
create policy "badges_read_auth" on public.badges for select to authenticated using (true);

-- private user-owned data
do $$
begin
  execute 'drop policy if exists "enrollments_own_all" on public.enrollments';
  execute 'create policy "enrollments_own_all" on public.enrollments for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid())';
  execute 'drop policy if exists "lesson_progress_own_all" on public.lesson_progress';
  execute 'create policy "lesson_progress_own_all" on public.lesson_progress for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid())';
  execute 'drop policy if exists "quiz_attempts_own_all" on public.quiz_attempts';
  execute 'create policy "quiz_attempts_own_all" on public.quiz_attempts for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid())';
  execute 'drop policy if exists "user_badges_own_all" on public.user_badges';
  execute 'create policy "user_badges_own_all" on public.user_badges for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid())';
  execute 'drop policy if exists "xp_events_own_all" on public.xp_events';
  execute 'create policy "xp_events_own_all" on public.xp_events for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid())';
  execute 'drop policy if exists "streaks_own_all" on public.streaks';
  execute 'create policy "streaks_own_all" on public.streaks for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid())';
  execute 'drop policy if exists "orders_own_all" on public.marketplace_orders';
  execute 'create policy "orders_own_all" on public.marketplace_orders for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid())';
  execute 'drop policy if exists "goals_own_all" on public.goals';
  execute 'create policy "goals_own_all" on public.goals for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid())';
  execute 'drop policy if exists "deadlines_own_all" on public.deadlines';
  execute 'create policy "deadlines_own_all" on public.deadlines for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid())';
  execute 'drop policy if exists "recommendations_own_all" on public.recommendations';
  execute 'create policy "recommendations_own_all" on public.recommendations for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid())';
  execute 'drop policy if exists "library_items_own_all" on public.library_items';
  execute 'create policy "library_items_own_all" on public.library_items for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid())';
  execute 'drop policy if exists "creator_profiles_own_all" on public.creator_profiles';
  execute 'create policy "creator_profiles_own_all" on public.creator_profiles for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid())';
end $$;

-- project member access
drop policy if exists "projects_if_member" on public.projects;
create policy "projects_if_member" on public.projects
for select to authenticated
using (
  owner_id = auth.uid()
  or exists (select 1 from public.project_members pm where pm.project_id = projects.id and pm.user_id = auth.uid())
);
drop policy if exists "projects_insert_owner" on public.projects;
create policy "projects_insert_owner" on public.projects
for insert to authenticated
with check (owner_id = auth.uid());

drop policy if exists "project_members_if_member" on public.project_members;
create policy "project_members_if_member" on public.project_members
for select to authenticated
using (
  user_id = auth.uid()
  or exists (select 1 from public.project_members pm where pm.project_id = project_members.project_id and pm.user_id = auth.uid())
);
drop policy if exists "project_members_insert_owner_or_self" on public.project_members;
create policy "project_members_insert_owner_or_self" on public.project_members
for insert to authenticated
with check (
  user_id = auth.uid()
  or exists (select 1 from public.projects p where p.id = project_members.project_id and p.owner_id = auth.uid())
);

drop policy if exists "project_tasks_if_member" on public.project_tasks;
create policy "project_tasks_if_member" on public.project_tasks
for all to authenticated
using (
  exists (select 1 from public.project_members pm where pm.project_id = project_tasks.project_id and pm.user_id = auth.uid())
  or exists (select 1 from public.projects p where p.id = project_tasks.project_id and p.owner_id = auth.uid())
)
with check (
  exists (select 1 from public.project_members pm where pm.project_id = project_tasks.project_id and pm.user_id = auth.uid())
  or exists (select 1 from public.projects p where p.id = project_tasks.project_id and p.owner_id = auth.uid())
);

drop policy if exists "project_files_if_member" on public.project_files;
create policy "project_files_if_member" on public.project_files
for all to authenticated
using (
  exists (select 1 from public.project_members pm where pm.project_id = project_files.project_id and pm.user_id = auth.uid())
  or exists (select 1 from public.projects p where p.id = project_files.project_id and p.owner_id = auth.uid())
)
with check (
  uploader_id = auth.uid()
);

-- ---------- Core flow functions ----------
create or replace function public.start_module(p_module_id uuid)
returns uuid
language plpgsql
security definer
as $$
declare
  v_user uuid := auth.uid();
  v_enrollment_id uuid;
begin
  if v_user is null then
    raise exception 'Not authenticated';
  end if;

  insert into public.enrollments(user_id, module_id)
  values (v_user, p_module_id)
  on conflict (user_id, module_id) do update set started_at = public.enrollments.started_at
  returning id into v_enrollment_id;

  return v_enrollment_id;
end;
$$;

create or replace function public.complete_lesson(p_lesson_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  v_user uuid := auth.uid();
  v_module uuid;
  v_total int;
  v_done int;
  v_progress int;
begin
  if v_user is null then
    raise exception 'Not authenticated';
  end if;

  select module_id into v_module from public.lessons where id = p_lesson_id;
  if v_module is null then
    raise exception 'Lesson not found';
  end if;

  insert into public.lesson_progress(user_id, lesson_id, module_id, completed, completed_at)
  values (v_user, p_lesson_id, v_module, true, now())
  on conflict (user_id, lesson_id)
  do update set completed = true, completed_at = now();

  select count(*) into v_total from public.lessons where module_id = v_module;
  select count(*) into v_done from public.lesson_progress where user_id = v_user and module_id = v_module and completed = true;
  v_progress := case when v_total = 0 then 0 else floor((v_done::numeric / v_total::numeric) * 100) end;

  update public.enrollments
  set progress_percent = v_progress,
      completed_at = case when v_progress = 100 then now() else null end
  where user_id = v_user and module_id = v_module;

  insert into public.xp_events(user_id, event_name, points, metadata)
  values (v_user, 'lesson_complete', 20, jsonb_build_object('lesson_id', p_lesson_id, 'module_id', v_module));
end;
$$;

create or replace function public.record_quiz_attempt(p_quiz_id uuid, p_score int)
returns void
language plpgsql
security definer
as $$
declare
  v_user uuid := auth.uid();
  v_module uuid;
  v_pass int;
  v_passed boolean;
begin
  if v_user is null then
    raise exception 'Not authenticated';
  end if;

  select module_id, pass_score into v_module, v_pass from public.quizzes where id = p_quiz_id;
  if v_module is null then
    raise exception 'Quiz not found';
  end if;
  v_passed := p_score >= coalesce(v_pass, 70);

  insert into public.quiz_attempts(user_id, quiz_id, module_id, score, passed)
  values (v_user, p_quiz_id, v_module, p_score, v_passed);

  insert into public.xp_events(user_id, event_name, points, metadata)
  values (v_user, 'quiz_attempt', case when v_passed then 30 else 10 end, jsonb_build_object('quiz_id', p_quiz_id, 'score', p_score));
end;
$$;

notify pgrst, 'reload schema';

