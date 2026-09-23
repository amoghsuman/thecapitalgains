"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { Gauge } from "lucide-react";

import { liveLabel } from "@/lib/market/client";
import { useMarketSnapshot } from "@/lib/market/useMarketSnapshot";
import type { Sentiment } from "@/lib/market/sentiment";

// The TCG Sentiment Index (lib/market/sentiment.ts) computed in /api/market:
// volatility 0.30, breadth 0.25, momentum 0.20, flows 0.15, relative strength
// 0.10, each scored as a percentile of its trailing 252-day range and the
// composite renormalised over the inputs that are available.

// Geometry. The dial is a top semicircle: score 0 at 9 o'clock, 50 at 12,
// 100 at 3 o'clock. d3.arc measures angles clockwise from 12 o'clock, so the
// arc runs −π/2 → +π/2; needle and tick positions use the same convention
// converted to SVG x/y (x = sin θ, y = −cos θ).
const WIDTH = 240;
const HEIGHT = 135;
const RADIUS = Math.min(WIDTH, HEIGHT * 2) / 2 - 12;

function dialAngle(score: number): number {
  return -Math.PI / 2 + (score / 100) * Math.PI;
}
function dialPoint(score: number, r: number): { x: number; y: number } {
  const a = dialAngle(score);
  return { x: Math.sin(a) * r, y: -Math.cos(a) * r };
}

const SEGMENTS = [
  { from: 0, to: 20, color: "#e05252", label: "Extreme fear" },
  { from: 20, to: 40, color: "#e88c38", label: "Fear" },
  { from: 40, to: 60, color: "#d4a72c", label: "Neutral" },
  { from: 60, to: 80, color: "#3b8a61", label: "Greed" },
  { from: 80, to: 100, color: "#1d5c42", label: "Extreme greed" },
];

function descriptionFor(sentiment: Sentiment): string {
  if (sentiment.score === null) return "No input is available right now, so no reading is shown.";
  if (sentiment.score < 40) return "Fear regime: volatility, breadth or flows are stretched to the downside. Option premiums are rich; defined-risk structures and patience with entries matter more than direction.";
  if (sentiment.score <= 60) return "Neutral regime: no input is at an extreme. Position size, not conviction, is the lever.";
  return "Greed regime: calm volatility and broad participation. Hedges are cheap, and crowded trades build quietly in regimes like this.";
}

function bandLabel(sentiment: Sentiment): string {
  if (sentiment.band === null) return "Unavailable";
  return sentiment.band.replace(/^\w/, (c) => c.toUpperCase());
}

