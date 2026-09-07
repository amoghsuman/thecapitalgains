"use client";

import { ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type Candle = { date?: string; open?: number; high?: number; low?: number; close?: number };

export type CandlestickChartValue = { title?: string; data?: Candle[] };

// Standard market convention deliberately overrides the Ivory Ledger brand
// palette here, same reasoning as the payoff diagram's profit/loss shading.
const UP_COLOR = "#16A34A";
const DOWN_COLOR = "#DC2626";
const GRID_COLOR = "#DFD9C8";
const AXIS_COLOR = "#6E6A5F";

// Recharts has no native candlestick type. Standard technique: give a Bar
// component a range dataKey ([low, high]) so recharts computes the wick's
// pixel y/height for us, then draw the actual candle in a custom `shape` —
// a thin wick line spanning the full bar, plus a body rect whose top/height
// is derived from where `open`/`close` fall proportionally within that same
// pixel range.
function CandleShape(props: any) {
  const { x, y, width, height, payload } = props;
  const { open, high, low, close } = payload as Candle;
  if ([open, high, low, close].some((v) => typeof v !== "number")) return null;

  const range = (high as number) - (low as number) || 1;
  const valueToY = (v: number) => y + height * (1 - (v - (low as number)) / range);

  const openY = valueToY(open as number);
  const closeY = valueToY(close as number);
  const bodyTop = Math.min(openY, closeY);
  const bodyHeight = Math.max(Math.abs(closeY - openY), 1.5);
  const isUp = (close as number) >= (open as number);
  const color = isUp ? UP_COLOR : DOWN_COLOR;

  const bodyWidth = Math.max(width * 0.6, 2);
  const bodyX = x + (width - bodyWidth) / 2;
  const wickX = x + width / 2;

  return (
    <g>
      <line x1={wickX} x2={wickX} y1={y} y2={y + height} stroke={color} strokeWidth={1.5} />
      <rect x={bodyX} y={bodyTop} width={bodyWidth} height={bodyHeight} fill={color} />
    </g>
  );
}

export default function CandlestickChartBlock({ value }: { value: CandlestickChartValue }) {
  const data = (value.data ?? []).filter((c) => c.date);

  return (
    <div className="mt-8">
      {value.title && <p className="font-mono text-[11px] text-ink-dim uppercase tracking-wide mb-3">{value.title}</p>}
      <div className="border border-hairline border-t-4 border-t-forest rounded-xl bg-panel px-4 py-5">
        <ResponsiveContainer width="100%" height={340}>
          <ComposedChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 4 }}>
            <CartesianGrid stroke={GRID_COLOR} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" stroke={AXIS_COLOR} tick={{ fill: AXIS_COLOR, fontSize: 11 }} />
            <YAxis stroke={AXIS_COLOR} tick={{ fill: AXIS_COLOR, fontSize: 11 }} domain={["auto", "auto"]} />
            <Tooltip
              contentStyle={{ background: "#FFFFFF", border: `1px solid ${GRID_COLOR}`, borderRadius: 8, fontSize: 12 }}
              formatter={(_v: unknown, _n: unknown, item: any) => {
                const p = item?.payload as Candle;
                return [`O ${p?.open} · H ${p?.high} · L ${p?.low} · C ${p?.close}`, "OHLC"];
              }}
            />
            <Bar dataKey={(d: Candle) => [d.low, d.high]} shape={CandleShape} isAnimationActive={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
