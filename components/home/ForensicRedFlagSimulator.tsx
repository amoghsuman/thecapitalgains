"use client";

import { useState } from "react";
import Link from "next/link";
import { ShieldAlert, AlertTriangle, CheckCircle, ArrowRight, Gauge, HelpCircle, FileText } from "lucide-react";

interface MetricState {
  cfoToEbitda: number; // percentage, e.g. 85%
  promoterPledge: number; // percentage, e.g. 5%
  relatedPartySales: number; // percentage, e.g. 4%
  auditorChurn: number; // count in 3 years, 0 to 3
}

export default function ForensicRedFlagSimulator() {
  const [metrics, setMetrics] = useState<MetricState>({
    cfoToEbitda: 42, // default showing an interesting distressed scenario
    promoterPledge: 38,
    relatedPartySales: 24,
    auditorChurn: 2,
  });

  // Calculate forensic danger score out of 100
  let dangerScore = 0;
  
  // CFO/EBITDA rule: < 60% is dangerous, < 40% is severe
  if (metrics.cfoToEbitda < 40) dangerScore += 35;
  else if (metrics.cfoToEbitda < 65) dangerScore += 20;
  else if (metrics.cfoToEbitda < 80) dangerScore += 8;

  // Promoter Pledge: > 25% is dangerous, > 50% critical
  if (metrics.promoterPledge > 50) dangerScore += 30;
  else if (metrics.promoterPledge > 25) dangerScore += 18;
  else if (metrics.promoterPledge > 10) dangerScore += 6;

  // Related Party Sales: > 15% is suspicious
  if (metrics.relatedPartySales > 20) dangerScore += 20;
  else if (metrics.relatedPartySales > 10) dangerScore += 10;

  // Auditor churn: > 1 in 3 years is alarming
  if (metrics.auditorChurn >= 2) dangerScore += 15;
  else if (metrics.auditorChurn === 1) dangerScore += 8;

  dangerScore = Math.min(100, dangerScore);

  const getRiskStatus = (score: number) => {
    if (score >= 65) {
      return {
        label: "CRITICAL FORENSIC DISTRESS",
        color: "text-rose-600",
        badgeBg: "bg-rose-100 text-rose-800 border-rose-200",
        recommendation: "Immediate Exit / Zero Capital Allocation. High likelihood of aggressive revenue inflation or promoter diversion.",
        historicalCase: "Resembles classic pre-collapse profiles (e.g. DHFL, Sintex, Karvy) where headline accounting profits masked uncollected paper receivables.",
      };
    }
    if (score >= 35) {
      return {
        label: "ELEVATED ACCOUNTING FRICTION",
        color: "text-amber-600",
        badgeBg: "bg-amber-100 text-amber-800 border-amber-200",
        recommendation: "Heightened Due Diligence required. Discount intrinsic value multiple by 30-40% margin of safety cushion.",
        historicalCase: "Common in cyclical midcap capital goods where working capital gets locked in government contracts or supplier credit.",
      };
    }
    return {
      label: "CLEAN INSTITUTIONAL GRADE",
      color: "text-emerald-700",
      badgeBg: "bg-emerald-100 text-emerald-800 border-emerald-200",
      recommendation: "High Earnings Quality. Cash conversion is robust; accounting earnings mirror bank balance growth.",
      historicalCase: "Matches durable compounders (e.g. TCS, Titan, Asian Paints) that consistently convert >85% EBITDA directly into liquid free cash.",
    };
  };

  const status = getRiskStatus(dangerScore);

  return (
    <section id="forensic-screener-section" className="py-16 md:py-24 bg-panel border-b border-hairline">
      <div className="site-container space-y-10">
        {/* Header */}
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 bg-ivory border border-hairline rounded-full px-3.5 py-1 text-gold">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span className="font-mono text-[10px] tracking-[0.18em] font-bold uppercase">
              APPLIED FORENSIC LAB · 03 / BALANCE SHEET AUDIT
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-olive tracking-tight">
            Forensic Balance Sheet Simulator: Spot the Trap
          </h2>
          <p className="text-sm sm:text-base text-ink-dim leading-relaxed">
            Headline revenue growth often masks catastrophic structural decay. Adjust the four primary forensic warning indicators below to test how institutional investors evaluate business solvency.
          </p>
        </div>

        {/* Simulator Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls Column (lg:col-span-6) */}
          <div className="lg:col-span-6 space-y-6 bg-ivory border border-hairline rounded-2xl p-6 sm:p-7 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-hairline">
              <span className="font-mono text-xs font-bold text-olive uppercase tracking-wider">
                FORENSIC STRESS CONTROLS
              </span>
              <button
                onClick={() =>
                  setMetrics({
                    cfoToEbitda: 88,
                    promoterPledge: 0,
                    relatedPartySales: 3,
                    auditorChurn: 0,
                  })
                }
                className="text-[11px] font-mono text-forest hover:text-forest-dark underline"
              >
                Reset to Clean Grade
              </button>
            </div>

            {/* Slider 1: CFO to EBITDA */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-olive flex items-center gap-1.5">
                  <span>Operating Cash Flow to EBITDA Ratio</span>
                  <span className="text-[10px] font-mono text-ink-dim">(Healthy: &gt; 75%)</span>
                </span>
                <span className="font-mono font-bold text-forest text-sm">
                  {metrics.cfoToEbitda}%
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="110"
                value={metrics.cfoToEbitda}
                onChange={(e) =>
                  setMetrics((m) => ({ ...m, cfoToEbitda: Number(e.target.value) }))
                }
                className="w-full accent-forest cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-ink-dim">
                <span>10% (Severe Paper Profits)</span>
                <span>110% (Exceptional Cash Conversion)</span>
              </div>
            </div>

            {/* Slider 2: Promoter Pledge % */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-olive flex items-center gap-1.5">
                  <span>Promoter Share Pledge %</span>
                  <span className="text-[10px] font-mono text-ink-dim">(Safe: &lt; 10%)</span>
                </span>
                <span className="font-mono font-bold text-forest text-sm">
                  {metrics.promoterPledge}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="90"
                value={metrics.promoterPledge}
                onChange={(e) =>
                  setMetrics((m) => ({ ...m, promoterPledge: Number(e.target.value) }))
                }
                className="w-full accent-forest cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-ink-dim">
                <span>0% (Zero Pledge)</span>
                <span>90% (High Margin Call Vulnerability)</span>
              </div>
            </div>

            {/* Slider 3: Related Party Transactions % */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-olive flex items-center gap-1.5">
                  <span>Related-Party Sales %</span>
                  <span className="text-[10px] font-mono text-ink-dim">(Safe: &lt; 5%)</span>
                </span>
                <span className="font-mono font-bold text-forest text-sm">
                  {metrics.relatedPartySales}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="45"
                value={metrics.relatedPartySales}
                onChange={(e) =>
                  setMetrics((m) => ({ ...m, relatedPartySales: Number(e.target.value) }))
                }
                className="w-full accent-forest cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-ink-dim">
                <span>0% (Arm's Length Only)</span>
                <span>45% (High Divergence Risk)</span>
              </div>
            </div>

            {/* Control 4: Auditor Resignations in Last 3 Years */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-olive">
                  Statutory Auditor Resignations (Past 3 Years)
                </span>
                <span className="font-mono font-bold text-forest text-sm">
                  {metrics.auditorChurn} Resignations
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[0, 1, 2, 3].map((val) => (
                  <button
                    key={val}
                    onClick={() => setMetrics((m) => ({ ...m, auditorChurn: val }))}
                    className={`py-2 rounded-lg text-xs font-mono font-bold border transition-all ${
                      metrics.auditorChurn === val
                        ? "bg-forest text-white border-forest shadow-xs"
                        : "bg-panel text-ink border-hairline hover:bg-ivory"
                    }`}
                  >
                    {val === 3 ? "3+ Times" : `${val}`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Result Column (lg:col-span-6) */}
          <div className="lg:col-span-6 space-y-6 bg-ivory border border-hairline rounded-2xl p-6 sm:p-7 shadow-2xs flex flex-col justify-between">
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-hairline">
                <div className="flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-forest" />
                  <span className="font-mono text-xs font-bold text-olive uppercase tracking-wider">
                    INSTITUTIONAL RISK SCORECARD
                  </span>
                </div>
                <span
                  className={`font-mono text-[11px] font-bold px-2.5 py-1 rounded border ${status.badgeBg}`}
                >
                  {status.label}
                </span>
              </div>

              {/* Big Score Gauge Display */}
              <div className="p-5 rounded-xl bg-panel border border-hairline flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-mono text-ink-dim uppercase">
                    Aggregated Forensic Hazard
                  </div>
                  <div className={`text-4xl font-mono font-extrabold mt-1 ${status.color}`}>
                    {dangerScore}/100
                  </div>
                  <div className="text-xs text-ink-dim mt-0.5">
                    {dangerScore > 50 ? "High probability of equity impairment" : "Sound economic balance sheet health"}
                  </div>
                </div>

                <div className="w-full sm:w-44 h-3 bg-hairline rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      dangerScore > 60
                        ? "bg-rose-500"
                        : dangerScore > 30
                        ? "bg-amber-500"
                        : "bg-emerald-600"
                    }`}
                    style={{ width: `${dangerScore}%` }}
                  />
                </div>
              </div>

              {/* Protocol Recommendation */}
              <div className="space-y-2">
                <div className="font-mono text-[11px] text-ink-dim font-bold uppercase tracking-wider">
                  INSTITUTIONAL ACTION PROTOCOL
                </div>
                <p className="text-xs sm:text-sm text-ink leading-relaxed font-medium bg-panel p-3.5 rounded-xl border border-hairline">
                  {status.recommendation}
                </p>
              </div>

              {/* Historical Precedent Case Study */}
              <div className="space-y-2">
                <div className="font-mono text-[11px] text-gold font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-gold" />
                  <span>INDIAN MARKET PRECEDENT</span>
                </div>
                <p className="text-xs text-ink-dim leading-relaxed italic bg-panel p-3 rounded-xl border border-hairline">
                  “{status.historicalCase}”
                </p>
              </div>
            </div>

            {/* Bottom Link to Fundamental Deep Dive */}
            <div className="pt-4 border-t border-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs font-mono text-ink-dim">
                Course Module: Reading Notes to Accounts
              </span>
              <Link
                href="/courses/how-to-read-financial-statements"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-forest hover:bg-forest-dark text-white text-xs font-bold transition-all shadow-xs"
              >
                <span>Master Forensic Analysis</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
