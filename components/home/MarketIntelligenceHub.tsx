"use client";

import MarketSentimentGauge from "@/components/home/MarketSentimentGauge";
import GlossaryOfTheWeek from "@/components/home/GlossaryOfTheWeek";

export default function MarketIntelligenceHub() {
  return (
    <section id="market-intelligence-hub" className="py-16 md:py-20 bg-ivory border-b border-hairline">
      <div className="site-container space-y-9">
        <div className="max-w-3xl">
          <div className="font-mono text-[11px] text-gold tracking-[0.16em] font-bold uppercase mb-2">
            PRACTICAL INTEL &amp; LEXICON
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-olive tracking-tight">
            Curiosity to Clarity: Market Sentiment &amp; Core Lexicon
          </h2>
          <p className="text-ink-dim text-sm sm:text-base mt-2 leading-relaxed">
            Monitor real-time behavioral sentiment on the Nifty 50 via our D3 telemetry gauge, and replace retail slang with institutional definitions from our curated weekly glossary.
          </p>
        </div>

        {/* 2-Column Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
          <MarketSentimentGauge />
          <GlossaryOfTheWeek />
        </div>
      </div>
    </section>
  );
}
