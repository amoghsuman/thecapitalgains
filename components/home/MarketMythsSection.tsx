"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, ThumbsUp, ThumbsDown, HelpCircle, Lightbulb, Sparkles, ArrowRight } from "lucide-react";
import { SEBI_FO_STATS, SEBI_FO_SOURCE } from "@/lib/home/sebiStats";
import { getFact, isShowable, provenance, RETURNS_CONCENTRATION, formatInrCompact, type MarketFact } from "@/lib/home/marketFacts";

const sebiShare = SEBI_FO_STATS.find((s) => s.id === "share-lost-fy22-24");

interface MarketMyth {
  id: string;
  category: string;
  statement: string;
  isMyth: boolean; // true = It's a Myth, false = It's Fact
  verdict: string;
  explanation: string;
  /** "Source: …" shown under the explanation. */
  source?: string;
  practicalTakeaway: string;
}

function buildMyths(facts: MarketFact[]): MarketMyth[] {
  const otmProbability = getFact(facts, "deepOtmExpiryProbability");
  const concentration = getFact(facts, "returnsConcentration");
  const rc = RETURNS_CONCENTRATION;
  return [
  {
    id: "myth-1",
    category: "OPTIONS & DERIVATIVES",
    statement: "Buying Out-of-the-Money (OTM) options every weekly expiry is a low-risk way to turn ₹1,000 into ₹10,000 with limited downside.",
    isMyth: true,
    verdict: "Debunked: Mathematically Destructive",
    explanation: `While the maximum loss on a single option purchase is capped at the premium paid, a deep OTM strike's probability of expiring in the money is low${isShowable(otmProbability) ? ` (roughly ${otmProbability.value}, using its delta as a proxy)` : ""}. Theta (time decay) erodes the entire premium, and a string of total losses across consecutive weekly expiries depletes capital permanently. SEBI's study found ${sebiShare?.value ?? ""} ${sebiShare?.label ?? ""}.`,
    source: `Source: ${SEBI_FO_SOURCE}`,
    practicalTakeaway:
      "Treat options as volatility and risk-hedging tools, not lottery tickets. Long-term wealth compounding occurs in underlying assets with positive expected value.",
  },
  {
    id: "myth-2",
    category: "VALUATION & PRICE",
    statement: "A stock trading at ₹20 per share is cheaper and offers higher upside potential than an institutional stock trading at ₹3,000 per share.",
    isMyth: true,
    verdict: "Debunked: The Nominal Price Illusion",
    explanation:
      "Nominal share price is merely market capitalization divided by total shares outstanding. A company trading at ₹20 with 10 billion shares has a ₹20,000 Crore valuation, whereas a ₹3,000 stock with 10 million shares has a ₹3,000 Crore valuation. Valuation is measured by Price-to-Earnings (P/E), EV/EBITDA, and Free Cash Flow yields, never absolute face price.",
    practicalTakeaway:
      "Always evaluate Enterprise Value and Free Cash Flow generation rather than the nominal stock quote.",
  },
  {
    id: "myth-3",
    category: "MARKET TIMING",
    statement: "Waiting on 100% cash until a major crash occurs is the safest way to beat long-term index compounding.",
    isMyth: true,
    verdict: "Debunked: The Cost of Missing the Best Days",
    explanation: isShowable(concentration)
      ? `${formatInrCompact(rc.invested)} in the Nifty 50 TRI from ${rc.periodStart} to ${rc.periodEnd} grew to about ${formatInrCompact(rc.fullyInvestedValue)} fully invested, but only about ${formatInrCompact(rc.missing15BestDaysValue)} if you missed the 15 best days. And ${rc.bestWorstProximity}, so the best days arrive inside the panics a cash-sitter is waiting out.`
      : `A large share of long-run index returns arrives in a handful of the best sessions, and those sessions cluster around the panics a cash-sitter is waiting out. Investors on the sidelines lose purchasing power to inflation in the meantime and rarely buy at the bottom when it comes.`,
    source: isShowable(concentration) ? provenance(concentration) : undefined,
    practicalTakeaway:
      "Maintain a structured asset allocation with systematic rebalancing, keeping liquidity buffers for rebalancing rather than binary market-timing gambles.",
  },
  {
    id: "myth-4",
    category: "DIVERSIFICATION",
    statement: "Owning 45 different equity mutual funds and 60 random stocks eliminates your portfolio risk.",
    isMyth: true,
    verdict: "Debunked: Closet Indexing & Expense Drag",
    explanation:
      "Holding excessive funds results in massive portfolio overlap—you end up holding the exact same top 15 NIFTY companies multiple times while paying redundant expense ratios and tracking friction. Most of the diversifiable, company-specific risk is gone once you hold a couple of dozen genuinely different businesses; what remains is market risk that more funds cannot remove.",
    practicalTakeaway:
      "Focus on intentional cross-asset diversification (Equities, Sovereign Debt, Gold, Liquid Reserves) rather than redundant stock collection.",
  },
  ];
}

interface MarketMythsSectionProps {
  facts: MarketFact[];
}

