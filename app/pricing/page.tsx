"use client";

import { useState } from "react";
import Link from "next/link";

const plans = [
  {
    id: "free",
    name: "FREE",
    monthlyPrice: "₹0",
    annualPrice: "₹0",
    period: "always free",
    badge: null,
    highlight: false,
    disabled: false,
    features: ["1 free lesson per course", "Weekly newsletter"],
    missing: ["Full course access", "Model portfolios", "Community"],
    cta: "Get started",
    ctaHref: "/courses",
    ctaStyle: "border" as const,
  },
  {
    id: "learner",
    name: "LEARNER",
    monthlyPrice: "₹299",
    annualPrice: "₹239",
    period: "per month",
    badge: null,
    highlight: false,
    disabled: false,
    features: [
      "All courses, all lessons",
      "Interactive exercises",
      "Progress tracking",
      "New courses as added",
    ],
    missing: ["WhatsApp community", "Live Q&A"],
    cta: "Start learning",
    ctaHref: "#",
    ctaStyle: "secondary" as const,
  },
  {
    id: "pro",
    name: "TRADER PRO",
    monthlyPrice: "₹999",
    annualPrice: "₹799",
    period: "per month",
    badge: "MOST POPULAR",
    highlight: true,
    disabled: false,
    features: [
      "Everything in Learner",
      "Private WhatsApp community",
      "Monthly live Q&A",
      "Downloadable PDF playbooks",
      "Priority support",
    ],
    missing: [],
    cta: "Go Pro",
    ctaHref: "#",
    ctaStyle: "primary" as const,
  },
  {
    id: "elite",
    name: "ELITE",
    monthlyPrice: "₹2,499",
    annualPrice: "₹1,999",
    period: "coming soon",
    badge: "COMING SOON",
    highlight: false,
    disabled: true,
    features: [
      "Everything in Pro",
      "Model portfolio research",
      "1:1 monthly session (30 min)",
      "Early access to new content",
    ],
    missing: [],
    cta: "Join waitlist",
    ctaHref: "#",
    ctaStyle: "disabled" as const,
  },
];

const tableFeatures: { label: string; free: boolean | "soon"; learner: boolean | "soon"; pro: boolean | "soon"; elite: boolean | "soon" }[] = [
  { label: "Free lesson previews", free: true, learner: true, pro: true, elite: true },
  { label: "Full course access", free: false, learner: true, pro: true, elite: true },
  { label: "Interactive exercises", free: false, learner: true, pro: true, elite: true },
  { label: "Progress tracking", free: false, learner: true, pro: true, elite: true },
  { label: "Downloadable PDFs", free: false, learner: false, pro: true, elite: true },
  { label: "WhatsApp community", free: false, learner: false, pro: true, elite: true },
  { label: "Monthly live Q&A", free: false, learner: false, pro: true, elite: true },
  { label: "Model portfolios", free: false, learner: false, pro: false, elite: "soon" },
  { label: "1:1 monthly session", free: false, learner: false, pro: false, elite: "soon" },
];

const faqs = [
  {
    q: "Can I cancel anytime?",
    a: "Yes, absolutely. There are no lock-ins. You can cancel your subscription at any time from your account settings and you will retain access until the end of your current billing period. No questions asked.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit and debit cards (Visa, Mastercard, RuPay), UPI, and net banking via Razorpay. All payments are processed securely and your card details are never stored on our servers.",
  },
  {
    q: "Is there a free trial?",
    a: "Every course has at least one free preview lesson — no sign-up required. You can read real course content, see the writing style, and experience the format before you pay. We believe that's more honest than a time-limited trial.",
  },
  {
    q: "What's the difference between Learner and Trader Pro?",
    a: "Learner gives you complete access to all course content — every lesson, every exercise, every future course we add. Trader Pro adds the community layer: a private WhatsApp group where you can ask questions, share trades, and get feedback, plus a monthly live Q&A session and downloadable PDF playbooks for offline reference.",
  },
  {
    q: "When will Elite launch?",
    a: "Elite is currently in development. It will include model portfolio research, a 1:1 monthly session with a market practitioner, and early access to new content and tools. Join the waitlist to be notified first — waitlist members will get a founding-member discount at launch.",
  },
];

