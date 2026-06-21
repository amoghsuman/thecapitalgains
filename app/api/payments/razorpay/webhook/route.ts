import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  if (expected !== signature) {
    console.error("Webhook signature mismatch");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(body);
  console.log("Webhook event received:", event.event);

  const sub = event?.payload?.subscription?.entity;
  const payment = event?.payload?.payment?.entity;
  const userId = sub?.notes?.user_id;
  const planKey: string = sub?.notes?.plan_key ?? "";

  console.log("userId:", userId, "planKey:", planKey, "sub:", sub?.id);

  if (!userId) {
    console.error("No user_id in webhook notes");
    return NextResponse.json({ received: true });
  }

  const tier = planKey.startsWith("pro")
    ? "pro"
    : planKey.startsWith("learner")
    ? "learner"
    : planKey.startsWith("premium")
    ? "premium"
    : planKey.startsWith("essential")
    ? "essential"
    : planKey.startsWith("newsletter")
    ? "newsletter"
    : "free";

  const supabase = await createClient();

  switch (event.event) {
    case "subscription.activated":
    case "subscription.charged": {
      const periodStart = sub.current_start
        ? new Date(sub.current_start * 1000).toISOString()
        : new Date().toISOString();
      const periodEnd = sub.current_end
        ? new Date(sub.current_end * 1000).toISOString()
        : null;

      const { error } = await supabase.from("subscriptions").upsert({
        user_id: userId,
        tier: tier,
        billing_cycle: planKey.endsWith("annual") ? "annual" : "monthly",
        amount_paise: sub.plan_id ? null : null,
        status: "active",
        razorpay_subscription_id: sub.id,
        razorpay_plan_id: sub.plan_id ?? null,
        razorpay_payment_id: payment?.id ?? null,
        current_period_start: periodStart,
        current_period_end: periodEnd,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });

      if (error) console.error("Supabase upsert error:", error);
      else console.log("Subscription activated/charged for user:", userId);
      break;
    }

    case "subscription.cancelled": {
      const { error } = await supabase.from("subscriptions")
        .update({ status: "cancelled", updated_at: new Date().toISOString() })
        .eq("user_id", userId);
      if (error) console.error("Supabase cancel error:", error);
      break;
    }

    case "subscription.completed":
    case "payment.failed": {
      const { error } = await supabase.from("subscriptions")
        .update({ status: "expired", updated_at: new Date().toISOString() })
        .eq("user_id", userId);
      if (error) console.error("Supabase expire error:", error);
      break;
    }
  }

  return NextResponse.json({ received: true });
}