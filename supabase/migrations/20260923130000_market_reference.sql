-- Slow-moving market reference numbers (repo rate, 10-year G-Sec yield,
-- FII/DII provisional flows, Nifty TRI since-inception CAGR). Written by
-- scripts/refresh-market-reference.mjs and app/api/cron/reference/route.ts
-- with the service role; read publicly by lib/market/reference.ts.

create table if not exists public.market_reference (
  key        text primary key,
  value      numeric,
  value_text text,
  as_of      date,
  source     text,
  source_url text,
  updated_at timestamptz not null default now()
);

alter table public.market_reference enable row level security;

-- Anyone may read; no policy grants insert/update/delete, so only the service
-- role (which bypasses RLS) can write.
create policy "market reference public read" on public.market_reference
  for select using (true);

-- Keep updated_at honest on every write.
create or replace function public.market_reference_touch()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists market_reference_touch on public.market_reference;
create trigger market_reference_touch
  before insert or update on public.market_reference
  for each row execute function public.market_reference_touch();
