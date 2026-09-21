"use client";

import { useState } from "react";
import Link from "next/link";
import { HelpCircle, CheckCircle, XCircle, ArrowRight, BookOpen } from "lucide-react";

interface Scenario {
  id: string;
  tag: string;
  question: string;
  context: string;
  options: {
    text: string;
    isCorrect: boolean;
    explanation: string;
  }[];
  courseRecommendation: {
    title: string;
    slug: string;
    chapter: string;
  };
  retailFailureRate: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: "iv-crush",
    tag: "DERIVATIVES & VOLATILITY",
    retailFailureRate: "84% of retail option buyers fail this test",
    question: "A heavy-weight stock announces stellar earnings beating street estimates by 20%. Why did OTM call options bought right before results collapse 60% at 9:15 AM?",
    context: "Reliance/Infosys quarterly results day scenario with Implied Volatility elevated at 58% prior to market close.",
    options: [
      {
        text: "The exchange widened bid-ask spreads to penalize retail buyers.",
        isCorrect: false,
        explanation: "Bid-ask spreads can widen during market open, but cannot eliminate 60% of extrinsic option value across the board.",
      },
      {
        text: "Vega collapse: Event IV plummeted from 58% to 22%, destroying extrinsic premium despite the positive stock gap.",
        isCorrect: true,
        explanation: "Correct! Option premium is heavily composed of Vega (volatility expectation). Once the binary event passes, IV collapses overnight (IV Crush). Buying naked options into earnings is a statistical trap.",
      },
      {
        text: "The market makers exercised their early expiry rights on Indian exchanges.",
        isCorrect: false,
        explanation: "Indian equity stock and index options are European-style and can only be exercised at expiry, never early.",
      },
    ],
    courseRecommendation: {
      title: "Options Trading from Zero",
      slug: "options-trading-from-zero",
      chapter: "Chapter 7: The Greeks & Event Volatility Crushes",
    },
  },
  {
    id: "working-capital-trap",
    tag: "EQUITY FORENSICS",
    question: "A company shows 35% reported Net Profit growth for 3 consecutive years, yet operating cash flow (CFO) is consistently negative. What is the most probable red flag?",
    context: "Indian manufacturing & infra balance sheet red flags.",
    options: [
      {
        text: "Aggressive revenue recognition with ballooning trade receivables and uncollected sales.",
        isCorrect: true,
        explanation: "Correct! When accounting Net Profit expands while Cash Flow from Operations shrinks or turns negative, profits are locked in unpaid invoices (Receivables) or inflated inventories—a classic prelude to corporate write-downs.",
      },
      {
        text: "The company pays too much corporate tax to the Government of India.",
        isCorrect: false,
        explanation: "Corporate tax is deducted prior to Net Profit; it does not explain a divergence between positive Net Profit and negative Cash Flow from Operations.",
      },
      {
        text: "High dividend payouts draining the operating cash account.",
        isCorrect: false,
        explanation: "Dividend payouts are recorded under Financing Cash Flows (CFF), not Operating Cash Flows (CFO).",
      },
    ],
    courseRecommendation: {
      title: "How to Read Financial Statements",
      slug: "how-to-read-financial-statements",
      chapter: "Chapter 4: The Cash Flow Statement — Where Scams Unravel",
    },
    retailFailureRate: "71% miss this forensic warning sign",
  },
  {
    id: "promoter-pledge-cascade",
    tag: "GOVERNANCE & PLEDGE TRAPS",
    question: "A high-flying mid-cap stock drops 10% on mild sector profit booking. Within 48 hours, the stock plunges 45% in continuous lower circuits with zero fundamental change. What structural mechanism triggered this freefall?",
    context: "High promoter pledging (>60% of promoter stake) pledged as collateral with NBFC lenders.",
    options: [
      {
        text: "Lender margin-call cascade: Falling stock prices breached collateral coverage ratios, prompting NBFCs to invoke and dump pledged shares into an illiquid market.",
        isCorrect: true,
        explanation: "Correct! When promoters borrow against their shares, lenders demand top-up margins if the price dips. If the promoter cannot provide cash within hours, lenders mechanically dump the collateral on the open market, triggering lower circuits and wiping out retail equity.",
      },
      {
        text: "SEBI automatically suspends stocks when delivery volumes exceed quarterly thresholds.",
        isCorrect: false,
        explanation: "SEBI does not dump or suspend stocks for normal delivery volume surges without statutory forensic orders.",
      },
      {
        text: "Foreign portfolio investors (FPIs) are legally barred from buying stocks with debt-to-equity above 1.0.",
        isCorrect: false,
        explanation: "FPI mandates are fund-specific, not statutory legal bans that cause sudden unilateral liquidation.",
      },
    ],
    courseRecommendation: {
      title: "Stock Market from Zero",
      slug: "stock-market-from-zero",
      chapter: "Chapter 6: Corporate Governance & Red-Flag Audit Rules",
    },
    retailFailureRate: "92% fail to monitor promoter pledge triggers",
  },
];

