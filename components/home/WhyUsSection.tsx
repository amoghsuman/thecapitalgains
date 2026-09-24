"use client";

import { Check, X, Shield, AlertTriangle, BookOpen, Layers, BarChart2, ShieldCheck } from "lucide-react";
import { SEBI_FO_STATS, SEBI_FO_SOURCE } from "@/lib/home/sebiStats";
import { MYTH_SUMMARIES } from "@/components/home/MarketMythsSection";

const sebiShare = SEBI_FO_STATS.find((s) => s.id === "share-lost-fy22-24");

// Two of the myths from MarketMythsSection, title plus its one-line verdict.
const MYTHS_TESTED = MYTH_SUMMARIES.slice(0, 2);

const COMPARISONS = [
  {
    id: "focus-objective",
    feature: "Focus & Objective",
    hype: "Quick 2x–5x returns, 'sure-shot' expiry day hero-zero option calls",
    capitalGains: "Capital preservation, asymmetric risk-reward, and systematic process",
    rubric: "Preservation Precedes Alpha",
  },
  {
    id: "pedagogy-format",
    feature: "Pedagogy Format",
    hype: "10-hour unstructured videos, screen-recorded generic chart indicators",
    capitalGains: "Concise, text-first reference playbooks with interactive mathematical models",
    rubric: "Text-First Knowledge Base",
  },
  {
    id: "research-quality",
    feature: "Research Quality",
    hype: "Sensationalized YouTube hot takes, broker referral monetization",
    capitalGains: "Forensic company teardowns, statutory filing audits starting at ₹1",
    rubric: "Statutory Financial Audits",
  },
  {
    id: "risk-frameworks",
    feature: "Risk Frameworks",
    hype: "No downside calculations; 'average down when losing'",
    capitalGains: "Explicit position sizing, Greeks risk budgets, downside margin of safety",
    rubric: "Strict Risk Budgeting",
  },
  {
    id: "alignment-integrity",
    feature: "Alignment & Integrity",
    hype: "Affiliate links to unregulated brokerages and private trading rooms",
    capitalGains: "Zero broker affiliations, 100% independent educational curriculum",
    rubric: "100% Independent Curriculum",
  },
];

