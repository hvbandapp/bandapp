-- Ensemble Trackr — Multi-Group Migration
-- LiveViral Media

-- ─────────────────────────────────────────
-- Ensembles (top-level groups)
-- ─────────────────────────────────────────
create table public.ensembles (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  description text,
  est_year    smallint,
  created_by  uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Seed Happy Valley Brass Band as the first group
insert into public.ensembles (name, description, est_year)
values ('Happy Valley Brass Band', 'Phoenix, AZ', 1986);

-- ─────────────────────────────────────────
-- Add ensemble_id to existing tables
-- ─────────────────────────────────────────

-- Events
alter table public.events add column ensemble_id uuid references public.ensembles(id) on delete cascade;
update public.events set ensemble_id = (select id from public.ensembles limit 1);
alter table public.events alter column ensemble_id set not null;
create index on public.events (ensemble_id);

-- Attendance periods
alter table public.attendance_periods add column ensemble_id uuid references public.ensembles(id) on delete cascade;
update public.attendance_periods set ensemble_id = (select id from public.ensembles limit 1);
alter table public.attendance_periods alter column ensemble_id set not null;
create index on public.attendance_periods (ensemble_id);

-- Notification log
alter table public.notification_log add column ensemble_id uuid references public.ensembles(id) on delete set null;
update public.notification_log set ensemble_id = (select id from public.ensembles limit 1);

-- ─────────────────────────────────────────
-- Sections — make per-ensemble
-- members.section FK references sections_name_key, so drop it first
-- ─────────────────────────────────────────
alter table public.members drop constraint members_section_fkey;
alter table public.sections drop constraint sections_name_key;
alter table public.sections add column ensemble_id uuid references public.ensembles(id) on delete cascade;
update public.sections set ensemble_id = (select id from public.ensembles limit 1);
alter table public.sections alter column ensemble_id set not null;
create unique index on public.sections (ensemble_id, name);
create index on public.sections (ensemble_id);

-- ─────────────────────────────────────────
-- Level policies — make per-ensemble
-- Change PK from (level) to (ensemble_id, level)
-- ─────────────────────────────────────────
alter table public.level_policies drop constraint level_policies_pkey;
alter table public.level_policies add column ensemble_id uuid references public.ensembles(id) on delete cascade;
update public.level_policies set ensemble_id = (select id from public.ensembles limit 1);
alter table public.level_policies alter column ensemble_id set not null;
alter table public.level_policies add primary key (ensemble_id, level);

-- ─────────────────────────────────────────
-- Ensemble members junction table
-- Members are global; their role/section/level is per-ensemble
-- ─────────────────────────────────────────
create table public.ensemble_members (
  ensemble_id  uuid not null references public.ensembles(id) on delete cascade,
  member_id    uuid not null references public.members(id) on delete cascade,
  section      text not null,
  level        smallint not null default 2 check (level in (1, 2, 3)),
  role         text not null default 'member' check (role in ('director', 'section_leader', 'member')),
  active       boolean not null default true,
  joined_at    timestamptz not null default now(),
  primary key (ensemble_id, member_id)
);

-- Migrate existing members into Happy Valley Brass Band
insert into public.ensemble_members (ensemble_id, member_id, section, level, role, active)
select
  (select id from public.ensembles limit 1),
  id, section, level, role, active
from public.members;

create index on public.ensemble_members (ensemble_id);
create index on public.ensemble_members (member_id);

-- ─────────────────────────────────────────
-- Row-level security for new tables
-- ─────────────────────────────────────────
alter table public.ensembles        enable row level security;
alter table public.ensemble_members enable row level security;

create policy "authenticated read" on public.ensembles
  for select using (auth.role() = 'authenticated');

create policy "authenticated read" on public.ensemble_members
  for select using (auth.role() = 'authenticated');

create policy "director write ensembles" on public.ensembles
  for all using (
    exists (
      select 1 from public.members
      where auth_user_id = auth.uid() and role = 'director'
    )
  );

create policy "director write ensemble_members" on public.ensemble_members
  for all using (
    exists (
      select 1 from public.members
      where auth_user_id = auth.uid() and role = 'director'
    )
  );

-- ─────────────────────────────────────────
-- Updated attendance summary view (ensemble-scoped)
-- ─────────────────────────────────────────
drop view if exists public.member_attendance_summary;
create view public.member_attendance_summary as
select
  em.ensemble_id,
  m.id                                        as member_id,
  m.first_name || ' ' || m.last_name         as member_name,
  em.section,
  em.level,
  count(distinct e.id)                        as total_events,
  count(*) filter (where a.status = 'present')                    as present,
  count(*) filter (where a.status = 'partial')                    as partial,
  count(*) filter (where a.status = 'absent' and (a.absence_type = 'unexcused' or a.absence_type is null)) as absent_unexcused,
  count(*) filter (where a.status in ('absent','excused') and a.absence_type = 'excused') as absent_excused,
  round(
    (count(*) filter (where a.status = 'present') + count(*) filter (where a.status = 'partial') * 0.5)
    / nullif(count(distinct e.id), 0) * 100
  )::int                                      as attendance_pct
from public.ensemble_members em
join public.members m on m.id = em.member_id
cross join public.attendance_periods ap
left join public.events e
  on e.date between ap.start_date and ap.end_date
  and e.ensemble_id = em.ensemble_id
left join public.attendance a
  on a.event_id = e.id and a.member_id = m.id
where em.active = true and ap.active = true
group by em.ensemble_id, m.id, m.first_name, m.last_name, em.section, em.level;
