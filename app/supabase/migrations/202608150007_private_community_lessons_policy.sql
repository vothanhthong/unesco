create policy "facilitators can create private community lessons"
  on public.scenarios for insert
  with check (
    created_by = auth.uid()
    and is_published = false
  );