export default function WhyUsSection() {
  return (
    <section id="why-us-section" className="py-16 md:py-24 bg-panel border-b border-hairline">
      <div className="site-container max-w-6xl space-y-12">
        {/* Section header */}
        <div className="max-w-[72ch]">
          <div className="inline-flex items-center gap-2 font-mono text-[11px] text-gold tracking-[0.16em] font-bold uppercase mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-gold" />
            <span>Noise versus process</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-olive tracking-tight leading-[1.18]">
            Why 9 in 10 retail F&O traders lose, and what we do differently
          </h2>
          <p className="text-ink-dim text-base sm:text-lg mt-3.5 leading-relaxed">
            {sebiShare ? `About ${sebiShare.value} ${sebiShare.label}, according to SEBI's own study.` : "SEBI's own study found that most individual F&O traders lose money."} Below is the structural divergence between speculative social hype and a disciplined, text-first process.
          </p>
        </div>

        {/* Comparison table beside the SEBI figures; stacked on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* SEBI Study Empirical Audit Card (rendered second in the DOM order on desktop via lg:order) */}
          <div
            id="sebi-data-audit-badge"
            className="lg:col-span-4 lg:order-2 bg-ivory border border-hairline rounded-2xl p-5 shadow-2xs"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#B91C1C]" />
              <span className="font-mono text-[11px] text-ink-dim uppercase font-bold tracking-wider">
                SEBI Study Empirical Audit
              </span>
            </div>
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-xs sm:text-sm leading-snug">
              {SEBI_FO_STATS.map((stat) => (
                <div key={stat.id} className="contents">
                  <dt className="text-[#B91C1C] font-mono font-bold whitespace-nowrap">{stat.value}</dt>
                  <dd className="text-ink font-normal">{stat.label}</dd>
                </div>
              ))}
            </dl>
            <p className="font-mono text-[11px] text-ink-dim mt-3">
              Source: {SEBI_FO_SOURCE}. Figures approximate and rounded.
            </p>
          </div>

        {/* Centerpiece: Noise vs Rigor Table */}
        <div
          id="institutional-comparison-matrix"
          className="lg:col-span-8 lg:order-1 border border-hairline rounded-2xl overflow-hidden shadow-xs bg-panel"
        >
          {/* Desktop Table Header */}
          <div className="hidden md:grid grid-cols-12 bg-forest-surface/90 border-b border-hairline text-xs font-bold py-4 px-5 lg:px-6">
            <div className="col-span-3 text-ink-dim font-mono tracking-wider uppercase text-[11px]">
              EVALUATION CRITERIA
            </div>
            <div className="col-span-4 text-[#B91C1C] flex items-center gap-1.5 font-mono tracking-wider uppercase text-[11px]">
              <AlertTriangle className="w-3.5 h-3.5" />
              SPECULATIVE SOCIAL NOISE
            </div>
            <div className="col-span-5 text-forest flex items-center gap-1.5 font-mono tracking-wider uppercase text-[11px]">
              <Shield className="w-3.5 h-3.5" />
              THE CAPITAL GAINS STANDARD
            </div>
          </div>

          {/* Desktop Rows */}
          <div className="hidden md:block divide-y divide-hairline">
            {COMPARISONS.map((row, idx) => (
              <div
                key={row.id}
                id={`desktop-comparison-row-${row.id}`}
                className="grid grid-cols-12 py-5 lg:py-6 px-5 lg:px-6 gap-4 lg:gap-5 items-start hover:bg-ivory/40 transition-colors group"
              >
                {/* Criterion Column (3 cols) */}
                <div className="col-span-3 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-gold-text font-bold">
                      0{idx + 1}
                    </span>
                    <h3 className="font-bold text-olive text-sm lg:text-base tracking-tight group-hover:text-olive-light transition-colors">
                      {row.feature}
                    </h3>
                  </div>
                  <div className="font-mono text-[10px] text-ink-dim tracking-wide uppercase">
                    {row.rubric}
                  </div>
                </div>

                {/* Speculative Noise Column (4 cols) */}
                <div className="col-span-4 flex items-start gap-2.5 pt-0.5">
                  <div className="p-1 rounded-full bg-red-50 text-[#B91C1C] flex-shrink-0 mt-0.5 border border-red-100">
                    <X className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-ink-dim text-sm leading-relaxed">
                    {row.hype}
                  </p>
                </div>

                {/* Capital Gains Standard Column (5 cols) */}
                <div className="col-span-5 flex items-start gap-2.5 bg-forest-surface/30 p-3.5 rounded-xl border border-forest/10 -my-1">
                  <div className="p-1 rounded-full bg-emerald-100 text-forest flex-shrink-0 mt-0.5 border border-emerald-200">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-olive font-medium text-sm leading-relaxed">
                    {row.capitalGains}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Card Layout */}
          <div className="md:hidden divide-y divide-hairline">
            {COMPARISONS.map((row, idx) => (
              <div key={row.id} className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-gold">0{idx + 1}</span>
                  <span className="font-mono text-[10px] text-ink-dim uppercase bg-ivory px-2 py-0.5 rounded border border-hairline">
                    {row.rubric}
                  </span>
                </div>
                <h4 className="font-bold text-olive text-base">{row.feature}</h4>
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-red-50/50 border border-red-100">
                    <div className="text-[10px] font-mono text-[#B91C1C] uppercase font-bold mb-1">
                      Noise
                    </div>
                    <p className="text-xs text-ink-dim leading-relaxed">{row.hype}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-forest-surface border border-forest/20">
                    <div className="text-[10px] font-mono text-forest uppercase font-bold mb-1">
                      The Capital Gains Standard
                    </div>
                    <p className="text-xs text-olive font-medium leading-relaxed">{row.capitalGains}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        </div>

        {/* Row of Four Principle Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Tile 1: Pillar 01 */}
          <div className="bg-ivory border border-hairline rounded-2xl p-5 flex flex-col justify-between hover:border-forest/40 transition-colors shadow-2xs">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-gold tracking-widest uppercase font-bold">
                  PILLAR 01
                </span>
                <BookOpen className="w-4 h-4 text-forest" />
              </div>
              <h3 className="text-sm font-bold text-olive">
                Foundations & Playbooks
              </h3>
              <p className="text-xs text-ink-dim leading-relaxed">
                Interactive, text-first playbooks crafted for fast comprehension, real Indian financial statements, cash flow models, and option payoff mechanics.
              </p>
            </div>
          </div>

          {/* Tile 2: Pillar 02 */}
          <div className="bg-ivory border border-hairline rounded-2xl p-5 flex flex-col justify-between hover:border-forest/40 transition-colors shadow-2xs">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-gold tracking-widest uppercase font-bold">
                  PILLAR 02
                </span>
                <Layers className="w-4 h-4 text-forest" />
              </div>
              <h3 className="text-sm font-bold text-olive">
                Forensic Research
              </h3>
              <p className="text-xs text-ink-dim leading-relaxed">
                Institutional-caliber company teardowns and macroeconomic briefings. Unconflicted analysis starting at ₹1, making high-conviction research universally accessible.
              </p>
            </div>
          </div>

          {/* Tile 3: Pillar 03 */}
          <div className="bg-ivory border border-hairline rounded-2xl p-5 flex flex-col justify-between hover:border-forest/40 transition-colors shadow-2xs">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-gold tracking-widest uppercase font-bold">
                  PILLAR 03
                </span>
                <BarChart2 className="w-4 h-4 text-forest" />
              </div>
              <h3 className="text-sm font-bold text-olive">
                Asset Allocation
              </h3>
              <p className="text-xs text-ink-dim leading-relaxed">
                Three distinct, transparent portfolio frameworks demonstrating asset allocation, risk weighting, and rebalancing cadence across market cycles.
              </p>
            </div>
          </div>

          {/* Tile 4: Myths, Tested */}
          <div className="bg-ivory border border-hairline rounded-2xl p-5 flex flex-col justify-between hover:border-forest/40 transition-colors shadow-2xs">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-gold tracking-widest uppercase font-bold">
                  DOCTRINE VERIFIED
                </span>
                <ShieldCheck className="w-4 h-4 text-gold" />
              </div>
              <h3 className="text-sm font-bold text-olive">
                Myths, Tested
              </h3>
              <ul className="space-y-2 text-[11px] text-ink-dim leading-relaxed">
                {MYTHS_TESTED.map((m) => (
                  <li key={m.id} className="border-l-2 border-rose-300 pl-2">
                    <span className="font-semibold text-olive">{m.title}:</span> {m.verdict}.
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
