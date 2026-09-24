"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Compass, Globe2, Activity, ShieldCheck, ArrowRight, Zap, RefreshCw, BarChart2 } from "lucide-react";
import { repoRate, asOfLabel } from "@/lib/market/constants";
import { liveLabel, type MarketQuote, type MarketSnapshot } from "@/lib/market/client";
import { useMarketSnapshot } from "@/lib/market/useMarketSnapshot";

// Readouts: live values come from /api/market, the repo rate from
// lib/market/constants.ts with its as-of date. A feed that is down says
// "Unavailable" for that value; nothing is shown that has no source at all.
function fmtQuote(q: MarketQuote | null, prefix = "", digits = 2): string {
  return q ? `${prefix}${q.last.toLocaleString("en-IN", { maximumFractionDigits: digits, minimumFractionDigits: digits })}` : "Unavailable";
}

function indicatorText(kind: EcosystemNode["indicator"], data: MarketSnapshot | null): string {
  switch (kind) {
    case "equities": {
      // 10Y G-Sec (market_reference row, else the FBIL constant, via /api/market)
      // when the snapshot has it; otherwise the Nifty 50 day change.
      const gsec = data?.reference.gsec10y ?? null;
      if (gsec) return `India 10Y G-Sec yield: ${gsec.value.toFixed(2)}% (${gsec.source}, ${asOfLabel(gsec.asOf)})`;
      const nifty = data?.indices.find((i) => i.name === "Nifty 50") ?? null;
      return nifty
        ? `NIFTY 50 today: ${nifty.changePct >= 0 ? "+" : ""}${nifty.changePct.toFixed(2)}% · ${nifty.last.toLocaleString("en-IN", { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`
        : "NIFTY 50 today: Unavailable";
    }
    case "macro": {
      // The G-Sec yield lives on the equities readout; this one is the policy rate.
      const repo = data?.reference.repoRate ?? { value: repoRate.value, asOf: repoRate.asOf, source: repoRate.source };
      return `RBI repo rate: ${repo.value.toFixed(2)}% (${repo.source}, ${asOfLabel(repo.asOf)})`;
    }
    case "crude":
      return `Brent crude: ${fmtQuote(data?.brent ?? null, "$")}/bbl · USD/INR: ${fmtQuote(data?.usdInr ?? null, "₹")}`;
    case "derivatives":
      return `India VIX: ${fmtQuote(data?.indiaVix ?? null)}`;
    case "allocation":
      return "House rule: max single-stock weight 10% · dry cash reserve 12%";
  }
}

interface EcosystemNode {
  id: string;
  name: string;
  layer: string;
  angle: number; // in degrees for positioning
  radiusPercent: number; // 0 to 100 relative to center
  color: string;
  headline: string;
  transmissionChain: string[];
  /** Which live/reference readout the inspector shows for this node. */
  indicator: "equities" | "macro" | "crude" | "derivatives" | "allocation";
  retailTrap: string;
  capitalGainsRule: string;
  actionSlug: string;
}

