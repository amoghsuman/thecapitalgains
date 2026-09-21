"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sliders,
  Activity,
  BarChart2,
  ShieldCheck,
  ArrowUpRight,
  CheckCircle2,
  Sparkles,
  RefreshCw,
} from "lucide-react";

type LabMode = "options" | "valuation";

type OptionStrategyKey = "bull-call" | "straddle" | "iron-condor" | "bear-put";

export default function InteractiveTerminalVisual() {
  const [activeTab, setActiveTab] = useState<LabMode>("options");

  // Options Lab State
  const [strategy, setStrategy] = useState<OptionStrategyKey>("bull-call");
  const [spotPrice, setSpotPrice] = useState<number>(25200);

  // Valuation Lab State
  const [fcfGrowth, setFcfGrowth] = useState<number>(15);
  const [discountRate, setDiscountRate] = useState<number>(11.5);
  const [terminalMultiple, setTerminalMultiple] = useState<number>(22);
  const [activeArchetype, setActiveArchetype] = useState<string>("custom");

  // Options Presets Handler
  const applyOptionPreset = (presetKey: OptionStrategyKey) => {
    setStrategy(presetKey);
    setSpotPrice(25200);
  };

  // Valuation Archetype Presets Handler
  const applyValuationPreset = (name: string, growth: number, wacc: number, multiple: number) => {
    setActiveArchetype(name);
    setFcfGrowth(growth);
    setDiscountRate(wacc);
    setTerminalMultiple(multiple);
  };

  // Computed Options Payoff Points for SVG
  const getOptionsMetrics = () => {
    if (strategy === "bull-call") {
      const strike1 = 25000;
      const strike2 = 25400;
      const netDebit = 95;
      const maxProfit = (strike2 - strike1 - netDebit) * 25; // 1 lot Nifty = 25
      const maxLoss = netDebit * 25;
      const breakeven = strike1 + netDebit;
      const delta = 0.58;
      const theta = -42; // ₹ decay / day
      return {
        name: "Bull Call Spread (25000 / 25400 CE)",
        subtitle: "Bullish Trend · Defined Risk & Defined Upside",
        maxProfit: `+₹${maxProfit.toLocaleString("en-IN")}`,
        maxLoss: `-₹${maxLoss.toLocaleString("en-IN")}`,
        breakeven: `₹${breakeven}`,
        delta: `+${delta}`,
        theta: `₹${theta}/day`,
        riskReward: "1 : 3.2",
        courseLink: "/courses/options-trading-from-zero",
        courseTitle: "Options Trading from Zero",
        scenario: "Used when anticipating moderate upward breakout above resistance without paying full naked call IV premium.",
        points: [
          { x: 0, y: 160 },
          { x: 100, y: 160 },
          { x: 140, y: 160 },
          { x: 260, y: 40 },
          { x: 380, y: 40 },
        ],
        zeroLineY: 130,
      };
    } else if (strategy === "straddle") {
      const strike = 25200;
      const netDebit = 340;
      const breakevenUpper = strike + netDebit;
      const breakevenLower = strike - netDebit;
      return {
        name: "Long Volatility Straddle (25200 ATM CE & PE)",
        subtitle: "Event Volatility · RBI Policy or Election Outcome",
        maxProfit: "Unlimited (Gamma Expansion)",
        maxLoss: `-₹${(netDebit * 25).toLocaleString("en-IN")}`,
        breakeven: `₹${breakevenLower} / ₹${breakevenUpper}`,
        delta: "0.02 (Delta Neutral)",
        theta: "-₹180/day (Aggressive Theta Drain)",
        riskReward: "Asymmetric",
        courseLink: "/courses/options-trading-from-zero",
        courseTitle: "Options Trading from Zero",
        scenario: "Profit from explosive price displacement in either direction before India VIX crushes post-announcement.",
        points: [
          { x: 0, y: 20 },
          { x: 190, y: 175 },
          { x: 380, y: 20 },
        ],
        zeroLineY: 130,
      };
    } else if (strategy === "bear-put") {
      const strike1 = 25400;
      const strike2 = 25000;
      const netDebit = 110;
      const maxProfit = (strike1 - strike2 - netDebit) * 25;
      const maxLoss = netDebit * 25;
      const breakeven = strike1 - netDebit;
      return {
        name: "Bear Put Spread (25400 / 25000 PE)",
        subtitle: "Downside Portfolio Hedge · Defined Cost",
        maxProfit: `+₹${maxProfit.toLocaleString("en-IN")}`,
        maxLoss: `-₹${maxLoss.toLocaleString("en-IN")}`,
        breakeven: `₹${breakeven}`,
        delta: "-0.52",
        theta: "-₹35/day",
        riskReward: "1 : 2.6",
        courseLink: "/courses/options-trading-from-zero",
        courseTitle: "Options Trading from Zero",
        scenario: "Systematic hedge against market corrections without paying exorbitant single-leg put premiums.",
        points: [
          { x: 0, y: 40 },
          { x: 120, y: 40 },
          { x: 240, y: 160 },
          { x: 380, y: 160 },
        ],
        zeroLineY: 130,
      };
    } else {
      return {
        name: "Iron Condor Range Bound (Hedging Wing)",
        subtitle: "Theta Decay Harvest · Low India VIX Environment",
        maxProfit: "+₹4,875 (Defined Net Credit)",
        maxLoss: "-₹7,625 (Defined Wing Risk)",
        breakeven: "₹24,850 — ₹25,550",
        delta: "0.04 (Market Neutral)",
        theta: "+₹95/day (Theta Inflow)",
        riskReward: "1 : 1.56",
        courseLink: "/courses/futures-derivatives-explained",
        courseTitle: "Futures & Derivatives Explained",
        scenario: "Harvest weekly time decay when Nifty consolidates between major institutional Open Interest walls.",
        points: [
          { x: 0, y: 170 },
          { x: 80, y: 170 },
          { x: 140, y: 60 },
          { x: 240, y: 60 },
          { x: 300, y: 170 },
          { x: 380, y: 170 },
        ],
        zeroLineY: 130,
      };
    }
  };

  // Valuation Calculation (Simplified 5-Year DCF model for demonstration)
  const calculateValuation = () => {
    const baseFCF = 1250; // In ₹ Cr (e.g. Mid-cap leader)
    const currentPrice = 1420;
    const sharesCount = 10; // 10 Cr shares

    let pvSum = 0;
    let currentFcf = baseFCF;
    for (let yr = 1; yr <= 5; yr++) {
      currentFcf = currentFcf * (1 + fcfGrowth / 100);
      const discountFactor = Math.pow(1 + discountRate / 100, yr);
      pvSum += currentFcf / discountFactor;
    }

    const terminalVal = (currentFcf * terminalMultiple) / Math.pow(1 + discountRate / 100, 5);
    const enterpriseValue = pvSum + terminalVal;
    const intrinsicSharePrice = Math.round(enterpriseValue / sharesCount);
    const marginOfSafety = Math.round(((intrinsicSharePrice - currentPrice) / intrinsicSharePrice) * 100);

    return {
      intrinsicSharePrice,
      currentPrice,
      marginOfSafety,
      isUndervalued: marginOfSafety > 10,
      isOvervalued: marginOfSafety < -10,
    };
  };

  const optMetrics = getOptionsMetrics();
  const valMetrics = calculateValuation();

  // Spot price marker X coordinate calculation: 24800 is x=40, 25600 is x=340
  const spotX = Math.max(30, Math.min(350, 40 + ((spotPrice - 24800) / 800) * 300));

  return (
    <div className="bg-panel border border-hairline rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm" id="terminal-lab">
      {/* Terminal Top Control Bar */}
      <div className="bg-forest-surface/80 border-b border-hairline px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-forest" />
            <span className="w-2.5 h-2.5 rounded-full bg-gold opacity-60" />
            <span className="w-2.5 h-2.5 rounded-full bg-hairline" />
          </div>
          <span className="font-mono text-[10px] text-ink-dim tracking-[0.16em] uppercase font-bold pl-2 border-l border-hairline">
            Institutional Laboratory v2.4
          </span>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-panel border border-hairline rounded-lg p-0.5">
          <button
            onClick={() => setActiveTab("options")}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === "options"
                ? "bg-olive text-white shadow-sm font-bold"
                : "text-ink-dim hover:text-ink"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Options & Greeks Lab</span>
          </button>
          <button
            onClick={() => setActiveTab("valuation")}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === "valuation"
                ? "bg-olive text-white shadow-sm font-bold"
                : "text-ink-dim hover:text-ink"
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>DCF & Valuation Lab</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Screen */}
      <div className="p-5 sm:p-7">
        {activeTab === "options" ? (
          <div className="space-y-6">
            {/* Quick Strategy Presets Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-gold-text tracking-wider uppercase font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-gold" />
                  Market Strategy Presets (Click to Load)
                </span>
                <span className="text-[11px] font-mono text-ink-dim">NSE Nifty 50 Index</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: "bull-call", label: "Bull Call Spread", badge: "Bullish R:R 1:3.2" },
                  { id: "straddle", label: "Volatility Straddle", badge: "Event / Earnings" },
                  { id: "iron-condor", label: "Iron Condor", badge: "Rangebound Income" },
                  { id: "bear-put", label: "Bear Put Spread", badge: "Downside Hedge" },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => applyOptionPreset(s.id as OptionStrategyKey)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      strategy === s.id
                        ? "bg-forest-surface border-forest shadow-xs ring-1 ring-forest/30"
                        : "bg-ivory/80 border-hairline hover:border-forest/40 hover:bg-panel"
                    }`}
                  >
                    <div className="text-xs font-bold text-olive">{s.label}</div>
                    <div className="text-[10px] font-mono text-ink-dim mt-0.5">{s.badge}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Current Strategy Explainer Banner */}
            <div className="p-3.5 bg-ivory/80 border border-hairline rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <div className="font-bold text-olive">{optMetrics.name}</div>
                <div className="text-ink-dim text-[11px] leading-relaxed">{optMetrics.scenario}</div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 font-mono text-[11px]">
                <span className="text-ink-dim">Risk/Reward:</span>
                <span className="font-bold text-forest bg-panel px-2 py-0.5 rounded border border-hairline">
                  {optMetrics.riskReward}
                </span>
              </div>
            </div>

            {/* Interactive SVG Payoff Chart */}
            <div className="relative bg-ivory/60 border border-hairline rounded-xl p-4 overflow-hidden">
              <div className="flex justify-between items-center text-[10px] font-mono text-ink-dim mb-1">
                <span>P&L PAYOFF GEOMETRY AT EXPIRY</span>
                <span className="text-forest font-bold">PROFIT ZONE ▲</span>
              </div>

              <svg viewBox="0 0 380 180" className="w-full h-36 sm:h-44 overflow-visible">
                <defs>
                  <linearGradient id="profitGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1B3A2B" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#1B3A2B" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Zero Profit Line */}
                <line
                  x1="0"
                  y1={optMetrics.zeroLineY}
                  x2="380"
                  y2={optMetrics.zeroLineY}
                  stroke="#DFD9C8"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
                <text x="5" y={optMetrics.zeroLineY - 4} fill="#6E6A5F" fontSize="9" fontFamily="monospace">
                  BREAKEVEN ₹0
                </text>

                {/* Payoff Curve */}
                <path
                  d={`M ${optMetrics.points.map((p) => `${p.x},${p.y}`).join(" L ")}`}
                  fill="none"
                  stroke="#1B3A2B"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Dynamic Spot Marker */}
                <line x1={spotX} y1="10" x2={spotX} y2="175" stroke="#A9822F" strokeWidth="1.5" strokeDasharray="2 2" />
                <circle cx={spotX} cy={strategy === "bull-call" ? 100 : strategy === "bear-put" ? 100 : 170} r="4.5" fill="#A9822F" />
              </svg>

              <div className="flex justify-between items-center text-[10px] font-mono text-ink-dim mt-1">
                <span>24,800 (Downside)</span>
                <span className="text-gold-text font-bold">Current Spot: ₹{spotPrice.toLocaleString("en-IN")}</span>
                <span>25,600 (Upside)</span>
              </div>
            </div>

            {/* Spot Price Simulation Slider */}
            <div className="p-3 bg-panel border border-hairline rounded-xl space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-ink-dim font-medium">Test Spot Price Displacement:</span>
                <span className="font-mono font-bold text-ink bg-ivory px-2 py-0.5 rounded border border-hairline">
                  Nifty: ₹{spotPrice.toLocaleString("en-IN")}
                </span>
              </div>
              <input
                type="range"
                min="24800"
                max="25600"
                step="50"
                value={spotPrice}
                onChange={(e) => setSpotPrice(Number(e.target.value))}
                className="w-full accent-forest h-1.5 bg-hairline rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-ink-dim">
                <span>₹24,800 (-400 pts)</span>
                <span>₹25,200 (ATM Baseline)</span>
                <span>₹25,600 (+400 pts)</span>
              </div>
            </div>

            {/* Greeks & Risk Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div className="bg-panel border border-hairline rounded-xl p-3">
                <div className="text-[10px] font-mono text-ink-dim uppercase">Max Profit</div>
                <div className="text-sm font-bold text-forest mt-0.5">{optMetrics.maxProfit}</div>
              </div>
              <div className="bg-panel border border-hairline rounded-xl p-3">
                <div className="text-[10px] font-mono text-ink-dim uppercase">Max Defined Risk</div>
                <div className="text-sm font-bold text-[#B91C1C] mt-0.5">{optMetrics.maxLoss}</div>
              </div>
              <div className="bg-panel border border-hairline rounded-xl p-3">
                <div className="text-[10px] font-mono text-ink-dim uppercase">Position Delta (Δ)</div>
                <div className="text-sm font-bold text-ink mt-0.5 font-mono">{optMetrics.delta}</div>
              </div>
              <div className="bg-panel border border-hairline rounded-xl p-3">
                <div className="text-[10px] font-mono text-ink-dim uppercase">Daily Theta (θ)</div>
                <div className="text-sm font-bold text-ink mt-0.5 font-mono">{optMetrics.theta}</div>
              </div>
            </div>

            {/* Course Integration Footer */}
            <div className="pt-3 border-t border-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <span className="text-ink-dim flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-forest flex-shrink-0" />
                Full chapter with 15+ interactive formulas in{" "}
                <strong className="text-ink">{optMetrics.courseTitle}</strong>
              </span>
              <Link
                href={optMetrics.courseLink}
                className="text-forest font-bold hover:text-forest-dark inline-flex items-center gap-1 self-start sm:self-auto"
              >
                Read playbook chapter <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          /* Valuation Lab */
          <div className="space-y-6">
            {/* Archetype Quick Selectors */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-gold-text tracking-wider uppercase font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-gold" />
                  Indian Corporate Archetype Presets
                </span>
                <span className="text-[10px] font-mono text-ink-dim">CMP: ₹1,420</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { name: "FMCG Compounder", growth: 14, wacc: 9.5, multiple: 32, badge: "Moat / Low Beta" },
                  { name: "Capital Goods", growth: 22, wacc: 13.5, multiple: 18, badge: "Order Book High Growth" },
                  { name: "Export IT Services", growth: 16, wacc: 11.0, multiple: 24, badge: "High FCF Margin" },
                  { name: "Cyclical Value", growth: 8, wacc: 14.0, multiple: 12, badge: "Mature / Mean Reversion" },
                ].map((arch) => (
                  <button
                    key={arch.name}
                    onClick={() => applyValuationPreset(arch.name, arch.growth, arch.wacc, arch.multiple)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      activeArchetype === arch.name
                        ? "bg-forest-surface border-forest shadow-xs ring-1 ring-forest/30"
                        : "bg-ivory/80 border-hairline hover:border-forest/40 hover:bg-panel"
                    }`}
                  >
                    <div className="text-xs font-bold text-olive">{arch.name}</div>
                    <div className="text-[10px] font-mono text-ink-dim mt-0.5">{arch.badge}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Sliders */}
            <div className="space-y-4 bg-ivory/60 border border-hairline rounded-xl p-4">
              {/* Slider 1: FCF Growth */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-ink-dim font-medium">5-Year Free Cash Flow Growth (CAGR):</span>
                  <span className="font-mono font-bold text-ink">{fcfGrowth}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="30"
                  step="1"
                  value={fcfGrowth}
                  onChange={(e) => {
                    setFcfGrowth(Number(e.target.value));
                    setActiveArchetype("custom");
                  }}
                  className="w-full accent-forest h-1.5 bg-hairline rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-ink-dim">
                  <span>5% (Conservative)</span>
                  <span>15% (Base Case)</span>
                  <span>30% (High Growth)</span>
                </div>
              </div>

              {/* Slider 2: Discount Rate */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-ink-dim font-medium">Cost of Equity / Discount Rate (WACC):</span>
                  <span className="font-mono font-bold text-ink">{discountRate}%</span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="16"
                  step="0.5"
                  value={discountRate}
                  onChange={(e) => {
                    setDiscountRate(Number(e.target.value));
                    setActiveArchetype("custom");
                  }}
                  className="w-full accent-forest h-1.5 bg-hairline rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-ink-dim">
                  <span>8% (Large Cap Stable)</span>
                  <span>11.5% (Nifty Equity Benchmark)</span>
                  <span>16% (Small Cap Risk Premium)</span>
                </div>
              </div>

              {/* Slider 3: Terminal Multiple */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-ink-dim font-medium">Terminal Multiple (EV/FCF Exit):</span>
                  <span className="font-mono font-bold text-ink">{terminalMultiple}x</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="38"
                  step="1"
                  value={terminalMultiple}
                  onChange={(e) => {
                    setTerminalMultiple(Number(e.target.value));
                    setActiveArchetype("custom");
                  }}
                  className="w-full accent-forest h-1.5 bg-hairline rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-ink-dim">
                  <span>10x (Mature Capital Intensive)</span>
                  <span>22x (Compounding Franchise)</span>
                  <span>38x (High RoCE Monopoly)</span>
                </div>
              </div>
            </div>

            {/* Valuation Verdict Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-panel border border-hairline rounded-xl p-4 space-y-1">
                <div className="text-[10px] font-mono text-ink-dim uppercase">Intrinsic Fair Value</div>
                <div className="text-2xl font-bold font-mono text-forest tracking-tight">
                  ₹{valMetrics.intrinsicSharePrice.toLocaleString("en-IN")}
                </div>
                <div className="text-[11px] text-ink-dim">vs Market CMP ₹{valMetrics.currentPrice}</div>
              </div>

              <div className="bg-panel border border-hairline rounded-xl p-4 space-y-1">
                <div className="text-[10px] font-mono text-ink-dim uppercase">Margin of Safety</div>
                <div
                  className={`text-2xl font-bold font-mono tracking-tight ${
                    valMetrics.marginOfSafety >= 0 ? "text-forest" : "text-[#B91C1C]"
                  }`}
                >
                  {valMetrics.marginOfSafety > 0 ? `+${valMetrics.marginOfSafety}%` : `${valMetrics.marginOfSafety}%`}
                </div>
                <div className="text-[11px] text-ink-dim">
                  {valMetrics.marginOfSafety >= 15
                    ? "Substantial Cushion"
                    : valMetrics.marginOfSafety >= 0
                    ? "Moderate Cushion"
                    : "No Safety Margin"}
                </div>
              </div>

              <div className="bg-panel border border-hairline rounded-xl p-4 flex flex-col justify-between">
                <div className="text-[10px] font-mono text-ink-dim uppercase">Analyst Verdict</div>
                <div className="inline-flex items-center gap-1.5 mt-1">
                  <ShieldCheck
                    className={`w-4 h-4 ${valMetrics.isUndervalued ? "text-forest" : "text-gold"}`}
                  />
                  <span className="font-bold text-sm text-ink">
                    {valMetrics.isUndervalued
                      ? "Attractive Entry Zone"
                      : valMetrics.isOvervalued
                      ? "Priced for Perfection"
                      : "Fair Valuation Zone"}
                  </span>
                </div>
                <div className="text-[10px] text-ink-dim mt-1">Grounded in discounted cash flows</div>
              </div>
            </div>

            {/* Course Integration Footer */}
            <div className="pt-3 border-t border-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <span className="text-ink-dim flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-forest flex-shrink-0" />
                Learn financial statement dissection in{" "}
                <strong className="text-ink">How to Read Financial Statements</strong>
              </span>
              <Link
                href="/courses/how-to-read-financial-statements"
                className="text-forest font-bold hover:text-forest-dark inline-flex items-center gap-1 self-start sm:self-auto"
              >
                Read valuation playbook <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
