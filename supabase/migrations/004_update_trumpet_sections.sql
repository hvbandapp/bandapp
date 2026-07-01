-- Ensemble Trackr — Replace 'Trumpet' with 'Trumpet 1' and 'Trumpet 2'
-- LiveViral Media

-- Rename existing 'Trumpet' row to 'Trumpet 1'
update public.sections
set name = 'Trumpet 1', sort_order = 1
where name = 'Trumpet';

-- Insert 'Trumpet 2' for every ensemble that has 'Trumpet 1'
insert into public.sections (ensemble_id, name, is_default, sort_order)
select ensemble_id, 'Trumpet 2', true, 2
from public.sections
where name = 'Trumpet 1'
on conflict (ensemble_id, name) do nothing;

-- Shift remaining default sections up one sort position
update public.sections set sort_order = 3 where name = 'Trombone';
update public.sections set sort_order = 4 where name = 'Euphonium';
update public.sections set sort_order = 5 where name = 'Tuba';
update public.sections set sort_order = 6 where name = 'Percussion';

-- Re-assign existing members whose section was 'Trumpet' to 'Trumpet 1'
update public.members          set section = 'Trumpet 1' where section = 'Trumpet';
update public.ensemble_members set section = 'Trumpet 1' where section = 'Trumpet';
