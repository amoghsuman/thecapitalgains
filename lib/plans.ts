// ─── Plans & pricing — single source of truth ─────────────────────────────────
//
// Prices live here as config defaults (in ₹) AND name the Razorpay plan-id env
// vars. `lib/pricing.server.ts` overlays LIVE Razorpay amounts on top of these
// defaults when credentials + plans exist, so the site is dynamic when Razorpay
// is configured and falls back to these numbers when it is not.
//
// This file is pure (no Razorpay SDK) so it is safe to import from client
// components as well as the server.

export type ServiceKey =
  | "free"
  | "learner"
  | "pro"
  | "newsletter"
  | "essential"
  | "premium"
  | "doubt"
  | "portfolio";

export type BillingCycle = "monthly" | "annual";
export type BillingType = "free" | "subscription" | "one-time";

export type PlanConfig = {
  key: ServiceKey;
  name: string;
  description: string;
  billingType: BillingType;
  billingLabel: string;
  /** Default monthly price in ₹ (fallback when no live Razorpay amount). */
  monthlyPrice: number;
  /** Names of the Razorpay plan-id env vars (subscription plans only). */
  razorpayPlanEnv?: { monthly: string; annual: string };
};

// Per-month price when billed annually = monthly × ANNUAL_DISCOUNT.
export const ANNUAL_DISCOUNT = 0.8;

export const PLANS: PlanConfig[] = [
  {
    key: "free",
    name: "Free Access",
    description: "1 free lesson per course + newsletter preview",
    billingType: "free",
    billingLabel: "",
    monthlyPrice: 0,
  },
  {
    key: "learner",
    name: "Learner",
    description: "All courses and lessons, progress tracking, PDF playbooks",
    billingType: "subscription",
    billingLabel: "/mo",
    monthlyPrice: 999,
    razorpayPlanEnv: {
      monthly: "RAZORPAY_PLAN_LEARNER_MONTHLY",
      annual: "RAZORPAY_PLAN_LEARNER_ANNUAL",
    },
  },
  {
    key: "pro",
    name: "Pro",
    description: "Everything in Learner + early access to new courses, workbooks",
    billingType: "subscription",
    billingLabel: "/mo",
    monthlyPrice: 2499,
    razorpayPlanEnv: {
      monthly: "RAZORPAY_PLAN_PRO_MONTHLY",
      annual: "RAZORPAY_PLAN_PRO_ANNUAL",
    },
  },
  {
    key: "newsletter",
    name: "Newsletter",
    description: "Weekly market deep-dive, one trade setup per week",
    billingType: "subscription",
    billingLabel: "/mo",
    monthlyPrice: 499,
    razorpayPlanEnv: {
      monthly: "RAZORPAY_PLAN_NEWSLETTER_MONTHLY",
      annual: "RAZORPAY_PLAN_NEWSLETTER_ANNUAL",
    },
  },
  {
    key: "essential",
    name: "Essential Research",
    description: "3 model portfolios + rebalancing alerts, newsletter included",
    billingType: "subscription",
    billingLabel: "/mo",
    monthlyPrice: 4999,
    razorpayPlanEnv: {
      monthly: "RAZORPAY_PLAN_ESSENTIAL_MONTHLY",
      annual: "RAZORPAY_PLAN_ESSENTIAL_ANNUAL",
    },
  },
  {
    key: "premium",
    name: "Premium Research",
    description: "Everything in Essential + F&O notes, stock idea notes, monthly digest",
    billingType: "subscription",
    billingLabel: "/mo",
    monthlyPrice: 12499,
    razorpayPlanEnv: {
      monthly: "RAZORPAY_PLAN_PREMIUM_MONTHLY",
      annual: "RAZORPAY_PLAN_PREMIUM_ANNUAL",
    },
  },
  {
    key: "doubt",
    name: "Doubt Session",
    description: "45-minute 1:1 session to work through a specific trade, concept, or analysis",
    billingType: "one-time",
    billingLabel: "/session",
    monthlyPrice: 1,
  },
  {
    key: "portfolio",
    name: "Portfolio Review",
    description: "Detailed written review of your current portfolio with actionable commentary",
    billingType: "one-time",
    billingLabel: "/review",
    monthlyPrice: 1,
  },
];

// Row ordering (with section dividers) for the pricing table.
export type TableRow =
  | { kind: "divider"; label: string }
  | { kind: "service"; key: ServiceKey };

export const TABLE_LAYOUT: TableRow[] = [
  { kind: "service", key: "free" },
  { kind: "divider", label: "COURSES & LEARNING" },
  { kind: "service", key: "learner" },
  { kind: "service", key: "pro" },
  { kind: "divider", label: "RESEARCH & ADVISORY" },
  { kind: "service", key: "newsletter" },
  { kind: "service", key: "essential" },
  { kind: "service", key: "premium" },
  { kind: "divider", label: "1:1 SESSIONS" },
  { kind: "service", key: "doubt" },
  { kind: "service", key: "portfolio" },
];

// A plan with prices resolved for rendering (live-overlaid or config default).
export type ResolvedService = {
  key: ServiceKey;
  name: string;
  description: string;
  billingType: BillingType;
  billingLabel: string;
  priceMonthly: number; // ₹
  priceAnnual: number; // ₹, per-month-equivalent when billed annually
  live: boolean; // true when priceMonthly came from Razorpay
};

/**
 * Resolve one plan's display prices. `live` maps `${key}_monthly` → ₹ amount
 * fetched from Razorpay; anything missing falls back to the config default.
 */
export function resolveService(
  p: PlanConfig,
  live: Record<string, number> = {}
): ResolvedService {
  const liveMonthly = live[`${p.key}_monthly`];
  const monthly = liveMonthly ?? p.monthlyPrice;
  const annual =
    p.billingType === "subscription" ? Math.round(monthly * ANNUAL_DISCOUNT) : monthly;
  return {
    key: p.key,
    name: p.name,
    description: p.description,
    billingType: p.billingType,
    billingLabel: p.billingLabel,
    priceMonthly: monthly,
    priceAnnual: annual,
    live: liveMonthly != null,
  };
}

export function resolveAllServices(live: Record<string, number> = {}): ResolvedService[] {
  return PLANS.map((p) => resolveService(p, live));
}
