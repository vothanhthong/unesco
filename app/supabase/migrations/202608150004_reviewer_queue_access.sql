create policy "reviewers can read scenario drafts"
  on public.scenario_drafts for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('reviewer', 'admin')
    )
  );
