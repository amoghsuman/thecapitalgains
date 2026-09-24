"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { Gauge } from "lucide-react";

import { liveLabel } from "@/lib/market/client";
import { useMarketSnapshot } from "@/lib/market/useMarketSnapshot";
import type { PublicSentiment, SentimentBand } from "@/lib/market/sentiment";
import MarketNote from "@/components/home/MarketNote";

// The TCG Sentiment Index (lib/market/sentiment.ts) computed in /api/market.
// The methodology is proprietary: the client receives score, band, coverage
// and computedAt only, and this card shows nothing about inputs or weights.

// Below this share of inputs the reading is flagged as partial.
const PARTIAL_COVERAGE = 0.6;

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

// Rigor Rule copy keyed on the band alone.
const RIGOR_RULE: Record<SentimentBand, string> = {
  "extreme fear": "Extreme fear: premiums are at their richest and forced selling dominates. Buy only what you already researched, in tranches, with position size as the lever.",
  fear: "Fear regime: option premiums are rich and entries are cheap but fragile. Defined-risk structures and patience with entries matter more than direction.",
  neutral: "Neutral regime: nothing is at an extreme. Position size, not conviction, is the lever.",
  greed: "Greed regime: calm markets and broad participation. Hedges are cheap, and crowded trades build quietly in regimes like this.",
  "extreme greed": "Extreme greed: everyone is already in. Trim what has run, keep hedges on while they are cheap, and expect the next surprise to be to the downside.",
};

function descriptionFor(sentiment: PublicSentiment | null): string {
  if (!sentiment || sentiment.band === null) return "No reading until the feed loads.";
  return RIGOR_RULE[sentiment.band];
}

function bandLabel(sentiment: PublicSentiment): string {
  if (sentiment.band === null) return "Unavailable";
  return sentiment.band.replace(/^\w/, (c) => c.toUpperCase());
}

interface MarketSentimentGaugeProps {
  /** slug → title for the courses the market-note tips link to. */
  courseTitles: Record<string, string>;
}

export default function MarketSentimentGauge({ courseTitles }: MarketSentimentGaugeProps) {
  const market = useMarketSnapshot();
  const snapshot = market.status === "ready" ? market.data : null;
  const sentiment = snapshot?.sentiment ?? null;
  const isLive = sentiment !== null && sentiment.score !== null;
  const isPartial = isLive && sentiment.coverage < PARTIAL_COVERAGE;
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
                NIFTY 50 · SENTIMENT
              </div>
              <h3 className="text-sm sm:text-base font-bold text-olive">
                TCG Sentiment Index
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-ink-dim px-2 py-0.5 rounded-full border border-hairline bg-ivory whitespace-nowrap">
              {isLive && snapshot ? liveLabel(snapshot.fetchedAt) : "Sample data"}
            </span>
            {isPartial ? (
              <span className="font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-200 bg-amber-100 text-amber-800 whitespace-nowrap">
                Partial data
              </span>
            ) : (
              isLive && (
                <div className={`font-mono text-xs font-bold px-2.5 py-0.5 rounded-full border ${getScoreBadgeColor(score)}`}>
                  {score} / 100
                </div>
              )
            )}
          </div>
        </div>

        <p className="text-xs text-ink-dim leading-relaxed mb-4">
          A proprietary composite of volatility, market breadth, momentum, institutional flows and relative strength for the Nifty 50.
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
              {isLive && sentiment ? bandLabel(sentiment) : "Unavailable"}
            </div>
            {isLive && !isPartial && (
              <div className="text-[10px] font-mono text-ink-dim">{score} / 100</div>
            )}
          </div>
        </div>

        <div className="mt-4 p-2.5 rounded-xl bg-forest/5 border border-forest/15 text-[11px] text-[#2c3731] leading-relaxed">
          <span className="font-bold text-forest uppercase font-mono mr-1">Rigor Rule:</span>
          {descriptionFor(isLive ? sentiment : null)}
        </div>

        {/* Live market note: renders nothing until the feed is up. */}
        <MarketNote courseTitles={courseTitles} />
      </div>
    </div>
  );
}
