// Market data providers. The route handler (app/api/market/route.ts) only
// talks to getQuotes() and getExtendedQuotes(); swap the implementations here
// to move from Yahoo Finance to Upstox, Kite or another feed without touching
// the UI. Server-only: never import this from a client component.

import { niftyWeights, REFERENCE_WEIGHTS_PREFIX } from "@/lib/market/constants";

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
export async function getExtendedQuotes(constituentTickers: string[]): Promise<ExtendedQuotes> {
  const constituentSymbols = constituentTickers.map((c) => `${c}.NS`);
  const all = [...constituentSymbols, VIX_SYMBOL, BRENT_SYMBOL, USDINR_SYMBOL];

  let spark: Record<string, SparkEntry>;
  try {
    spark = await fetchSpark(all);
  } catch (err: unknown) {
    console.error("[market] spark failed:", err instanceof Error ? err.message : err);
    return { constituents: null, indiaVix: null, brent: null, usdInr: null };
  }

  const constituents: SymbolQuote[] = [];
  for (const symbol of constituentTickers) {
    const q = parseSparkEntry(symbol, spark[`${symbol}.NS`]);
    if (q) constituents.push(q);
  }

  return {
    constituents: constituents.length > 0 ? constituents : null,
    indiaVix: parseSparkEntry("INDIA VIX", spark[VIX_SYMBOL]),
    brent: parseSparkEntry("BRENT", spark[BRENT_SYMBOL]),
    usdInr: parseSparkEntry("USD/INR", spark[USDINR_SYMBOL]),
  };
}

// ─── Daily close history (chart endpoint, cached an hour) ────────────────────
//
// Used only by the sentiment index. One request per symbol; a failure returns
// null for that symbol and the index simply loses that input.

type YahooHistoryResponse = {
  chart?: {
    result?: Array<{
      timestamp?: number[] | null;
      indicators?: { quote?: Array<{ close?: (number | null)[] | null }> | null } | null;
    }> | null;
  };
};

