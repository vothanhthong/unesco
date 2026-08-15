alter table public.scenarios
  add column if not exists community_cluster_id uuid references public.scam_clusters(id) on delete set null;

create index if not exists scenarios_community_cluster_owner_idx
  on public.scenarios(community_cluster_id, created_by);
