alter table public.scenarios
  add column if not exists title_en text,
  add column if not exists content_en text;

update public.scenarios as scenario
set
  title_en = cluster.title_en,
  content_en = cluster.summary_en,
  updated_at = now()
from public.scam_clusters as cluster
where scenario.community_cluster_id = cluster.id
  and (scenario.title_en is null or scenario.content_en is null)
  and (cluster.title_en is not null or cluster.summary_en is not null);
