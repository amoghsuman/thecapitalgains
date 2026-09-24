-- Capital AI tutor on Gemini's free tier: per-user hourly and daily caps, a
-- global daily cap, and a per-request log with token counts.
--
-- chat_usage keeps counters, one row per (key, bucket, window). Keys are the
-- user id (as text) for the user buckets and the literal 'global' for the
-- site-wide daily bucket. Daily windows start at midnight IST.
-- chat_usage_log holds one row per request (model, tokens, latency, status)
-- for /api/admin/tutor-stats; only the service role writes it.
--
-- Not applied automatically; run through the Supabase SQL editor or
-- `supabase db push`. Idempotent; the old (user_id, window_start) rows and the
-- old increment_chat_usage(uuid, integer) function are replaced.

begin;

-- ── Counters ─────────────────────────────────────────────────────────────────

-- Rebuild the counter table: key text (user id or 'global') + bucket.
drop function if exists public.increment_chat_usage(uuid, integer);
drop table if exists public.chat_usage;

create table public.chat_usage (
  key          text        not null,
  bucket       text        not null check (bucket in ('user_hour', 'user_day', 'global_day')),
  window_start timestamptz not null,
  count        integer     not null default 0,
  updated_at   timestamptz not null default now(),
  primary key (key, bucket, window_start)
);

alter table public.chat_usage enable row level security;

-- Users may read their own counters (the UI can show remaining budget); only
-- the function below writes.
create policy "own chat usage read" on public.chat_usage
  for select using (key = auth.uid()::text);

-- Midnight IST of the current day, as an absolute instant.
create or replace function public.ist_day_start(p_at timestamptz default now())
returns timestamptz
language sql
immutable
as $$
  select (date_trunc('day', p_at at time zone 'Asia/Kolkata')) at time zone 'Asia/Kolkata';
$$;

-- Atomic check-and-increment across the three buckets. Returns
--   { allowed: true, remaining: {hour, day, global} }
-- or
--   { allowed: false, reason: 'user_hour' | 'user_day' | 'global_day', reset_at: <timestamptz> }
-- A blocked call is fully undone so it consumes no budget anywhere.
create or replace function public.check_chat_caps(
  p_user_id       uuid,
  p_hour_limit    integer,
  p_day_limit     integer,
  p_global_limit  integer
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_hour_start   timestamptz := date_trunc('hour', now());
  v_day_start    timestamptz := public.ist_day_start(now());
  v_key          text := p_user_id::text;
  v_hour         integer;
  v_day          integer;
  v_global       integer;
  v_reason       text := null;
  v_reset        timestamptz;
begin
  -- Callers may only count against their own id.
  if auth.uid() is distinct from p_user_id then
    raise exception 'check_chat_caps: user mismatch';
  end if;

  insert into public.chat_usage (key, bucket, window_start, count)
  values (v_key, 'user_hour', v_hour_start, 1)
  on conflict (key, bucket, window_start)
  do update set count = public.chat_usage.count + 1, updated_at = now()
  returning count into v_hour;

  insert into public.chat_usage (key, bucket, window_start, count)
  values (v_key, 'user_day', v_day_start, 1)
  on conflict (key, bucket, window_start)
  do update set count = public.chat_usage.count + 1, updated_at = now()
  returning count into v_day;

  insert into public.chat_usage (key, bucket, window_start, count)
  values ('global', 'global_day', v_day_start, 1)
  on conflict (key, bucket, window_start)
  do update set count = public.chat_usage.count + 1, updated_at = now()
  returning count into v_global;

  -- The site-wide cap wins over the personal ones in the message shown.
  if v_global > p_global_limit then
    v_reason := 'global_day'; v_reset := v_day_start + interval '1 day';
  elsif v_day > p_day_limit then
    v_reason := 'user_day';   v_reset := v_day_start + interval '1 day';
  elsif v_hour > p_hour_limit then
    v_reason := 'user_hour';  v_reset := v_hour_start + interval '1 hour';
  end if;

  if v_reason is not null then
    update public.chat_usage set count = count - 1 where key = v_key   and bucket = 'user_hour'  and window_start = v_hour_start;
    update public.chat_usage set count = count - 1 where key = v_key   and bucket = 'user_day'   and window_start = v_day_start;
    update public.chat_usage set count = count - 1 where key = 'global' and bucket = 'global_day' and window_start = v_day_start;
    return jsonb_build_object('allowed', false, 'reason', v_reason, 'reset_at', v_reset);
  end if;

  return jsonb_build_object(
    'allowed', true,
    'remaining', jsonb_build_object(
      'hour',   p_hour_limit   - v_hour,
      'day',    p_day_limit    - v_day,
      'global', p_global_limit - v_global
    )
  );
end;
$$;

revoke all on function public.check_chat_caps(uuid, integer, integer, integer) from public;
grant execute on function public.check_chat_caps(uuid, integer, integer, integer) to authenticated;

create index if not exists chat_usage_window_idx on public.chat_usage (window_start);

-- ── Per-request log ──────────────────────────────────────────────────────────

create table if not exists public.chat_usage_log (
  id            bigint generated always as identity primary key,
  user_id       uuid        not null references auth.users (id) on delete cascade,
  model         text        not null,
  input_tokens  integer,
  output_tokens integer,
  latency_ms    integer     not null,
  -- 'ok' | 'empty' | 'upstream_error' | 'quota' | 'capped'
  status        text        not null,
  created_at    timestamptz not null default now()
);

alter table public.chat_usage_log enable row level security;
-- No policies: only the service role (which bypasses RLS) reads or writes.

create index if not exists chat_usage_log_created_idx on public.chat_usage_log (created_at);
create index if not exists chat_usage_log_user_idx on public.chat_usage_log (user_id, created_at);

commit;
