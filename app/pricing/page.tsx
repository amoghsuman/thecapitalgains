"use client";

import { useState } from "react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

type LearnTier = "none" | "free" | "learner" | "pro";
type ResearchTier = "none" | "newsletter" | "essential" | "premium";
type CommunityTier = "none" | "community" | "elite";

type Tier = {
  id: string;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  features: string[];
  muted?: boolean;
  badge?: string;
};

// ─── Pricing Data ─────────────────────────────────────────────────────────────

const learnTiers: Tier[] = [
  {
    id: "none",
    name: "No education subscription",
    monthlyPrice: 0,
    annualPrice: 0,
    features: [],
    muted: true,
  },
  {
    id: "free",
    name: "FREE",
    monthlyPrice: 0,
    annualPrice: 0,
    features: ["1 free lesson per course", "Newsletter preview"],
  },
  {
    id: "learner",
    name: "LEARNER",
    monthlyPrice: 999,
    annualPrice: 799,
    features: ["All courses & lessons", "Progress tracking", "PDF playbooks"],
  },
  {
    id: "pro",
    name: "PRO",
    monthlyPrice: 2499,
    annualPrice: 1999,
    features: ["Everything in Learner", "Live monthly workshop", "Session recordings", "Workbooks"],
    badge: "MOST POPULAR",
  },
];

const researchTiers: Tier[] = [
  {
    id: "none",
    name: "No research subscription",
    monthlyPrice: 0,
    annualPrice: 0,
    features: [],
    muted: true,
  },
  {
    id: "newsletter",
    name: "NEWSLETTER",
    monthlyPrice: 499,
    annualPrice: 399,
    features: ["Weekly deep-dive", "One setup per week", "One concept per week"],
  },
  {
    id: "essential",
    name: "ESSENTIAL",
    monthlyPrice: 4999,
    annualPrice: 3999,
    features: ["Newsletter included", "3 model portfolios", "Rebalancing alerts", "Sector notes"],
  },
  {
    id: "premium",
    name: "PREMIUM",
    monthlyPrice: 12499,
    annualPrice: 9999,
    features: [
      "Everything in Essential",
      "F&O notes",
      "Earnings previews",
      "Stock idea notes",
      "Monthly digest",
    ],
    badge: "MAX",
  },
];

const communityTiers: Tier[] = [
  {
    id: "none",
    name: "No community subscription",
    monthlyPrice: 0,
    annualPrice: 0,
    features: [],
    muted: true,
  },
  {
    id: "community",
    name: "COMMUNITY",
    monthlyPrice: 999,
    annualPrice: 799,
    features: ["Private WhatsApp group", "Monthly group Q&A"],
  },
  {
    id: "elite",
    name: "ELITE ACCESS",
    monthlyPrice: 9999,
    annualPrice: 7999,
    features: [
      "Community included",
      "Unlimited 1:1 async WhatsApp",
      "Custom learning path",
    ],
    badge: "PREMIUM",
  },
];

