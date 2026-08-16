alter table public.scam_clusters
  add column if not exists title text,
  add column if not exists summary text,
  add column if not exists upvote_count integer not null default 0 check (upvote_count >= 0);

create table if not exists public.scam_cluster_votes (
  id uuid primary key default gen_random_uuid(),
  cluster_id uuid not null references public.scam_clusters(id) on delete cascade,
  voter_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (cluster_id, voter_id)
);

create index if not exists scam_cluster_votes_cluster_id_idx on public.scam_cluster_votes(cluster_id);
create index if not exists scam_cluster_votes_voter_id_idx on public.scam_cluster_votes(voter_id);

alter table public.scam_cluster_votes enable row level security;

create policy "verified cluster votes are readable by their voter"
  on public.scam_cluster_votes for select
  using (voter_id = auth.uid());

create policy "authenticated users can vote for verified clusters"
  on public.scam_cluster_votes for insert
  with check (
    voter_id = auth.uid()
    and exists (
      select 1 from public.scam_clusters
      where scam_clusters.id = scam_cluster_votes.cluster_id
        and scam_clusters.is_verified = true
    )
  );

create policy "voters can remove their vote"
  on public.scam_cluster_votes for delete
  using (voter_id = auth.uid());

create or replace function public.update_scam_cluster_upvote_count()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.scam_clusters
    set upvote_count = upvote_count + 1, updated_at = now()
    where id = new.cluster_id;
    return new;
  end if;

  update public.scam_clusters
  set upvote_count = greatest(upvote_count - 1, 0), updated_at = now()
  where id = old.cluster_id;
  return old;
end;
$$;

drop trigger if exists scam_cluster_votes_count on public.scam_cluster_votes;
create trigger scam_cluster_votes_count
  after insert or delete on public.scam_cluster_votes
  for each row execute procedure public.update_scam_cluster_upvote_count();
