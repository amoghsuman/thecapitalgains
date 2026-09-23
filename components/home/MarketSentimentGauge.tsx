"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { Gauge } from "lucide-react";

import { liveLabel } from "@/lib/market/client";
import { useMarketSnapshot } from "@/lib/market/useMarketSnapshot";

// ─── Score ───────────────────────────────────────────────────────────────────
//
// For now the score is a function of India VIX alone. Mapping (linear, clamped):
//   VIX 10 or lower  → 90 ("Extreme Greed": very low implied volatility)
//   VIX 30 or higher → 10 ("Extreme Fear":  very high implied volatility)
//   in between       → 90 − (VIX − 10) × 4
// so VIX 15 → 70, VIX 20 → 50, VIX 25 → 30. FII flows and advance/decline
// breadth are not yet part of the composite; they render as "Unavailable"
// until a data source is wired in lib/market/providers.ts.
const VIX_LOW = 10;
const VIX_HIGH = 30;

function scoreFromVix(vix: number): number {
  const clamped = Math.min(VIX_HIGH, Math.max(VIX_LOW, vix));
  return Math.round(90 - (clamped - VIX_LOW) * 4);
}

function labelFor(score: number): string {
  if (score < 25) return "Extreme Fear";
  if (score < 45) return "Fear";
  if (score <= 55) return "Neutral";
  if (score <= 75) return "Mild Greed";
  return "Extreme Greed";
}

function descriptionFor(score: number): string {
  if (score < 45) return "Implied volatility is elevated. Option premiums are expensive; defined-risk structures and patience with entries matter more than direction.";
  if (score <= 55) return "Implied volatility is mid-range. Neither buyers nor sellers of options have a structural edge; position size, not conviction, is the lever.";
  return "Implied volatility is subdued. Premiums are cheap for hedging, and calm regimes are where crowded trades quietly build.";
}

