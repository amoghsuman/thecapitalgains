"use client";

import { motion } from "motion/react";
import { useMarketSnapshot } from "@/lib/market/useMarketSnapshot";
import type { MarketQuote } from "@/lib/market/client";

function pct(v: number): string {
  return `[${v >= 0 ? "+" : ""}${v.toFixed(2)}%]`;
}

function fmt(q: MarketQuote, digits = 2): string {
  return `${q.last.toLocaleString("en-IN", { maximumFractionDigits: digits, minimumFractionDigits: digits })} ${pct(q.changePct)}`;
}

// Decorative hero background. The quote strings are only rendered when the
// live feed supplies them; otherwise the shapes stay and the numbers are gone.
export default function HeroMarketDataOverlay() {
  const market = useMarketSnapshot();
  const data = market.status === "ready" ? market.data : null;

  const nifty = data?.indices.find((i) => i.name === "Nifty 50") ?? null;
  const bankNifty = data?.indices.find((i) => i.name === "Bank Nifty") ?? null;
  const vix = data?.indiaVix ?? null;

  const lines: string[] = [];
  if (nifty) lines.push(`NSE:NIFTY50 // ${fmt({ ...nifty, symbol: "NIFTY50" })}`);
  if (vix) lines.push(`INDIA_VIX: ${fmt(vix)}`);
  if (bankNifty) lines.push(`BANKNIFTY: ${fmt({ ...bankNifty, symbol: "BANKNIFTY" })}`);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none" aria-hidden="true">
      <svg
        className="w-full h-full opacity-[0.22] stroke-forest"
        viewBox="0 0 1200 600"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="streamGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1e3a2b" stopOpacity="0" />
            <stop offset="25%" stopColor="#2c5e43" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#b4832c" stopOpacity="0.8" />
            <stop offset="75%" stopColor="#2c5e43" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#1e3a2b" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="streamGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#b4832c" stopOpacity="0" />
            <stop offset="40%" stopColor="#2c5e43" stopOpacity="0.6" />
            <stop offset="80%" stopColor="#b4832c" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#1e3a2b" stopOpacity="0" />
          </linearGradient>

          <filter id="laserGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {lines.length > 0 && (
          <g className="text-[9px] font-mono fill-ink-dim/40 stroke-none tracking-widest">
            <text x="40" y="40">LIVE // DELAYED</text>
            {lines.map((line, i) => (
              <text key={line} x="40" y={55 + i * 15}>
                {line}
              </text>
            ))}
          </g>
        )}

        {/* Micro Candlestick Clusters (decorative shapes, not quotes) */}
        {[
          { x: 120, open: 210, close: 180, high: 170, low: 220, bull: true },
          { x: 135, open: 180, close: 195, high: 175, low: 205, bull: false },
          { x: 150, open: 195, close: 165, high: 160, low: 200, bull: true },
          { x: 165, open: 165, close: 150, high: 145, low: 175, bull: true },
          { x: 880, open: 260, close: 240, high: 235, low: 270, bull: true },
          { x: 895, open: 240, close: 255, high: 230, low: 265, bull: false },
          { x: 910, open: 255, close: 230, high: 225, low: 260, bull: true },
        ].map((c, i) => (
          <g key={i} opacity="0.4" className="transition-opacity">
            <line x1={c.x} y1={c.high} x2={c.x} y2={c.low} stroke={c.bull ? "#2c5e43" : "#b4832c"} strokeWidth="1" />
            <rect
              x={c.x - 3}
              y={Math.min(c.open, c.close)}
              width="6"
              height={Math.max(4, Math.abs(c.open - c.close))}
              fill={c.bull ? "#2c5e43" : "#b4832c"}
              rx="1"
            />
          </g>
        ))}

        <motion.path
          d="M -100 240 Q 150 160, 320 280 T 680 180 T 1000 260 T 1300 170"
          fill="none"
          stroke="url(#streamGrad1)"
          strokeWidth="1.8"
          strokeDasharray="6 8"
          initial={{ strokeDashoffset: 0 }}
          animate={{ strokeDashoffset: -280 }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        />

        <motion.path
          d="M -100 360 Q 180 430, 420 320 T 780 400 T 1060 290 T 1300 380"
          fill="none"
          stroke="url(#streamGrad2)"
          strokeWidth="1.4"
          strokeDasharray="4 6"
          initial={{ strokeDashoffset: 0 }}
          animate={{ strokeDashoffset: 240 }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
        />

        <motion.circle
          r="3"
          fill="#b4832c"
          filter="url(#laserGlow)"
          animate={{
            cx: [-50, 200, 450, 700, 950, 1250],
            cy: [220, 180, 290, 185, 260, 160],
            opacity: [0, 0.9, 1, 0.8, 1, 0],
          }}
          transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
        />

        <motion.circle
          r="2.5"
          fill="#2c5e43"
          filter="url(#laserGlow)"
          animate={{
            cx: [-20, 280, 520, 800, 1100, 1280],
            cy: [370, 410, 310, 405, 300, 360],
            opacity: [0, 0.8, 1, 0.7, 0.9, 0],
          }}
          transition={{ duration: 9, repeat: Infinity, ease: "linear", delay: 2.5 }}
        />

        {[200, 400, 600, 800, 1000].map((x) => (
          <g key={x} opacity="0.35">
            <line x1={x} y1="120" x2={x} y2="135" stroke="#2c5e43" strokeWidth="1" />
            <line x1={x} y1="460" x2={x} y2="475" stroke="#b4832c" strokeWidth="1" />
            <circle cx={x} cy={120} r="1.5" fill="#2c5e43" />
          </g>
        ))}
      </svg>
    </div>
  );
}
