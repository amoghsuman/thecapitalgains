// Turns one Razorpay subscription webhook event into `subscriptions` writes.
//
// Every write is scoped to (user_id, stack): the stack comes from the plan key
// in the subscription's notes (lib/plans.ts stackOf), so a Research event can
// only ever create, update, cancel or expire the user's Research row, and a
// Learn event only the Learn row. The route handler verifies the signature and
// hands the parsed event here; scripts/check-webhook-stacks.mjs drives this
// same function against a test user to prove the isolation.

import type { SupabaseClient } from "@supabase/supabase-js";
import { stackOf, tierOfPlanKey, type Stack } from "@/lib/plans";

export type RazorpaySubscriptionEntity = {
  id: string;
  plan_id?: string | null;
  current_start?: number | null;
  current_end?: number | null;
  notes?: { user_id?: string; plan_key?: string; user_email?: string } | null;
};

export type RazorpayPaymentEntity = {
  id: string;
  amount?: number | null;
};

export type RazorpayWebhookEvent = {
  event: string;
  payload?: {
    subscription?: { entity?: RazorpaySubscriptionEntity };
    payment?: { entity?: RazorpayPaymentEntity };
  };
};

export type ApplyResult = {
  action: "activated" | "cancelled" | "expired" | "ignored";
  userId: string | null;
  stack: Stack | null;
  error: string | null;
};

const ACTIVATE_EVENTS = new Set(["subscription.activated", "subscription.charged"]);
const CANCEL_EVENTS = new Set(["subscription.cancelled"]);
const EXPIRE_EVENTS = new Set(["subscription.completed", "payment.failed"]);

export async function applyRazorpayEvent(
  supabase: SupabaseClient,
  event: RazorpayWebhookEvent,
  now: Date = new Date()
): Promise<ApplyResult> {
  const sub = event.payload?.subscription?.entity;
  const payment = event.payload?.payment?.entity;
  const userId = sub?.notes?.user_id ?? null;
  const planKey = sub?.notes?.plan_key ?? "";

  if (!sub || !userId) {
    return { action: "ignored", userId, stack: null, error: "no subscription entity or user_id in notes" };
  }

  const tier = tierOfPlanKey(planKey);
  if (!tier) {
    return { action: "ignored", userId, stack: null, error: `unknown plan_key "${planKey}"` };
  }
  const stack = stackOf(tier);
  const nowIso = now.toISOString();

  if (ACTIVATE_EVENTS.has(event.event)) {
    const periodStart = sub.current_start ? new Date(sub.current_start * 1000).toISOString() : nowIso;
    const periodEnd = sub.current_end ? new Date(sub.current_end * 1000).toISOString() : null;

    const { error } = await supabase.from("subscriptions").upsert(
      {
        user_id: userId,
        stack,
        tier,
        billing_cycle: planKey.endsWith("annual") ? "annual" : "monthly",
        amount_paise: payment?.amount ?? null,
        status: "active",
        razorpay_subscription_id: sub.id,
        razorpay_plan_id: sub.plan_id ?? null,
        razorpay_payment_id: payment?.id ?? null,
        current_period_start: periodStart,
        current_period_end: periodEnd,
        updated_at: nowIso,
      },
      { onConflict: "user_id,stack" }
    );
    return { action: "activated", userId, stack, error: error?.message ?? null };
  }

  if (CANCEL_EVENTS.has(event.event) || EXPIRE_EVENTS.has(event.event)) {
    const status = CANCEL_EVENTS.has(event.event) ? "cancelled" : "expired";
    const { error } = await supabase
      .from("subscriptions")
      .update({ status, updated_at: nowIso })
      .eq("user_id", userId)
      .eq("stack", stack);
    return { action: status, userId, stack, error: error?.message ?? null };
  }

  return { action: "ignored", userId, stack, error: null };
}
