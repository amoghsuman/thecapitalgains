import { Check, X, Shield, AlertTriangle, BookOpen } from "lucide-react";
import { SEBI_FO_STATS, SEBI_FO_SOURCE } from "@/lib/home/sebiStats";

export default function InstitutionalComparison() {
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

  return (
    <section id="institutional-rigor-section" className="py-16 md:py-20 border-b border-hairline bg-panel">
      {/* Playbook Container: Constrained to max-w-6xl for optimal measure and reading rhythm */}
      <div className="site-container max-w-6xl space-y-10">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="max-w-[72ch]">
            <div className="inline-flex items-center gap-2 font-mono text-[11px] text-gold tracking-[0.16em] font-bold uppercase mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gold" />
              <span>Doctrine · Noise vs. Institutional Rigor</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-olive tracking-tight leading-[1.18]">
              The Contrast: Noise vs. Institutional Rigor
            </h2>
            <p className="text-ink-dim text-base sm:text-lg mt-3.5 leading-relaxed">
              About 93% of individual traders in Indian equity F&amp;O lost money over FY22 to FY24, according to SEBI&apos;s own study. Below is the structural divergence between speculative social hype and an audited institutional framework.
            </p>
          </div>

          {/* SEBI Study Empirical Audit Card */}
          <div
            id="sebi-data-audit-badge"
            className="flex-shrink-0 bg-ivory border border-hairline rounded-2xl p-5 max-w-md shadow-2xs"
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
        </div>

        {/* Playbook Comparison Table / Matrix */}
        <div
          id="institutional-comparison-matrix"
          className="border border-hairline rounded-2xl overflow-hidden shadow-xs bg-panel"
        >
          {/* Desktop Table Header */}
          <div className="hidden md:grid grid-cols-12 bg-forest-surface/90 border-b border-hairline text-xs font-bold py-4 px-6 lg:px-8">
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
                className="grid grid-cols-12 py-5 lg:py-6 px-6 lg:px-8 gap-6 items-start hover:bg-ivory/40 transition-colors group"
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
                <div className="col-span-5 flex items-start gap-3 pt-0.5 bg-forest-surface/35 -my-2.5 py-2.5 px-3.5 rounded-xl border border-forest/10">
                  <div className="p-1 rounded-full bg-forest/10 text-forest flex-shrink-0 mt-0.5 border border-forest/20">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-ink font-semibold text-sm lg:text-[15px] leading-relaxed">
                    {row.capitalGains}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Stacked Card View (< md) for Pristine Readability */}
          <div className="md:hidden divide-y divide-hairline">
            {COMPARISONS.map((row, idx) => (
              <div
                key={row.id}
                id={`mobile-comparison-card-${row.id}`}
                className="p-5 space-y-4 hover:bg-ivory/30 transition-colors"
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-gold-text font-bold">
                      0{idx + 1}
                    </span>
                    <h3 className="font-bold text-olive text-base">
                      {row.feature}
                    </h3>
                  </div>
                  <span className="font-mono text-[9px] uppercase font-bold text-ink-dim bg-olive-surface px-2 py-0.5 rounded">
                    {row.rubric}
                  </span>
                </div>

                {/* Hype */}
                <div className="bg-red-50/60 border border-red-100 rounded-xl p-3 flex items-start gap-2.5">
                  <X className="w-4 h-4 text-[#B91C1C] flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="block font-mono text-[9px] text-[#B91C1C] font-bold uppercase tracking-wider mb-1">
                      Speculative Social Noise
                    </span>
                    <p className="text-xs text-ink-dim leading-relaxed">
                      {row.hype}
                    </p>
                  </div>
                </div>

                {/* Capital Gains Standard */}
                <div className="bg-forest-surface border border-forest/15 rounded-xl p-3.5 flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-forest flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="block font-mono text-[9px] text-forest font-bold uppercase tracking-wider mb-1">
                      The Capital Gains Standard
                    </span>
                    <p className="text-xs sm:text-sm font-semibold text-ink leading-relaxed">
                      {row.capitalGains}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Playbook Ledger Footer */}
          <div
            id="playbook-audit-footer"
            className="bg-ivory/70 border-t border-hairline py-3.5 px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-ink-dim"
          >
            <div className="flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5 text-forest" />
              <span className="font-mono text-[11px] tracking-wide">
                Audit Benchmark: SEBI Consultation Paper on Retail Derivatives & Statutory NSE Filings
              </span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-gold-text font-bold">
              <Shield className="w-3.5 h-3.5 text-gold" />
              <span>Independent Educational Standard</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