const NODES: EcosystemNode[] = [
  {
    id: "equities",
    name: "Indian Equities",
    layer: "DOMESTIC EARNINGS & VALUATIONS",
    angle: 270, // Top
    radiusPercent: 68,
    color: "#1d5c42",
    headline: "CFO-to-EBITDA Conversion & ROIC Reinvestment Moat",
    transmissionChain: [
      "Capex Surge announced by management",
      "Debt-to-Equity expands beyond 1.5x",
      "Working capital cycle elongates (Receivables > 120 days)",
      "Free Cash Flow turns negative despite EPS growth",
      "Institutional rating downgrade triggers retail entrapment",
    ],
    indicator: "equities",
    retailTrap: "Buying companies purely on P/E ratios without checking cash conversion cycles.",
    capitalGainsRule: "Rule: Always discount future cash flows using realistic domestic hurdle rates (WACC 12-14%).",
    actionSlug: "financial-statements-deep-dive",
  },
  {
    id: "macro",
    name: "Macro & RBI Repo",
    layer: "LIQUIDITY & SYSTEMIC COST OF CAPITAL",
    angle: 340, // Top right
    radiusPercent: 78,
    color: "#b38938",
    headline: "Monetary Stance, Yield Curves & Currency Transmission",
    transmissionChain: [
      "US 10-Year Treasury Yields spike above 4.5%",
      "FPI capital outflows accelerate from Indian debt & equity",
      "USD/INR depreciates past historical thresholds",
      "RBI intervenes in FX reserves & pauses rate easing",
      "Domestic banking margins contract as deposit costs rise",
    ],
    indicator: "macro",
    retailTrap: "Assuming smallcaps will surge during periods of systemic liquidity drainage.",
    capitalGainsRule: "Rule: Track RBI net liquidity absorption to predict small-and-midcap drawdowns.",
    actionSlug: "macro-forces-in-indian-markets",
  },
  {
    id: "crude",
    name: "Crude Oil & FX",
    layer: "CURRENT ACCOUNT & IMPORTED INFLATION",
    angle: 45, // Bottom right
    radiusPercent: 62,
    color: "#cf6730",
    headline: "Energy Import Shocks & Corporate Margin Compression",
    transmissionChain: [
      "Brent Crude crosses $85/barrel due to OPEC supply cuts",
      "India imports 85%+ crude: Current Account Deficit expands",
      "Paint, Tyre, Lubricant, and Airline input margins shrink",
      "Auto and FMCG pass price hikes → demand moderation",
      "Domestic consumption cyclicals experience earnings downgrades",
    ],
    indicator: "crude",
    retailTrap: "Ignoring input raw material shocks on midcap manufacturing balance sheets.",
    capitalGainsRule: "Rule: Hedge energy-sensitive holdings or shift to domestic services during crude rallies.",
    actionSlug: "fundamental-analysis-masterclass",
  },
  {
    id: "derivatives",
    name: "Derivatives & VIX",
    layer: "MARKET VOLATILITY & HEDGING ASYMMETRY",
    angle: 135, // Bottom left
    radiusPercent: 72,
    color: "#2a7b63",
    headline: "India VIX, Put-Call Ratio (PCR) & Theta Decay",
    transmissionChain: [
      "Market enters consolidation zone with low India VIX (<13)",
      "Retail traders buy naked out-of-the-money calls expecting breakouts",
      "Option premium decay (Theta) accelerates exponentially at T-10 days",
      "Market makers collect option premium while retail capital evaporates",
      "93% retail traders close financial year with realized losses (SEBI Study)",
    ],
    indicator: "derivatives",
    retailTrap: "Buying cheap OTM lottery calls hoping for quick 5x windfalls.",
    capitalGainsRule: "Rule: Only trade multi-leg defined-risk structures where maximum downside is capped.",
    actionSlug: "options-trading-from-zero",
  },
  {
    id: "allocation",
    name: "Model Allocation",
    layer: "TACTICAL RISK SIZING & REBALANCING",
    angle: 205, // Top left
    radiusPercent: 60,
    color: "#5b4e78",
    headline: "Systematic Core-Satellite Portfolio Survivorship",
    transmissionChain: [
      "Investor builds portfolio with equal 5% weights",
      "One thematic winner grows to 25% of total portfolio value",
      "Sector cycle turns down; single stock crashes 45%",
      "Overall portfolio suffers severe 18% drawdown from single name",
      "Emotional panic selling locks in losses at market bottom",
    ],
    indicator: "allocation",
    retailTrap: "Letting single-stock winners become overconcentrated liabilities.",
    capitalGainsRule: "Rule: Execute automated rebalancing rules whenever single position breaches 12% NAV.",
    actionSlug: "portfolio-management-asset-allocation",
  },
];

