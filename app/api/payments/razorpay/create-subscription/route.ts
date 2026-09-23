import { NextRequest, NextResponse } from "next/server";
import { razorpay, PLAN_IDS } from "@/lib/razorpay";
import { createClient } from "@/lib/supabase/server";
import { stackOf, tierOfPlanKey } from "@/lib/plans";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { planKey } = await req.json();
  const planId = PLAN_IDS[planKey];

  if (!planId) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  try {
    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      customer_notify: 1,
      total_count: 12,
      notes: {
        user_id: session.user.id,
        user_email: session.user.email ?? "",
        plan_key: planKey,
      },
    });

    return NextResponse.json({ subscriptionId: subscription.id });
  } catch (err) {
    console.error("Razorpay error:", err);
    return NextResponse.json({ error: "Failed to create subscription" }, { status: 500 });
  }
}