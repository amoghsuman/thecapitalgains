-- One subscription row per user PER STACK (Learn / Research).
--
-- Until now `subscriptions` had UNIQUE (user_id) and the Razorpay webhook
-- upserted on user_id, so buying a Research plan replaced a Learn row (and
-- vice versa). lib/access.ts has always modelled the two stacks as independent
-- entitlements, so the table now keys on (user_id, stack).
--
-- Not applied automatically; run through the Supabase SQL editor or
-- `supabase db push`. Idempotent.

begin;

alter table public.subscriptions
  add column if not exists stack text not null default 'learn';

-- Which stack a tier belongs to. Kept in sync with stackOf() in lib/plans.ts.
alter table public.subscriptions
  drop constraint if exists subscriptions_stack_check;
alter table public.subscriptions
  add constraint subscriptions_stack_check check (stack in ('learn', 'research'));

-- Backfill from the tier already on the row.
update public.subscriptions
set stack = case
  when tier in ('newsletter', 'essential', 'premium') then 'research'
  else 'learn'
end
where stack is distinct from case
  when tier in ('newsletter', 'essential', 'premium') then 'research'
  else 'learn'
end;

-- The webhook upserts on (user_id, stack); the old one-row-per-user key goes.
alter table public.subscriptions
  drop constraint if exists subscriptions_user_id_key;
alter table public.subscriptions
  drop constraint if exists subscriptions_user_id_stack_key;
alter table public.subscriptions
  add constraint subscriptions_user_id_stack_key unique (user_id, stack);

-- Keep the tier/stack pairing honest at the database level too.
alter table public.subscriptions
  drop constraint if exists subscriptions_tier_matches_stack;
alter table public.subscriptions
  add constraint subscriptions_tier_matches_stack check (
    (stack = 'research' and tier in ('newsletter', 'essential', 'premium'))
    or (stack = 'learn' and tier in ('free', 'learner', 'pro', 'elite'))
  );

-- Reads are always "this user's rows" (both stacks) or "this user's row for
-- one stack"; the unique constraint above already indexes (user_id, stack).
create index if not exists subscriptions_user_id_status_idx
  on public.subscriptions (user_id, status);

commit;
