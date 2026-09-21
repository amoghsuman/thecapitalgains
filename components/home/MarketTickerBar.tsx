"use client";

import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import {
  fetchMarket,
  isMarketError,
  MARKET_POLL_MS,
  type MarketSnapshot,
} from "@/lib/market/client";

interface TickerItem {
  symbol: string;
  value: string;
  change?: string;
  isPositive?: boolean;
  tag?: string;
}

type TickerState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; data: MarketSnapshot };

const priceFormat = new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function toItems(data: MarketSnapshot): TickerItem[] {
  const items: TickerItem[] = data.indices.map((i) => ({
    symbol: i.name.toUpperCase(),
    value: priceFormat.format(i.last),
    change: `${i.changePct >= 0 ? "+" : ""}${i.changePct.toFixed(2)}%`,
    isPositive: i.changePct >= 0,
    tag: "INDEX",
  }));

  // NSE blocks server-side fetches of its FII/DII endpoint. Until a flows
  // source is wired in lib/market/providers.ts, say so; never show numbers.
  items.push({ symbol: "FII/DII FLOWS", value: "as of previous close, unavailable" });
  items.push({ symbol: "SOURCE", value: data.source, tag: "DELAYED" });

  return items;
}

export default function MarketTickerBar() {
  const [state, setState] = useState<TickerState>({ status: "loading" });

  // Poll /api/market every 60s, only while the tab is visible.
  useEffect(() => {
    let cancelled = false;
    let controller: AbortController | null = null;

    async function load() {
      controller?.abort();
      controller = new AbortController();
      const result = await fetchMarket(controller.signal);
      if (cancelled) return;
      setState(isMarketError(result) ? { status: "error" } : { status: "ready", data: result });
    }

    function tick() {
      if (document.visibilityState === "visible") void load();
    }

    void load();
    const interval = window.setInterval(tick, MARKET_POLL_MS);
    document.addEventListener("visibilitychange", tick);

    return () => {
      cancelled = true;
      controller?.abort();
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", tick);
    };
  }, []);

  if (state.status === "loading") return null;

  const items = state.status === "ready" ? toItems(state.data) : [];
  // Repeated so one half of the track always spans the container (the
  // marquee keyframe shifts by -50%).
  const track = [...items, ...items, ...items, ...items];

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
          {state.status === "ready" && (
            <span className="text-[9px] font-mono px-1.5 py-0.5 bg-forest-surface text-forest-tint rounded font-medium">
              DELAYED
            </span>
          )}
        </div>

        {/* Marquee Ticker */}
        <div className="flex-1 overflow-hidden relative">
          {state.status === "error" ? (
            <span className="font-mono text-xs text-ink-dim">Market data unavailable</span>
          ) : (
            <div className="flex items-center gap-8 whitespace-nowrap animate-marquee">
              {track.map((item, idx) => (
                <div key={`${item.symbol}-${idx}`} className="inline-flex items-center gap-2.5 text-xs">
                  <span className="font-mono font-bold text-ink tracking-tight">{item.symbol}</span>
                  <span className="font-mono text-ink-dim">{item.value}</span>
                  {item.change && (
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
                  )}
                  {item.tag && (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 bg-forest-surface text-forest-tint rounded font-medium">
                      {item.tag}
                    </span>
                  )}
                  <span className="text-hairline mx-1">/</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
