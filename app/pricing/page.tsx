"use client";

import { useState } from "react";
import Link from "next/link";
import "@/app/premium-theme.css";

// ─── Types ────────────────────────────────────────────────────────────────────

type LearnTier = "none" | "free" | "learner" | "pro";
type ResearchTier = "none" | "newsletter" | "essential" | "premium";

type Tier = {
  id: string;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  features: string[];
  muted?: boolean;
  badge?: string;
  color?: string;
};

// ─── Pricing Data ─────────────────────────────────────────────────────────────

const learnTiers: Tier[] = [
  {
    id: "free",
    name: "FREE",
    monthlyPrice: 0,
    annualPrice: 0,
    features: ["1 free lesson per course", "Newsletter preview"],
    color: "emerald"
  },
  {
    id: "learner",
    name: "LEARNER",
    monthlyPrice: 999,
    annualPrice: 799,
    features: ["All courses & lessons", "Progress tracking", "PDF playbooks"],
    color: "violet"
  },
  {
    id: "pro",
    name: "PRO",
    monthlyPrice: 2499,
    annualPrice: 1999,
    features: [
      "Everything in Learner",
      "Early access to new courses",
      "Session recordings",
      "Workbooks",
    ],
    badge: "MOST POPULAR",
    color: "amber"
  },
];

