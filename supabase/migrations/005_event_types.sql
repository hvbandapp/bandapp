-- Ensemble Trackr — Event Types table
-- LiveViral Media

create table public.event_types (
  id          uuid primary key default uuid_generate_v4(),
  ensemble_id uuid not null references public.ensembles(id) on delete cascade,
  name        text not null,
  is_default  boolean not null default false,
  sort_order  smallint not null default 0,
  created_at  timestamptz not null default now(),
  unique (ensemble_id, name)
);

-- Seed default event types for Happy Valley Brass Band
insert into public.event_types (ensemble_id, name, is_default, sort_order)
select id, 'Rehearsal',      true, 1 from public.ensembles limit 1;
insert into public.event_types (ensemble_id, name, is_default, sort_order)
select id, 'Sunday Service', true, 2 from public.ensembles limit 1;
insert into public.event_types (ensemble_id, name, is_default, sort_order)
select id, 'Funeral',        true, 3 from public.ensembles limit 1;
insert into public.event_types (ensemble_id, name, is_default, sort_order)
select id, 'Concert',        true, 4 from public.ensembles limit 1;

create index on public.event_types (ensemble_id);

alter table public.event_types enable row level security;

create policy "authenticated read" on public.event_types
  for select using (auth.role() = 'authenticated');

create policy "director write event_types" on public.event_types
  for all using (
    exists (select 1 from public.members where auth_user_id = auth.uid() and role = 'director')
  );
