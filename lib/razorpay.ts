import Razorpay from "razorpay";

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export const PLAN_IDS: Record<string, string> = {
  learner_monthly: process.env.RAZORPAY_PLAN_LEARNER_MONTHLY!,
  learner_annual: process.env.RAZORPAY_PLAN_LEARNER_ANNUAL!,
  pro_monthly: process.env.RAZORPAY_PLAN_PRO_MONTHLY!,
  pro_annual: process.env.RAZORPAY_PLAN_PRO_ANNUAL!,
  newsletter_monthly: process.env.RAZORPAY_PLAN_NEWSLETTER_MONTHLY!,
  newsletter_annual: process.env.RAZORPAY_PLAN_NEWSLETTER_ANNUAL!,
  essential_monthly: process.env.RAZORPAY_PLAN_ESSENTIAL_MONTHLY!,
  essential_annual: process.env.RAZORPAY_PLAN_ESSENTIAL_ANNUAL!,
  premium_monthly: process.env.RAZORPAY_PLAN_PREMIUM_MONTHLY!,
  premium_annual: process.env.RAZORPAY_PLAN_PREMIUM_ANNUAL!,
};