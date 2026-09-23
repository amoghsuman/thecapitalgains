// The one place that decides what subscriptions a user currently holds. The
// dashboard (server), the course page, the lesson reader (browser) and the
// research gates all call this, so a tier badge and an access gate can never
// disagree about validity.
//
// A user holds up to one row per stack (`subscriptions` is UNIQUE on
// (user_id, stack), migration 20260923140000): Learn (learner < pro) and
// Research (newsletter < essential < premium). The two are independent —
// lesson access reads the Learn row only, research content the Research row
// only — and the Razorpay webhook writes each stack's row without touching
// the other.

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Tier } from "@/lib/access";
import { stackOf, type Stack } from "@/lib/plans";

export type SubscriptionStatus = "active" | "cancelled" | "expired" | "past_due" | "trialing";

export type ActiveSubscription = {
  tier: Tier;
  stack: Stack;
  status: SubscriptionStatus;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  /** status is "active" and the period has not ended. This is THE validity rule. */
  isCurrent: boolean;
};

export type ActiveSubscriptions = {
  learn: ActiveSubscription | null;
  research: ActiveSubscription | null;
};

const KNOWN_TIERS: ReadonlySet<string> = new Set([
  "free", "learner", "pro", "newsletter", "essential", "premium",
]);

type Row = {
  tier: string | null;
  stack: string | null;
  status: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
};

function toSubscription(row: Row, now: Date): ActiveSubscription {
  const tier = row.tier && KNOWN_TIERS.has(row.tier) ? (row.tier as Tier) : "free";
  const end = row.current_period_end ? new Date(row.current_period_end) : null;
  const periodOpen = end === null || Number.isNaN(end.getTime()) || end.getTime() > now.getTime();
  return {
    tier,
    // The column is authoritative; derive from the tier only for rows written
    // before the column existed.
    stack: row.stack === "learn" || row.stack === "research" ? row.stack : stackOf(tier),
    status: (row.status ?? "active") as SubscriptionStatus,
    currentPeriodStart: row.current_period_start,
    currentPeriodEnd: row.current_period_end,
    isCurrent: row.status === "active" && periodOpen,
  };
}

/** Both of a user's active rows (one per stack), evaluated at `now`. Missing rows are null. */
export async function getActiveSubscriptions(
  supabase: SupabaseClient,
  userId: string,
  now: Date = new Date()
): Promise<ActiveSubscriptions> {
  const read = (columns: string) =>
    supabase.from("subscriptions").select(columns).eq("user_id", userId).eq("status", "active");

  let { data, error } = await read("tier, stack, status, current_period_start, current_period_end");
  // Before migration 20260923140000 there is no `stack` column; read without
  // it and derive the stack from the tier so access keeps working meanwhile.
  if (error && /stack/.test(error.message)) {
    ({ data, error } = await read("tier, status, current_period_start, current_period_end"));
  }

  const out: ActiveSubscriptions = { learn: null, research: null };
  if (error) {
    console.error("[subscription] read failed:", error.message);
    return out;
  }
  for (const row of (data ?? []) as unknown as Row[]) {
    const sub = toSubscription(row, now);
    // One row per stack is enforced by the database; if an old dataset still
    // has two, the one with the later period end wins.
    const existing = out[sub.stack];
    if (!existing || (sub.currentPeriodEnd ?? "") > (existing.currentPeriodEnd ?? "")) {
      out[sub.stack] = sub;
    }
  }
  return out;
}

/**
 * The tier to feed lib/access.ts for course/lesson gating: the Learn row's
 * tier when that subscription is current, otherwise "free". A Research row
 * never contributes here.
 */
export function learnTierOf(subs: ActiveSubscriptions): Tier {
  return subs.learn && subs.learn.isCurrent ? subs.learn.tier : "free";
}

/**
 * The tier to feed canAccessResearch(): the Research row's tier when that
 * subscription is current, otherwise "free". A Learn row never contributes here.
 */
export function researchTierOf(subs: ActiveSubscriptions): Tier {
  return subs.research && subs.research.isCurrent ? subs.research.tier : "free";
}