const faqs = [
  {
    q: "Can I subscribe to just one stack?",
    a: "Yes, absolutely. Pick any combination you like — one stack, two stacks, or all three. There is no minimum bundle requirement. You only pay for what you select.",
  },
  {
    q: "Can I change my bundle later?",
    a: "Yes. Write to hello@thecapitalgains.com and we'll update your plan at the next billing cycle. Upgrades take effect immediately; downgrades take effect at the end of your current billing period.",
  },
  {
    q: "Is there a free trial?",
    a: "Every course has free preview lessons — no account or card required. The newsletter also has a free weekly edition. We believe that's more honest than a time-limited trial where you can't tell if the content is actually good.",
  },
  {
    q: "What is the research fee cap for retail investors?",
    a: "SEBI regulations cap research advisory fees for individual investors at ₹1,50,000 per annum. Our Premium Research tier at ₹12,499/month equals ₹1,49,988/year — within this limit. For institutional or non-individual clients, please write to hello@thecapitalgains.com for custom pricing.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel from your account settings or write to hello@thecapitalgains.com. Access continues until the end of your current billing period. No questions asked.",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  return "₹" + n.toLocaleString("en-IN");
}

function resolvePrice(tier: Tier, annual: boolean): number {
  if (tier.monthlyPrice === 0) return 0;
  return annual ? tier.annualPrice : tier.monthlyPrice;
}

// ─── Tier Card ────────────────────────────────────────────────────────────────

function TierCard({
  tier,
  price,
  selected,
  onClick,
}: {
  tier: Tier;
  price: number;
  selected: boolean;
  onClick: () => void;
}) {
  if (tier.muted) {
    return (
      <button
        onClick={onClick}
        className={`w-full text-left rounded-xl px-4 py-3 border transition-all ${
          selected
            ? "border-[rgba(30,18,69,0.2)] bg-[#EDE9E0]"
            : "border-[rgba(30,18,69,0.07)] bg-[#FAFAF7] hover:border-[rgba(30,18,69,0.15)]"
        }`}
      >
        <div className="flex justify-between items-center">
          <span className="text-[12px] text-[#7A7A8A]">{tier.name}</span>
          {selected && <span className="text-[#7A7A8A] text-[11px]">✓</span>}
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl px-4 py-4 border-2 transition-all relative ${
        selected
          ? "border-[#D4860A] bg-white shadow-[0_2px_16px_rgba(212,134,10,0.1)]"
          : "border-[rgba(30,18,69,0.1)] bg-white hover:border-[rgba(30,18,69,0.25)]"
      }`}
    >
      {/* Selected checkmark */}
      {selected && (
        <div className="absolute top-3 right-3 w-5 h-5 bg-[#D4860A] rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-white text-[10px] leading-none">✓</span>
        </div>
      )}

      {/* Badge (only when not selected) */}
      {tier.badge && !selected && (
        <div className="absolute top-3 right-3">
          <span className="font-mono text-[8px] font-medium bg-[rgba(212,134,10,0.12)] text-[#D4860A] rounded px-1.5 py-0.5 tracking-wider">
            {tier.badge}
          </span>
        </div>
      )}

      <div className="font-mono text-[10px] text-[#7A7A8A] tracking-widest mb-1.5 pr-10">
        {tier.name}
      </div>
      <div className="font-mono text-[20px] font-medium text-[#1E1245] leading-none mb-3">
        {price === 0 ? "₹0" : fmt(price)}
        {price > 0 && (
          <span className="text-[11px] font-normal text-[#7A7A8A] ml-1">/month</span>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        {tier.features.map((f) => (
          <div key={f} className="flex gap-2 items-start">
            <span className="text-[#1A7A4A] text-[11px] flex-shrink-0 mt-0.5">✓</span>
            <span className="text-[12px] text-[#3D3D3D] leading-snug">{f}</span>
          </div>
        ))}
      </div>
    </button>
  );
}

// ─── Stack Column ─────────────────────────────────────────────────────────────

function StackColumn({
  stackNum,
  title,
  subtitle,
  headerBg,
  tiers,
  selected,
  onSelect,
  annual,
  footer,
}: {
  stackNum: string;
  title: string;
  subtitle: string;
  headerBg: string;
  tiers: Tier[];
  selected: string;
  onSelect: (id: string) => void;
  annual: boolean;
  footer?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col">
      {/* Stack header */}
      <div className={`${headerBg} rounded-t-2xl px-6 py-5`}>
        <div className="font-mono text-[10px] text-[rgba(255,255,255,0.4)] tracking-widest mb-2">
          {stackNum}
        </div>
        <div className="font-serif text-[22px] text-white mb-1">{title}</div>
        <div className="text-[12px] text-[rgba(255,255,255,0.55)]">{subtitle}</div>
      </div>

      {/* Tier cards */}
      <div className="flex flex-col gap-2 bg-[#F4F1EB] px-4 py-4 rounded-b-2xl border-x border-b border-[rgba(30,18,69,0.1)]">
        {tiers.map((tier) => {
          const price = resolvePrice(tier, annual);
          // Clicking the currently selected (non-none) tier deselects it back to none.
          // Clicking "none" always sets to none.
          const handleClick = () => {
            if (tier.id === "none") {
              onSelect("none");
            } else {
              onSelect(selected === tier.id ? "none" : tier.id);
            }
          };
          return (
            <TierCard
              key={tier.id}
              tier={tier}
              price={price}
              selected={selected === tier.id}
              onClick={handleClick}
            />
          );
        })}
        {footer && <div className="mt-2">{footer}</div>}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);
  const [selectedLearn, setSelectedLearn] = useState<LearnTier>("none");
  const [selectedResearch, setSelectedResearch] = useState<ResearchTier>("none");
  const [selectedCommunity, setSelectedCommunity] = useState<CommunityTier>("none");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // ── Prices ─────────────────────────────────────────────────────────────────

  const learnTier = learnTiers.find((t) => t.id === selectedLearn)!;
  const researchTier = researchTiers.find((t) => t.id === selectedResearch)!;
  const communityTier = communityTiers.find((t) => t.id === selectedCommunity)!;

  const learnPrice = resolvePrice(learnTier, annual);
  const researchPrice = resolvePrice(researchTier, annual);
  const communityPrice = resolvePrice(communityTier, annual);
  const total = learnPrice + researchPrice + communityPrice;

  const hasSelection =
    selectedLearn !== "none" || selectedResearch !== "none" || selectedCommunity !== "none";

  // ── CTA URL ────────────────────────────────────────────────────────────────

  const params = new URLSearchParams();
  if (selectedLearn !== "none") params.set("learn", selectedLearn);
  if (selectedResearch !== "none") params.set("research", selectedResearch);
  if (selectedCommunity !== "none") params.set("community", selectedCommunity);
  if (annual) params.set("billing", "annual");
  const ctaUrl = `/auth/signup?${params.toString()}`;

  // ── Summary items ──────────────────────────────────────────────────────────

  const summaryItems: { label: string; price: number }[] = [];
  if (selectedLearn !== "none")
    summaryItems.push({ label: `Learn — ${learnTier.name}`, price: learnPrice });
  if (selectedResearch !== "none")
    summaryItems.push({ label: `Research — ${researchTier.name}`, price: researchPrice });
  if (selectedCommunity !== "none")
    summaryItems.push({ label: `Community — ${communityTier.name}`, price: communityPrice });

  return (
    <div className="bg-[#FAFAF7] min-h-screen overflow-x-hidden">

      {/* ── HERO ── */}
      <section className="max-w-6xl mx-auto px-8 pt-16 pb-8">
        <div className="font-mono text-[11px] text-[#7A7A8A] tracking-widest uppercase mb-2">
          Pricing
        </div>
        <h1 className="font-serif text-5xl font-bold text-[#1E1245] leading-[1.1] mb-3">
          Build your subscription
        </h1>
        <p className="text-[16px] text-[#3D3D3D] mb-8 max-w-xl">
          Choose what you need from each stack. Pay one monthly total. Cancel anytime.
        </p>

        {/* Billing toggle */}
        <div className="inline-flex items-center bg-[#F4F1EB] rounded-lg p-1 gap-1">
          <button
            onClick={() => setAnnual(false)}
            className={`px-5 py-2 rounded-md text-[13px] font-medium transition-all ${
              !annual
                ? "bg-white text-[#1E1245] shadow-sm"
                : "text-[#3D3D3D] hover:text-[#1E1245]"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setAnnual(true)}
            className={`px-5 py-2 rounded-md text-[13px] font-medium transition-all ${
              annual
                ? "bg-white text-[#1E1245] shadow-sm"
                : "text-[#3D3D3D] hover:text-[#1E1245]"
            }`}
          >
            Annual — save 20%
          </button>
        </div>
      </section>

      {/* ── THREE STACKS ── */}
      <section className="max-w-6xl mx-auto px-8 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* STACK 01 — LEARN */}
          <StackColumn
            stackNum="STACK 01"
            title="Learn"
            subtitle="Self-paced courses & playbooks"
            headerBg="bg-[#1E1245]"
            tiers={learnTiers}
            selected={selectedLearn}
            onSelect={(id) => setSelectedLearn(id as LearnTier)}
            annual={annual}
          />

          {/* STACK 02 — RESEARCH */}
          <StackColumn
            stackNum="STACK 02"
            title="Research"
            subtitle="Market analysis & model portfolios"
            headerBg="bg-[#2D1B69]"
            tiers={researchTiers}
            selected={selectedResearch}
            onSelect={(id) => setSelectedResearch(id as ResearchTier)}
            annual={annual}
            footer={
              <div className="flex flex-col gap-2 mt-1">
                <p className="font-mono text-[10px] text-[#7A7A8A] leading-relaxed">
                  For institutional / non-individual pricing, write to{" "}
                  <span className="text-[#3D3D3D]">hello@thecapitalgains.com</span>
                </p>
                <div className="bg-white border border-[rgba(30,18,69,0.1)] rounded-lg px-3 py-2.5">
                  <p className="font-mono text-[9px] text-[#7A7A8A] leading-relaxed">
                    ⚖ Research services provided under SEBI Research Analyst regulations.
                    Individual client fees capped at ₹1,50,000 per annum.
                  </p>
                </div>
              </div>
            }
          />

          {/* STACK 03 — COMMUNITY */}
          <StackColumn
            stackNum="STACK 03"
            title="Community"
            subtitle="Live sessions & direct access"
            headerBg="bg-[#3D2785]"
            tiers={communityTiers}
            selected={selectedCommunity}
            onSelect={(id) => setSelectedCommunity(id as CommunityTier)}
            annual={annual}
          />
        </div>
      </section>

      {/* ── BUNDLE SUMMARY ── */}
      <section className="max-w-6xl mx-auto px-8 mt-10 mb-20">
        <div className="bg-white border border-[rgba(30,18,69,0.1)] rounded-2xl p-8 shadow-[0_4px_32px_rgba(30,18,69,0.06)]">
          <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between">

            {/* Left — itemised selections */}
            <div className="flex-1 min-w-0">
              <div className="font-mono text-[11px] text-[#7A7A8A] tracking-widest uppercase mb-4">
                Your bundle
              </div>
              {summaryItems.length === 0 ? (
                <p className="text-[14px] text-[#7A7A8A]">
                  No tiers selected yet. Choose from the stacks above.
                </p>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {summaryItems.map((item) => (
                    <div
                      key={item.label}
                      className="flex justify-between items-center gap-8"
                    >
                      <span className="text-[14px] text-[#3D3D3D]">{item.label}</span>
                      <span className="font-mono text-[14px] text-[#1E1245] whitespace-nowrap">
                        {item.price === 0 ? "Free" : `${fmt(item.price)}/mo`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Vertical divider — desktop only */}
            <div className="hidden lg:block w-px self-stretch bg-[rgba(30,18,69,0.08)]" />

            {/* Right — total + CTA */}
            <div className="flex flex-col items-start lg:items-end gap-3 flex-shrink-0">
              <div className="lg:text-right">
                <div className="font-mono text-[11px] text-[#7A7A8A] tracking-widest uppercase mb-1">
                  Monthly total
                </div>
                <div className="font-mono text-[40px] font-medium text-[#1E1245] leading-none">
                  {fmt(total)}
                  <span className="text-[14px] font-normal text-[#7A7A8A] ml-1.5">/mo</span>
                </div>
                {annual && total > 0 && (
                  <div className="font-mono text-[11px] text-[#1A7A4A] mt-1.5">
                    Billed annually · 20% saved
                  </div>
                )}
              </div>

              {hasSelection ? (
                <Link
                  href={ctaUrl}
                  className="bg-[#D4860A] hover:bg-[#F0A020] text-white rounded-lg px-8 py-3.5 text-[15px] font-medium transition-colors whitespace-nowrap"
                >
                  Subscribe Now — {fmt(total)}/month →
                </Link>
              ) : (
                <button
                  disabled
                  className="bg-[#F4F1EB] text-[#7A7A8A] rounded-lg px-8 py-3.5 text-[15px] font-medium cursor-default whitespace-nowrap"
                >
                  Select at least one tier
                </button>
              )}

              <div className="font-mono text-[10px] text-[#7A7A8A]">Prices exclude GST</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="max-w-3xl mx-auto px-8 mt-4 pb-20">
        <h2 className="font-serif text-[28px] font-bold text-[#1E1245] mb-8">
          Common questions
        </h2>
        <div className="flex flex-col gap-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="bg-white border border-[rgba(30,18,69,0.1)] rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex justify-between items-center px-6 py-4 text-left"
              >
                <span className="text-[15px] font-medium text-[#1E1245]">
                  {faq.q}
                </span>
                <span
                  className={`font-mono text-[18px] text-[#7A7A8A] ml-4 flex-shrink-0 transition-transform duration-200 ${
                    openFaq === i ? "rotate-45" : ""
                  }`}
                >
                  +
                </span>
              </button>
              {openFaq === i && (
                <div className="px-6 pb-5 text-[14px] text-[#3D3D3D] leading-relaxed border-t border-[rgba(30,18,69,0.07)]">
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
