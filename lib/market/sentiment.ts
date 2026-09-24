// TCG Sentiment Index.
//
// Each input is scored 0–100 as the percentile rank of its latest value within
// its trailing 252-trading-day range (VIX-based inputs inverted, since high
// volatility reads as fear). The composite is a weighted mean, renormalised
// over whichever inputs are available, so a missing feed lowers confidence
// rather than biasing the score.
//
//   volatility        0.30   VIX level (inverted) and 5-day VIX change (inverted), averaged
//   breadth           0.25   share of fetched Nifty constituents up on the day
//   momentum          0.20   Nifty % distance from its 50-DMA and 200-DMA, averaged
//   flows             0.15   sum of the last five FII net figures, null if fewer than five
//   relative strength 0.10   Bank Nifty 10-day return minus Nifty 10-day return
//
// Bands: <20 extreme fear · 20–40 fear · 40–60 neutral · 60–80 greed · >80 extreme greed.
// Pure functions only; the route (app/api/market) gathers the series.
//
// The methodology is proprietary: only PublicSentiment (score, band, coverage,
// computedAt) leaves the server. The per-input breakdown stays in the full
// Sentiment object for logs and server-side use.

export type SentimentInputKey = "volatility" | "breadth" | "momentum" | "flows" | "relativeStrength";

export type SentimentBand = "extreme fear" | "fear" | "neutral" | "greed" | "extreme greed";

export type SentimentInput = {
  key: SentimentInputKey;
  label: string;
  weight: number;
  /** Latest raw reading in the input's own unit; null when unavailable. */
  raw: number | null;
  /** 0–100 percentile score; null when unavailable. */
  score: number | null;
  available: boolean;
  note: string;
};

/** What /api/market sends to the browser. Nothing about inputs or weights. */
export type PublicSentiment = {
  /** 0–100, or null when no input is available. */
  score: number | null;
  band: SentimentBand | null;
  /** Sum of the weights of the inputs that were available (1.0 = all). */
  coverage: number;
  computedAt: string;
};

/** Full server-side result; never serialised to the client. */
export type Sentiment = PublicSentiment & {
  inputs: SentimentInput[];
};

/** Strips the proprietary breakdown; the only shape the client may receive. */
export function toPublicSentiment(s: Sentiment): PublicSentiment {
  return { score: s.score, band: s.band, coverage: s.coverage, computedAt: s.computedAt };
}

/** One-line server log of the inputs behind a reading. */
export function describeSentimentInputs(s: Sentiment): string {
  return s.inputs
    .map((i) => `${i.key}=${i.available && i.score !== null ? Math.round(i.score) : "n/a"}`)
    .join(" ");
}

export const WEIGHTS: Record<SentimentInputKey, number> = {
  volatility: 0.3,
  breadth: 0.25,
  momentum: 0.2,
  flows: 0.15,
  relativeStrength: 0.1,
};

export const LOOKBACK_DAYS = 252;
const MIN_HISTORY = 20;

