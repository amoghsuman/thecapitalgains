"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Activity, X, ExternalLink, Sparkles, TrendingUp, ShieldAlert, Award } from "lucide-react";
import Link from "next/link";
import { SEBI_FO_STATS, SEBI_FO_SOURCE } from "@/lib/home/sebiStats";
import { getFact, isShowable, provenance, type MarketFact as SourcedFact } from "@/lib/home/marketFacts";

const sebiShare = SEBI_FO_STATS.find((s) => s.id === "share-lost-fy22-24");
const sebiAggregate = SEBI_FO_STATS.find((s) => s.id === "aggregate-loss-fy22-24");

interface MarketFact {
  id: string;
  badge: string;
  badgeColor: string;
  icon: "trending" | "shield" | "sparkles" | "award";
  title: string;
  fact: string;
  stat?: string;
  /** Rendered under the fact: a plain source line, or a fact's full provenance. */
  source?: string;
  /** When set, the toast is only shown if this fact is showable (has a value and is fresh). */
  requiresFact?: SourcedFact;
  relatedCourseHref: string;
  relatedCourseName: string;
}

function buildToasts(facts: SourcedFact[]): MarketFact[] {
  const cagr = getFact(facts, "niftyLongTermCagr");
  const doubling = getFact(facts, "doublingYears");
  const hurdle = getFact(facts, "hurdleRateAssumption");
  return [
  {
    id: "f1",
    badge: "SEBI DERIVATIVES STATS",
    badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
    icon: "shield",
    title: `${sebiShare?.value ?? ""} of individual F&O traders lost money`,
    fact: `SEBI's study found ${sebiShare?.value ?? ""} ${sebiShare?.label ?? ""}, with ${sebiAggregate?.value ?? ""} ${sebiAggregate?.label ?? ""}.`,
    stat: `${sebiAggregate?.value ?? ""} lost`,
    source: `Source: ${SEBI_FO_SOURCE}`,
    relatedCourseHref: "/courses/options-trading-from-zero",
    relatedCourseName: "Options Trading From Zero",
  },
  {
    id: "f2",
    badge: "COMPOUNDING LAW",
    badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
    icon: "trending",
    title: "Rule of 72 in Indian Markets",
    fact: `At the Nifty 50 TRI's since-inception CAGR of ${cagr?.value}, an uninterrupted index corpus doubles roughly every ${doubling?.value} (rule of 72).`,
    stat: `Doubles every ${doubling?.value}`,
    source: cagr ? provenance(cagr) : undefined,
    requiresFact: doubling,
    relatedCourseHref: "/courses/mutual-funds-etfs-complete-guide",
    relatedCourseName: "Mutual Funds & ETFs Guide",
  },
  {
    id: "f3",
    badge: "FORENSIC ACCOUNTING",
    badgeColor: "bg-amber-50 text-amber-800 border-amber-200",
    icon: "sparkles",
    title: "The CFO Divergence Warning",
    fact: "In many governance collapses on Dalal Street, net profit kept growing on paper while operating cash flow (CFO) trended negative for two or more consecutive years. Profit is an opinion; cash is a fact.",
    stat: "CFO vs PAT",
    relatedCourseHref: "/courses/how-to-read-financial-statements",
    relatedCourseName: "Financial Statements Playbook",
  },
  {
    id: "f4",
    badge: "TAX FRICTION",
    badgeColor: "bg-forest-surface text-forest border-forest/20",
    icon: "award",
    title: "STCG 20% Drag vs Deferred LTCG",
    fact: "An active trader realizing gains every month pays 20% STCG immediately, losing the exponential yield curve compared to deferred 12.5% LTCG after the 1-year threshold.",
    stat: "20% STCG annual drag",
    relatedCourseHref: "/courses/mutual-funds-etfs-complete-guide",
    relatedCourseName: "Wealth Friction Lab",
  },
  {
    id: "f5",
    badge: "DERIVATIVES MECHANICS",
    badgeColor: "bg-gold/15 text-gold-text border-gold/30",
    icon: "trending",
    title: "The Implied Volatility Trap",
    fact: "Buying options right before Union Budget or corporate earnings often leads to a 40%+ loss within minutes of market open due to rapid Vega collapse (IV crush).",
    stat: "Vega decay > Spot delta",
    relatedCourseHref: "/courses/options-trading-from-zero",
    relatedCourseName: "Options Trading From Zero",
  },
  {
    id: "f6",
    badge: "VALUATION RIGOR",
    badgeColor: "bg-forest/10 text-forest border-forest/20",
    icon: "award",
    title: "ROCE vs Cost of Capital (WACC)",
    fact: `A business only creates economic value for shareholders if its Return on Capital Employed (ROCE) consistently beats the hurdle rate: the 10-year G-Sec yield plus a 5% equity risk premium (${hurdle?.value}).`,
    stat: `Hurdle rate ${hurdle?.value}`,
    source: hurdle ? provenance(hurdle) : undefined,
    requiresFact: hurdle,
    relatedCourseHref: "/courses/how-to-read-financial-statements",
    relatedCourseName: "Fundamental Analysis Playbook",
  },
  ];
}

