-- ============================================================
-- Planora Database Schema v2
-- ============================================================

-- ============================================================
-- SHARED UPDATED_AT TRIGGER
-- ============================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- ============================================================
-- TASKS
-- ============================================================

create table public.tasks (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  title text not null,

  note text not null default '',

  deadline date,

  completed boolean not null default false,

  completed_at timestamptz,

  planned_date date,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now(),

  -- Allows focus_sessions to verify that
  -- task_id and user_id belong together.
  unique (id, user_id)
);


create index tasks_user_id_idx
  on public.tasks(user_id);

create index tasks_user_planned_date_idx
  on public.tasks(user_id, planned_date);

create index tasks_user_completed_idx
  on public.tasks(user_id, completed);


create trigger tasks_set_updated_at
before update on public.tasks
for each row
execute function public.set_updated_at();


-- ============================================================
-- FOCUS SESSIONS
-- ============================================================

create table public.focus_sessions (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  task_id uuid,

  -- Snapshot keeps history readable even if task is deleted.
  task_title text not null,

  phase text not null
    check (phase in ('focus', 'break')),

  duration_seconds integer not null
    check (duration_seconds >= 0),

  elapsed_seconds integer not null
    check (elapsed_seconds >= 0),

  completed_fully boolean not null default false,

  started_at timestamptz not null,

  ended_at timestamptz not null,

  created_at timestamptz not null default now(),

  constraint focus_session_time_order
    check (ended_at >= started_at),

  constraint focus_session_task_owner_fk
    foreign key (task_id, user_id)
    references public.tasks(id, user_id)
    on delete set null (task_id)
);


create index focus_sessions_user_id_idx
  on public.focus_sessions(user_id);

create index focus_sessions_task_id_idx
  on public.focus_sessions(task_id);

create index focus_sessions_user_started_at_idx
  on public.focus_sessions(user_id, started_at desc);


-- ============================================================
-- USER SETTINGS
-- ============================================================

create table public.user_settings (
  user_id uuid primary key
    references auth.users(id)
    on delete cascade,

  focus_minutes integer not null default 25
    check (focus_minutes > 0),

  break_minutes integer not null default 5
    check (break_minutes > 0),

  language text not null default 'en'
    check (language in ('en', 'zh')),

  theme text not null default 'dark'
    check (theme in ('dark', 'light')),

  updated_at timestamptz not null default now()
);


create trigger user_settings_set_updated_at
before update on public.user_settings
for each row
execute function public.set_updated_at();


-- ============================================================
-- TABLE PRIVILEGES
-- ============================================================

-- Anonymous visitors should not access user data.
revoke all
on public.tasks,
   public.focus_sessions,
   public.user_settings
from anon;

-- Signed-in users may perform CRUD.
-- RLS below decides WHICH rows they can access.
grant select, insert, update, delete
on public.tasks,
   public.focus_sessions,
   public.user_settings
to authenticated;


-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.tasks
enable row level security;

alter table public.focus_sessions
enable row level security;

alter table public.user_settings
enable row level security;


-- ============================================================
-- TASK POLICIES
-- ============================================================

create policy "Users can read their own tasks"
on public.tasks
for select
to authenticated
using (
  (select auth.uid()) = user_id
);


create policy "Users can create their own tasks"
on public.tasks
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
);


create policy "Users can update their own tasks"
on public.tasks
for update
to authenticated
using (
  (select auth.uid()) = user_id
)
with check (
  (select auth.uid()) = user_id
);


create policy "Users can delete their own tasks"
on public.tasks
for delete
to authenticated
using (
  (select auth.uid()) = user_id
);


-- ============================================================
-- FOCUS SESSION POLICIES
-- ============================================================

create policy "Users can read their own focus sessions"
on public.focus_sessions
for select
to authenticated
using (
  (select auth.uid()) = user_id
);


create policy "Users can create their own focus sessions"
on public.focus_sessions
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
);


create policy "Users can update their own focus sessions"
on public.focus_sessions
for update
to authenticated
using (
  (select auth.uid()) = user_id
)
with check (
  (select auth.uid()) = user_id
);


create policy "Users can delete their own focus sessions"
on public.focus_sessions
for delete
to authenticated
using (
  (select auth.uid()) = user_id
);


-- ============================================================
-- USER SETTINGS POLICIES
-- ============================================================

create policy "Users can read their own settings"
on public.user_settings
for select
to authenticated
using (
  (select auth.uid()) = user_id
);


create policy "Users can create their own settings"
on public.user_settings
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
);


create policy "Users can update their own settings"
on public.user_settings
for update
to authenticated
using (
  (select auth.uid()) = user_id
)
with check (
  (select auth.uid()) = user_id
);


create policy "Users can delete their own settings"
on public.user_settings
for delete
to authenticated
using (
  (select auth.uid()) = user_id
);