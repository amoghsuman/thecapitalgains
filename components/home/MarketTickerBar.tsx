"use client";

import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import type { MarketSnapshot } from "@/lib/market/client";
import { useMarketSnapshot } from "@/lib/market/useMarketSnapshot";

interface TickerItem {
  symbol: string;
  value: string;
  change?: string;
  isPositive?: boolean;
  tag?: string;
}

const priceFormat = new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const croreFormat = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

function formatCrore(v: number): string {
  const sign = v > 0 ? "+" : v < 0 ? "−" : "";
  return `${sign}₹${croreFormat.format(Math.abs(v))} Cr`;
}

function formatSessionDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "UTC" });
}

function toItems(data: MarketSnapshot): TickerItem[] {
  const items: TickerItem[] = data.indices.map((i) => ({
    symbol: i.name.toUpperCase(),
    value: priceFormat.format(i.last),
    change: `${i.changePct >= 0 ? "+" : ""}${i.changePct.toFixed(2)}%`,
    isPositive: i.changePct >= 0,
    tag: "INDEX",
  }));

  // Flows are provisional NSE figures loaded into market_reference by the
  // laptop refresh script; absent rows show as unavailable, never as numbers.
  if (data.flows) {
    const asOf = formatSessionDate(data.flows.asOf);
    items.push({ symbol: "FII NET", value: formatCrore(data.flows.fii), change: `as of ${asOf} close`, isPositive: data.flows.fii >= 0, tag: "PROV." });
    items.push({ symbol: "DII NET", value: formatCrore(data.flows.dii), change: `as of ${asOf} close`, isPositive: data.flows.dii >= 0, tag: "PROV." });
  } else {
    items.push({ symbol: "FII/DII FLOWS", value: "as of previous close, unavailable" });
  }
  items.push({ symbol: "SOURCE", value: data.source, tag: "DELAYED" });

  return items;
}

export default function MarketTickerBar() {
  const state = useMarketSnapshot();

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
