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
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(body);
  const sub = event?.payload?.subscription?.entity;
  const userId = sub?.notes?.user_id;
  const planKey: string = sub?.notes?.plan_key ?? "";

  if (!userId) {
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
    case "subscription.charged":
      await supabase.from("subscriptions").upsert({
        user_id: userId,
        tier: tier,
        status: "active",
        razorpay_subscription_id: sub.id,
        valid_until: new Date(sub.charge_at * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });
      break;

    case "subscription.cancelled":
      await supabase.from("subscriptions")
        .update({ status: "cancelled", updated_at: new Date().toISOString() })
        .eq("user_id", userId);
      break;

    case "subscription.completed":
    case "payment.failed":
      await supabase.from("subscriptions")
        .update({ status: "expired", updated_at: new Date().toISOString() })
        .eq("user_id", userId);
      break;
  }

  return NextResponse.json({ received: true });
}