export default function MarketObservatoryRadar() {
  const [selectedNodeId, setSelectedNodeId] = useState<string>("equities");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const activeNode = NODES.find((n) => n.id === selectedNodeId) || NODES[0];

  const market = useMarketSnapshot();
  const snapshot = market.status === "ready" ? market.data : null;
  const isLive = snapshot !== null && (snapshot.brent !== null || snapshot.usdInr !== null || snapshot.indiaVix !== null);

  // Canvas radar ambient particle rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = 0;
    let height = 0;

    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    // Decorative orbiting points, laid out deterministically (golden-angle
    // spacing) so the field is identical on every render.
    const GOLDEN = Math.PI * (3 - Math.sqrt(5));
    const particles = Array.from({ length: 60 }, (_, i) => ({
      radius: 0.5 + ((i * 7) % 15) / 10,
      speed: 0.0005 + ((i * 13) % 10) / 10000,
      angle: (i * GOLDEN) % (Math.PI * 2),
      orbitRadius: 40 + ((i * 37) % 160),
    }));

    let t = 0;
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const render = () => {
      t += 0.015;
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      // Draw faint concentric institutional orbit rings
      const rings = [60, 110, 160, 210];
      rings.forEach((r, idx) => {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = idx === 1 ? "rgba(180, 150, 92, 0.22)" : "rgba(220, 210, 185, 0.1)";
        ctx.lineWidth = 1;
        ctx.setLineDash(idx % 2 === 0 ? [4, 4] : []);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // Draw subtle rotating radar sweep line
      const sweepAngle = prefersReducedMotion ? 0.8 : t * 0.4;
      const sweepRadius = 220;
      const sx = cx + Math.cos(sweepAngle) * sweepRadius;
      const sy = cy + Math.sin(sweepAngle) * sweepRadius;

      const grad = ctx.createLinearGradient(cx, cy, sx, sy);
      grad.addColorStop(0, "rgba(29, 92, 66, 0.35)");
      grad.addColorStop(1, "rgba(29, 92, 66, 0)");

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, sweepRadius, sweepAngle - 0.2, sweepAngle);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // Render orbiting points
      particles.forEach((p, i) => {
        if (!prefersReducedMotion) {
          p.angle += p.speed;
        }
        const px = cx + Math.cos(p.angle) * p.orbitRadius;
        const py = cy + Math.sin(p.angle) * (p.orbitRadius * 0.78);

        ctx.beginPath();
        ctx.arc(px, py, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = i % 5 === 0 ? "rgba(196, 154, 69, 0.75)" : "rgba(235, 230, 215, 0.35)";
        ctx.fill();
      });

      if (!prefersReducedMotion) {
        animId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <section id="market-observatory-section" className="py-16 md:py-24 bg-[#0a1813] text-[#e8e4d8] border-b border-hairline relative overflow-hidden">
      {/* Decorative dark background grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.06] bg-[linear-gradient(to_right,#e8e4d8_1px,transparent_1px),linear-gradient(to_bottom,#e8e4d8_1px,transparent_1px)] bg-[size:3rem_3rem]" />

      <div className="site-container relative z-10 space-y-12">
        {/* Section Top Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-4 border-b border-[#20332a]">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 bg-[#12241d] border border-[#233f33] rounded-full px-3.5 py-1 text-gold">
              <Compass className="w-3.5 h-3.5" />
              <span className="font-mono text-[10px] tracking-[0.18em] font-bold uppercase">
                SYSTEMIC TELEMETRY · 02 / THE OBSERVATORY
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#faf8f2] tracking-tight">
              Explore the market as an interconnected system.
            </h2>
            <p className="text-sm sm:text-base text-[#9fb3a7] leading-relaxed">
              Markets do not move in isolated silos. When crude spikes or US Treasury yields surge, domestic equities transmit the shock through corporate margins and currency depreciation. Click any node to track the transmission mechanism.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#12241d] border border-[#233f33] text-xs font-mono text-[#b3c7bc]">
              <span className={`w-2 h-2 rounded-full ${isLive ? "bg-emerald-400 animate-pulse" : "bg-[#3a4f44]"}`} />
              <span>{isLive && snapshot ? liveLabel(snapshot.fetchedAt) : "Sample data"}</span>
            </div>
          </div>
        </div>

        {/* Main Interactive Stage: Radar Canvas + Live Telemetry Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* LEFT: Orbital Radar Visualization (lg:col-span-6) */}
          <div className="lg:col-span-6 flex flex-col items-center">
            <div className="w-full max-w-[480px] aspect-[4/3] sm:aspect-square relative rounded-3xl bg-[#07130f] border border-[#1d352b] p-4 sm:p-6 flex items-center justify-center shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
              {/* Background Canvas Radar */}
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full rounded-3xl pointer-events-none"
              />

              {/* Central Core: "YOUR PROCESS" */}
              <div className="relative z-20 w-24 h-24 rounded-full bg-gradient-to-br from-[#1d4a37] to-[#0f281e] border-2 border-[#b38938] flex flex-col items-center justify-center text-center p-2 shadow-[0_0_35px_rgba(179,137,56,0.3)]">
                <span className="font-mono text-[9px] text-gold tracking-widest uppercase font-bold">
                  CORE
                </span>
                <span className="text-[11px] font-mono font-extrabold text-[#faf7f0] leading-tight mt-0.5">
                  YOUR PROCESS
                </span>
                <span className="text-[8px] text-[#8ea79a] mt-0.5 font-mono">
                  DISCIPLINE
                </span>
              </div>

              {/* Interactive Node Buttons Positioned in Orbit */}
              {NODES.map((node) => {
                const isActive = node.id === selectedNodeId;
                const rad = (node.angle * Math.PI) / 180;
                // Calculate position relative to center (50%)
                const distancePercent = node.radiusPercent * 0.45; // scale to fit nicely inside box
                const left = 50 + distancePercent * Math.cos(rad);
                const top = 50 + distancePercent * Math.sin(rad) * 0.85; // slight oval perspective

                return (
                  <button
                    key={node.id}
                    onClick={() => setSelectedNodeId(node.id)}
                    style={{ left: `${left}%`, top: `${top}%` }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 z-30 px-3 py-1.5 rounded-full font-mono text-[11px] transition-all transform duration-200 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                      isActive
                        ? "bg-gold text-[#081713] font-bold ring-4 ring-gold/30 scale-110 shadow-lg"
                        : "bg-[#142921]/90 hover:bg-[#1f3c30] text-[#cfdcce] border border-[#2b4c3e] hover:scale-105"
                    }`}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: isActive ? "#081713" : node.color }}
                    />
                    <span>{node.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick Node Switcher Bar for Mobile/Tablet */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 font-mono text-[11px]">
              {NODES.map((node) => (
                <button
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  className={`px-2.5 py-1 rounded-lg border transition-all ${
                    selectedNodeId === node.id
                      ? "bg-gold/20 border-gold text-gold font-bold"
                      : "bg-[#12241d] border-[#223d31] text-[#9fb3a7] hover:text-[#e8e4d8]"
                  }`}
                >
                  {node.name}
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT: Live Transmission Chain & Playbook Insight (lg:col-span-6) */}
          <div className="lg:col-span-6 space-y-6 bg-[#0f231b] border border-[#203a2e] rounded-3xl p-6 sm:p-8 shadow-xl">
            {/* Active Node Header */}
            <div className="space-y-2 border-b border-[#203a2e] pb-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] text-gold font-bold tracking-widest uppercase">
                  {activeNode.layer}
                </span>
                <span className="font-mono text-[10px] bg-[#173327] text-[#9bb2a5] px-2.5 py-0.5 rounded border border-[#264b3a]">
                  ACTIVE TRANSMISSION
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#faf8f2] tracking-tight">
                {activeNode.headline}
              </h3>
              <div className="font-mono text-xs text-[#a0b8ab] flex items-center gap-2 pt-1">
                <BarChart2 className="w-3.5 h-3.5 text-gold" />
                <span>{indicatorText(activeNode.indicator, snapshot)}</span>
              </div>
            </div>

            {/* Transmission Mechanism Steps */}
            <div className="space-y-2.5">
              <div className="font-mono text-[11px] text-[#7d9689] uppercase tracking-wider font-semibold">
                SYSTEMIC TRANSMISSION MECHANISM (5 STEPS):
              </div>
              <div className="space-y-2">
                {activeNode.transmissionChain.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-[#091712] border border-[#1d352b] flex items-start gap-2.5 hover:border-gold/40 transition-colors"
                  >
                    <span className="w-5 h-5 rounded-md bg-[#162e24] text-gold font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-xs text-[#d1ded7] leading-relaxed font-mono">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Contrast: The Common Retail Trap vs The Capital Gains Rule */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-3.5 rounded-xl bg-[#281313]/60 border border-[#4d2424] space-y-1">
                <div className="flex items-center gap-1.5 font-mono text-[10px] text-rose-400 font-bold uppercase">
                  <ShieldCheck className="w-3 h-3 text-rose-400" />
                  <span>COMMON RETAIL TRAP</span>
                </div>
                <p className="text-xs text-[#d9b8b8] leading-relaxed">
                  {activeNode.retailTrap}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#112d21] border border-[#235841] space-y-1">
                <div className="flex items-center gap-1.5 font-mono text-[10px] text-emerald-400 font-bold uppercase">
                  <Zap className="w-3 h-3 text-emerald-400" />
                  <span>CAPITAL GAINS PROTOCOL</span>
                </div>
                <p className="text-xs text-[#b8ded0] leading-relaxed">
                  {activeNode.capitalGainsRule}
                </p>
              </div>
            </div>

            {/* Link to Related Deep Dive */}
            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs text-[#8da597] font-mono">
                Explore framework in curriculum:
              </span>
              <Link
                href={`/courses/${activeNode.actionSlug}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gold hover:bg-[#c29640] text-[#081713] text-xs font-bold transition-all shadow-md hover:-translate-y-0.5"
              >
                <span>Study Transmission Model</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
