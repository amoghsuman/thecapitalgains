"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, HelpCircle, ChevronRight } from "lucide-react";

interface GlossaryTerm {
  term: string;
  tag: string;
  simpleDef: string;
  institutionalDef: string;
  formula?: string;
  commonMistake: string;
  relatedCourseSlug: string;
  relatedCourseTitle: string;
  example: string;
}

const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    term: "ROCE (Return on Capital Employed)",
    tag: "FUNDAMENTALS",
    simpleDef: "Measures how much pure operating profit a company squeezes out of every ₹100 of total capital invested into the business.",
    institutionalDef: "EBIT / (Total Assets − Current Liabilities). Reflects economic moats and management's capital allocation efficiency independent of debt financing structure.",
    formula: "ROCE = EBIT ÷ [Total Debt + Shareholder Equity − Cash]",
    commonMistake: "Confusing ROCE with ROE. High ROE can be artificially engineered with dangerous financial leverage; high ROCE requires genuine business quality.",
    relatedCourseSlug: "how-to-read-financial-statements",
    relatedCourseTitle: "How to Read Financial Statements",
    example: "If Company A generates ₹25 Cr EBIT on ₹100 Cr employed capital, ROCE is 25%—comfortably beating India's 14% hurdle rate.",
  },
  {
    term: "Implied Volatility (IV) Crush",
    tag: "DERIVATIVES",
    simpleDef: "The sudden, sharp collapse in option prices immediately after an anticipated binary event passes (e.g., Union Budget or earnings).",
    institutionalDef: "When an uncertainty event resolves, forward standard deviation demand vanishes, causing option vega to shrink premiums even if the underlying moved in your direction.",
    formula: "Option Price Drop ≈ Vega × ΔIV",
    commonMistake: "Buying naked Call or Put options on quarterly results day. Even if the stock moves up 3%, IV can crash 40%, leaving buyers with net capital loss.",
    relatedCourseSlug: "options-trading-from-zero",
    relatedCourseTitle: "Options Trading from Zero",
    example: "Holding Nifty 25,000 Call before RBI rate cut. The rate cut occurs, market rises 40 pts, but call option value drops 25% due to IV crashing from 19 to 13.",
  },
  {
    term: "Margin of Safety",
    tag: "VALUATION",
    simpleDef: "Buying a business at a substantial discount to its conservative intrinsic worth to protect against unforeseen bad luck or human error.",
    institutionalDef: "The quantitative cushion between market capitalization and conservative discounted cash flow (DCF) under conservative terminal growth assumptions.",
    formula: "Margin of Safety % = (Intrinsic Value − Market Price) ÷ Intrinsic Value",
    commonMistake: "Assuming a low Price-to-Earnings (P/E) ratio equals a margin of safety. Value traps with decaying cash flows have no safety cushion.",
    relatedCourseSlug: "how-to-read-financial-statements",
    relatedCourseTitle: "Fundamental Analysis & Balance Sheets",
    example: "Valuing an industrial manufacturer at ₹450/share conservative intrinsic value and refusing to purchase until market panic offers it at ₹320.",
  },
  {
    term: "STCG Tax Drag",
    tag: "WEALTH PRESERVATION",
    simpleDef: "The silent compounder killer in India where hyperactive trading loses 20% of all profits every financial year before money can compound.",
    institutionalDef: "Under current Indian tax code, short-term equity capital gains are taxed at 20% flat. Annual tax realization interrupts geometric compounding curves.",
    formula: "Compound FV = P × [1 + r(1 − Tax)]^n",
    commonMistake: "Thinking a 20% annual trading profit beats a 15% long-term compounder. After paying 20% STCG every cycle, net returns severely lag long-term index holding.",
    relatedCourseSlug: "mutual-funds-etfs-complete-guide",
    relatedCourseTitle: "Mutual Funds & ETFs Complete Guide",
    example: "Trading 50 times a year triggers ₹1,00,000 in STCG tax liability annually, removing capital that would have doubled twice over 15 years.",
  },
];

