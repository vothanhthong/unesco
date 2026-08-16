alter table public.scam_clusters
  add column if not exists title_en text,
  add column if not exists summary_en text;
