"use client";

import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

interface TickerItem {
  symbol: string;
  name: string;
  value: string;
  change: string;
  isPositive: boolean;
  tag?: string;
}

const TICKER_DATA: TickerItem[] = [
  { symbol: "NIFTY 50", name: "National Stock Exchange", value: "25,328.40", change: "+0.64%", isPositive: true, tag: "INDEX" },
  { symbol: "BANK NIFTY", name: "Banking Index", value: "52,180.15", change: "+0.82%", isPositive: true, tag: "F&O" },
  { symbol: "INDIA VIX", name: "Implied Volatility", value: "12.84", change: "-3.12%", isPositive: false, tag: "IV" },
  { symbol: "USD / INR", name: "Currency Pair", value: "83.68", change: "+0.04%", isPositive: true },
  { symbol: "10Y G-SEC", name: "India Benchmark Yield", value: "6.79%", change: "-2 bps", isPositive: false, tag: "MACRO" },
  { symbol: "NIFTY PCR", name: "Put Call Ratio", value: "1.18", change: "+0.06", isPositive: true, tag: "SENTIMENT" },
  { symbol: "FII FLOWS", name: "Institutional Net Cash", value: "+₹2,140 Cr", change: "Net Buyers", isPositive: true, tag: "FLOWS" },
  { symbol: "DII FLOWS", name: "Domestic Institutional", value: "+₹1,890 Cr", change: "Net Buyers", isPositive: true, tag: "FLOWS" },
];

export default function MarketTickerBar() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="w-full bg-panel border-y border-hairline py-2.5 overflow-hidden select-none">
      <div className="site-container flex items-center gap-6">
        {/* Market Status Pill */}
        <div className="flex items-center gap-2 flex-shrink-0 pr-4 border-r border-hairline">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-forest opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-forest"></span>
          </span>
          <span className="font-mono text-[10px] font-bold tracking-[0.16em] uppercase text-forest flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" />
            NSE / BSE PULSE
          </span>
        </div>

        {/* Marquee Ticker */}
        <div className="flex-1 overflow-hidden relative">
          <div className="flex items-center gap-8 whitespace-nowrap animate-marquee">
            {[...TICKER_DATA, ...TICKER_DATA].map((item, idx) => (
              <div key={`${item.symbol}-${idx}`} className="inline-flex items-center gap-2.5 text-xs">
                <span className="font-mono font-bold text-ink tracking-tight">{item.symbol}</span>
                <span className="font-mono text-ink-dim">{item.value}</span>
                <span
                  className={`inline-flex items-center gap-0.5 font-mono text-[11px] font-semibold ${
                    item.isPositive ? "text-forest" : "text-[#B91C1C]"
                  }`}
                >
                  {item.isPositive ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {item.change}
                </span>
                {item.tag && (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 bg-forest-surface text-forest-tint rounded font-medium">
                    {item.tag}
                  </span>
                )}
                <span className="text-hairline mx-1">/</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
