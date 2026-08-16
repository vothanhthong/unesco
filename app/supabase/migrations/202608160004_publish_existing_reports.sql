insert into public.scam_clusters (
  fingerprint,
  category,
  locale,
  title,
  summary,
  title_en,
  summary_en,
  report_count,
  contributor_count,
  reviewer_count,
  upvote_count,
  is_verified,
  is_trending,
  updated_at
)
select
  'report-' || report.id::text,
  report.source_type,
  report.locale,
  left(report.description, 160),
  report.description,
  case when lower(report.locale) like 'en%' then left(report.description, 160) end,
  case when lower(report.locale) like 'en%' then report.description end,
  1,
  1,
  0,
  0,
  true,
  false,
  report.created_at
from public.scam_reports as report
where report.status <> 'rejected'
  and not exists (
    select 1
    from public.scam_clusters as cluster
    where cluster.fingerprint = 'report-' || report.id::text
  );
