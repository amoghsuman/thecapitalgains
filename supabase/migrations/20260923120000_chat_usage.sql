-- Per-user rate limiting for /api/chat (Capital AI tutor).
-- One row per user per hourly window; the route calls increment_chat_usage()
-- which atomically bumps the counter and reports whether the call is allowed.

create table if not exists public.chat_usage (
  user_id      uuid        not null references auth.users (id) on delete cascade,
  window_start timestamptz not null,
  count        integer     not null default 0,
  updated_at   timestamptz not null default now(),
  primary key (user_id, window_start)
);

alter table public.chat_usage enable row level security;

-- Users may read their own usage; only the function below writes.
create policy "own chat usage read" on public.chat_usage
  for select using (auth.uid() = user_id);

-- Atomic check-and-increment. Returns true when the request is within the
-- limit (and has been counted), false when the hourly limit is already spent.
create or replace function public.increment_chat_usage(p_user_id uuid, p_limit integer)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_window timestamptz := date_trunc('hour', now());
  v_count  integer;
begin
  -- Callers may only count against their own id.
  if auth.uid() is distinct from p_user_id then
    raise exception 'increment_chat_usage: user mismatch';
  end if;

  insert into public.chat_usage (user_id, window_start, count)
  values (p_user_id, v_window, 1)
  on conflict (user_id, window_start)
  do update set count = public.chat_usage.count + 1, updated_at = now()
  returning count into v_count;

  if v_count > p_limit then
    -- Undo the increment so a blocked call does not consume budget.
    update public.chat_usage set count = count - 1 where user_id = p_user_id and window_start = v_window;
    return false;
  end if;

  return true;
end;
$$;

revoke all on function public.increment_chat_usage(uuid, integer) from public;
grant execute on function public.increment_chat_usage(uuid, integer) to authenticated;

-- Housekeeping: old windows are useless after an hour; keep a week for audit.
create index if not exists chat_usage_window_idx on public.chat_usage (window_start);
