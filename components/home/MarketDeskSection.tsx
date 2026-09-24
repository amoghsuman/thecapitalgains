"use client";

import { useState } from "react";
import { Compass, Activity, Gauge, BookOpen } from "lucide-react";
import MarketObservatoryRadar from "./MarketObservatoryRadar";
import NiftyConstituentTreemap from "./NiftyConstituentTreemap";
import MarketSentimentGauge from "./MarketSentimentGauge";
import GlossaryOfTheWeek from "./GlossaryOfTheWeek";
import { MarketPulseStrip } from "./MarketPulseToast";
import { useMarketSnapshot } from "@/lib/market/useMarketSnapshot";
import { liveLabel } from "@/lib/market/client";
import type { MarketFact } from "@/lib/home/marketFacts";
import type { GlossaryTerm, MarketFactCard } from "@/lib/sanity/queries";

interface MarketDeskSectionProps {
  courseTitles: Record<string, string>;
  facts: MarketFact[];
  glossaryTerms: GlossaryTerm[];
  factCards: MarketFactCard[];
}

type MarketDeskTab = "heatmap" | "sentiment" | "glossary";

export default function MarketDeskSection({ courseTitles, facts, glossaryTerms, factCards }: MarketDeskSectionProps) {
  const [activeTab, setActiveTab] = useState<MarketDeskTab>("heatmap");
  const market = useMarketSnapshot();
  const isLive = market.status === "ready";
  const timeLabel = isLive ? liveLabel(market.data.fetchedAt) : "Sample data";

  return (
    <section id="market-desk-section" className="py-16 md:py-24 bg-ivory border-b border-hairline">
      <div className="site-container space-y-10">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="font-mono text-[11px] text-gold tracking-[0.16em] font-bold uppercase mb-2">
              MARKET DESK & TELEMETRY
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-olive tracking-tight">
              Market Desk
            </h2>
            <p className="text-ink-dim text-sm sm:text-base mt-1 max-w-2xl leading-relaxed">
              Real-time radar telemetry, constituent heatmaps, proprietary sentiment scoring, and weekly financial lexicon.
            </p>
          </div>

          {/* Live · delayed · time chip */}
          <div className="flex items-center gap-1.5 font-mono text-[10px] text-ink-dim px-3 py-1 rounded-full border border-hairline bg-panel self-start sm:self-auto shrink-0 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-forest animate-pulse" />
            <span>{isLive ? timeLabel : "Live • delayed • connecting..."}</span>
          </div>
        </div>

        {/* Lead: Market Observatory Radar (always visible so its animation plays on scroll-in) */}
        <div className="w-full">
          <MarketObservatoryRadar />
        </div>

        {/* Secondary Desk Tabs */}
        <div className="space-y-6 pt-4 border-t border-hairline">
          {/* Tab Row: Pill style, mobile horizontal scroll */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin scrollbar-thumb-hairline">
            <button
              type="button"
              onClick={() => setActiveTab("heatmap")}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === "heatmap"
                  ? "bg-forest text-white shadow-xs font-bold ring-2 ring-forest/20"
                  : "bg-panel hover:bg-white text-ink-dim hover:text-ink border border-hairline hover:border-forest/30"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Nifty 50 Heatmap</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("sentiment")}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === "sentiment"
                  ? "bg-forest text-white shadow-xs font-bold ring-2 ring-forest/20"
                  : "bg-panel hover:bg-white text-ink-dim hover:text-ink border border-hairline hover:border-forest/30"
              }`}
            >
              <Gauge className="w-3.5 h-3.5" />
              <span>Sentiment Index</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("glossary")}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === "glossary"
                  ? "bg-forest text-white shadow-xs font-bold ring-2 ring-forest/20"
                  : "bg-panel hover:bg-white text-ink-dim hover:text-ink border border-hairline hover:border-forest/30"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Glossary of the Week</span>
            </button>
          </div>

          {/* Tab Content Panels */}
          <div>
            {activeTab === "heatmap" && (
              <div className="w-full">
                <NiftyConstituentTreemap />
              </div>
            )}

            {activeTab === "sentiment" && (
              <div className="w-full max-w-4xl mx-auto">
                <MarketSentimentGauge courseTitles={courseTitles} />
              </div>
            )}

            {activeTab === "glossary" && (
              <div className="w-full space-y-4">
                <GlossaryOfTheWeek terms={glossaryTerms} />
                <MarketPulseStrip facts={facts} cards={factCards} />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