interface MarketPulseToastProps {
  /** From buildMarketFacts() on the server. */
  facts: SourcedFact[];
}

export default function MarketPulseToast({ facts }: MarketPulseToastProps) {
  // Toasts whose figure is missing or stale are left out entirely.
  const VISIBLE_FACTS = buildToasts(facts).filter((f) => !f.requiresFact || isShowable(f.requiresFact));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isDismissed || isPaused) return;

    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % VISIBLE_FACTS.length);
        setIsVisible(true);
      }, 400);
    }, 60000); // Refreshes every 60 seconds

    return () => clearInterval(interval);
  }, [isDismissed, isPaused]);

  if (isDismissed) return null;

  const currentFact = VISIBLE_FACTS[currentIndex];

  return (
    <aside
      aria-label="Market Pulse Intelligence"
      className="fixed bottom-4 right-4 z-40 max-w-xs sm:max-w-sm pointer-events-auto"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence mode="wait">
        {isVisible && (
          <motion.div
            key={currentFact.id}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 350, damping: 26 }}
            className="bg-panel border border-forest/20 shadow-xl rounded-2xl p-4 relative overflow-hidden backdrop-blur-md"
          >
            {/* Top header row */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-forest opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-forest" />
                </span>
                <span className="font-mono text-[9px] font-bold tracking-[0.16em] uppercase text-forest">
                  MARKET PULSE
                </span>
                <span className="text-[10px] text-ink-muted">· 60s auto-refresh</span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsVisible(false);
                    setTimeout(() => {
                      setCurrentIndex((prev) => (prev + 1) % VISIBLE_FACTS.length);
                      setIsVisible(true);
                    }, 250);
                  }}
                  title="Next market fact"
                  aria-label="Next market fact"
                  className="p-1 text-ink-muted hover:text-olive transition-colors rounded-md hover:bg-ivory cursor-pointer"
                >
                  <Activity className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsDismissed(true)}
                  title="Dismiss notification"
                  aria-label="Dismiss notification"
                  className="p-1 text-ink-muted hover:text-rose-700 transition-colors rounded-md hover:bg-ivory cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Fact Category Tag & Title */}
            <div className="space-y-1 mb-2">
              <div className="flex items-center gap-2">
                <span
                  className={`font-mono text-[9px] px-2 py-0.5 rounded-full border font-bold uppercase ${currentFact.badgeColor}`}
                >
                  {currentFact.badge}
                </span>
                {currentFact.stat && (
                  <span className="font-mono text-[10px] font-bold text-olive">
                    {currentFact.stat}
                  </span>
                )}
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-olive leading-tight">
                {currentFact.title}
              </h4>
            </div>

            {/* Fact body */}
            <p className="text-[11px] sm:text-xs text-ink-dim leading-relaxed mb-3">
              {currentFact.fact}
              {currentFact.source && (
                <span className="block mt-1 font-mono text-[10px] text-ink-muted">{currentFact.source}</span>
              )}
            </p>

            {/* Action footer link */}
            <div className="pt-2 border-t border-hairline/80 flex items-center justify-between text-[10px]">
              <span className="text-ink-muted">Curriculum Reference:</span>
              <Link
                href={currentFact.relatedCourseHref}
                className="inline-flex items-center gap-1 font-semibold text-forest hover:text-forest-dark group font-mono transition-colors"
              >
                <span>{currentFact.relatedCourseName}</span>
                <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </div>

            {/* Subtle progress indicator */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-forest/10 overflow-hidden">
              <motion.div
                key={`progress-${currentFact.id}-${isPaused}`}
                initial={{ width: "0%" }}
                animate={{ width: isPaused ? "100%" : "100%" }}
                transition={{
                  duration: isPaused ? 0 : 60,
                  ease: "linear",
                }}
                className="h-full bg-forest"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
}
