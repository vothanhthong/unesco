create extension if not exists pgcrypto;

do $$
begin
  create type public.practice_status as enum ('waiting', 'paired', 'triggered', 'passed', 'failed');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.practice_result as enum ('passed', 'failed');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'facilitator' check (role in ('facilitator', 'reviewer', 'admin')),
  display_name text,
  locale text not null default 'vi-VN',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.family_members (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  display_name text not null,
  relationship text,
  locale text not null default 'vi-VN',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.scenarios (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  category text not null,
  title text not null,
  sender text not null,
  content text not null,
  link_hint text,
  locale text not null default 'vi-VN',
  is_verified boolean not null default true,
  is_published boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.scenario_versions (
  id uuid primary key default gen_random_uuid(),
  scenario_id uuid not null references public.scenarios(id) on delete cascade,
  version_number integer not null check (version_number > 0),
  status text not null default 'draft' check (status in ('draft', 'published', 'outdated')),
  content jsonb not null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (scenario_id, version_number)
);

create table if not exists public.practice_sessions (
  id uuid primary key default gen_random_uuid(),
  pairing_code text not null unique check (pairing_code ~ '^[0-9]{4}$'),
  facilitator_id uuid references public.profiles(id) on delete set null,
  family_member_id uuid references public.family_members(id) on delete set null,
  scenario_id uuid references public.scenarios(id) on delete set null,
  status public.practice_status not null default 'waiting',
  scam jsonb,
  push_subscription jsonb,
  created_at timestamptz not null default now(),
  paired_at timestamptz,
  triggered_at timestamptz,
  completed_at timestamptz
);

create table if not exists public.practice_results (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null unique references public.practice_sessions(id) on delete cascade,
  result public.practice_result not null,
  warning_signs jsonb not null default '[]'::jsonb,
  debrief_notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.scam_reports (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  source_type text not null check (source_type in ('message', 'email', 'screenshot', 'audio', 'story')),
  description text not null,
  locale text not null default 'vi-VN',
  context text,
  status text not null default 'submitted' check (status in ('submitted', 'processing', 'draft_ready', 'in_review', 'approved', 'rejected', 'resolved')),
  pii_status text not null default 'unknown' check (pii_status in ('unknown', 'clear', 'needs_redaction', 'redacted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.report_attachments (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.scam_reports(id) on delete cascade,
  storage_path text not null unique,
  file_name text not null,
  mime_type text not null,
  byte_size bigint not null check (byte_size > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.scenario_drafts (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.scam_reports(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'draft' check (status in ('draft', 'in_review', 'approved', 'rejected', 'outdated')),
  source_snapshot jsonb not null,
  generated_content jsonb,
  model_metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.scenario_reviews (
  id uuid primary key default gen_random_uuid(),
  draft_id uuid not null references public.scenario_drafts(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id) on delete cascade,
  action text not null check (action in ('approve', 'edit', 'outdated')),
  reason text,
  created_at timestamptz not null default now()
);

create table if not exists public.scam_clusters (
  id uuid primary key default gen_random_uuid(),
  fingerprint text not null unique,
  category text not null,
  locale text not null default 'vi-VN',
  report_count integer not null default 0 check (report_count >= 0),
  contributor_count integer not null default 0 check (contributor_count >= 0),
  reviewer_count integer not null default 0 check (reviewer_count >= 0),
  is_verified boolean not null default false,
  is_trending boolean not null default false,
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data ->> 'display_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

drop trigger if exists family_members_set_updated_at on public.family_members;
create trigger family_members_set_updated_at
  before update on public.family_members
  for each row execute procedure public.set_updated_at();

drop trigger if exists scenarios_set_updated_at on public.scenarios;
create trigger scenarios_set_updated_at
  before update on public.scenarios
  for each row execute procedure public.set_updated_at();

drop trigger if exists scam_reports_set_updated_at on public.scam_reports;
create trigger scam_reports_set_updated_at
  before update on public.scam_reports
  for each row execute procedure public.set_updated_at();

drop trigger if exists scenario_drafts_set_updated_at on public.scenario_drafts;
create trigger scenario_drafts_set_updated_at
  before update on public.scenario_drafts
  for each row execute procedure public.set_updated_at();

drop trigger if exists scam_clusters_set_updated_at on public.scam_clusters;
create trigger scam_clusters_set_updated_at
  before update on public.scam_clusters
  for each row execute procedure public.set_updated_at();

create index if not exists family_members_owner_id_idx on public.family_members(owner_id);
create index if not exists scenarios_published_category_idx on public.scenarios(is_published, category);
create index if not exists scenarios_locale_verified_idx on public.scenarios(locale, is_verified, is_published);
create index if not exists practice_sessions_facilitator_id_idx on public.practice_sessions(facilitator_id);
create index if not exists practice_sessions_status_idx on public.practice_sessions(status);
create index if not exists scam_reports_owner_id_status_idx on public.scam_reports(owner_id, status);
create index if not exists scam_reports_created_at_idx on public.scam_reports(created_at desc);
create index if not exists scenario_drafts_owner_id_status_idx on public.scenario_drafts(owner_id, status);
create index if not exists scam_clusters_verified_trending_idx on public.scam_clusters(is_verified, is_trending);

alter table public.profiles enable row level security;
alter table public.family_members enable row level security;
alter table public.scenarios enable row level security;
alter table public.scenario_versions enable row level security;
alter table public.practice_sessions enable row level security;
alter table public.practice_results enable row level security;
alter table public.scam_reports enable row level security;
alter table public.report_attachments enable row level security;
alter table public.scenario_drafts enable row level security;
alter table public.scenario_reviews enable row level security;
alter table public.scam_clusters enable row level security;

create policy "profiles are readable by their owner"
  on public.profiles for select
  using (id = auth.uid());

create policy "profiles are writable by their owner"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "family members are owned by facilitators"
  on public.family_members for all
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "published scenarios are readable"
  on public.scenarios for select
  using (is_published = true or created_by = auth.uid());

create policy "scenario versions are readable when published"
  on public.scenario_versions for select
  using (
    status = 'published'
    or created_by = auth.uid()
  );

create policy "practice sessions are owned by facilitators"
  on public.practice_sessions for all
  using (facilitator_id = auth.uid())
  with check (facilitator_id = auth.uid());

create policy "practice results follow session ownership"
  on public.practice_results for all
  using (
    exists (
      select 1 from public.practice_sessions
      where practice_sessions.id = practice_results.session_id
        and practice_sessions.facilitator_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.practice_sessions
      where practice_sessions.id = practice_results.session_id
        and practice_sessions.facilitator_id = auth.uid()
    )
  );

create policy "reports are owned by contributors"
  on public.scam_reports for all
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "attachments follow report ownership"
  on public.report_attachments for all
  using (
    exists (
      select 1 from public.scam_reports
      where scam_reports.id = report_attachments.report_id
        and scam_reports.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.scam_reports
      where scam_reports.id = report_attachments.report_id
        and scam_reports.owner_id = auth.uid()
    )
  );

create policy "drafts are owned by contributors"
  on public.scenario_drafts for all
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "reviews are owned by reviewers"
  on public.scenario_reviews for all
  using (reviewer_id = auth.uid())
  with check (reviewer_id = auth.uid());

create policy "verified clusters are public"
  on public.scam_clusters for select
  using (is_verified = true);

insert into storage.buckets (id, name, public)
values ('scam-evidence', 'scam-evidence', false)
on conflict (id) do update set public = false;

create policy "authenticated users can upload private evidence"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'scam-evidence' and owner_id = auth.uid()::text);

create policy "users can read their private evidence"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'scam-evidence' and owner_id = auth.uid()::text);

create policy "users can delete their private evidence"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'scam-evidence' and owner_id = auth.uid()::text);