export default function GlossaryOfTheWeek() {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const active = GLOSSARY_TERMS[activeIndex];

  return (
    <div className="bg-panel border border-hairline rounded-2xl p-5 sm:p-6 shadow-2xs hover:border-forest/40 transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gold/10 text-gold flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="font-mono text-[10px] text-gold tracking-widest uppercase font-bold">
                WEEKLY MARKET LEXICON
              </div>
              <h3 className="text-sm sm:text-base font-bold text-olive">
                Glossary of the Week
              </h3>
            </div>
          </div>

          <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-forest/10 text-forest border border-forest/20">
            {active.tag}
          </span>
        </div>

        <p className="text-xs text-ink-dim leading-relaxed mb-4">
          Replace misleading market slang with institutional precision. Hover or tap the interactive term for real-world mechanics.
        </p>

        <div className="p-4 rounded-xl bg-ivory border border-hairline relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <div className="relative inline-block">
              <button
                type="button"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onClick={() => setShowTooltip(!showTooltip)}
                className="group inline-flex items-center gap-1.5 text-base sm:text-lg font-bold text-olive hover:text-forest transition-colors underline decoration-dotted decoration-gold/60 underline-offset-4 cursor-pointer text-left"
              >
                <span>{active.term}</span>
                <HelpCircle className="w-3.5 h-3.5 text-gold shrink-0 group-hover:scale-110 transition-transform" />
              </button>

              {showTooltip && (
                <div className="absolute left-0 top-full mt-2 z-30 w-72 sm:w-80 p-3.5 bg-olive text-white rounded-xl shadow-xl border border-hairline/20 font-sans text-xs animate-in fade-in zoom-in-95 duration-150">
                  <div className="font-mono text-[9px] text-gold uppercase tracking-wider font-bold mb-1">
                    Quick Mental Model
                  </div>
                  <p className="text-white/90 leading-relaxed font-normal">
                    {active.simpleDef}
                  </p>
                  {active.formula && (
                    <div className="mt-2 pt-2 border-t border-white/10 font-mono text-[10px] text-emerald-300">
                      {active.formula}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2 mt-2">
            <div className="text-xs text-[#2c3731] leading-relaxed font-normal">
              {active.institutionalDef}
            </div>

            {active.formula && (
              <div className="p-2 rounded bg-panel font-mono text-[11px] text-forest border border-hairline">
                {active.formula}
              </div>
            )}

            <div className="pt-2 text-[11px] text-rose-800 bg-rose-50/70 p-2.5 rounded-lg border border-rose-200/60 leading-relaxed">
              <strong className="font-bold uppercase font-mono mr-1">Retail Trap:</strong>
              {active.commonMistake}
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 mt-4 border-t border-hairline">
        <div className="flex items-center justify-between text-[10px] font-mono text-ink-dim mb-2">
          <span>EXPLORE ESSENTIAL TERMS:</span>
          <span>{activeIndex + 1} / {GLOSSARY_TERMS.length}</span>
        </div>

        <div className="grid grid-cols-4 gap-1.5 font-mono text-[10px] mb-3">
          {GLOSSARY_TERMS.map((t, idx) => (
            <button
              key={t.term}
              onClick={() => {
                setActiveIndex(idx);
                setShowTooltip(false);
              }}
              className={`py-1 rounded-md text-center transition-all cursor-pointer truncate px-1 ${
                activeIndex === idx
                  ? "bg-forest text-white font-bold shadow-2xs"
                  : "bg-ivory hover:bg-panel border border-hairline text-ink-dim"
              }`}
            >
              {t.tag.split(" ")[0]}
            </button>
          ))}
        </div>

        <Link
          href={`/courses/${active.relatedCourseSlug}`}
          className="w-full inline-flex items-center justify-between px-3 py-2 rounded-xl bg-ivory border border-hairline hover:border-forest/40 hover:bg-panel text-xs font-semibold text-olive group transition-all"
        >
          <span className="truncate">Taught in: <strong>{active.relatedCourseTitle}</strong></span>
          <ChevronRight className="w-3.5 h-3.5 text-forest group-hover:translate-x-0.5 transition-transform shrink-0" />
        </Link>
      </div>
    </div>
  );
}
