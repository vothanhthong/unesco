alter table public.scam_clusters
  add column if not exists created_by_user_id uuid references public.profiles(id) on delete set null;

update public.scam_clusters as cluster
set created_by_user_id = report.owner_id
from public.scam_reports as report
where cluster.created_by_user_id is null
  and cluster.fingerprint = 'report-' || report.id::text;

create table if not exists public.scam_cluster_lesson_additions (
  id uuid primary key default gen_random_uuid(),
  cluster_id uuid not null references public.scam_clusters(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid references public.scenarios(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (cluster_id, user_id)
);

insert into public.scam_cluster_lesson_additions (cluster_id, user_id, lesson_id, created_at)
select community_cluster_id, created_by, id, created_at
from public.scenarios
where community_cluster_id is not null
  and created_by is not null
on conflict (cluster_id, user_id) do nothing;

create index if not exists scam_cluster_lesson_additions_cluster_idx
  on public.scam_cluster_lesson_additions(cluster_id, created_at desc);
create index if not exists scam_cluster_lesson_additions_user_idx
  on public.scam_cluster_lesson_additions(user_id);

alter table public.scam_cluster_lesson_additions enable row level security;

create policy "users can read their own lesson additions"
  on public.scam_cluster_lesson_additions for select using (user_id = auth.uid());
create policy "users can add their own lessons"
  on public.scam_cluster_lesson_additions for insert with check (user_id = auth.uid());
create policy "users can remove their own lesson additions"
  on public.scam_cluster_lesson_additions for delete using (user_id = auth.uid());

create or replace function public.get_community_clusters(p_sort text default 'latest', p_locale text default 'vi')
returns table (
  id uuid, title text, summary text, category text, locale text, report_count integer,
  contributor_count integer, upvote_count integer, lesson_addition_count bigint, is_trending boolean,
  has_voted boolean, has_added_to_lesson boolean, is_shared_by_current_user boolean
)
language sql stable security definer set search_path = public as $$
  with cluster_stats as (
    select c.*,
      (select count(*) from public.scam_cluster_lesson_additions la where la.cluster_id = c.id) as lesson_count,
      (select count(*) * 3 from public.scam_cluster_votes v where v.cluster_id = c.id and v.created_at >= now() - interval '30 days')
      + (select count(*) * 2 from public.scam_cluster_lesson_additions la where la.cluster_id = c.id and la.created_at >= now() - interval '30 days')
      + c.report_count as trending_score
    from public.scam_clusters c
    where c.is_verified = true and c.title is not null and c.summary is not null
  )
  select c.id,
    case when p_locale = 'en' and c.title_en is not null then c.title_en else c.title end,
    case when p_locale = 'en' and c.summary_en is not null then c.summary_en else c.summary end,
    c.category, c.locale, c.report_count, c.contributor_count, c.upvote_count,
    c.lesson_count, (c.trending_score > 0),
    exists(select 1 from public.scam_cluster_votes v where v.cluster_id = c.id and v.voter_id = auth.uid()),
    exists(select 1 from public.scam_cluster_lesson_additions la where la.cluster_id = c.id and la.user_id = auth.uid()),
    c.created_by_user_id = auth.uid()
  from cluster_stats c
  order by case when p_sort = 'trending' then c.trending_score end desc nulls last, c.updated_at desc;
$$;

create or replace function public.get_my_community_impact()
returns table (scenarios_shared bigint, votes_received bigint, lesson_additions_received bigint)
language sql stable security definer set search_path = public as $$
  select
    (select count(*) from public.scam_clusters c where c.created_by_user_id = auth.uid() and c.is_verified = true),
    (select coalesce(sum(c.upvote_count), 0) from public.scam_clusters c where c.created_by_user_id = auth.uid() and c.is_verified = true),
    (select count(*) from public.scam_cluster_lesson_additions la join public.scam_clusters c on c.id = la.cluster_id where c.created_by_user_id = auth.uid() and c.is_verified = true);
$$;

create or replace function public.get_top_contributors()
returns table (user_id uuid, display_name text, verified_scenario_count bigint, helpful_votes_received bigint, lesson_additions_received bigint, contributor_score bigint, rank bigint, is_current_user boolean)
language sql stable security definer set search_path = public as $$
  with contributors as (
    select distinct created_by_user_id as user_id from public.scam_clusters where is_verified = true and created_by_user_id is not null
  ), impact as (
    select contributor.user_id,
      (select count(*) from public.scam_clusters c where c.created_by_user_id = contributor.user_id and c.is_verified = true) as scenarios,
      (select coalesce(sum(c.upvote_count), 0) from public.scam_clusters c where c.created_by_user_id = contributor.user_id and c.is_verified = true) as votes,
      (select count(*) from public.scam_cluster_lesson_additions la join public.scam_clusters c on c.id = la.cluster_id where c.created_by_user_id = contributor.user_id and c.is_verified = true) as additions,
      (select max(c.updated_at) from public.scam_clusters c where c.created_by_user_id = contributor.user_id and c.is_verified = true) as latest
    from contributors contributor
  ), ranked as (
    select i.*, 5 * scenarios + 2 * votes + 3 * additions as score,
      row_number() over (order by 5 * scenarios + 2 * votes + 3 * additions desc, additions desc, votes desc, scenarios desc, latest desc) as position
    from impact i
  )
  select r.user_id, coalesce(nullif(trim(p.display_name), ''), 'Community Member ' || right(replace(r.user_id::text, '-', ''), 3)),
    r.scenarios, r.votes, r.additions, r.score, r.position, r.user_id = auth.uid()
  from ranked r join public.profiles p on p.id = r.user_id
  order by r.position limit 5;
$$;

revoke all on function public.get_community_clusters(text, text) from public;
revoke all on function public.get_my_community_impact() from public;
revoke all on function public.get_top_contributors() from public;
grant execute on function public.get_community_clusters(text, text) to anon, authenticated;
grant execute on function public.get_my_community_impact() to authenticated;
grant execute on function public.get_top_contributors() to anon, authenticated;