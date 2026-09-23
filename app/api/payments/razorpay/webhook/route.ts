import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import { applyRazorpayEvent, type RazorpayWebhookEvent } from "@/lib/payments/applyRazorpayEvent";

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

  const event = JSON.parse(body) as RazorpayWebhookEvent;
  console.log("Webhook event received:", event.event);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // All row writes live in lib/payments/applyRazorpayEvent.ts so they can be
  // exercised without a signed request (scripts/check-webhook-stacks.mjs).
  const result = await applyRazorpayEvent(supabase, event);
  if (result.error) console.error("Webhook apply error:", result.error);
  else console.log("Webhook applied:", result.action, "user:", result.userId, "stack:", result.stack);

  return NextResponse.json({ received: true });
}