export default function InteractiveScenarioCheck() {
  const [activeScenarioIdx, setActiveScenarioIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const scenario = SCENARIOS[activeScenarioIdx];

  const handleSelect = (idx: number) => {
    setSelectedOption(idx);
  };

  const handleNextScenario = (nextIdx: number) => {
    setSelectedOption(null);
    setActiveScenarioIdx(nextIdx);
  };

  return (
    <section className="py-16 md:py-20 bg-panel border-b border-hairline">
      <div className="site-container space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="font-mono text-[11px] text-gold tracking-[0.16em] font-bold uppercase mb-2">
              REAL-WORLD MARKET CHALLENGE
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-olive tracking-tight">
              Test Your Institutional Instincts
            </h2>
            <p className="text-ink-dim text-sm sm:text-base mt-1">
              Test how you handle real NSE trading traps and balance sheet anomalies before risking your capital.
            </p>
          </div>

          <div className="inline-flex rounded-xl border border-hairline p-1 bg-ivory">
            {SCENARIOS.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => handleNextScenario(idx)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeScenarioIdx === idx
                    ? "bg-forest text-white shadow-xs font-bold"
                    : "text-ink-dim hover:text-ink"
                }`}
              >
                Case 0{idx + 1}: {s.tag.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Challenge Box */}
        <div className="bg-ivory/60 border border-hairline rounded-2xl p-6 sm:p-8 shadow-2xs">
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] bg-forest-surface text-forest px-2.5 py-1 rounded font-bold uppercase tracking-wider">
                  {scenario.tag}
                </span>
                <span className="text-xs text-ink-dim font-medium">Case Study {activeScenarioIdx + 1} of {SCENARIOS.length}</span>
              </div>
              <span className="font-mono text-[11px] text-[#B91C1C] bg-red-50/80 px-2.5 py-1 rounded-full border border-red-200/60 font-medium">
                ⚠️ {scenario.retailFailureRate}
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-olive leading-snug">
              {scenario.question}
            </h3>

            <p className="text-xs sm:text-sm text-ink-dim italic border-l-2 border-gold pl-3 py-0.5">
              Context: {scenario.context}
            </p>

            {/* Options */}
            <div className="space-y-3 pt-2">
              {scenario.options.map((opt, idx) => {
                const isChosen = selectedOption === idx;
                const hasAnswered = selectedOption !== null;

                let borderClass = "border-hairline hover:border-forest/40 bg-ivory/50";
                if (hasAnswered) {
                  if (opt.isCorrect) {
                    borderClass = "border-forest bg-forest-surface text-forest";
                  } else if (isChosen && !opt.isCorrect) {
                    borderClass = "border-[#B91C1C] bg-red-50/70 text-[#B91C1C]";
                  } else {
                    borderClass = "border-hairline opacity-60";
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={hasAnswered}
                    onClick={() => handleSelect(idx)}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-start gap-3 ${borderClass}`}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {hasAnswered ? (
                        opt.isCorrect ? (
                          <CheckCircle className="w-4 h-4 text-forest" />
                        ) : isChosen ? (
                          <XCircle className="w-4 h-4 text-[#B91C1C]" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-hairline" />
                        )
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-hairline text-[10px] font-mono flex items-center justify-center text-ink-dim">
                          {String.fromCharCode(65 + idx)}
                        </div>
                      )}
                    </div>
                    <div className="space-y-1 text-xs sm:text-sm">
                      <div className="font-medium text-ink">{opt.text}</div>
                      {hasAnswered && (isChosen || opt.isCorrect) && (
                        <p className="text-xs text-ink-dim pt-1 leading-relaxed">
                          {opt.explanation}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Resolution Card if answered */}
            {selectedOption !== null && (
              <div className="pt-4 border-t border-hairline mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-forest-surface/50 p-4 rounded-xl">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-forest flex-shrink-0" />
                  <div className="text-xs">
                    <div className="text-ink-dim font-medium">Deconstructed in depth inside:</div>
                    <div className="font-bold text-ink">
                      {scenario.courseRecommendation.title} ({scenario.courseRecommendation.chapter})
                    </div>
                  </div>
                </div>
                <Link
                  href={`/courses/${scenario.courseRecommendation.slug}`}
                  className="premium-button-primary text-xs font-semibold inline-flex items-center gap-1.5 self-start sm:self-auto"
                >
                  Master This Playbook <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
