-- Ensemble Trackr — Initial Schema
-- LiveViral Media
-- Happy Valley Brass Band

-- ─────────────────────────────────────────
-- Extensions
-- ─────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────
-- Attendance periods
-- ─────────────────────────────────────────
create table public.attendance_periods (
  id          uuid primary key default uuid_generate_v4(),
  label       text not null,
  start_date  date not null,
  end_date    date not null,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- Level policies
-- ─────────────────────────────────────────
create table public.level_policies (
  level                     smallint primary key check (level in (1, 2, 3)),
  label                     text not null,
  description               text not null default '',
  max_absences              smallint,
  warning_threshold         smallint,
  final_notice_threshold    smallint,
  updated_at                timestamptz not null default now()
);

insert into public.level_policies (level, label, description, max_absences, warning_threshold, final_notice_threshold)
values
  (1, 'Level 1 — Elite',       'Highly committed / advanced players. No formal absence limit.', null, null, null),
  (2, 'Level 2 — Standard',    'Standard ensemble members with regular attendance expectations.', 5, 3, 5),
  (3, 'Level 3 — Developmental', 'Developmental or younger players with structured accountability.', 3, 2, 3);

-- ─────────────────────────────────────────
-- Sections
-- ─────────────────────────────────────────
create table public.sections (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null unique,
  is_default  boolean not null default false,
  sort_order  smallint not null default 0,
  created_at  timestamptz not null default now()
);

insert into public.sections (name, is_default, sort_order)
values
  ('Trumpet',    true, 1),
  ('Trombone',   true, 2),
  ('Euphonium',  true, 3),
  ('Tuba',       true, 4),
  ('Percussion', true, 5);

-- ─────────────────────────────────────────
-- Members
-- ─────────────────────────────────────────
create table public.members (
  id          uuid primary key default uuid_generate_v4(),
  auth_user_id uuid references auth.users(id) on delete set null,
  first_name  text not null,
  last_name   text not null,
  email       text not null unique,
  phone       text,
  section     text not null references public.sections(name) on update cascade,
  level       smallint not null default 2 check (level in (1, 2, 3)),
  role        text not null default 'member' check (role in ('director', 'section_leader', 'member')),
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index on public.members (section);
create index on public.members (level);
create index on public.members (active);

-- ─────────────────────────────────────────
-- Events
-- ─────────────────────────────────────────
create table public.events (
  id           uuid primary key default uuid_generate_v4(),
  name         text not null,
  date         date not null,
  type         text not null check (type in ('rehearsal', 'sunday_service', 'funeral', 'concert', 'custom')),
  custom_type  text,
  notes        text,
  created_by   uuid references auth.users(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index on public.events (date desc);
create index on public.events (type);

-- ─────────────────────────────────────────
-- Attendance records
-- ─────────────────────────────────────────
create table public.attendance (
  id             uuid primary key default uuid_generate_v4(),
  event_id       uuid not null references public.events(id) on delete cascade,
  member_id      uuid not null references public.members(id) on delete cascade,
  status         text not null default 'absent' check (status in ('present', 'partial', 'absent', 'excused')),
  note           text,
  absence_type   text check (absence_type in ('excused', 'unexcused')),
  logged_by      uuid references auth.users(id) on delete set null,
  logged_at      timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (event_id, member_id)
);

create index on public.attendance (event_id);
create index on public.attendance (member_id);
create index on public.attendance (status);

-- ─────────────────────────────────────────
-- Notifications log
-- ─────────────────────────────────────────
create table public.notification_log (
  id              uuid primary key default uuid_generate_v4(),
  member_id       uuid references public.members(id) on delete set null,
  member_name     text not null,
  member_email    text not null,
  type            text not null check (type in ('warning', 'final_notice', 'announcement', 'event_reminder')),
  subject         text not null,
  message         text not null,
  triggered_by    text not null default 'auto' check (triggered_by in ('auto', 'manual')),
  sent_by         uuid references auth.users(id) on delete set null,
  resend_id       text,
  delivered       boolean not null default false,
  sent_at         timestamptz not null default now()
);

create index on public.notification_log (member_id);
create index on public.notification_log (sent_at desc);

-- ─────────────────────────────────────────
-- Row-level security
-- ─────────────────────────────────────────
alter table public.attendance_periods  enable row level security;
alter table public.level_policies      enable row level security;
alter table public.sections            enable row level security;
alter table public.members             enable row level security;
alter table public.events              enable row level security;
alter table public.attendance          enable row level security;
alter table public.notification_log    enable row level security;

-- Authenticated users can read all data
create policy "authenticated read" on public.members             for select using (auth.role() = 'authenticated');
create policy "authenticated read" on public.events              for select using (auth.role() = 'authenticated');
create policy "authenticated read" on public.attendance          for select using (auth.role() = 'authenticated');
create policy "authenticated read" on public.sections            for select using (auth.role() = 'authenticated');
create policy "authenticated read" on public.level_policies      for select using (auth.role() = 'authenticated');
create policy "authenticated read" on public.attendance_periods  for select using (auth.role() = 'authenticated');

-- Members can only see their own notification log entries
create policy "member own notifications" on public.notification_log
  for select using (
    auth.role() = 'authenticated'
    and (
      member_id = (select id from public.members where auth_user_id = auth.uid() limit 1)
      or exists (
        select 1 from public.members
        where auth_user_id = auth.uid()
        and role in ('director', 'section_leader')
      )
    )
  );

-- Director / section leader can insert and update attendance
create policy "staff write attendance" on public.attendance
  for all using (
    exists (
      select 1 from public.members
      where auth_user_id = auth.uid()
      and role in ('director', 'section_leader')
    )
  );

-- Director can write everything else
create policy "director write members" on public.members
  for all using (
    exists (select 1 from public.members where auth_user_id = auth.uid() and role = 'director')
  );

create policy "director write events" on public.events
  for all using (
    exists (select 1 from public.members where auth_user_id = auth.uid() and role in ('director', 'section_leader'))
  );

create policy "director write settings" on public.level_policies
  for all using (
    exists (select 1 from public.members where auth_user_id = auth.uid() and role = 'director')
  );

create policy "director write sections" on public.sections
  for all using (
    exists (select 1 from public.members where auth_user_id = auth.uid() and role = 'director')
  );

create policy "director write periods" on public.attendance_periods
  for all using (
    exists (select 1 from public.members where auth_user_id = auth.uid() and role = 'director')
  );

-- ─────────────────────────────────────────
-- Helper view: attendance summary per member per period
-- ─────────────────────────────────────────
create or replace view public.member_attendance_summary as
select
  m.id                                       as member_id,
  m.first_name || ' ' || m.last_name        as member_name,
  m.section,
  m.level,
  count(distinct e.id)                       as total_events,
  count(*) filter (where a.status = 'present')                   as present,
  count(*) filter (where a.status = 'partial')                   as partial,
  count(*) filter (where a.status = 'absent' and (a.absence_type = 'unexcused' or a.absence_type is null)) as absent_unexcused,
  count(*) filter (where a.status in ('absent','excused') and a.absence_type = 'excused') as absent_excused,
  round(
    (count(*) filter (where a.status = 'present') + count(*) filter (where a.status = 'partial') * 0.5)
    / nullif(count(distinct e.id), 0) * 100
  )::int                                     as attendance_pct
from public.members m
cross join public.attendance_periods ap
left join public.events e
  on e.date between ap.start_date and ap.end_date
left join public.attendance a
  on a.event_id = e.id and a.member_id = m.id
where m.active = true and ap.active = true
group by m.id, m.first_name, m.last_name, m.section, m.level;
