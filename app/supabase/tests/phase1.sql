-- Run after `supabase db reset` or against a disposable database.
-- These checks fail fast if the Phase 1 schema or ownership policies are missing.
do $$
declare
  table_name text;
  required_tables text[] := array[
    'profiles',
    'family_members',
    'scenarios',
    'scenario_versions',
    'practice_sessions',
    'practice_results',
    'scam_reports',
    'report_attachments',
    'scenario_drafts',
    'scenario_reviews',
    'scam_clusters'
  ];
begin
  foreach table_name in array required_tables loop
    if to_regclass('public.' || table_name) is null then
      raise exception 'Phase 1 table is missing: public.%', table_name;
    end if;
  end loop;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'family_members'
      and policyname = 'family members are owned by facilitators'
  ) then
    raise exception 'Family member ownership policy is missing';
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'scam_reports'
      and policyname = 'reports are owned by contributors'
  ) then
    raise exception 'Scam report ownership policy is missing';
  end if;

  if not exists (
    select 1
    from storage.buckets
    where id = 'scam-evidence'
      and public = false
  ) then
    raise exception 'Private scam-evidence bucket is missing';
  end if;
end $$;