export type SentimentSeries = {
  /** Daily closes, oldest first. */
  niftyCloses: number[] | null;
  bankNiftyCloses: number[] | null;
  vixCloses: number[] | null;
  /** Share of constituents with a positive day change, 0–100. */
  breadthPct: number | null;
  /** FII net ₹ crore per session, oldest first (any length). */
  fiiNetHistory: number[] | null;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function bandFor(score: number): SentimentBand {
  if (score < 20) return "extreme fear";
  if (score < 40) return "fear";
  if (score <= 60) return "neutral";
  if (score <= 80) return "greed";
  return "extreme greed";
}

/** Percentile rank (0–100) of the last value within the trailing window, inclusive of itself. */
export function percentileOfLatest(series: number[], lookback = LOOKBACK_DAYS): number | null {
  const window = series.slice(-lookback).filter((v) => Number.isFinite(v));
  if (window.length < MIN_HISTORY) return null;
  const latest = window[window.length - 1];
  const min = Math.min(...window);
  const max = Math.max(...window);
  if (max === min) return 50;
  return ((latest - min) / (max - min)) * 100;
}

function sma(series: number[], n: number, endIndex: number): number | null {
  if (endIndex + 1 < n) return null;
  let sum = 0;
  for (let i = endIndex - n + 1; i <= endIndex; i++) sum += series[i];
  return sum / n;
}

/** % distance of each close from its n-day SMA, for every index where the SMA exists. */
function distanceFromSmaSeries(closes: number[], n: number): number[] {
  const out: number[] = [];
  for (let i = n - 1; i < closes.length; i++) {
    const m = sma(closes, n, i);
    if (m !== null && m !== 0) out.push(((closes[i] - m) / m) * 100);
  }
  return out;
}

function changeSeries(closes: number[], lag: number): number[] {
  const out: number[] = [];
  for (let i = lag; i < closes.length; i++) {
    if (closes[i - lag] !== 0) out.push(((closes[i] - closes[i - lag]) / closes[i - lag]) * 100);
  }
  return out;
}

function rollingSum(series: number[], n: number): number[] {
  const out: number[] = [];
  for (let i = n - 1; i < series.length; i++) {
    let s = 0;
    for (let j = i - n + 1; j <= i; j++) s += series[j];
    out.push(s);
  }
  return out;
}

function last<T>(arr: T[]): T | null {
  return arr.length > 0 ? arr[arr.length - 1] : null;
}

function round1(v: number | null): number | null {
  return v === null ? null : Math.round(v * 10) / 10;
}

// ─── Inputs ───────────────────────────────────────────────────────────────────

function volatilityInput(vix: number[] | null): SentimentInput {
  const base = { key: "volatility" as const, label: "Volatility (India VIX)", weight: WEIGHTS.volatility };
  if (!vix || vix.length < MIN_HISTORY) {
    return { ...base, raw: null, score: null, available: false, note: "India VIX history unavailable" };
  }
  const levelPct = percentileOfLatest(vix);
  const change5d = changeSeries(vix, 5);
  const changePct = percentileOfLatest(change5d);
  const parts = [levelPct, changePct].filter((v): v is number => v !== null);
  if (parts.length === 0) {
    return { ...base, raw: last(vix), score: null, available: false, note: "not enough VIX history" };
  }
  // Inverted: a high VIX percentile is fear.
  const score = 100 - parts.reduce((a, b) => a + b, 0) / parts.length;
  return {
    ...base,
    raw: round1(last(vix)),
    score: round1(score),
    available: true,
    note: `VIX ${last(vix)?.toFixed(2)}, 5-day change ${round1(last(change5d))}%`,
  };
}

function breadthInput(breadthPct: number | null): SentimentInput {
  const base = { key: "breadth" as const, label: "Breadth (constituents up on the day)", weight: WEIGHTS.breadth };
  if (breadthPct === null) return { ...base, raw: null, score: null, available: false, note: "constituent quotes unavailable" };
  // No breadth history is kept, so the share itself is the score: 50% up = 50.
  return { ...base, raw: round1(breadthPct), score: round1(breadthPct), available: true, note: `${round1(breadthPct)}% of fetched constituents up` };
}

function momentumInput(nifty: number[] | null): SentimentInput {
  const base = { key: "momentum" as const, label: "Momentum (Nifty vs 50/200-DMA)", weight: WEIGHTS.momentum };
  if (!nifty || nifty.length < 50) return { ...base, raw: null, score: null, available: false, note: "Nifty history unavailable" };
  const d50 = distanceFromSmaSeries(nifty, 50);
  const d200 = distanceFromSmaSeries(nifty, 200);
  const p50 = percentileOfLatest(d50);
  const p200 = d200.length >= MIN_HISTORY ? percentileOfLatest(d200) : null;
  const parts = [p50, p200].filter((v): v is number => v !== null);
  if (parts.length === 0) return { ...base, raw: null, score: null, available: false, note: "not enough Nifty history" };
  const score = parts.reduce((a, b) => a + b, 0) / parts.length;
  return {
    ...base,
    raw: round1(last(d50)),
    score: round1(score),
    available: true,
    note: `${round1(last(d50))}% from 50-DMA${d200.length ? `, ${round1(last(d200))}% from 200-DMA` : ", 200-DMA needs more history"}`,
  };
}

function flowsInput(fii: number[] | null): SentimentInput {
  const base = { key: "flows" as const, label: "Flows (FII net, last 5 sessions)", weight: WEIGHTS.flows };
  if (!fii || fii.length < 5) {
    return { ...base, raw: null, score: null, available: false, note: `needs five FII sessions in market_reference (have ${fii?.length ?? 0})` };
  }
  const sums = rollingSum(fii, 5);
  const score = sums.length >= MIN_HISTORY ? percentileOfLatest(sums) : null;
  if (score === null) {
    return { ...base, raw: round1(last(sums)), score: null, available: false, note: "not enough flow history for a percentile" };
  }
  return { ...base, raw: round1(last(sums)), score: round1(score), available: true, note: `₹${Math.round(last(sums) ?? 0).toLocaleString("en-IN")} crore net over 5 sessions` };
}

function relativeStrengthInput(bank: number[] | null, nifty: number[] | null): SentimentInput {
  const base = { key: "relativeStrength" as const, label: "Relative strength (Bank Nifty vs Nifty, 10 days)", weight: WEIGHTS.relativeStrength };
  if (!bank || !nifty || bank.length < 11 || nifty.length < 11) {
    return { ...base, raw: null, score: null, available: false, note: "index history unavailable" };
  }
  const n = Math.min(bank.length, nifty.length);
  const b = changeSeries(bank.slice(-n), 10);
  const k = changeSeries(nifty.slice(-n), 10);
  const rel = b.map((v, i) => v - k[i]);
  const score = percentileOfLatest(rel);
  if (score === null) return { ...base, raw: round1(last(rel)), score: null, available: false, note: "not enough history" };
  return { ...base, raw: round1(last(rel)), score: round1(score), available: true, note: `Bank Nifty ${round1(last(rel))} pp vs Nifty over 10 days` };
}

// ─── Composite ────────────────────────────────────────────────────────────────

export function computeSentiment(series: SentimentSeries, now: Date = new Date()): Sentiment {
  const inputs: SentimentInput[] = [
    volatilityInput(series.vixCloses),
    breadthInput(series.breadthPct),
    momentumInput(series.niftyCloses),
    flowsInput(series.fiiNetHistory),
    relativeStrengthInput(series.bankNiftyCloses, series.niftyCloses),
  ];

  const usable = inputs.filter((i) => i.available && i.score !== null);
  const coverage = usable.reduce((s, i) => s + i.weight, 0);
  if (coverage === 0) {
    return { score: null, band: null, inputs, coverage: 0, computedAt: now.toISOString() };
  }
  const weighted = usable.reduce((s, i) => s + (i.score as number) * i.weight, 0) / coverage;
  const score = Math.round(Math.min(100, Math.max(0, weighted)));
  return { score, band: bandFor(score), inputs, coverage: Math.round(coverage * 100) / 100, computedAt: now.toISOString() };
}
