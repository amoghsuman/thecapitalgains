"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Search, Layers, Compass } from "lucide-react";

const STEPS = [
  {
    step: "01 / LEARN",
    title: "Mental Models",
    headline: "Understand the Core Idea",
    desc: "Deconstruct business quality, ROCE, and option payoff mechanics before placing orders. No jargon for the sake of jargon.",
    metric: "12 Curated Playbooks",
    icon: BookOpen,
    href: "/courses",
  },
  {
    step: "02 / RESEARCH",
    title: "Forensic Evidence",
    headline: "Test against Real Filings",
    desc: "Examine statutory notes, auditor qualifications, cash-conversion cycles, and management incentives on Indian corporate balance sheets.",
    metric: "Starts at ₹1 / teardown",
    icon: Search,
    href: "/pricing",
  },
  {
    step: "03 / ALLOCATE",
    title: "Position Sizing",
    headline: "Convert Conviction to Weight",
    desc: "Calculate downside risk budgets, position sizing rules, and asset allocation across market cap segments before pulling the trigger.",
    metric: "3 Model Portfolios",
    icon: Layers,
    href: "/portfolios",
  },
  {
    step: "04 / REVIEW",
    title: "Discipline Loop",
    headline: "Institutional Judgement",
    desc: "Audit post-trade results systematically. Rebalance winners, cut thesis-broken names, and refine your edge over market cycles.",
    metric: "Quarterly Cadence",
    icon: Compass,
    href: "/about",
  },
];

export default function TacticalExecutionFlow() {
  return (
    <section className="py-16 md:py-24 bg-panel border-b border-hairline">
      <div className="site-container space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-hairline/70">
          <div className="max-w-2xl space-y-2">
            <div className="font-mono text-[11px] text-gold tracking-[0.16em] font-bold uppercase">
              05 / FROM CURIOSITY TO CONVICTION
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-olive tracking-tight">
              Follow the trail: A complete investing loop.
            </h2>
            <p className="text-sm sm:text-base text-ink-dim leading-relaxed">
              True market edge isn&apos;t just finding an idea—it is the disciplined journey from foundational understanding, to forensic evidence, to risk-sized allocation and periodic review.
            </p>
          </div>
          <Link
            href="/courses"
            className="shrink-0 inline-flex items-center gap-2 text-xs font-bold text-forest hover:text-forest-dark"
          >
            <span>Explore Entire Curriculum</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 4-Step Connected Flow Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={s.step}
                className="bg-ivory border border-hairline rounded-2xl p-6 sm:p-7 flex flex-col justify-between hover:border-forest/40 hover:bg-panel transition-all shadow-2xs group relative"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-forest tracking-wider">
                      {s.step}
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-forest/10 text-forest flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-olive group-hover:text-forest transition-colors">
                      {s.title}
                    </h3>
                    <div className="text-xs font-mono text-gold font-semibold mt-0.5">
                      {s.headline}
                    </div>
                  </div>

                  <p className="text-xs text-ink-dim leading-relaxed font-normal">
                    {s.desc}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-hairline flex items-center justify-between">
                  <span className="font-mono text-[10px] text-ink-dim uppercase">
                    {s.metric}
                  </span>
                  <Link
                    href={s.href}
                    className="text-xs font-bold text-forest hover:text-forest-dark inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                  >
                    <span>Proceed</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
