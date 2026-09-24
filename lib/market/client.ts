// Browser-side contract for /api/market. Safe to import from client components.

export type MarketIndex = {
  name: string;
  last: number;
  changePct: number;
  asOf: string;
};

export type MarketQuote = {
  symbol: string;
  last: number;
  changePct: number;
  asOf: string;
};

/** A dated reference number from the market_reference table or a constant. */
export type ReferenceReading = {
  value: number;
  /** YYYY-MM-DD */
  asOf: string;
  source: string;
};

export type MarketFlows = {
  /** Net FII cash-market activity, ₹ crore (positive = net buying). */
  fii: number;
  /** Net DII cash-market activity, ₹ crore. */
  dii: number;
  /** YYYY-MM-DD of the trading session. */
  asOf: string;
  source: string;
};

import type { PublicSentiment } from "@/lib/market/sentiment";

export type MarketWeight = {
  symbol: string;
  name: string;
  /** NSE industry group. */
  sector: string;
  /** Approximate index weight, % (free-float market cap share). */
  weight: number;
};

export type MarketWeights = {
  constituents: MarketWeight[];
  weightsAsOf: string;
  source: string;
  approximate: true;
};

export type MarketSnapshot = {
  indices: MarketIndex[];
  /** TCG Sentiment Index: score, band, coverage only (the inputs are proprietary and stay server-side). */
  sentiment: PublicSentiment;
  /** FII/DII provisional flows from market_reference; null when not loaded yet. */
  flows: MarketFlows | null;
  reference: {
    repoRate: ReferenceReading;
    gsec10y: ReferenceReading | null;
  };
  /** Nifty constituents (NSE tickers, no suffix); null when the batch failed. */
  constituents: MarketQuote[] | null;
  /** Approximate Nifty 50 weights (free-float market cap); null when they could not be derived. */
  weights: MarketWeights | null;
  indiaVix: MarketQuote | null;
  brent: MarketQuote | null;
  usdInr: MarketQuote | null;
  delayed: true;
  source: string;
  fetchedAt: string;
};

export type MarketResponse = MarketSnapshot | { error: true };

export function isMarketError(r: MarketResponse): r is { error: true } {
  return "error" in r;
}

export const MARKET_POLL_MS = 60_000;

export async function fetchMarket(signal?: AbortSignal): Promise<MarketResponse> {
  try {
    const res = await fetch("/api/market", { signal, cache: "no-store" });
    if (!res.ok) return { error: true };
    return (await res.json()) as MarketResponse;
  } catch {
    return { error: true };
  }
}

/** "Live · delayed · 14:32" for a snapshot's fetchedAt, in IST. */
export function liveLabel(fetchedAt: string): string {
  const d = new Date(fetchedAt);
  const time = Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" });
  return time ? `Live · delayed · ${time} IST` : "Live · delayed";
}
