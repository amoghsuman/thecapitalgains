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
import { TrendingUp, Activity, BarChart2, ShieldCheck } from "lucide-react";

interface DataPoint {
  time: string;
  price: number;
  ma20: number;
  volume: number;
}

const TIMEFRAME_DATA: Record<string, { data: DataPoint[]; change: string; isPositive: boolean; high: string; low: string; label: string }> = {
  "1D": {
    label: "Intraday (5m)",
    change: "+1.42%",
    isPositive: true,
    high: "₹2,548.80",
    low: "₹2,492.10",
    data: [
      { time: "09:15", price: 2495, ma20: 2490, volume: 180 },
      { time: "10:00", price: 2508, ma20: 2498, volume: 240 },
      { time: "10:45", price: 2502, ma20: 2503, volume: 160 },
      { time: "11:30", price: 2515, ma20: 2507, volume: 310 },
      { time: "12:15", price: 2522, ma20: 2512, volume: 190 },
      { time: "13:00", price: 2519, ma20: 2516, volume: 140 },
      { time: "13:45", price: 2534, ma20: 2521, volume: 380 },
      { time: "14:30", price: 2542, ma20: 2528, volume: 420 },
      { time: "15:30", price: 2538, ma20: 2533, volume: 290 },
    ],
  },
  "1M": {
    label: "Monthly Trend",
    change: "+6.85%",
    isPositive: true,
    high: "₹2,560.00",
    low: "₹2,360.50",
    data: [
      { time: "W1", price: 2375, ma20: 2360, volume: 950 },
      { time: "W2", price: 2410, ma20: 2385, volume: 1120 },
      { time: "W3", price: 2390, ma20: 2395, volume: 880 },
      { time: "W4", price: 2465, ma20: 2415, volume: 1420 },
      { time: "W5", price: 2538, ma20: 2450, volume: 1680 },
    ],
  },
  "1Y": {
    label: "Cycle Accumulation",
    change: "+28.40%",
    isPositive: true,
    high: "₹2,580.00",
    low: "₹1,940.00",
    data: [
      { time: "Q1", price: 1980, ma20: 1950, volume: 4100 },
      { time: "Q2", price: 2120, ma20: 2040, volume: 3800 },
      { time: "Q3", price: 2280, ma20: 2160, volume: 4500 },
      { time: "Q4", price: 2538, ma20: 2320, volume: 5200 },
    ],
  },
};

export default function HeroStockChart() {
  const [activeRange, setActiveRange] = useState<"1D" | "1M" | "1Y">("1D");
  const [showIndicator, setShowIndicator] = useState(true);

  const current = TIMEFRAME_DATA[activeRange];
  const lastPrice = current.data[current.data.length - 1].price;

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
              <span className="font-mono text-xs font-bold text-ink">NIFTY ALPHA 50</span>
              <span className="font-mono text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded">
                {current.change}
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
              <linearGradient id="maGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#A9822F" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#A9822F" stopOpacity={0.0} />
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
                      {showIndicator && (
                        <div className="text-[9px] text-gold-text">20 EMA: ₹{data.ma20}</div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />

            <ReferenceLine
              y={current.data[0].price}
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

            {showIndicator && (
              <Area
                type="monotone"
                dataKey="ma20"
                stroke="#A9822F"
                strokeWidth={1.2}
                strokeDasharray="4 3"
                fill="none"
                isAnimationActive={true}
                animationDuration={600}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Metrics & Overlay Controls */}
      <div className="mt-2.5 flex items-center justify-between text-[10px] text-ink-dim font-mono">
        <div className="flex items-center gap-3">
          <span>H: <strong className="text-ink font-medium">{current.high}</strong></span>
          <span>L: <strong className="text-ink font-medium">{current.low}</strong></span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowIndicator(!showIndicator);
          }}
          className="inline-flex items-center gap-1 text-[9px] font-bold text-forest hover:text-forest-dark uppercase tracking-wider transition-colors"
        >
          <Activity className="w-3 h-3 text-gold" />
          <span>{showIndicator ? "20 EMA (ON)" : "20 EMA (OFF)"}</span>
        </button>
      </div>
    </div>
  );
}
