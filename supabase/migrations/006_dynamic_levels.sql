-- Ensemble Trackr — Dynamic member levels
-- Remove hardcoded level check constraints so admins can add levels beyond 1-2-3

alter table public.members
  drop constraint if exists members_level_check;

alter table public.ensemble_members
  drop constraint if exists ensemble_members_level_check;