export async function getDailyCloses(symbol: string, range: "1y" | "2y" = "2y"): Promise<number[] | null> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=1d`;
  try {
    const res = await fetch(url, { headers: HEADERS, next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = (await res.json()) as YahooHistoryResponse;
    const closes = json.chart?.result?.[0]?.indicators?.quote?.[0]?.close ?? null;
    if (!closes) throw new Error("no close series");
    const clean = closes.filter((c): c is number => typeof c === "number" && Number.isFinite(c));
    return clean.length > 0 ? clean : null;
  } catch (err: unknown) {
    console.error(`[market] history ${symbol} failed:`, err instanceof Error ? err.message : err);
    return null;
  }
}

export const HISTORY_SYMBOLS = { nifty: "^NSEI", bankNifty: "^NSEBANK", vix: "^INDIAVIX" } as const;

// ─── Nifty 50 constituents and approximate weights ────────────────────────────
//
// The constituent list comes from NSE's own CSV (browser UA; the www host is
// tried with a cookie warm-up after the archives host). Weights are NOT the
// official factsheet numbers: they are free-float market cap (Yahoo
// quoteSummary floatShares × last price) as a share of the list's total, which
// tracks the index method closely enough for a heatmap. If the list cannot be
// fetched, the stale copy in lib/market/constants.ts is used and flagged.

export type Nifty50Constituent = {
  symbol: string;
  name: string;
  /** NSE's "Industry" column; the treemap groups by it. */
  sector: string;
};

export type ConstituentList = {
  constituents: Nifty50Constituent[];
  /** "nse" for a fresh CSV, "fallback" for the stale copy in constants.ts. */
  origin: "nse" | "fallback";
  /** ISO date the list was obtained (or the fallback's factsheet date). */
  asOf: string;
};

export type ConstituentWeight = Nifty50Constituent & {
  /** Approximate index weight, % of the priced constituents. */
  weight: number;
  /** Free-float market cap, ₹ (floatShares × last price). */
  floatMcap: number;
};

export type ConstituentWeights = {
  constituents: ConstituentWeight[];
  weightsAsOf: string;
  source: string;
  approximate: true;
};

export const WEIGHTS_SOURCE =
  "Approximate, derived from free-float market cap (Yahoo Finance) against the NSE Nifty 50 constituent list";

const NSE_LIST_URLS = [
  "https://archives.nseindia.com/content/indices/ind_nifty50list.csv",
  "https://www.nseindia.com/content/indices/ind_nifty50list.csv",
];
const NSE_HEADERS = {
  "User-Agent": BROWSER_UA,
  Accept: "text/csv,text/plain,*/*",
  "Accept-Language": "en-US,en;q=0.9",
  Referer: "https://www.nseindia.com/",
};

// RFC-4180-ish: quoted fields may contain commas.
function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQ) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') inQ = false;
      else cur += ch;
    } else if (ch === '"') inQ = true;
    else if (ch === ",") {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

function parseNiftyList(csv: string): Nifty50Constituent[] {
  const lines = csv.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];
  const header = parseCsvLine(lines[0]).map((h) => h.toLowerCase());
  const iName = header.findIndex((h) => h.startsWith("company"));
  const iInd = header.indexOf("industry");
  const iSym = header.indexOf("symbol");
  if (iName < 0 || iSym < 0) return [];
  const out: Nifty50Constituent[] = [];
  for (const line of lines.slice(1)) {
    const f = parseCsvLine(line);
    const symbol = f[iSym];
    if (!symbol) continue;
    out.push({ symbol, name: f[iName] ?? symbol, sector: (iInd >= 0 && f[iInd]) || "Other" });
  }
  return out;
}

// Cookie warm-up for the www host: NSE serves its CSVs only to sessions that
// have loaded a page first. Best effort; an empty string means no cookies.
async function warmNseCookies(): Promise<string> {
  try {
    const res = await fetch("https://www.nseindia.com/", { headers: NSE_HEADERS, cache: "no-store" });
    const set = res.headers.getSetCookie?.() ?? [];
    return set.map((c) => c.split(";")[0]).join("; ");
  } catch {
    return "";
  }
}

async function fetchNiftyListCsv(): Promise<string> {
  let lastErr: unknown = null;
  for (const url of NSE_LIST_URLS) {
    try {
      const cookie = url.includes("www.nseindia.com") ? await warmNseCookies() : "";
      const res = await fetch(url, {
        headers: cookie ? { ...NSE_HEADERS, Cookie: cookie } : NSE_HEADERS,
        next: { revalidate: 86400 },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      if (!/symbol/i.test(text.slice(0, 200))) throw new Error("not a constituent CSV");
      return text;
    } catch (err: unknown) {
      lastErr = err;
      console.error(`[market] nifty list ${url} failed:`, err instanceof Error ? err.message : err);
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("nifty list unavailable");
}

// Last successful list, so a transient NSE failure does not drop to the stale
// constants copy while the process is alive.
let lastGoodList: ConstituentList | null = null;

export async function getNifty50Constituents(): Promise<ConstituentList> {
  try {
    const list = parseNiftyList(await fetchNiftyListCsv());
    if (list.length < 40) throw new Error(`only ${list.length} rows parsed`);
    lastGoodList = { constituents: list, origin: "nse", asOf: new Date().toISOString().slice(0, 10) };
    return lastGoodList;
  } catch (err: unknown) {
    console.error("[market] nifty list unavailable, using fallback:", err instanceof Error ? err.message : err);
    if (lastGoodList) return lastGoodList;
    return {
      constituents: niftyWeights.constituents.map((c) => ({ symbol: c.symbol, name: c.name, sector: c.sector })),
      origin: "fallback",
      asOf: niftyWeights.asOf,
    };
  }
}

// ─── Yahoo quoteSummary (needs a session cookie + crumb) ─────────────────────

type YahooSession = { cookie: string; crumb: string; fetchedAt: number };
let yahooSession: YahooSession | null = null;
let yahooSessionCooldownUntil = 0;
const YAHOO_SESSION_TTL_MS = 60 * 60 * 1000;
const YAHOO_COOLDOWN_MS = 15 * 60 * 1000;

async function getYahooSession(): Promise<YahooSession | null> {
  if (yahooSession && Date.now() - yahooSession.fetchedAt < YAHOO_SESSION_TTL_MS) return yahooSession;
  if (Date.now() < yahooSessionCooldownUntil) return null;

  try {
    const seed = await fetch("https://fc.yahoo.com", {
      headers: { "User-Agent": BROWSER_UA },
      cache: "no-store",
      redirect: "manual",
    });
    const cookie = (seed.headers.getSetCookie?.() ?? []).map((c) => c.split(";")[0]).join("; ");
    if (!cookie) {
      yahooSessionCooldownUntil = Date.now() + YAHOO_COOLDOWN_MS;
      return null;
    }
    const res = await fetch("https://query2.finance.yahoo.com/v1/test/getcrumb", {
      headers: { "User-Agent": BROWSER_UA, Cookie: cookie },
      cache: "no-store",
    });
    if (!res.ok) {
      yahooSessionCooldownUntil = Date.now() + YAHOO_COOLDOWN_MS;
      console.warn(`[market] Yahoo crumb endpoint returned ${res.status}; activated 15-minute fallback mode`);
      return null;
    }
    const crumb = (await res.text()).trim();
    if (!crumb || crumb.includes("<")) {
      yahooSessionCooldownUntil = Date.now() + YAHOO_COOLDOWN_MS;
      return null;
    }
    yahooSession = { cookie, crumb, fetchedAt: Date.now() };
    return yahooSession;
  } catch (err: unknown) {
    yahooSessionCooldownUntil = Date.now() + YAHOO_COOLDOWN_MS;
    console.warn("[market] Yahoo session init failed:", err instanceof Error ? err.message : err);
    return null;
  }
}

type YahooQuoteSummary = {
  quoteSummary?: {
    result?: Array<{
      defaultKeyStatistics?: { floatShares?: { raw?: number } | null } | null;
      price?: { regularMarketPrice?: { raw?: number } | null } | null;
    }> | null;
    error?: { description?: string } | null;
  };
};

type FloatReading = { floatShares: number; price: number };

// Float shares move slowly; one read per symbol per day (Next fetch cache) plus
// a process-level memo so a crumb rotation does not refetch every symbol.
const floatMemo = new Map<string, { value: FloatReading; fetchedAt: number }>();
const FLOAT_TTL_MS = 24 * 60 * 60 * 1000;

async function fetchFloatReading(symbol: string, session: YahooSession): Promise<FloatReading | null> {
  const hit = floatMemo.get(symbol);
  if (hit && Date.now() - hit.fetchedAt < FLOAT_TTL_MS) return hit.value;
  try {
    const url = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(
      `${symbol}.NS`
    )}?modules=defaultKeyStatistics,price&crumb=${encodeURIComponent(session.crumb)}`;
    const res = await fetch(url, {
      headers: { "User-Agent": BROWSER_UA, Accept: "application/json", Cookie: session.cookie },
      next: { revalidate: 86400 },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = (await res.json()) as YahooQuoteSummary;
    const r = json.quoteSummary?.result?.[0];
    const floatShares = r?.defaultKeyStatistics?.floatShares?.raw;
    const price = r?.price?.regularMarketPrice?.raw;
    if (typeof floatShares !== "number" || typeof price !== "number" || floatShares <= 0 || price <= 0) {
      throw new Error(json.quoteSummary?.error?.description ?? "no float/price");
    }
    const value = { floatShares, price };
    floatMemo.set(symbol, { value, fetchedAt: Date.now() });
    return value;
  } catch (err: unknown) {
    console.error(`[market] float ${symbol} failed:`, err instanceof Error ? err.message : err);
    return null;
  }
}