export default function MarketMythsSection({ facts }: MarketMythsSectionProps) {
  const MARKET_MYTHS = buildMyths(facts);
  const [selectedMythIndex, setSelectedMythIndex] = useState(0);
  const [userVotes, setUserVotes] = useState<Record<string, "myth" | "fact">>({});

  const currentMyth = MARKET_MYTHS[selectedMythIndex];
  const userVote = userVotes[currentMyth.id];

  const handleVote = (vote: "myth" | "fact") => {
    setUserVotes((prev) => ({ ...prev, [currentMyth.id]: vote }));
  };

  const isUserCorrect = userVote ? (userVote === "myth") === currentMyth.isMyth : null;

  return (
    <section id="market-myths-interactive" className="py-16 md:py-20 bg-panel border-b border-hairline">
      <div className="site-container space-y-9">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="font-mono text-[11px] text-gold tracking-[0.16em] font-bold uppercase mb-2">
              REAL-WORLD PEDAGOGY
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-olive tracking-tight">
              Market Myths vs. Institutional Realities
            </h2>
            <p className="text-ink-dim text-sm sm:text-base mt-1 max-w-2xl leading-relaxed">
              Cast your vote on common retail investing beliefs and receive immediate empirical teardowns grounded in NSE trading data and financial mathematics.
            </p>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-xs text-ink-dim bg-ivory px-3.5 py-1.5 rounded-xl border border-hairline shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-gold" />
            <span>Interactive Learning Lab</span>
          </div>
        </div>

        {/* Question Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-hairline">
          {MARKET_MYTHS.map((myth, idx) => {
            const hasAnswered = !!userVotes[myth.id];
            const isCurrent = idx === selectedMythIndex;
            return (
              <button
                key={myth.id}
                onClick={() => setSelectedMythIndex(idx)}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  isCurrent
                    ? "bg-forest text-white font-bold shadow-xs"
                    : "bg-ivory border border-hairline text-ink-dim hover:text-ink hover:bg-ivory/80"
                }`}
              >
                <span>Myth 0{idx + 1}: {myth.category}</span>
                {hasAnswered && (
                  <span className="w-2 h-2 rounded-full bg-gold" />
                )}
              </button>
            );
          })}
        </div>

        {/* Myth Interactive Card */}
        <div className="bg-ivory border border-hairline rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-forest font-bold tracking-widest uppercase bg-forest-surface px-2.5 py-1 rounded">
                {currentMyth.category}
              </span>
              <span className="text-xs font-mono text-ink-dim">
                Case {selectedMythIndex + 1} of {MARKET_MYTHS.length}
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-olive leading-relaxed">
              “{currentMyth.statement}”
            </h3>
          </div>

          {/* Voting Action Buttons */}
          {!userVote ? (
            <div className="pt-2 space-y-3">
              <div className="font-mono text-[10px] text-ink-dim uppercase tracking-wider font-bold">
                What is your view? Vote to reveal the statistical breakdown:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md">
                <button
                  type="button"
                  id={`vote-myth-btn-${currentMyth.id}`}
                  onClick={() => handleVote("myth")}
                  className="p-4 rounded-xl border border-hairline bg-panel hover:bg-forest-surface hover:border-forest/50 text-olive font-bold text-sm flex items-center justify-center gap-2.5 transition-all shadow-2xs cursor-pointer group"
                >
                  <ThumbsDown className="w-4 h-4 text-red-700 group-hover:scale-110 transition-transform" />
                  <span>It's a Myth!</span>
                </button>

                <button
                  type="button"
                  id={`vote-fact-btn-${currentMyth.id}`}
                  onClick={() => handleVote("fact")}
                  className="p-4 rounded-xl border border-hairline bg-panel hover:bg-forest-surface hover:border-forest/50 text-olive font-bold text-sm flex items-center justify-center gap-2.5 transition-all shadow-2xs cursor-pointer group"
                >
                  <ThumbsUp className="w-4 h-4 text-forest group-hover:scale-110 transition-transform" />
                  <span>It's a Fact!</span>
                </button>
              </div>
            </div>
          ) : (
            /* Revealed Expert Teardown */
            <div className="space-y-5 animate-in fade-in slide-in-from-top-3 duration-250">
              {/* Verdict Header */}
              <div
                className={`p-4 rounded-xl border flex items-center justify-between flex-wrap gap-3 ${
                  isUserCorrect
                    ? "bg-forest-surface border-forest/30 text-forest"
                    : "bg-red-50 border-red-200 text-red-800"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {isUserCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-forest" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-700" />
                  )}
                  <div>
                    <div className="font-bold text-sm">
                      {isUserCorrect ? "Sharp Instincts! You called it right." : "Common Pitfall! Most retail participants fall into this trap."}
                    </div>
                    <div className="font-mono text-xs opacity-90 mt-0.5">
                      Verdict: <strong>{currentMyth.verdict}</strong>
                    </div>
                  </div>
                </div>

                <div className="font-mono text-xs px-3 py-1 bg-white/70 rounded-lg border border-hairline">
                  A common belief among retail investors
                </div>
              </div>

              {/* In-depth Institutional Explanation */}
              <div className="p-5 bg-panel rounded-xl border border-hairline space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-gold uppercase tracking-wider">
                  <Lightbulb className="w-4 h-4 text-gold" />
                  <span>Empirical Market Mechanics & Mathematics</span>
                </div>
                <p className="text-xs sm:text-sm text-ink-dim leading-relaxed">
                  {currentMyth.explanation}
                  {currentMyth.source && (
                    <span className="block mt-1.5 font-mono text-[10px] text-ink-muted">{currentMyth.source}</span>
                  )}
                </p>
                <div className="pt-3 border-t border-hairline flex items-start gap-2 text-xs">
                  <span className="font-bold text-forest shrink-0 font-mono">Actionable Rule:</span>
                  <span className="text-ink font-medium leading-relaxed">
                    {currentMyth.practicalTakeaway}
                  </span>
                </div>
              </div>

              {/* Next Question Pill */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => {
                    const next = (selectedMythIndex + 1) % MARKET_MYTHS.length;
                    setSelectedMythIndex(next);
                  }}
                  className="px-4 py-2 bg-forest hover:bg-forest-dark text-white rounded-xl text-xs font-mono font-bold inline-flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <span>Next Myth Analysis</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