export default function MarketSentimentGauge() {
  const market = useMarketSnapshot();
  const snapshot = market.status === "ready" ? market.data : null;
  const sentiment = snapshot?.sentiment ?? null;
  const isLive = sentiment !== null && sentiment.score !== null;
  // With no reading the needle rests at 50 and the card says so.
  const score = sentiment?.score ?? 50;
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg.append("g").attr("transform", `translate(${WIDTH / 2}, ${HEIGHT - 10})`);

    const arcGenerator = d3
      .arc<{ startAngle: number; endAngle: number }>()
      .innerRadius(RADIUS - 22)
      .outerRadius(RADIUS)
      .cornerRadius(3);

    // Coloured bands, 0 → 100 left to right.
    SEGMENTS.forEach((seg) => {
      g.append("path")
        .attr("d", arcGenerator({ startAngle: dialAngle(seg.from) + 0.015, endAngle: dialAngle(seg.to) - 0.015 }) as string)
        .attr("fill", seg.color)
        .attr("opacity", isLive ? 0.85 : 0.35);
    });

    // Needle: a thin triangle from the hub to the score on the dial.
    const tip = dialPoint(score, RADIUS - 16);
    const perp = dialAngle(score) + Math.PI / 2;
    const baseW = 5;
    const left = { x: Math.sin(perp) * baseW, y: -Math.cos(perp) * baseW };
    const right = { x: -left.x, y: -left.y };
    g.append("path")
      .attr("d", `M ${left.x} ${left.y} L ${tip.x} ${tip.y} L ${right.x} ${right.y} Z`)
      .attr("fill", isLive ? "#1c2b24" : "#9aa39d")
      .attr("stroke", "#faf8f5")
      .attr("stroke-width", 1.2)
      .style("filter", "drop-shadow(0px 2px 4px rgba(0,0,0,0.25))");

    g.append("circle").attr("cx", 0).attr("cy", 0).attr("r", 7).attr("fill", isLive ? "#1c2b24" : "#9aa39d").attr("stroke", "#b4832c").attr("stroke-width", 2);
    g.append("circle").attr("cx", 0).attr("cy", 0).attr("r", 2.5).attr("fill", "#faf8f5");

    // Tick labels at 0, 25, 50, 75, 100 just outside the arc.
    [0, 25, 50, 75, 100].forEach((t) => {
      const p = dialPoint(t, RADIUS + 10);
      g.append("text")
        .attr("x", p.x)
        .attr("y", p.y)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .attr("fill", "#718077")
        .attr("font-size", "8.5px")
        .attr("font-family", "monospace")
        .text(t);
    });
  }, [score, isLive]);

  const getScoreBadgeColor = (s: number) => {
    if (s < 20) return "bg-rose-100 text-rose-800 border-rose-200";
    if (s < 40) return "bg-orange-100 text-orange-800 border-orange-200";
    if (s <= 60) return "bg-amber-100 text-amber-800 border-amber-200";
    if (s <= 80) return "bg-emerald-100 text-emerald-800 border-emerald-200";
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
                TCG SENTIMENT INDEX
              </div>
              <h3 className="text-sm sm:text-base font-bold text-olive">
                Nifty 50 Sentiment Index
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-ink-dim px-2 py-0.5 rounded-full border border-hairline bg-ivory whitespace-nowrap">
              {isLive && snapshot ? liveLabel(snapshot.fetchedAt) : "Sample data"}
            </span>
            {isLive && (
              <div className={`font-mono text-xs font-bold px-2.5 py-0.5 rounded-full border ${getScoreBadgeColor(score)}`}>
                {score} / 100
              </div>
            )}
          </div>
        </div>

        <p className="text-xs text-ink-dim leading-relaxed mb-4">
          Weighted composite of volatility (0.30), breadth (0.25), momentum (0.20), flows (0.15) and relative strength (0.10), each scored against its trailing 252-day range and renormalised over the inputs available.
        </p>

        <div className="flex flex-col items-center justify-center my-1 relative">
          <svg
            ref={svgRef}
            width={WIDTH}
            height={HEIGHT}
            className="overflow-visible"
            aria-label={isLive && sentiment ? `Sentiment score ${score} out of 100 (${bandLabel(sentiment)})` : "Sentiment index unavailable"}
          />
          <div className="text-center -mt-2">
            <div className="font-mono text-xs font-bold text-olive uppercase tracking-wider">
              {sentiment ? bandLabel(sentiment) : "Unavailable"}
            </div>
            <div className="text-[10px] font-mono text-ink-dim">
              {sentiment && sentiment.score !== null
                ? `Coverage: ${Math.round(sentiment.coverage * 100)}% of weights available`
                : "Feed unavailable"}
            </div>
          </div>
        </div>

        {/* Inputs used, with unavailable ones marked */}
        <ul className="mt-4 pt-3 border-t border-hairline space-y-1.5 font-mono text-[11px]">
          {(sentiment?.inputs ?? []).map((input) => (
            <li key={input.key} className="flex items-start justify-between gap-3">
              <span className={input.available ? "text-ink" : "text-ink-dim line-through decoration-hairline"}>
                {input.label} <span className="text-ink-muted">×{input.weight.toFixed(2)}</span>
              </span>
              <span className={`text-right shrink-0 ${input.available ? "text-olive font-bold" : "text-ink-dim"}`}>
                {input.available && input.score !== null ? Math.round(input.score) : "Unavailable"}
              </span>
            </li>
          ))}
          {!sentiment && <li className="text-ink-dim">Inputs unavailable until the feed loads.</li>}
        </ul>

        <div className="mt-3 p-2.5 rounded-xl bg-forest/5 border border-forest/15 text-[11px] text-[#2c3731] leading-relaxed">
          <span className="font-bold text-forest uppercase font-mono mr-1">Rigor Rule:</span>
          {sentiment ? descriptionFor(sentiment) : "No reading until the feed loads."}
        </div>
      </div>

      {sentiment && (
        <div className="pt-4 mt-4 border-t border-hairline">
          <div className="text-[10px] font-mono text-ink-dim space-y-0.5">
            {sentiment.inputs.map((input) => (
              <div key={input.key}>
                <span className="text-ink font-semibold">{input.key}</span>: {input.note}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
