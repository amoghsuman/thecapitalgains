"use client";

import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from "recharts";

export type PayoffDiagramValue = {
  instrumentType?: "call" | "put" | "futures";
  position?: "long" | "short";
  strikePrice?: number;
  premium?: number;
  spotPriceRange?: { min?: number; max?: number };
  caption?: string;
};

// Standard red/green convention deliberately overrides the Ivory Ledger
// brand palette here — profit/loss shading needs to read unambiguously at a
// glance, which brand forest/gold can't substitute for.
const PROFIT_COLOR = "#16A34A";
const LOSS_COLOR = "#DC2626"; // matches the existing "warning" callout red used elsewhere in the reader
const GRID_COLOR = "#DFD9C8";
const AXIS_COLOR = "#6E6A5F";
const STEPS = 60;

type Instrument = "call" | "put" | "futures";
type Position = "long" | "short";

function computePayoff(spot: number, instrumentType: Instrument, position: Position, strike: number, premium: number): number {
  let base: number;
  if (instrumentType === "call") {
    base = Math.max(spot - strike, 0) - premium;
  } else if (instrumentType === "put") {
    base = Math.max(strike - spot, 0) - premium;
  } else {
    base = spot - strike; // futures: no premium, linear payoff
  }
  return position === "short" ? -base : base;
}

function computeBreakeven(instrumentType: Instrument, strike: number, premium: number): number {
  if (instrumentType === "call") return strike + premium;
  if (instrumentType === "put") return strike - premium;
  return strike; // futures: breakeven is the entry price itself, same for long and short
}

export default function PayoffDiagramBlock({ value }: { value: PayoffDiagramValue }) {
  const instrumentType = value.instrumentType ?? "call";
  const position = value.position ?? "long";
  const strike = value.strikePrice ?? 0;
  const premium = instrumentType === "futures" ? 0 : value.premium ?? 0;
  const min = value.spotPriceRange?.min ?? strike * 0.9;
  const max = value.spotPriceRange?.max ?? strike * 1.1;

  const breakeven = computeBreakeven(instrumentType, strike, premium);

  const data = Array.from({ length: STEPS + 1 }, (_, i) => {
    const spot = min + ((max - min) * i) / STEPS;
    const payoff = computePayoff(spot, instrumentType, position, strike, premium);
    return {
      spot: Math.round(spot * 100) / 100,
      payoff: Math.round(payoff * 100) / 100,
      profit: payoff > 0 ? payoff : 0,
      loss: payoff < 0 ? payoff : 0,
    };
  });

  const instrumentLabel = instrumentType === "futures" ? "Futures" : instrumentType === "put" ? "Put" : "Call";

  return (
    <div className="mt-8">
      <p className="font-mono text-[11px] text-ink-dim uppercase tracking-wide mb-3">
        {position === "short" ? "Short" : "Long"} {instrumentLabel} — Payoff Diagram
      </p>
      <div className="flex items-baseline justify-between mb-2">
        <span className="font-mono text-[10px] text-ink-dim/70">Profit / Loss (₹)</span>
      </div>
      <div className="border border-hairline border-t-4 border-t-gold rounded-xl bg-panel px-4 py-5">
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 4 }}>
            <CartesianGrid stroke={GRID_COLOR} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="spot" stroke={AXIS_COLOR} tick={{ fill: AXIS_COLOR, fontSize: 11 }} />
            <YAxis stroke={AXIS_COLOR} tick={{ fill: AXIS_COLOR, fontSize: 11 }} />
            <Tooltip
              contentStyle={{ background: "#FFFFFF", border: `1px solid ${GRID_COLOR}`, borderRadius: 8, fontSize: 12 }}
              formatter={(v: unknown) => [`₹${v}`, "Payoff"]}
              labelFormatter={(spot: unknown) => `Spot: ₹${spot}`}
            />
            <ReferenceLine y={0} stroke="#1A1A18" strokeWidth={1.5} />
            <ReferenceLine
              x={breakeven}
              stroke="#A9822F"
              strokeDasharray="4 4"
              label={{ value: `Breakeven ₹${Math.round(breakeven * 100) / 100}`, position: "top", fill: "#6E5620", fontSize: 11 }}
            />
            <Area type="monotone" dataKey="profit" stroke="none" fill={PROFIT_COLOR} fillOpacity={0.18} isAnimationActive={false} />
            <Area type="monotone" dataKey="loss" stroke="none" fill={LOSS_COLOR} fillOpacity={0.15} isAnimationActive={false} />
            <Line type="monotone" dataKey="payoff" stroke="#1A1A18" strokeWidth={2.5} dot={false} isAnimationActive={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <p className="text-center font-mono text-[10px] text-ink-dim/70 mt-2">Spot Price (₹)</p>
      {value.caption && <p className="text-[13px] text-ink-dim mt-2 leading-relaxed">{value.caption}</p>}
    </div>
  );
}
