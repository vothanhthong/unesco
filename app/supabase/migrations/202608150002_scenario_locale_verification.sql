alter table if exists public.scenarios
  add column if not exists locale text not null default 'vi-VN';

alter table if exists public.scenarios
  add column if not exists is_verified boolean not null default true;

create index if not exists scenarios_locale_verified_idx
  on public.scenarios(locale, is_verified, is_published);
