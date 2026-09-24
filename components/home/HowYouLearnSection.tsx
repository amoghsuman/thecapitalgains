"use client";

import Link from "next/link";
import { BookOpen, Cpu, ShieldCheck, RefreshCw, ArrowRight, CheckCircle2 } from "lucide-react";
import PlaybookPageTurnStage from "./PlaybookPageTurnStage";
import type { MarketFact } from "@/lib/home/marketFacts";

interface HowYouLearnSectionProps {
  facts: MarketFact[];
  courseSlugs: string[];
  courseTitles: Record<string, string>;
}

export default function HowYouLearnSection({
  facts,
  courseSlugs,
  courseTitles,
}: HowYouLearnSectionProps) {
  const isAvailable = (slug: string) => courseSlugs.includes(slug);
  const getTitle = (slug: string, fallback: string) => courseTitles[slug] || fallback;

  return (
    <section id="how-you-learn-section" className="py-16 md:py-24 bg-ivory border-b border-hairline">
      <div className="site-container space-y-12">
        {/* Section Header */}
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 font-mono text-[11px] text-gold tracking-[0.16em] font-bold uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-gold" />
            <span>Pedagogical Framework</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-olive tracking-tight">
            How You&apos;ll Learn: A Four-Step Progression
          </h2>
          <p className="text-ink-dim text-sm sm:text-base leading-relaxed">
            Disciplined execution follows a four-step progression from foundational reading to institutional post-trade review.
          </p>
        </div>

        {/* Step 01: Read the chapter (with PlaybookPageTurnStage as the visual) */}
        <div className="bg-panel border border-hairline rounded-3xl p-6 sm:p-8 space-y-8 shadow-2xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-hairline">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-bold text-white bg-forest px-2.5 py-1 rounded-full">
                  STEP 01
                </span>
                <span className="font-mono text-xs text-gold uppercase tracking-wider font-bold">
                  Read the Chapter
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-olive">
                Mental Models & Foundational Principles
              </h3>
              <p className="text-ink-dim text-sm leading-relaxed">
                Deconstruct business quality, ROCE, and option payoff mechanics before placing orders. Understand market microstructure, order matching, and compounding mechanics without video filler.
              </p>
            </div>

            {/* Course reference with resolved title and Coming soon chip */}
            <div className="shrink-0 bg-ivory p-4 rounded-2xl border border-hairline max-w-sm">
              <div className="text-[10px] font-mono text-ink-muted uppercase font-bold mb-1">
                Curriculum Reference
              </div>
              <div className="flex items-center gap-2">
                {isAvailable("stock-market-from-zero") ? (
                  <Link
                    href="/courses/stock-market-from-zero"
                    className="text-xs font-bold text-olive hover:text-forest flex items-center gap-1 group"
                  >
                    <span>{getTitle("stock-market-from-zero", "Stock Market From Zero")}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                ) : (
                  <>
                    <span className="text-xs font-bold text-olive">
                      {getTitle("stock-market-from-zero", "Stock Market From Zero")}
                    </span>
                    <span className="font-mono text-[9px] px-2 py-0.5 rounded bg-hairline/80 text-ink-dim uppercase">
                      Coming soon
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Visual: Tactile Playbook Stage */}
          <div className="rounded-2xl overflow-hidden border border-hairline bg-ivory p-2 sm:p-4">
            <PlaybookPageTurnStage facts={facts} courseSlugs={courseSlugs} bare={true} />
          </div>
        </div>

        {/* Steps 02, 03, 04 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 02: Run the model */}
          <div className="bg-panel border border-hairline rounded-3xl p-6 sm:p-7 flex flex-col justify-between hover:border-forest/40 transition-colors shadow-2xs space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-white bg-forest px-2.5 py-1 rounded-full">
                  STEP 02
                </span>
                <Cpu className="w-4 h-4 text-forest" />
              </div>
              <div className="font-mono text-[10px] text-gold uppercase tracking-wider font-bold">
                Run the Model
              </div>
              <h3 className="text-lg font-bold text-olive leading-snug">
                Forensic Evidence & Interactive Simulators
              </h3>
              <p className="text-xs text-ink-dim leading-relaxed">
                Test against real statutory filings, run DCF scenarios, inspect option payoff geometries under dynamic Greeks, and verify promoter disclosures before taking risk.
              </p>
            </div>

            <div className="pt-4 border-t border-hairline space-y-2">
              <div className="text-[10px] font-mono text-ink-muted uppercase font-bold">
                Applied Reference
              </div>
              <div className="flex items-center gap-2">
                {isAvailable("how-to-read-financial-statements") ? (
                  <Link
                    href="/courses/how-to-read-financial-statements"
                    className="text-xs font-semibold text-forest hover:text-forest-dark flex items-center gap-1 group font-mono"
                  >
                    <span>{getTitle("how-to-read-financial-statements", "Financial Statements")}</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                ) : (
                  <>
                    <span className="text-xs font-semibold text-olive font-mono">
                      {getTitle("how-to-read-financial-statements", "Financial Statements")}
                    </span>
                    <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-hairline/80 text-ink-dim uppercase">
                      Coming soon
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Step 03: Execute with rules */}
          <div className="bg-panel border border-hairline rounded-3xl p-6 sm:p-7 flex flex-col justify-between hover:border-forest/40 transition-colors shadow-2xs space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-white bg-forest px-2.5 py-1 rounded-full">
                  STEP 03
                </span>
                <ShieldCheck className="w-4 h-4 text-forest" />
              </div>
              <div className="font-mono text-[10px] text-gold uppercase tracking-wider font-bold">
                Execute with Rules
              </div>
              <h3 className="text-lg font-bold text-olive leading-snug">
                Position Sizing & Risk Budgets
              </h3>
              <p className="text-xs text-ink-dim leading-relaxed">
                Convert conviction into allocation weight. Calculate downside risk budgets, position sizing limits, and multi-asset allocation across market cap segments.
              </p>
            </div>

            <div className="pt-4 border-t border-hairline space-y-2">
              <div className="text-[10px] font-mono text-ink-muted uppercase font-bold">
                Applied Reference
              </div>
              <div className="flex items-center gap-2">
                {isAvailable("mutual-funds-etfs-complete-guide") ? (
                  <Link
                    href="/courses/mutual-funds-etfs-complete-guide"
                    className="text-xs font-semibold text-forest hover:text-forest-dark flex items-center gap-1 group font-mono"
                  >
                    <span>{getTitle("mutual-funds-etfs-complete-guide", "Portfolio Allocation")}</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                ) : (
                  <>
                    <span className="text-xs font-semibold text-olive font-mono">
                      {getTitle("mutual-funds-etfs-complete-guide", "Portfolio Allocation")}
                    </span>
                    <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-hairline/80 text-ink-dim uppercase">
                      Coming soon
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Step 04: Review and repeat */}
          <div className="bg-panel border border-hairline rounded-3xl p-6 sm:p-7 flex flex-col justify-between hover:border-forest/40 transition-colors shadow-2xs space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-white bg-forest px-2.5 py-1 rounded-full">
                  STEP 04
                </span>
                <RefreshCw className="w-4 h-4 text-forest" />
              </div>
              <div className="font-mono text-[10px] text-gold uppercase tracking-wider font-bold">
                Review and Repeat
              </div>
              <h3 className="text-lg font-bold text-olive leading-snug">
                Institutional Judgement & Discipline Loop
              </h3>
              <p className="text-xs text-ink-dim leading-relaxed">
                Audit post-trade results systematically. Rebalance winners, prune thesis-broken names, and refine your operational edge across macroeconomic cycles.
              </p>
            </div>

            <div className="pt-4 border-t border-hairline space-y-2">
              <div className="text-[10px] font-mono text-ink-muted uppercase font-bold">
                Applied Reference
              </div>
              <Link
                href="/portfolios"
                className="text-xs font-semibold text-forest hover:text-forest-dark flex items-center gap-1 group font-mono"
              >
                <span>Model Portfolios & Rebalancing Cadence</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
