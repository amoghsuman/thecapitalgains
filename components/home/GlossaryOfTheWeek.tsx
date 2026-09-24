"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BookOpen, HelpCircle, ChevronRight } from "lucide-react";
import { weekIndex } from "@/lib/home/weekRotation";
import type { GlossaryTerm, GlossaryCategory } from "@/lib/sanity/queries";

// Terms come from Sanity (`glossaryTerm`, seeded by scripts/seed-glossary-facts.mjs).
// One tab per category; the term shown in each tab is chosen by ISO week
// number modulo that category's term count, so it changes weekly and every
// term gets a turn.

const CATEGORY_ORDER: { value: GlossaryCategory; label: string }[] = [
  { value: "fundamentals", label: "FUNDAMENTALS" },
  { value: "derivatives", label: "DERIVATIVES" },
  { value: "valuation", label: "VALUATION" },
  { value: "wealth", label: "WEALTH" },
];

interface GlossaryOfTheWeekProps {
  terms: GlossaryTerm[];
}

export default function GlossaryOfTheWeek({ terms }: GlossaryOfTheWeekProps) {
  const [showTooltip, setShowTooltip] = useState<boolean>(false);

  // Categories that actually have terms, in the fixed order above.
  const tabs = useMemo(
    () => CATEGORY_ORDER.filter((c) => terms.some((t) => t.category === c.value)),
    [terms]
  );
  const [activeCategory, setActiveCategory] = useState<GlossaryCategory | null>(null);
  const category = activeCategory && tabs.some((t) => t.value === activeCategory) ? activeCategory : tabs[0]?.value ?? null;

  const termOfWeek = useMemo(() => {
    if (!category) return null;
    const inCategory = terms.filter((t) => t.category === category).sort((a, b) => a.order - b.order);
    if (inCategory.length === 0) return null;
    return inCategory[weekIndex(inCategory.length)];
  }, [terms, category]);

  // Nothing published yet: render nothing rather than a placeholder.
  if (!termOfWeek || !category) return null;
  const active = termOfWeek;
  const tagLabel = CATEGORY_ORDER.find((c) => c.value === category)?.label ?? category.toUpperCase();

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
            {tagLabel}
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

              {showTooltip && (active.shortDefinition || active.formula) && (
                <div className="absolute left-0 top-full mt-2 z-30 w-72 sm:w-80 p-3.5 bg-olive text-white rounded-xl shadow-xl border border-hairline/20 font-sans text-xs animate-in fade-in zoom-in-95 duration-150">
                  <div className="font-mono text-[9px] text-gold uppercase tracking-wider font-bold mb-1">
                    Quick Mental Model
                  </div>
                  <p className="text-white/90 leading-relaxed font-normal">
                    {active.shortDefinition ?? active.definition}
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
              {active.definition}
            </div>

            {active.formula && (
              <div className="p-2 rounded bg-panel font-mono text-[11px] text-forest border border-hairline">
                {active.formula}
              </div>
            )}

            {active.retailTrap && (
              <div className="pt-2 text-[11px] text-rose-800 bg-rose-50/70 p-2.5 rounded-lg border border-rose-200/60 leading-relaxed">
                <strong className="font-bold uppercase font-mono mr-1">Retail Trap:</strong>
                {active.retailTrap}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="pt-4 mt-4 border-t border-hairline">
        <div className="flex items-center justify-between text-[10px] font-mono text-ink-dim mb-2">
          <span>EXPLORE ESSENTIAL TERMS:</span>
          <span>{tabs.findIndex((t) => t.value === category) + 1} / {tabs.length}</span>
        </div>

        <div className={`grid gap-1.5 font-mono text-[10px] mb-3 ${tabs.length >= 4 ? "grid-cols-4" : tabs.length === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
          {tabs.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => {
                setActiveCategory(t.value);
                setShowTooltip(false);
              }}
              className={`py-1 rounded-md text-center transition-all cursor-pointer truncate px-1 ${
                category === t.value
                  ? "bg-forest text-white font-bold shadow-2xs"
                  : "bg-ivory hover:bg-panel border border-hairline text-ink-dim"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {active.course && (
          <Link
            href={`/courses/${active.course.slug}`}
            className="w-full inline-flex items-center justify-between px-3 py-2 rounded-xl bg-ivory border border-hairline hover:border-forest/40 hover:bg-panel text-xs font-semibold text-olive group transition-all"
          >
            <span className="truncate">Taught in: <strong>{active.course.title}</strong></span>
            <ChevronRight className="w-3.5 h-3.5 text-forest group-hover:translate-x-0.5 transition-transform shrink-0" />
          </Link>
        )}
      </div>
    </div>
  );
}
