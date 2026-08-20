import Razorpay from "razorpay";
import { PLANS } from "./plans";

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// Derived from the single plan config in lib/plans.ts so the plan-key → env-var
// mapping can never drift from the pricing UI. Keys look like "learner_monthly".
export const PLAN_IDS: Record<string, string> = Object.fromEntries(
  PLANS.filter((p) => p.razorpayPlanEnv).flatMap((p) => [
    [`${p.key}_monthly`, process.env[p.razorpayPlanEnv!.monthly] ?? ""],
    [`${p.key}_annual`, process.env[p.razorpayPlanEnv!.annual] ?? ""],
  ])
);