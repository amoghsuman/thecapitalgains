// Market data providers. The route handler (app/api/market/route.ts) only
// talks to getQuotes() and getExtendedQuotes(); swap the implementations here
// to move from Yahoo Finance to Upstox, Kite or another feed without touching
// the UI. Server-only: never import this from a client component.

import { niftyWeights } from "@/lib/market/constants";

export type IndexQuote = {
  name: string;
  last: number;
  changePct: number;
  /** ISO timestamp of the quote's last trade. */
  asOf: string;
};

export type SymbolQuote = {
  symbol: string;
  last: number;
  changePct: number;
  asOf: string;
};

export type ExtendedQuotes = {
  /** One entry per Nifty constituent we could price; null if the batch failed. */
  constituents: SymbolQuote[] | null;
  indiaVix: SymbolQuote | null;
  brent: SymbolQuote | null;
  usdInr: SymbolQuote | null;
};

export const QUOTE_SOURCE = "Yahoo Finance (NSE indices)";

const INDEX_SYMBOLS: { symbol: string; name: string }[] = [
  { symbol: "^NSEI", name: "Nifty 50" },
  { symbol: "^NSEBANK", name: "Bank Nifty" },
  // Yahoo has no ^CNXMIDCAP; the Midcap 100 index is listed under this ticker.
  { symbol: "NIFTY_MIDCAP_100.NS", name: "Nifty Midcap 100" },
];

const VIX_SYMBOL = "^INDIAVIX";
const BRENT_SYMBOL = "BZ=F";
const USDINR_SYMBOL = "INR=X";

const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

const HEADERS = { "User-Agent": BROWSER_UA, Accept: "application/json" };

// ─── Per-symbol chart endpoint (indices) ──────────────────────────────────────

type YahooChartResponse = {
  chart?: {
    result?: Array<{
      meta?: {
        regularMarketPrice?: number;
        chartPreviousClose?: number;
        previousClose?: number;
        regularMarketTime?: number;
      };
    }> | null;
  };
};

async function fetchYahooQuote(symbol: string, name: string): Promise<IndexQuote> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1d&interval=1d`;
  const res = await fetch(url, { headers: HEADERS, next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Yahoo ${symbol}: HTTP ${res.status}`);

  const json = (await res.json()) as YahooChartResponse;
  const meta = json.chart?.result?.[0]?.meta;
  const last = meta?.regularMarketPrice;
  const prev = meta?.chartPreviousClose ?? meta?.previousClose;
  const time = meta?.regularMarketTime;

  if (typeof last !== "number" || typeof prev !== "number" || prev === 0 || typeof time !== "number") {
    throw new Error(`Yahoo ${symbol}: unexpected payload`);
  }

  return { name, last, changePct: ((last - prev) / prev) * 100, asOf: new Date(time * 1000).toISOString() };
}

// One unavailable symbol drops out of the list; the feed only fails when no
// index could be fetched at all.
export async function getQuotes(): Promise<IndexQuote[]> {
  const results = await Promise.allSettled(INDEX_SYMBOLS.map((s) => fetchYahooQuote(s.symbol, s.name)));
  const quotes: IndexQuote[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") quotes.push(r.value);
    else console.error("[market] quote failed:", r.reason instanceof Error ? r.reason.message : r.reason);
  }
  if (quotes.length === 0) throw new Error("No index quotes available");
  return quotes;
}

// ─── Batched spark endpoint (constituents, VIX, Brent, USD/INR) ───────────────
//
// One request prices every symbol. The response is keyed by symbol:
//   { "HDFCBANK.NS": { chartPreviousClose, close: [last], timestamp: [t] }, … }

type SparkEntry = {
  symbol?: string;
  chartPreviousClose?: number | null;
  previousClose?: number | null;
  close?: (number | null)[] | null;
  timestamp?: (number | null)[] | null;
};

function parseSparkEntry(symbol: string, entry: SparkEntry | undefined): SymbolQuote | null {
  if (!entry) return null;
  const closes = (entry.close ?? []).filter((c): c is number => typeof c === "number");
  const times = (entry.timestamp ?? []).filter((t): t is number => typeof t === "number");
  const last = closes[closes.length - 1];
  const prev = entry.chartPreviousClose ?? entry.previousClose;
  const time = times[times.length - 1];
  if (typeof last !== "number" || typeof prev !== "number" || prev === 0 || typeof time !== "number") return null;
  return { symbol, last, changePct: ((last - prev) / prev) * 100, asOf: new Date(time * 1000).toISOString() };
}

// Yahoo caps spark at 20 symbols per request, so the list is chunked and the
// results merged. A failed chunk only loses its own symbols.
const SPARK_CHUNK = 20;

async function fetchSparkChunk(symbols: string[]): Promise<Record<string, SparkEntry>> {
  const url = `https://query1.finance.yahoo.com/v8/finance/spark?symbols=${encodeURIComponent(
    symbols.join(",")
  )}&range=1d&interval=1d`;
  const res = await fetch(url, { headers: HEADERS, next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Yahoo spark: HTTP ${res.status}`);
  return (await res.json()) as Record<string, SparkEntry>;
}

async function fetchSpark(symbols: string[]): Promise<Record<string, SparkEntry>> {
  const chunks: string[][] = [];
  for (let i = 0; i < symbols.length; i += SPARK_CHUNK) chunks.push(symbols.slice(i, i + SPARK_CHUNK));

  const results = await Promise.allSettled(chunks.map(fetchSparkChunk));
  const merged: Record<string, SparkEntry> = {};
  let ok = 0;
  for (const r of results) {
    if (r.status === "fulfilled") {
      Object.assign(merged, r.value);
      ok++;
    } else {
      console.error("[market] spark chunk failed:", r.reason instanceof Error ? r.reason.message : r.reason);
    }
  }
  if (ok === 0) throw new Error("Yahoo spark: every chunk failed");
  return merged;
}

// Every field is independently null when its quote is missing; a generated
// number is never substituted.
export async function getExtendedQuotes(): Promise<ExtendedQuotes> {
  const constituentSymbols = niftyWeights.constituents.map((c) => `${c.symbol}.NS`);
  const all = [...constituentSymbols, VIX_SYMBOL, BRENT_SYMBOL, USDINR_SYMBOL];

  let spark: Record<string, SparkEntry>;
  try {
    spark = await fetchSpark(all);
  } catch (err: unknown) {
    console.error("[market] spark failed:", err instanceof Error ? err.message : err);
    return { constituents: null, indiaVix: null, brent: null, usdInr: null };
  }

  const constituents: SymbolQuote[] = [];
  for (const c of niftyWeights.constituents) {
    const q = parseSparkEntry(c.symbol, spark[`${c.symbol}.NS`]);
    if (q) constituents.push(q);
  }

  return {
    constituents: constituents.length > 0 ? constituents : null,
    indiaVix: parseSparkEntry("INDIA VIX", spark[VIX_SYMBOL]),
    brent: parseSparkEntry("BRENT", spark[BRENT_SYMBOL]),
    usdInr: parseSparkEntry("USD/INR", spark[USDINR_SYMBOL]),
  };
}
