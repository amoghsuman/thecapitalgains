"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BrainCircuit, CheckCircle2, XCircle, ArrowRight, RotateCcw, Clock, Sparkles } from "lucide-react";

interface QuizQuestion {
  id: string;
  category: string;
  question: string;
  context: string;
  options: {
    label: string;
    text: string;
    isCorrect: boolean;
    explanation: string;
  }[];
  institutionalRule: string;
  recommendedCourseSlug: string;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "q1",
    category: "OPTIONS & GREEKS",
    question: "Nifty 25,000 Call option is priced at ₹120. Results are announced today after market hours. Tomorrow Nifty opens flat (0.0%). What happens to the Call price?",
    context: "Assumption: No sudden change in implied interest rates; spot price unchanged.",
    options: [
      {
        label: "A",
        text: "Price stays at ₹120 because the market didn't move.",
        isCorrect: false,
        explanation: "Incorrect. Option pricing depends heavily on Implied Volatility (IV) and Theta decay, not spot price alone.",
      },
      {
        label: "B",
        text: "Price collapses significantly (IV crush + 1 day of theta decay).",
        isCorrect: true,
        explanation: "Correct! The post-event IV collapse eradicates extrinsic value. Even without spot movement, the premium implodes.",
      },
      {
        label: "C",
        text: "Price rises because the market showed resilience.",
        isCorrect: false,
        explanation: "Incorrect. Options are depreciating assets. Uncertainty has left the room, collapsing premium demand.",
      },
    ],
    institutionalRule: "Rule: Never hold unhedged long options across scheduled binary events (Earnings / Budget / RBI).",
    recommendedCourseSlug: "options-trading-from-zero",
  },
  {
    id: "q2",
    category: "FORENSIC ACCOUNTING",
    question: "A company reports +40% year-on-year Net Profit growth for 3 consecutive years, but its Cash Flow from Operations (CFO) is consistently negative. What is the most probable diagnosis?",
    context: "Statutory notes show surging Trade Receivables and capitalised development expenses.",
    options: [
      {
        label: "A",
        text: "The company is growing so fast that cash will catch up automatically later.",
        isCorrect: false,
        explanation: "Incorrect. Persistent CFO divergence is the #1 leading indicator of fraudulent channel stuffing or uncollectible sales.",
      },
      {
        label: "B",
        text: "Aggressive revenue recognition / channel stuffing booking uncollected paper profits.",
        isCorrect: true,
        explanation: "Correct! Accounting profits can be fabricated via aggressive credit terms, but cash conversion never lies.",
      },
      {
        label: "C",
        text: "The business is merely paying higher taxes and depreciation.",
        isCorrect: false,
        explanation: "Incorrect. Taxes and depreciation cannot explain 3 continuous years of negative operating cash flows.",
      },
    ],
    institutionalRule: "Rule: If Operating Cash Flow trails EBITDA by >30% over 3 fiscal years, eliminate from your investable universe.",
    recommendedCourseSlug: "how-to-read-financial-statements",
  },
  {
    id: "q3",
    category: "COMPOUNDING & TAX FRICTION",
    question: "Trader A makes 22% annual return trading actively (paying 20% STCG every year). Investor B earns 15% CAGR holding quality index/compounders with zero churn for 15 years. Who ends up with more real wealth?",
    context: "Assuming identical starting capital of ₹10,00,000 and standard Indian tax rates.",
    options: [
      {
        label: "A",
        text: "Investor B creates substantially higher net post-tax wealth.",
        isCorrect: true,
        explanation: "Correct! Annual tax drag reduces Trader A's effective CAGR to ~17.6% minus heavy broker slippage, while Investor B's gross corpus compounds uninterrupted before deferred LTCG.",
      },
      {
        label: "B",
        text: "Trader A wins easily because 22% is way higher than 15%.",
        isCorrect: false,
        explanation: "Incorrect. Annual taxation intercepts geometric compounding, severely dampening the exponential curve.",
      },
      {
        label: "C",
        text: "Both end up with exactly identical amounts.",
        isCorrect: false,
        explanation: "Incorrect. Geometric mathematics heavily penalizes annual corpus subtraction.",
      },
    ],
    institutionalRule: "Rule: Tax deferral is an interest-free compounding loan from the government. Respect holding periods.",
    recommendedCourseSlug: "mutual-funds-etfs-complete-guide",
  },
];