const researchTiers: Tier[] = [
  {
    id: "newsletter",
    name: "NEWSLETTER",
    monthlyPrice: 499,
    annualPrice: 399,
    features: ["Weekly deep-dive", "One setup per week", "One concept per week"],
    color: "slate"
  },
  {
    id: "essential",
    name: "ESSENTIAL",
    monthlyPrice: 4999,
    annualPrice: 3999,
    features: ["Newsletter included", "3 model portfolios", "Rebalancing alerts"],
    color: "violet"
  },
  {
    id: "premium",
    name: "PREMIUM",
    monthlyPrice: 12499,
    annualPrice: 9999,
    features: [
      "Everything in Essential",
      "F&O notes",
      "Stock idea notes",
      "Monthly digest",
    ],
    badge: "MAX",
    color: "amber"
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
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl p-6 border transition-all relative group flex flex-col h-full shadow-sm ${
        selected
          ? "border-[#1E1245] bg-white shadow-md ring-2 ring-[rgba(30,18,69,0.08)]"
          : "border-[rgba(30,18,69,0.12)] bg-white hover:border-[rgba(30,18,69,0.25)] hover:shadow-md"
      }`}
    >
      <div className="flex justify-between items-start mb-6">
        <div className={`p-2 rounded-lg ${selected ? 'bg-[#1E1245] text-white' : 'bg-[#F5F3FF] text-[#8B7BAB] group-hover:bg-[#EDE9FF]'} transition-colors`}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        {tier.badge && (
          <span className="bg-[#D4860A] text-white text-[9px] font-bold px-2 py-1 rounded tracking-widest uppercase">
            {tier.badge}
          </span>
        )}
      </div>

      <div className="font-mono text-[10px] text-slate-400 tracking-[0.2em] mb-1.5 uppercase font-bold">
        {tier.name}
      </div>
      <div className="text-2xl font-bold text-[#1E1245] leading-none mb-6 font-mono">
        {price === 0 ? "Free" : fmt(price)}
        {price > 0 && (
          <span className="text-xs font-normal text-[#8B7BAB] ml-1">/ mo</span>
        )}
      </div>
      
      <div className="flex flex-col gap-3 flex-1">
        {tier.features.map((f) => (
          <div key={f} className="flex gap-3 items-start">
            <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M5 13l4 4L19 7" /></svg>
            </div>
            <span className="text-[13px] text-[#4B3F6B] leading-snug font-medium">{f}</span>
          </div>
        ))}
      </div>
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);
  const [selectedLearn, setSelectedLearn] = useState<LearnTier>("learner");
  const [selectedResearch, setSelectedResearch] = useState<ResearchTier>("none");

  const learnTier = learnTiers.find((t) => t.id === selectedLearn);
  const researchTier = researchTiers.find((t) => t.id === selectedResearch);

  const learnPrice = learnTier ? resolvePrice(learnTier, annual) : 0;
  const researchPrice = researchTier ? resolvePrice(researchTier, annual) : 0;
  const total = learnPrice + researchPrice;

  return (
    <div className="bg-[#FAFAF7] min-h-screen pb-32 font-sans">

      {/* ── HEADER ── */}
      <header className="bg-[#1E1245] py-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[100%] rounded-full bg-[rgba(139,92,246,0.1)] blur-[120px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[100%] rounded-full bg-[rgba(99,102,241,0.08)] blur-[100px]" />
        </div>

        <div className="max-w-4xl mx-auto px-8 relative z-10">
          <div className="inline-flex items-center gap-3 bg-white/10 border border-white/15 rounded-full px-5 py-2 mb-8">
            <span className="font-mono text-[11px] text-[#A78BFA] tracking-[0.3em] font-bold uppercase">Pricing</span>
          </div>
          <h1 className="text-6xl font-bold text-white tracking-tight leading-tight mb-6">
            Build your stack. <span className="text-[#D4860A]">Own your edge.</span>
          </h1>
          <p className="text-white/60 text-xl leading-relaxed max-w-2xl mx-auto mb-10">
            Combine education and high-performance research.
            No complex contracts. Just pure signal.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center bg-white/10 border border-white/15 rounded-2xl p-1.5">
            <button
              onClick={() => setAnnual(false)}
              className={`px-8 py-3 rounded-xl text-sm font-bold tracking-tight transition-all ${
                !annual ? "bg-white text-[#1E1245] shadow-xl" : "text-white/50 hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-8 py-3 rounded-xl text-sm font-bold tracking-tight transition-all ${
                annual ? "bg-white text-[#1E1245] shadow-xl" : "text-white/50 hover:text-white"
              }`}
            >
              Annual — Save 20%
            </button>
          </div>
        </div>
      </header>

      {/* ── BUILDER SECTION ── */}
      <main className="max-w-6xl mx-auto px-8 pt-16 space-y-24">
        
        {/* Stack 01: Learn */}
        <section>
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 rounded-xl bg-[#1E1245] text-white flex items-center justify-center font-bold">01</div>
            <div>
              <h2 className="text-2xl font-bold text-[#1E1245] tracking-tight">The Learning Stack</h2>
              <p className="text-[#4B3F6B] text-sm font-medium">Step-by-step playbooks for market mastery.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {learnTiers.map((tier) => (
              <TierCard
                key={tier.id}
                tier={tier}
                price={resolvePrice(tier, annual)}
                selected={selectedLearn === tier.id}
                onClick={() => setSelectedLearn(selectedLearn === tier.id ? "none" : tier.id as LearnTier)}
              />
            ))}
          </div>
        </section>

        {/* Stack 02: Research */}
        <section>
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 rounded-xl bg-[#D4860A] text-white flex items-center justify-center font-bold">02</div>
            <div>
              <h2 className="text-2xl font-bold text-[#1E1245] tracking-tight">The Research Stack</h2>
              <p className="text-[#4B3F6B] text-sm font-medium">Model portfolios and sectoral deep-dives.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {researchTiers.map((tier) => (
              <TierCard
                key={tier.id}
                tier={tier}
                price={resolvePrice(tier, annual)}
                selected={selectedResearch === tier.id}
                onClick={() => setSelectedResearch(selectedResearch === tier.id ? "none" : tier.id as ResearchTier)}
              />
            ))}
          </div>
          <div className="mt-8 p-6 rounded-2xl border border-[rgba(30,18,69,0.12)] flex items-center justify-between gap-8">
            <p className="text-xs font-medium text-[#4B3F6B] leading-relaxed max-w-xl">
              ⚖ Research services are provided under SEBI Research Analyst regulations.
              Individual fees are capped at ₹1.5L per annum. For institutional pricing,
              please write to <span className="text-[#D4860A] font-bold">hello@thecapitalgains.com</span>
            </p>
            <div className="hidden sm:block px-4 py-2 bg-white rounded-lg border border-[rgba(30,18,69,0.12)] text-[10px] font-bold text-[#8B7BAB] tracking-widest uppercase">SEBI RA</div>
          </div>
        </section>

        {/* BUNDLE SUMMARY */}
        <section className="sticky bottom-0 z-50">
          <div className="bg-[#1E1245] rounded-3xl p-10 shadow-2xl shadow-[#1E1245]/40 border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/10 blur-[80px] rounded-full -mr-32 -mt-32" />
            
            <div className="flex flex-col lg:flex-row gap-12 items-center justify-between relative z-10">
              <div className="flex-1">
                <div className="font-mono text-[10px] text-violet-400 tracking-[0.3em] font-bold uppercase mb-6">Your Performance Bundle</div>
                <div className="flex flex-wrap gap-4">
                  {selectedLearn !== "none" && (
                    <div className="px-5 py-3 bg-white/5 border border-white/10 rounded-2xl">
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Learn</div>
                      <div className="text-white font-bold">{learnTier?.name}</div>
                    </div>
                  )}
                  {selectedResearch !== "none" && (
                    <div className="px-5 py-3 bg-white/5 border border-white/10 rounded-2xl">
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Research</div>
                      <div className="text-white font-bold">{researchTier?.name}</div>
                    </div>
                  )}
                  {selectedLearn === "none" && selectedResearch === "none" && (
                    <div className="text-[#94A3B8] font-medium italic">No tiers selected. Choose from the stacks above.</div>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-10">
                <div className="text-center sm:text-right">
                  <div className="font-mono text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Total Monthly</div>
                  <div className="text-5xl font-bold text-white tracking-tight">
                    {fmt(total)}
                    <span className="text-lg font-normal text-slate-400 ml-2">/mo</span>
                  </div>
                  {annual && total > 0 && <div className="text-xs font-bold text-emerald-400 mt-2">Annual Billing Applied · Save 20%</div>}
                </div>

                <Link 
                  href="/auth/signup" 
                  className={`premium-button-primary !py-5 !px-10 text-base font-bold tracking-tight shadow-xl shadow-violet-600/30 transition-all ${total === 0 ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  Confirm Subscription →
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
