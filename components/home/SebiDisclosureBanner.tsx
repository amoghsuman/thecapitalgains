"use client";

import { useState } from "react";
import { Shield, AlertTriangle, Scale, CheckCircle2, ChevronRight, Info } from "lucide-react";
import Link from "next/link";

export default function SebiDisclosureBanner() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section className="py-12 bg-ivory/90 border-b border-hairline" id="sebi-regulatory-assurance">
      <div className="site-container max-w-5xl">
        <div className="bg-panel border border-hairline rounded-2xl p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-forest-surface flex items-center justify-center text-forest border border-hairline flex-shrink-0">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-[10px] text-forest font-bold uppercase tracking-wider bg-forest-surface px-2 py-0.5 rounded border border-forest/20">
                    STATUTORY ASSURANCE
                  </span>
                  <span className="font-mono text-[10px] text-ink-dim tracking-wider uppercase">
                    SEBI (RESEARCH ANALYSTS) REGULATIONS, 2014 · INDEPENDENT PEDAGOGY
                  </span>
                </div>
                <h4 className="text-sm sm:text-base font-bold text-olive mt-1">
                  100% Educational Architecture · Zero Broker Affiliation · Unconflicted Research
                </h4>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs font-bold text-forest hover:text-forest-dark inline-flex items-center gap-1 self-start md:self-auto py-1 px-2.5 rounded-lg hover:bg-forest-surface transition-colors"
            >
              <span>{isExpanded ? "Hide Disclosures" : "Read Regulatory Notes"}</span>
              <ChevronRight
                className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}
              />
            </button>
          </div>

          {/* Quick Regulatory Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-hairline text-xs text-ink-dim">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-forest flex-shrink-0" />
              <span>
                <strong className="text-ink font-semibold">Non-Advisory: </strong>
                No buy/sell calls or portfolio management.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-forest flex-shrink-0" />
              <span>
                <strong className="text-ink font-semibold">Zero Kickbacks: </strong>
                No broker referral codes or transaction cuts.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-forest flex-shrink-0" />
              <span>
                <strong className="text-ink font-semibold">Objective Data: </strong>
                Sourced from statutory BSE/NSE filings.
              </span>
            </div>
          </div>

          {/* Expandable Statutory Disclosure Details */}
          {isExpanded && (
            <div className="mt-5 pt-4 border-t border-hairline/80 space-y-3.5 text-xs text-ink-dim leading-relaxed animate-in fade-in duration-200">
              <div className="p-3.5 bg-ivory rounded-xl border border-hairline space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-olive font-mono text-[11px]">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#B91C1C]" />
                  <span>SEBI RISK DISCLOSURE ON DERIVATIVES TRADING</span>
                </div>
                {/* The SEBI risk-disclosure paragraph now lives in components/layout/Footer.tsx. */}
                <p>
                  Derivative instruments (Futures and Options) involve substantial risk of loss and are not suitable for all investors. The Capital Gains strictly teaches defined-risk hedging, payoff geometries, and volatility mathematics for educational purposes. We never advocate naked speculative positioning.
                </p>
              </div>

              <p>
                <strong className="text-ink font-semibold">Educational Nature: </strong>
                The content, research notes, financial screeners, and interactive models provided on The Capital Gains are strictly for educational and analytical purposes. They do not constitute personalized investment advice, financial planning, or an offer/solicitation to buy or sell securities under the SEBI (Research Analysts) Regulations, 2014. Consult a SEBI-registered Investment Adviser before making financial decisions.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