export default function ConceptLogicQuiz() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  const activeQ = QUIZ_QUESTIONS[currentIdx];

  useEffect(() => {
    if (hasAnswered) return;
    if (timeLeft <= 0) {
      setHasAnswered(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, hasAnswered]);

  const handleSelectOption = (idx: number) => {
    if (hasAnswered) return;
    setSelectedOption(idx);
    setHasAnswered(true);
  };

  const handleNextQuestion = () => {
    const next = (currentIdx + 1) % QUIZ_QUESTIONS.length;
    setCurrentIdx(next);
    setSelectedOption(null);
    setHasAnswered(false);
    setTimeLeft(30);
  };

  const handleReset = () => {
    setSelectedOption(null);
    setHasAnswered(false);
    setTimeLeft(30);
  };

  const isCorrect = selectedOption !== null && activeQ.options[selectedOption]?.isCorrect;

  return (
    <section className="py-16 md:py-20 bg-ivory border-b border-hairline">
      <div className="site-container space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-hairline/70">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 bg-panel border border-hairline rounded-full px-3.5 py-1 text-gold">
              <BrainCircuit className="w-3.5 h-3.5" />
              <span className="font-mono text-[10px] tracking-[0.18em] font-bold uppercase">
                30-SECOND RAPID AUDIT · REAL MARKET MECHANICS
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-olive tracking-tight">
              Test your market instincts against institutional reality.
            </h2>
            <p className="text-sm sm:text-base text-ink-dim leading-relaxed">
              No textbook trivia. A fast practical puzzle testing whether you can spot options volatility traps, forensic red flags, or wealth friction in under 30 seconds.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono text-xs ${
              timeLeft <= 10 && !hasAnswered
                ? "bg-rose-50 text-rose-700 border-rose-200 animate-pulse"
                : "bg-panel text-ink-dim border-hairline"
            }`}>
              <Clock className="w-3.5 h-3.5" />
              <span>{hasAnswered ? "Completed" : `${timeLeft}s left`}</span>
            </div>

            <button
              onClick={handleNextQuestion}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forest-dark transition-all cursor-pointer shadow-2xs"
            >
              <span>Next Puzzle</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="w-full max-w-4xl mx-auto bg-panel border border-hairline rounded-2xl p-6 sm:p-8 shadow-xs">
          <div className="flex items-center justify-between gap-4 border-b border-hairline pb-4 mb-6">
            <span className="font-mono text-[11px] text-forest font-bold tracking-wider uppercase">
              {activeQ.category}
            </span>
            <span className="font-mono text-xs text-ink-dim">
              Puzzle {currentIdx + 1} of {QUIZ_QUESTIONS.length}
            </span>
          </div>

          <div className="space-y-2 mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-olive leading-snug">
              {activeQ.question}
            </h3>
            <p className="text-xs sm:text-sm font-mono text-gold font-medium">
              {activeQ.context}
            </p>
          </div>

          <div className="space-y-3">
            {activeQ.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              let btnStyle = "bg-ivory border-hairline text-olive hover:border-forest/40 hover:bg-panel";

              if (hasAnswered) {
                if (opt.isCorrect) {
                  btnStyle = "bg-emerald-50/80 border-emerald-400 text-emerald-900 font-semibold";
                } else if (isSelected && !opt.isCorrect) {
                  btnStyle = "bg-rose-50/80 border-rose-300 text-rose-900 font-semibold";
                } else {
                  btnStyle = "bg-ivory/50 border-hairline/60 text-ink-dim opacity-70";
                }
              }

              return (
                <button
                  key={opt.label}
                  disabled={hasAnswered}
                  onClick={() => handleSelectOption(idx)}
                  className={`w-full p-4 rounded-xl border text-left flex items-start gap-3.5 transition-all cursor-pointer ${btnStyle}`}
                >
                  <span
                    className={`w-6 h-6 rounded-lg font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected
                        ? "bg-forest text-white"
                        : "bg-panel border border-hairline text-ink"
                    }`}
                  >
                    {opt.label}
                  </span>
                  <div className="flex-1 text-xs sm:text-sm leading-relaxed">
                    {opt.text}
                  </div>
                  {hasAnswered && opt.isCorrect && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  )}
                  {hasAnswered && isSelected && !opt.isCorrect && (
                    <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          {hasAnswered && (
            <div className="mt-6 pt-6 border-t border-hairline space-y-4 animate-in fade-in duration-200">
              <div
                className={`p-4 rounded-xl border ${
                  isCorrect
                    ? "bg-emerald-50/90 border-emerald-200 text-emerald-950"
                    : "bg-amber-50/90 border-amber-200 text-amber-950"
                }`}
              >
                <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase mb-1">
                  {isCorrect ? (
                    <span className="text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Correct Intuition
                    </span>
                  ) : (
                    <span className="text-amber-700 flex items-center gap-1">
                      <Sparkles className="w-4 h-4" /> Key Market Lesson
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm leading-relaxed">
                  {selectedOption !== null
                    ? activeQ.options[selectedOption]?.explanation
                    : "Time expired! Read the institutional breakdown below."}
                </p>

                <div className="mt-3 pt-2.5 border-t border-hairline/40 font-mono text-[11px] font-semibold">
                  {activeQ.institutionalRule}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-dim hover:text-olive transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retry this question</span>
                </button>

                <Link
                  href={`/courses/${activeQ.recommendedCourseSlug}`}
                  className="inline-flex items-center gap-2 text-xs font-bold text-forest hover:text-forest-dark group"
                >
                  <span>Master this concept in Curriculum Playbook</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
