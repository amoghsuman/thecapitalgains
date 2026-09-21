// Market data providers. The route handler (app/api/market/route.ts) only
// talks to getQuotes(); swap the implementation here to move from Yahoo
// Finance to Upstox, Kite or another feed without touching the UI.
// Server-only: never import this from a client component.

export type IndexQuote = {
  name: string;
  last: number;
  changePct: number;
  /** ISO timestamp of the quote's last trade. */
  asOf: string;
};

export const QUOTE_SOURCE = "Yahoo Finance (NSE indices)";

const INDEX_SYMBOLS: { symbol: string; name: string }[] = [
  { symbol: "^NSEI", name: "Nifty 50" },
  { symbol: "^NSEBANK", name: "Bank Nifty" },
  { symbol: "NIFTY_MIDCAP_100.NS", name: "Nifty Midcap 100" },
];

const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

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
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
    symbol
  )}?range=1d&interval=1d`;
  const res = await fetch(url, {
    headers: { "User-Agent": BROWSER_UA, Accept: "application/json" },
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`Yahoo ${symbol}: HTTP ${res.status}`);

  const json = (await res.json()) as YahooChartResponse;
  const meta = json.chart?.result?.[0]?.meta;
  const last = meta?.regularMarketPrice;
  const prev = meta?.chartPreviousClose ?? meta?.previousClose;
  const time = meta?.regularMarketTime;

  if (typeof last !== "number" || typeof prev !== "number" || prev === 0 || typeof time !== "number") {
    throw new Error(`Yahoo ${symbol}: unexpected payload`);
  }

  return {
    name,
    last,
    changePct: ((last - prev) / prev) * 100,
    asOf: new Date(time * 1000).toISOString(),
  };
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