function Cell({ val }: { val: boolean | "soon" }) {
  if (val === true)
    return <span className="text-[#1A7A4A] text-[16px]">✓</span>;
  if (val === "soon")
    return <span className="font-mono text-[11px] text-[#9494A8]">Soon</span>;
  return <span className="text-[#9494A8] text-[15px]">—</span>;
}

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="bg-[#FAFAF7] min-h-screen overflow-x-hidden">

      {/* ── HERO ── */}
      <section className="max-w-6xl mx-auto px-8 pt-16 pb-10">
        <div className="font-mono text-[11px] text-[#9494A8] tracking-widest uppercase mb-2">
          Pricing
        </div>
        <h1 className="font-serif text-5xl font-bold text-[#0F2348] leading-[1.1] mb-3">
          Simple, transparent pricing
        </h1>
        <p className="text-[16px] text-[#5A5A72] mb-8">
          Start free. Upgrade when you&apos;re ready. Cancel anytime.
        </p>

        {/* Toggle */}
        <div className="inline-flex items-center bg-[#F4F1EB] rounded-lg p-1 gap-1">
          <button
            onClick={() => setAnnual(false)}
            className={`px-5 py-2 rounded-md text-[13px] font-medium transition-all ${
              !annual
                ? "bg-white text-[#0F2348] shadow-sm"
                : "text-[#5A5A72] hover:text-[#0F2348]"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setAnnual(true)}
            className={`px-5 py-2 rounded-md text-[13px] font-medium transition-all ${
              annual
                ? "bg-white text-[#0F2348] shadow-sm"
                : "text-[#5A5A72] hover:text-[#0F2348]"
            }`}
          >
            Annual — save 20%
          </button>
        </div>
      </section>

      {/* ── PRICING CARDS ── */}
      <section className="max-w-6xl mx-auto px-8 pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-2xl p-6 relative flex flex-col ${
                plan.highlight
                  ? "border-2 border-[#D4860A] bg-white"
                  : plan.disabled
                  ? "border border-dashed border-[rgba(15,35,72,0.15)] bg-[#F4F1EB]"
                  : "border border-[rgba(15,35,72,0.1)] bg-white"
              }`}
            >
              {plan.badge === "MOST POPULAR" && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#D4860A] text-white font-mono text-[9px] font-medium rounded-full px-3 py-1 tracking-wider whitespace-nowrap">
                  MOST POPULAR
                </div>
              )}
              {plan.badge === "COMING SOON" && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#9494A8] text-white font-mono text-[9px] font-medium rounded-full px-3 py-1 tracking-wider whitespace-nowrap">
                  COMING SOON
                </div>
              )}

              <div className="font-mono text-[11px] text-[#9494A8] tracking-widest mb-2">
                {plan.name}
              </div>
              <div
                className={`font-mono text-[30px] font-medium mb-0.5 leading-none ${
                  plan.disabled ? "text-[#9494A8]" : "text-[#0F2348]"
                }`}
              >
                {annual && plan.id !== "free" ? plan.annualPrice : plan.monthlyPrice}
              </div>
              <div className="text-[12px] text-[#9494A8] mb-5">
                {plan.disabled ? plan.period : annual && plan.id !== "free" ? "per month, billed annually" : plan.period}
              </div>

              <div className="flex flex-col gap-2 mb-6 flex-1">
                {plan.features.map((f) => (
                  <div key={f} className="flex gap-2 text-[13px] text-[#5A5A72]">
                    <span className="text-[#1A7A4A] flex-shrink-0">✓</span>
                    {f}
                  </div>
                ))}
                {plan.missing.map((f) => (
                  <div key={f} className="flex gap-2 text-[13px] text-[#9494A8]">
                    <span className="flex-shrink-0">—</span>
                    {f}
                  </div>
                ))}
              </div>

              <Link
                href={plan.ctaHref}
                className={`block text-center rounded-lg py-2.5 text-[13px] font-medium transition-all ${
                  plan.ctaStyle === "primary"
                    ? "bg-[#D4860A] hover:bg-[#F0A020] text-white"
                    : plan.ctaStyle === "secondary"
                    ? "bg-[#F4F1EB] hover:bg-[#EDE9E0] text-[#0F2348]"
                    : plan.ctaStyle === "border"
                    ? "border border-[rgba(15,35,72,0.2)] text-[#5A5A72] hover:border-[#0F2348] hover:text-[#0F2348]"
                    : "bg-[#F4F1EB] text-[#9494A8] pointer-events-none"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── COMPARISON TABLE ── */}
      <section className="max-w-6xl mx-auto px-8 mt-16">
        <h2 className="font-serif text-[28px] font-bold text-[#0F2348] mb-8">
          Everything that&apos;s included
        </h2>
        <div className="rounded-2xl overflow-hidden border border-[rgba(15,35,72,0.1)]">
          {/* Header */}
          <div className="grid grid-cols-5 bg-[#0F2348]">
            <div className="px-5 py-4 font-mono text-[11px] text-[rgba(255,255,255,0.5)] tracking-widest uppercase">
              Feature
            </div>
            {["Free", "Learner", "Pro", "Elite"].map((col) => (
              <div
                key={col}
                className="px-5 py-4 font-mono text-[11px] text-white tracking-widest uppercase text-center"
              >
                {col}
              </div>
            ))}
          </div>
          {/* Rows */}
          {tableFeatures.map((row, i) => (
            <div
              key={row.label}
              className={`grid grid-cols-5 border-t border-[rgba(15,35,72,0.07)] ${
                i % 2 === 0 ? "bg-white" : "bg-[#F4F1EB]"
              }`}
            >
              <div className="px-5 py-3.5 text-[13px] text-[#0F2348] font-medium">
                {row.label}
              </div>
              {(["free", "learner", "pro", "elite"] as const).map((col) => (
                <div
                  key={col}
                  className="px-5 py-3.5 flex items-center justify-center"
                >
                  <Cell val={row[col]} />
                </div>
              ))}
            </div>  
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="max-w-3xl mx-auto px-8 mt-16 pb-20">
        <h2 className="font-serif text-[28px] font-bold text-[#0F2348] mb-8">
          Common questions
        </h2>
        <div className="flex flex-col gap-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="bg-white border border-[rgba(15,35,72,0.1)] rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex justify-between items-center px-6 py-4 text-left"
              >
                <span className="text-[15px] font-medium text-[#0F2348]">
                  {faq.q}
                </span>
                <span
                  className={`font-mono text-[18px] text-[#9494A8] ml-4 flex-shrink-0 transition-transform ${
                    openFaq === i ? "rotate-45" : ""
                  }`}
                >
                  +
                </span>
              </button>
              {openFaq === i && (
                <div className="px-6 pb-5 text-[14px] text-[#5A5A72] leading-relaxed border-t border-[rgba(15,35,72,0.07)]">
                  <div className="pt-4">{faq.a}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
