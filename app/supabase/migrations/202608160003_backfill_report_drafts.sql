insert into public.scenario_drafts (report_id, owner_id, status, source_snapshot)
select
  report.id,
  report.owner_id,
  'draft',
  jsonb_build_object(
    'title', left(report.description, 160),
    'summary', report.description,
    'category', report.source_type,
    'locale', report.locale,
    'context', report.context
  )
from public.scam_reports as report
where report.status in ('submitted', 'processing', 'in_review')
  and not exists (
    select 1
    from public.scenario_drafts as draft
    where draft.report_id = report.id
  );