export default function MarketSentimentGauge() {
  const market = useMarketSnapshot();
  const snapshot = market.status === "ready" ? market.data : null;
  const vix = snapshot?.indiaVix ?? null;
  const isLive = snapshot !== null && vix !== null;
  // With no VIX quote the needle rests at neutral and the card says so.
  const score = vix ? scoreFromVix(vix.last) : 50;
  const label = vix ? labelFor(score) : "Unavailable";
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = 240;
    const height = 135;
    const radius = Math.min(width, height * 2) / 2 - 12;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height - 10})`);

    const arcGenerator = d3
      .arc<{ startAngle: number; endAngle: number }>()
      .innerRadius(radius - 22)
      .outerRadius(radius)
      .cornerRadius(3);

    const segments = [
      { from: 0, to: 25, color: "#e05252", label: "Ext Fear" },
      { from: 25, to: 45, color: "#e88c38", label: "Fear" },
      { from: 45, to: 55, color: "#d4a72c", label: "Neutral" },
      { from: 55, to: 75, color: "#3b8a61", label: "Greed" },
      { from: 75, to: 100, color: "#1d5c42", label: "Ext Greed" },
    ];

    const scoreToRad = (val: number) => {
      return -Math.PI / 2 + (val / 100) * Math.PI;
    };

    segments.forEach((seg) => {
      const startAngle = scoreToRad(seg.from) + 0.015;
      const endAngle = scoreToRad(seg.to) - 0.015;

      g.append("path")
        .attr(
          "d",
          arcGenerator({
            startAngle,
            endAngle,
          }) as string
        )
        .attr("fill", seg.color)
        .attr("opacity", 0.85);
    });

    const needleRad = scoreToRad(score);
    const needleLength = radius - 16;
    const needleBaseWidth = 5;

    const topX = Math.cos(needleRad) * needleLength;
    const topY = Math.sin(needleRad) * needleLength;
    const leftX = Math.cos(needleRad - Math.PI / 2) * needleBaseWidth;
    const leftY = Math.sin(needleRad - Math.PI / 2) * needleBaseWidth;
    const rightX = Math.cos(needleRad + Math.PI / 2) * needleBaseWidth;
    const rightY = Math.sin(needleRad + Math.PI / 2) * needleBaseWidth;

    const needlePath = `M ${leftX} ${leftY} L ${topX} ${topY} L ${rightX} ${rightY} Z`;

    g.append("path")
      .attr("d", needlePath)
      .attr("fill", "#1c2b24")
      .attr("stroke", "#faf8f5")
      .attr("stroke-width", 1.2)
      .style("filter", "drop-shadow(0px 2px 4px rgba(0,0,0,0.25))");

    g.append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", 7)
      .attr("fill", "#1c2b24")
      .attr("stroke", "#b4832c")
      .attr("stroke-width", 2);

    g.append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", 2.5)
      .attr("fill", "#faf8f5");

    const ticks = [0, 50, 100];
    ticks.forEach((t) => {
      const angle = scoreToRad(t);
      const textX = Math.cos(angle) * (radius + 9);
      const textY = Math.sin(angle) * (radius + 9);
      g.append("text")
        .attr("x", textX)
        .attr("y", textY)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .attr("fill", "#718077")
        .attr("font-size", "8.5px")
        .attr("font-family", "monospace")
        .text(t);
    });
  }, [score]);

  const getScoreBadgeColor = (score: number) => {
    if (score < 25) return "bg-rose-100 text-rose-800 border-rose-200";
    if (score < 45) return "bg-orange-100 text-orange-800 border-orange-200";
    if (score <= 55) return "bg-amber-100 text-amber-800 border-amber-200";
    if (score <= 75) return "bg-emerald-100 text-emerald-800 border-emerald-200";
    return "bg-forest/15 text-forest border-forest/30";
  };

  return (
    <div className="bg-panel border border-hairline rounded-2xl p-5 sm:p-6 shadow-2xs hover:border-forest/40 transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-forest/10 text-forest flex items-center justify-center">
              <Gauge className="w-4 h-4" />
            </div>
            <div>
              <div className="font-mono text-[10px] text-gold tracking-widest uppercase font-bold">
                D3 TELEMETRY
              </div>
              <h3 className="text-sm sm:text-base font-bold text-olive">
                Nifty 50 Sentiment Index
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-ink-dim px-2 py-0.5 rounded-full border border-hairline bg-ivory whitespace-nowrap">
              {isLive ? liveLabel(snapshot?.fetchedAt ?? "") : "Sample data"}
            </span>
            {isLive && (
              <div className={`font-mono text-xs font-bold px-2.5 py-0.5 rounded-full border ${getScoreBadgeColor(score)}`}>
                {score} / 100
              </div>
            )}
          </div>
        </div>

        <p className="text-xs text-ink-dim leading-relaxed mb-4">
          Score derived from India VIX only (see the mapping in this component). FII flows and advance/decline breadth are not yet wired in.
        </p>

        <div className="flex flex-col items-center justify-center my-1 relative">
          <svg
            ref={svgRef}
            width={240}
            height={135}
            className="overflow-visible"
            aria-label={isLive ? `Market sentiment score ${score} out of 100 (${label})` : "Market sentiment unavailable"}
          />
          <div className="text-center -mt-2">
            <div className="font-mono text-xs font-bold text-olive uppercase tracking-wider">
              {label}
            </div>
            <div className="text-[10px] font-mono text-ink-dim">
              {vix ? `VIX day change: ${vix.changePct >= 0 ? "+" : ""}${vix.changePct.toFixed(2)}%` : "Feed unavailable"}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-hairline text-center font-mono">
          <div className="p-2 rounded-lg bg-ivory border border-hairline">
            <div className="text-[9px] text-ink-dim uppercase">India VIX</div>
            <div className="text-xs font-bold text-olive mt-0.5">{vix ? vix.last.toFixed(2) : "Unavailable"}</div>
            {snapshot && vix && <div className="text-[9px] text-ink-muted mt-0.5 truncate">Source: {snapshot.source}</div>}
          </div>
          <div className="p-2 rounded-lg bg-ivory border border-hairline">
            <div className="text-[9px] text-ink-dim uppercase">FII Net Flow</div>
            <div className="text-xs font-bold text-ink-dim mt-0.5 truncate">Unavailable</div>
          </div>
          <div className="p-2 rounded-lg bg-ivory border border-hairline">
            <div className="text-[9px] text-ink-dim uppercase">Adv / Dec</div>
            <div className="text-xs font-bold text-ink-dim mt-0.5">Unavailable</div>
          </div>
        </div>

        <div className="mt-3 p-2.5 rounded-xl bg-forest/5 border border-forest/15 text-[11px] text-[#2c3731] leading-relaxed">
          <span className="font-bold text-forest uppercase font-mono mr-1">Rigor Rule:</span>
          {vix ? descriptionFor(score) : "No India VIX quote is available right now, so no regime reading is shown."}
        </div>
      </div>

      <div className="pt-4 mt-4 border-t border-hairline">
        <div className="flex items-center justify-between text-[10px] font-mono text-ink-dim">
          <span>INPUTS: INDIA VIX (LIVE) · FII FLOWS (UNAVAILABLE) · ADV/DEC (UNAVAILABLE)</span>
        </div>
      </div>
    </div>
  );
}
