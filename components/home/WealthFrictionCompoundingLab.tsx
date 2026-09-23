"use client";

import { useState } from "react";
import Link from "next/link";
import { Coins, TrendingDown, TrendingUp, ArrowRight, DollarSign, Layers } from "lucide-react";

export default function WealthFrictionCompoundingLab() {
  const [initialCapital, setInitialCapital] = useState<number>(500000); // 5 Lakhs INR
  const [years, setYears] = useState<number>(15);
  const [annualReturn, setAnnualReturn] = useState<number>(14); // 14% CAGR expected gross

  // Frictions: house assumptions, editable below. None is a published figure.
  const [inflationRate, setInflationRate] = useState<number>(6.0);
  const [noisyTraderTaxDragAndChurn, setNoisyDrag] = useState<number>(4.8);
  const [disciplinedTaxDragAndChurn, setDisciplinedDrag] = useState<number>(1.4);

  // Scenario 1: Disciplined Investor
  // Net nominal CAGR = annualReturn - disciplinedTaxDragAndChurn
  const disciplinedNominalCAGR = Math.max(0, annualReturn - disciplinedTaxDragAndChurn);
  const disciplinedNominalFinal = initialCapital * Math.pow(1 + disciplinedNominalCAGR / 100, years);
  const disciplinedRealFinal = disciplinedNominalFinal / Math.pow(1 + inflationRate / 100, years);

  // Scenario 2: Noise-Chasing Retail Trader (High churn, short-term tax, impulsive entry/exit)
  const noisyNominalCAGR = Math.max(0, annualReturn - noisyTraderTaxDragAndChurn);
  const noisyNominalFinal = initialCapital * Math.pow(1 + noisyNominalCAGR / 100, years);
  const noisyRealFinal = noisyNominalFinal / Math.pow(1 + inflationRate / 100, years);

  // Friction Delta
  const wealthLostToFriction = disciplinedNominalFinal - noisyNominalFinal;

  const formatINR = (val: number) => {
    if (val >= 10000000) {
      return `₹${(val / 10000000).toFixed(2)} Cr`;
    }
    if (val >= 100000) {
      return `₹${(val / 100000).toFixed(2)} L`;
    }
    return `₹${Math.round(val).toLocaleString("en-IN")}`;
  };

  return (
    <section id="wealth-friction-lab-section" className="py-16 md:py-24 bg-ivory border-b border-hairline">
      <div className="site-container space-y-10">
        {/* Header */}
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 bg-panel border border-hairline rounded-full px-3.5 py-1 text-gold">
            <Coins className="w-3.5 h-3.5" />
            <span className="font-mono text-[10px] tracking-[0.18em] font-bold uppercase">
              BEHAVIORAL MATHEMATICS · 04 / WEALTH FRICTION LAB
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-olive tracking-tight">
            The Silent Killers: Tax Drag, Churn, and Inflation
          </h2>
          <p className="text-sm sm:text-base text-ink-dim leading-relaxed">
            Most Indian investors focus on chasing the next 50% breakout. In reality, wealth destruction happens silently through constant portfolio churn, STCG tax drag (20%), broker slippage, and unhedged inflation. Compare the two compounding paths below.
          </p>
        </div>

        {/* Lab Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Controls Column (lg:col-span-5) */}
          <div className="lg:col-span-5 space-y-6 bg-panel border border-hairline rounded-2xl p-6 sm:p-7 shadow-2xs">
            <div className="font-mono text-xs font-bold text-olive uppercase tracking-wider pb-3 border-b border-hairline flex items-center justify-between">
              <span>SIMULATION PARAMETERS</span>
              <span className="text-[11px] text-ink-dim font-normal">Indian Rupee</span>
            </div>

            {/* Initial Capital */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-olive">Starting Capital</span>
                <span className="font-mono font-bold text-forest text-sm">
                  {formatINR(initialCapital)}
                </span>
              </div>
              <input
                type="range"
                min="100000"
                max="5000000"
                step="50000"
                value={initialCapital}
                onChange={(e) => setInitialCapital(Number(e.target.value))}
                className="w-full accent-forest cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-ink-dim">
                <span>₹1 Lakh</span>
                <span>₹50 Lakhs</span>
              </div>
            </div>

            {/* Time Horizon */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-olive">Investment Horizon</span>
                <span className="font-mono font-bold text-forest text-sm">{years} Years</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[5, 10, 15, 25].map((yr) => (
                  <button
                    key={yr}
                    onClick={() => setYears(yr)}
                    className={`py-2 rounded-lg text-xs font-mono font-bold border transition-all ${
                      years === yr
                        ? "bg-forest text-white border-forest shadow-xs"
                        : "bg-ivory text-ink border-hairline hover:bg-panel"
                    }`}
                  >
                    {yr} Yrs
                  </button>
                ))}
              </div>
            </div>

            {/* Expected Gross Equities Return */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-olive">Gross Annual Portfolio Return</span>
                <span className="font-mono font-bold text-forest text-sm">
                  {annualReturn}% CAGR
                </span>
              </div>
              <input
                type="range"
                min="9"
                max="22"
                step="0.5"
                value={annualReturn}
                onChange={(e) => setAnnualReturn(Number(e.target.value))}
                className="w-full accent-forest cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-ink-dim">
                <span>9% (Conservative)</span>
                <span>22% (Exceptional Compounder)</span>
              </div>
            </div>

            {/* Assumptions (editable) */}
            <div className="p-3.5 rounded-xl bg-ivory border border-hairline space-y-2 text-[11px] font-mono text-ink-dim">
              <div className="font-bold text-olive uppercase">ASSUMPTIONS (EDITABLE):</div>
              {[
                { label: "Inflation (CPI), % p.a.", value: inflationRate, set: setInflationRate, min: 0, max: 12, step: 0.5 },
                { label: "Churn tax + slippage (trader), % drag", value: noisyTraderTaxDragAndChurn, set: setNoisyDrag, min: 0, max: 10, step: 0.1 },
                { label: "Buy & hold tax drag (LTCG), % drag", value: disciplinedTaxDragAndChurn, set: setDisciplinedDrag, min: 0, max: 5, step: 0.1 },
              ].map((a) => (
                <label key={a.label} className="flex items-center justify-between gap-3">
                  <span>• {a.label}</span>
                  <span className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={a.min}
                      max={a.max}
                      step={a.step}
                      value={a.value}
                      onChange={(e) => a.set(Number(e.target.value))}
                      className="w-16 px-1.5 py-0.5 rounded border border-hairline bg-panel text-right text-ink"
                    />
                    <span className="text-[9px] text-ink-muted">Assumption (editable)</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Comparison Cards (lg:col-span-7) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Disciplined Investor Card */}
              <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-emerald-800 font-bold uppercase tracking-wider bg-emerald-100 px-2 py-0.5 rounded">
                    DISCIPLINED INVESTOR
                  </span>
                  <TrendingUp className="w-4 h-4 text-emerald-700" />
                </div>
                <div className="space-y-1">
                  <div className="text-[11px] text-emerald-800 font-mono">
                    Nominal Accumulated Wealth:
                  </div>
                  <div className="text-2xl sm:text-3xl font-mono font-extrabold text-emerald-950">
                    {formatINR(disciplinedNominalFinal)}
                  </div>
                  <div className="text-xs text-emerald-800 font-medium pt-1">
                    Real Purchasing Power (Net of CPI):{" "}
                    <strong>{formatINR(disciplinedRealFinal)}</strong>
                  </div>
                </div>
                <ul className="text-[11px] text-emerald-900 space-y-1 pt-2 border-t border-emerald-200/60 font-mono">
                  <li>• Turnover &lt; 20% annually</li>
                  <li>• LTCG tax deferral advantage</li>
                  <li>• Compounding operates uninterrupted</li>
                </ul>
              </div>

              {/* Impulsive Churn Trader Card */}
              <div className="p-5 rounded-2xl bg-rose-50/70 border border-rose-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-rose-800 font-bold uppercase tracking-wider bg-rose-100 px-2 py-0.5 rounded">
                    NOISY CHURN TRADER
                  </span>
                  <TrendingDown className="w-4 h-4 text-rose-700" />
                </div>
                <div className="space-y-1">
                  <div className="text-[11px] text-rose-800 font-mono">
                    Nominal Accumulated Wealth:
                  </div>
                  <div className="text-2xl sm:text-3xl font-mono font-extrabold text-rose-950">
                    {formatINR(noisyNominalFinal)}
                  </div>
                  <div className="text-xs text-rose-800 font-medium pt-1">
                    Real Purchasing Power (Net of CPI):{" "}
                    <strong>{formatINR(noisyRealFinal)}</strong>
                  </div>
                </div>
                <ul className="text-[11px] text-rose-900 space-y-1 pt-2 border-t border-rose-200/60 font-mono">
                  <li>• Continuous STCG realization (20%)</li>
                  <li>• Bid-ask spread slippage & STT churn</li>
                  <li>• Friction robs multi-year compounding</li>
                </ul>
              </div>
            </div>

            {/* Friction Callout Highlight */}
            <div className="p-5 rounded-2xl bg-panel border border-hairline flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <div className="text-xs font-mono text-gold uppercase tracking-wider font-bold">
                  WEALTH CONSERVED BY DISCIPLINED PLAYBOOKS:
                </div>
                <div className="text-2xl sm:text-3xl font-mono font-bold text-olive mt-1">
                  {formatINR(wealthLostToFriction)}
                </div>
                <p className="text-xs text-ink-dim mt-0.5">
                  Saved simply by avoiding senseless portfolio churn and short-term tax leaks over {years} years.
                </p>
              </div>

              <Link
                href="/portfolios"
                className="shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-forest hover:bg-forest-dark text-white text-xs font-bold transition-all shadow-xs"
              >
                <span>Inspect Model Portfolios</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
