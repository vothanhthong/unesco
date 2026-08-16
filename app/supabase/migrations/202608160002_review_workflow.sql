create or replace function public.is_reviewer_or_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role in ('reviewer', 'admin')
  );
$$;

revoke all on function public.is_reviewer_or_admin() from public;
grant execute on function public.is_reviewer_or_admin() to authenticated;

drop policy if exists "reviewers can read drafts" on public.scenario_drafts;
create policy "reviewers can read drafts"
  on public.scenario_drafts for select
  using (public.is_reviewer_or_admin());

drop policy if exists "reviewers can update drafts" on public.scenario_drafts;
create policy "reviewers can update drafts"
  on public.scenario_drafts for update
  using (public.is_reviewer_or_admin())
  with check (public.is_reviewer_or_admin());

drop policy if exists "reviewers can update reports" on public.scam_reports;
create policy "reviewers can update reports"
  on public.scam_reports for update
  using (public.is_reviewer_or_admin())
  with check (public.is_reviewer_or_admin());

drop policy if exists "reviewers can create verified clusters" on public.scam_clusters;
create policy "reviewers can create verified clusters"
  on public.scam_clusters for insert
  with check (public.is_reviewer_or_admin() and is_verified = true);
