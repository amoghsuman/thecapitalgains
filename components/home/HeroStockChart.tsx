"use client";

import { useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { TrendingUp } from "lucide-react";

interface DataPoint {
  time: string;
  price: number;
}

// Illustrative sample series for the card: not a real index and not a live
// feed. Everything shown alongside the chart is derived from these points.
const TIMEFRAME_DATA: Record<string, { data: DataPoint[]; label: string }> = {
  "1D": {
    label: "Intraday (5m)",
    data: [
      { time: "09:15", price: 2495 },
      { time: "10:00", price: 2508 },
      { time: "10:45", price: 2502 },
      { time: "11:30", price: 2515 },
      { time: "12:15", price: 2522 },
      { time: "13:00", price: 2519 },
      { time: "13:45", price: 2534 },
      { time: "14:30", price: 2542 },
      { time: "15:30", price: 2538 },
    ],
  },
  "1M": {
    label: "Monthly Trend",
    data: [
      { time: "W1", price: 2375 },
      { time: "W2", price: 2410 },
      { time: "W3", price: 2390 },
      { time: "W4", price: 2465 },
      { time: "W5", price: 2538 },
    ],
  },
  "1Y": {
    label: "Cycle Accumulation",
    data: [
      { time: "Q1", price: 1980 },
      { time: "Q2", price: 2120 },
      { time: "Q3", price: 2280 },
      { time: "Q4", price: 2538 },
    ],
  },
};

export default function HeroStockChart() {
  const [activeRange, setActiveRange] = useState<"1D" | "1M" | "1Y">("1D");

  const current = TIMEFRAME_DATA[activeRange];
  const firstPrice = current.data[0].price;
  const lastPrice = current.data[current.data.length - 1].price;
  const changePct = ((lastPrice - firstPrice) / firstPrice) * 100;
  const change = `${changePct >= 0 ? "+" : ""}${changePct.toFixed(2)}%`;

  return (
    <div className="mt-5 pt-4 border-t border-hairline/80">
      {/* Top Header & Toggles */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-forest-surface flex items-center justify-center text-forest border border-hairline">
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-xs font-bold text-ink">SAMPLE INDEX</span>
              <span className="font-mono text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded">
                {change}
              </span>
            </div>
            <div className="text-[10px] text-ink-dim font-mono">
              ₹{lastPrice.toLocaleString("en-IN")} · {current.label}
            </div>
          </div>
        </div>

        {/* Timeframe selector pill */}
        <div className="flex items-center bg-ivory rounded-lg p-0.5 border border-hairline">
          {(["1D", "1M", "1Y"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setActiveRange(r);
              }}
              className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded transition-all ${
                activeRange === r
                  ? "bg-forest text-white shadow-xs"
                  : "text-ink-dim hover:text-ink"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Recharts Graph */}
      <div className="h-32 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={current.data}
            margin={{ top: 8, right: 4, left: 4, bottom: 0 }}
          >
            <defs>
              <linearGradient id="priceGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1B3A2B" stopOpacity={0.28} />
                <stop offset="95%" stopColor="#1B3A2B" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="time"
              stroke="#A8A29E"
              fontSize={9}
              tickLine={false}
              axisLine={{ stroke: "rgba(223, 217, 200, 0.6)" }}
              dy={3}
            />
            <YAxis
              domain={["dataMin - 15", "dataMax + 15"]}
              hide
            />

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as DataPoint;
                  return (
                    <div className="bg-panel border border-hairline rounded-lg px-2.5 py-1.5 shadow-lg text-[11px] font-mono">
                      <div className="text-ink-dim text-[9px] uppercase tracking-wider">{data.time}</div>
                      <div className="font-bold text-ink text-xs">₹{data.price.toLocaleString("en-IN")}</div>
                    </div>
                  );
                }
                return null;
              }}
            />

            <ReferenceLine
              y={firstPrice}
              stroke="rgba(110, 106, 95, 0.25)"
              strokeDasharray="3 3"
            />

            <Area
              type="monotone"
              dataKey="price"
              stroke="#1B3A2B"
              strokeWidth={2}
              fill="url(#priceGlow)"
              isAnimationActive={true}
              animationDuration={800}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Caption */}
      <div className="mt-2.5 flex items-center justify-between text-[10px] text-ink-dim font-mono">
        <span>Sample chart · illustrative data, not a live feed</span>
      </div>
    </div>
  );
}