// Weight = float market cap / sum over the constituents that could be priced.
// A symbol without a float reading is left out of the weights (and the sum),
// never given a placeholder number. When the Yahoo session is unavailable
// (cooldown) or fewer than 80% of the list could be priced, the reference
// weights from constants.ts are returned instead, labelled as such.
// The stale copy in constants.ts, labelled so the treemap can say so. No
// float market cap exists for these rows (0), only the factsheet weight.
function referenceWeights(): ConstituentWeights {
  return {
    constituents: niftyWeights.constituents.map((c) => ({
      symbol: c.symbol,
      name: c.name,
      sector: c.sector,
      weight: c.weight,
      floatMcap: 0,
    })),
    weightsAsOf: niftyWeights.asOf,
    source: `${REFERENCE_WEIGHTS_PREFIX}, ${niftyWeights.source}, as of ${niftyWeights.asOf} (live float data unavailable)`,
    approximate: true,
  };
}

export async function getConstituentWeights(list: ConstituentList): Promise<ConstituentWeights | null> {
  const session = await getYahooSession();
  if (!session) {
    return referenceWeights();
  }

  const readings = await Promise.all(list.constituents.map((c) => fetchFloatReading(c.symbol, session)));
  const priced: ConstituentWeight[] = [];
  let total = 0;
  list.constituents.forEach((c, i) => {
    const r = readings[i];
    if (!r) return;
    const floatMcap = r.floatShares * r.price;
    total += floatMcap;
    priced.push({ ...c, weight: 0, floatMcap });
  });
  if (total <= 0 || priced.length < list.constituents.length * 0.8) {
    console.error(`[market] weights: only ${priced.length}/${list.constituents.length} constituents priced; using reference weights`);
    return referenceWeights();
  }
  for (const p of priced) p.weight = Math.round((p.floatMcap / total) * 10000) / 100;
  priced.sort((a, b) => b.weight - a.weight);
  return {
    constituents: priced,
    weightsAsOf: new Date().toISOString(),
    source: `${WEIGHTS_SOURCE}${list.origin === "fallback" ? " (stale fallback list)" : ""}`,
    approximate: true,
  };
}
