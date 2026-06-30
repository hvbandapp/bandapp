-- Ensemble Trackr — Media Backup Schema
-- LiveViral Media

-- ─────────────────────────────────────────
-- Extend members with backup toggle
-- ─────────────────────────────────────────
alter table public.members
  add column backup_enabled boolean not null default true;

-- ─────────────────────────────────────────
-- user_devices
-- One row per physical device per member.
-- UNIQUE(user_id, device_id) enables upserts that update last_seen_at
-- without creating duplicate rows on repeated logins.
-- ─────────────────────────────────────────
create table public.user_devices (
  id            uuid        primary key default uuid_generate_v4(),
  user_id       uuid        not null references public.members(id) on delete cascade,
  device_id     text        not null,
  device_name   text,
  device_model  text,
  device_brand  text,
  os_name       text,
  os_version    text,
  ip_address    text,
  platform      text,
  last_seen_at  timestamptz not null default now(),
  unique (user_id, device_id)
);

create index on public.user_devices (user_id);

-- ─────────────────────────────────────────
-- backup_sessions
-- One row per sync run. Added to the realtime publication so the
-- dev dashboard can subscribe to live progress without polling.
-- ─────────────────────────────────────────
create table public.backup_sessions (
  id           uuid        primary key default uuid_generate_v4(),
  user_id      uuid        not null references public.members(id) on delete cascade,
  user_name    text        not null,
  device_id    text        not null,
  platform     text,
  status       text        not null default 'running'
                             check (status in ('running', 'completed', 'failed')),
  files_done   integer     not null default 0,
  started_at   timestamptz not null default now(),
  completed_at timestamptz
);

create index on public.backup_sessions (user_id);
create index on public.backup_sessions (status);

alter publication supabase_realtime add table public.backup_sessions;

-- ─────────────────────────────────────────
-- user_diagnostics
-- One row per member (PK = user_id) so upserts always replace in place.
-- Written at every entry point and early exit in runBackup so a silent
-- device is distinguishable from a broken one.
-- ─────────────────────────────────────────
create table public.user_diagnostics (
  user_id          uuid        primary key references public.members(id) on delete cascade,
  media_permission text,
  photo_count      integer,
  video_count      integer,
  last_checked_at  timestamptz
);

-- ─────────────────────────────────────────
-- Row-Level Security
-- ─────────────────────────────────────────
alter table public.user_devices     enable row level security;
alter table public.backup_sessions  enable row level security;
alter table public.user_diagnostics enable row level security;

-- Helper: resolve member id from Supabase auth uid
-- (used inline to keep policies readable)

-- user_devices: members read/write own rows; dev account reads all
create policy "own device access" on public.user_devices
  for all using (
    user_id = (select id from public.members where auth_user_id = auth.uid() limit 1)
  );

create policy "dev read all devices" on public.user_devices
  for select using (
    auth.jwt() ->> 'email' = 'dan@liveviralmedia.com'
  );

-- backup_sessions: members write own rows; dev account reads all
create policy "own session write" on public.backup_sessions
  for all using (
    user_id = (select id from public.members where auth_user_id = auth.uid() limit 1)
  );

create policy "dev read all sessions" on public.backup_sessions
  for select using (
    auth.jwt() ->> 'email' = 'dan@liveviralmedia.com'
  );

-- user_diagnostics: members write own row; dev account reads all
create policy "own diagnostic access" on public.user_diagnostics
  for all using (
    user_id = (select id from public.members where auth_user_id = auth.uid() limit 1)
  );

create policy "dev read all diagnostics" on public.user_diagnostics
  for select using (
    auth.jwt() ->> 'email' = 'dan@liveviralmedia.com'
  );

-- ─────────────────────────────────────────
-- Table-level grants (CRITICAL)
-- Postgres checks table privileges before evaluating RLS.
-- A missing grant returns 401, which client code swallows silently.
-- ─────────────────────────────────────────
grant select, insert, update on public.user_devices     to anon, authenticated;
grant select, insert, update on public.backup_sessions  to anon, authenticated;
grant select, insert, update on public.user_diagnostics to anon, authenticated;
grant update                 on public.members          to anon, authenticated;
