// Market note: one or two plain-English sentences about today's session, an
// educational tip and a course CTA, all derived from the /api/market snapshot.
// No model calls; every clause is a template filled from the numbers below.
// Observation only: nothing here predicts, recommends or instructs.
//
// Safe to import from client components (pure functions, no server deps).

import type { MarketSnapshot, MarketQuote, MarketWeight } from "@/lib/market/client";

// ─── Buckets ──────────────────────────────────────────────────────────────────

export type IndexBucket = "sharpUp" | "up" | "flat" | "down" | "sharpDown" | "unknown";
export type VixBucket = "spike" | "up" | "unchanged" | "down" | "drop" | "unknown";
export type BreadthBucket = "broadUp" | "leanUp" | "even" | "leanDown" | "broadDown" | "unknown";

const INDEX_SHARP = 1.5;
const INDEX_MOVE = 0.5;
const VIX_SPIKE = 8;
const VIX_MOVE = 2;

export function indexBucket(changePct: number | null): IndexBucket {
  if (changePct === null) return "unknown";
  if (changePct >= INDEX_SHARP) return "sharpUp";
  if (changePct >= INDEX_MOVE) return "up";
  if (changePct <= -INDEX_SHARP) return "sharpDown";
  if (changePct <= -INDEX_MOVE) return "down";
  return "flat";
}

export function vixBucket(changePct: number | null): VixBucket {
  if (changePct === null) return "unknown";
  if (changePct >= VIX_SPIKE) return "spike";
  if (changePct >= VIX_MOVE) return "up";
  if (changePct <= -VIX_SPIKE) return "drop";
  if (changePct <= -VIX_MOVE) return "down";
  return "unchanged";
}

export function breadthBucket(advancingShare: number | null): BreadthBucket {
  if (advancingShare === null) return "unknown";
  if (advancingShare >= 0.7) return "broadUp";
  if (advancingShare >= 0.55) return "leanUp";
  if (advancingShare <= 0.3) return "broadDown";
  if (advancingShare <= 0.45) return "leanDown";
  return "even";
}

// ─── Derived view of the snapshot ─────────────────────────────────────────────

export type SectorStat = {
  sector: string;
  /** Short plain-English label for sentences. */
  label: string;
  count: number;
  up: number;
  down: number;
  /** Weight-averaged day change, %. */
  avgChange: number;
};

export type MarketDerived = {
  nifty: { changePct: number; last: number } | null;
  bankNifty: { changePct: number } | null;
  midcap: { changePct: number } | null;
  index: IndexBucket;
  /** Constituents with a quote. */
  total: number;
  advancing: number;
  declining: number;
  breadth: BreadthBucket;
  sectors: SectorStat[];
  strongest: SectorStat | null;
  weakest: SectorStat | null;
  /** Bank Nifty change minus Nifty change, percentage points. */
  bankGap: number | null;
  /** Midcap 100 change minus Nifty change, percentage points. */
  midcapGap: number | null;
  vix: { level: number; changePct: number } | null;
  vixBucket: VixBucket;
  sentimentBand: MarketSnapshot["sentiment"]["band"];
  fetchedAt: string;
};

// NSE industry names are long; sentences use these.
const SECTOR_LABELS: Record<string, string> = {
  "Financial Services": "banks and financials",
  "Oil Gas & Consumable Fuels": "energy",
  "Information Technology": "IT",
  "Automobile and Auto Components": "autos",
  "Fast Moving Consumer Goods": "FMCG",
  "Metals & Mining": "metals",
  Healthcare: "pharma",
  Construction: "construction",
  Telecommunication: "telecom",
  "Consumer Durables": "consumer durables",
  "Construction Materials": "cement",
  Power: "power",
  "Consumer Services": "consumer services",
  Services: "services",
  "Capital Goods": "capital goods",
  Realty: "realty",
  "Chemicals": "chemicals",
};

function sectorLabel(sector: string): string {
  return SECTOR_LABELS[sector] ?? sector.toLowerCase();
}

function findIndex(snapshot: MarketSnapshot, name: string): { changePct: number; last: number } | null {
  const q = snapshot.indices.find((i) => i.name === name);
  return q ? { changePct: q.changePct, last: q.last } : null;
}

function sectorStats(quotes: MarketQuote[], weights: MarketWeight[] | null): SectorStat[] {
  if (!weights) return [];
  const bySymbol = new Map(weights.map((w) => [w.symbol, w]));
  const acc = new Map<string, { count: number; up: number; down: number; wsum: number; wchg: number }>();
  for (const q of quotes) {
    const w = bySymbol.get(q.symbol);
    if (!w) continue;
    const a = acc.get(w.sector) ?? { count: 0, up: 0, down: 0, wsum: 0, wchg: 0 };
    a.count += 1;
    if (q.changePct > 0) a.up += 1;
    else if (q.changePct < 0) a.down += 1;
    a.wsum += w.weight;
    a.wchg += w.weight * q.changePct;
    acc.set(w.sector, a);
  }
  return Array.from(acc.entries())
    .map(([sector, a]) => ({
      sector,
      label: sectorLabel(sector),
      count: a.count,
      up: a.up,
      down: a.down,
      avgChange: a.wsum > 0 ? a.wchg / a.wsum : 0,
    }))
    .sort((x, y) => y.avgChange - x.avgChange);
}

/** Sectors with fewer members than this are not called out as strongest/weakest. */
const MIN_SECTOR_MEMBERS = 3;

export function deriveMarket(snapshot: MarketSnapshot): MarketDerived {
  const nifty = findIndex(snapshot, "Nifty 50");
  const bankNifty = findIndex(snapshot, "Bank Nifty");
  const midcap = findIndex(snapshot, "Nifty Midcap 100");
  const quotes = snapshot.constituents ?? [];
  const advancing = quotes.filter((q) => q.changePct > 0).length;
  const declining = quotes.filter((q) => q.changePct < 0).length;
  const sectors = sectorStats(quotes, snapshot.weights?.constituents ?? null);
  const eligible = sectors.filter((s) => s.count >= MIN_SECTOR_MEMBERS);
  const vix = snapshot.indiaVix ? { level: snapshot.indiaVix.last, changePct: snapshot.indiaVix.changePct } : null;

  return {
    nifty,
    bankNifty: bankNifty ? { changePct: bankNifty.changePct } : null,
    midcap: midcap ? { changePct: midcap.changePct } : null,
    index: indexBucket(nifty?.changePct ?? null),
    total: quotes.length,
    advancing,
    declining,
    breadth: breadthBucket(quotes.length > 0 ? advancing / quotes.length : null),
    sectors,
    strongest: eligible[0] ?? null,
    weakest: eligible.length > 0 ? eligible[eligible.length - 1] : null,
    bankGap: nifty && bankNifty ? bankNifty.changePct - nifty.changePct : null,
    midcapGap: nifty && midcap ? midcap.changePct - nifty.changePct : null,
    vix,
    vixBucket: vixBucket(vix?.changePct ?? null),
    sentimentBand: snapshot.sentiment.band,
    fetchedAt: snapshot.fetchedAt,
  };
}

// ─── Sentence composition ─────────────────────────────────────────────────────

export const NOTE_MAX_CHARS = 220;

const r1 = (v: number): string => (Math.round(v * 10) / 10).toFixed(1);
const pct = (v: number): string => `${r1(Math.abs(v))}%`;
const pts = (v: number): string => `${r1(Math.abs(v))} point${Math.abs(Math.round(v * 10)) === 10 ? "" : "s"}`;

function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Headline clause: index move plus breadth.
function headline(d: MarketDerived): string | null {
  const n = d.nifty;
  const haveBreadth = d.total > 0;
  switch (d.index) {
    case "sharpDown":
    case "down":
      if (!n) return null;
      return haveBreadth
        ? `Nifty is down ${pct(n.changePct)} with ${d.declining} of ${d.total} constituents in the red`
        : `Nifty is down ${pct(n.changePct)}`;
    case "sharpUp":
    case "up":
      if (!n) return null;
      if (d.breadth === "broadUp") return `Broad advance: Nifty up ${pct(n.changePct)}, ${d.advancing} of ${d.total} constituents up`;
      return haveBreadth
        ? `Nifty is up ${pct(n.changePct)} with ${d.advancing} of ${d.total} constituents higher`
        : `Nifty is up ${pct(n.changePct)}`;
    case "flat": {
      const breadthWords: Record<BreadthBucket, string> = {
        broadUp: "most constituents higher",
        leanUp: "breadth slightly positive",
        even: "breadth even",
        leanDown: "breadth slightly negative",
        broadDown: "most constituents lower",
        unknown: "",
      };
      const b = breadthWords[d.breadth];
      const vixWord = d.vixBucket === "unchanged" ? ", India VIX unchanged" : "";
      return `A quiet session: Nifty flat${b ? `, ${b}` : ""}${vixWord}`;
    }
    default:
      return null;
  }
}

// Sector clause: the weakest group on a down day, the leaders on an up day.
function sectorClause(d: MarketDerived): string | null {
  if (d.index === "down" || d.index === "sharpDown") {
    const w = d.weakest;
    if (!w || w.avgChange >= 0) return null;
    const bank =
      w.sector === "Financial Services" && d.bankGap !== null && d.bankGap < -0.2
        ? `, Bank Nifty lagging Nifty by ${pts(d.bankGap)}`
        : "";
    return `${capitalise(w.label)} are the weakest group: ${w.down} of ${w.count} down${bank}`;
  }
  if (d.index === "up" || d.index === "sharpUp") {
    const leaders = d.sectors.filter((s) => s.count >= MIN_SECTOR_MEMBERS && s.avgChange > 0).slice(0, 2);
    if (leaders.length === 0) return null;
    const names = leaders.map((s) => s.label).join(" and ");
    return `led by ${names}`;
  }
  return null;
}

// Third clause: whichever of VIX and the midcap gap is more notable.
function colourClause(d: MarketDerived): string | null {
  const vixNotable = d.vix && d.vixBucket !== "unchanged" && d.vixBucket !== "unknown";
  const midNotable = d.midcapGap !== null && Math.abs(d.midcapGap) >= 0.3;
  if (vixNotable && d.vix) {
    const dir = d.vix.changePct > 0 ? "up" : "down";
    return `India VIX ${dir} ${pct(d.vix.changePct)}`;
  }
  if (midNotable && d.midcapGap !== null) {
    const rel = d.midcapGap > 0 ? "outperforming" : "lagging";
    return `midcaps are ${rel} by ${pts(d.midcapGap)}`;
  }
  return null;
}

/** One or two sentences, capped at NOTE_MAX_CHARS; null when there is nothing to say. */
export function composeNote(d: MarketDerived): string | null {
  const head = headline(d);
  if (!head) return null;
  const sector = sectorClause(d);
  const colour = colourClause(d);

  // Up days attach the leaders to the headline ("…up, led by metals and autos");
  // down and flat days give the sector its own sentence.
  let first = head;
  let second: string | null = sector;
  if (sector && sector.startsWith("led by")) {
    first = `${head}, ${sector}`;
    second = null;
  }

  const parts: string[] = [first];
  if (second) parts.push(second);
  if (colour) {
    // A VIX or midcap remark rides on the headline when that is the only sentence,
    // otherwise it becomes its own sentence ("India VIX…" keeps its capital).
    if (parts.length === 1) parts[0] = `${parts[0]}; ${colour}`;
    else parts.push(capitalise(colour));
  }

  let text = parts.map((p) => `${p}.`).join(" ");
  while (text.length > NOTE_MAX_CHARS && parts.length > 1) {
    parts.pop();
    text = parts.map((p) => `${p}.`).join(" ");
  }
  if (text.length > NOTE_MAX_CHARS) text = `${text.slice(0, NOTE_MAX_CHARS - 1).trimEnd()}.`;
  return text;
}

// ─── Tips ─────────────────────────────────────────────────────────────────────
//
// Keyed by regime (index × VIX × breadth). Ordered most specific first; the
// last entry always matches. Every courseSlug exists in Sanity as of
// 2026-09-24 (scripts verify); a missing one falls back to FALLBACK_COURSE.

export const FALLBACK_COURSE = "stock-market-from-zero";

export type MarketTip = {
  id: string;
  text: string;
  courseSlug: string;
  matches: (d: MarketDerived) => boolean;
};

const isDown = (d: MarketDerived) => d.index === "down" || d.index === "sharpDown";
const isUp = (d: MarketDerived) => d.index === "up" || d.index === "sharpUp";
const vixUp = (d: MarketDerived) => d.vixBucket === "up" || d.vixBucket === "spike";
const vixDown = (d: MarketDerived) => d.vixBucket === "down" || d.vixBucket === "drop";
const broadDown = (d: MarketDerived) => d.breadth === "broadDown" || d.breadth === "leanDown";
const broadUp = (d: MarketDerived) => d.breadth === "broadUp" || d.breadth === "leanUp";
const banksWeakest = (d: MarketDerived) => d.weakest?.sector === "Financial Services" && (d.bankGap ?? 0) < -0.2;

export const TIPS: MarketTip[] = [
  {
    id: "banking-selloff",
    text: "When banks lead a decline, the balance sheet is where the story lives: loan growth, deposit costs and provisioning explain more of a bank's move than the day's headline.",
    courseSlug: "how-to-read-financial-statements",
    matches: (d) => isDown(d) && banksWeakest(d),
  },
  {
    id: "vix-spike-down",
    text: "A sharp rise in India VIX makes option premiums more expensive; hedges bought after the move cost more than hedges bought before it, which is why protection is planned in calm markets.",
    courseSlug: "understanding-options-as-a-hedging-tool-for-investors",
    matches: (d) => isDown(d) && d.vixBucket === "spike",
  },
  {
    id: "broad-down",
    text: "On broad down days, position size matters more than stock selection; a fixed rupee risk per trade keeps a red day survivable.",
    courseSlug: "understanding-position-sizing-and-the-kelly-criterion",
    matches: (d) => isDown(d) && broadDown(d),
  },
  {
    id: "down-vix-up",
    text: "Falling prices with rising VIX is the market paying up for insurance; the premium a put costs is a live estimate of how much movement is expected, not a forecast of direction.",
    courseSlug: "options-trading-from-zero",
    matches: (d) => isDown(d) && vixUp(d),
  },
  {
    id: "narrow-down",
    text: "An index down day with most constituents higher is a weight story: a few heavyweights can move the index while the median stock does nothing.",
    courseSlug: "stock-market-from-zero",
    matches: (d) => isDown(d) && broadUp(d),
  },
  {
    id: "sharp-down",
    text: "Large single-day drops cluster: volatility tends to follow volatility, so a wide range today makes a wide range tomorrow more likely than usual.",
    courseSlug: "understanding-implied-volatility-and-the-volatility-surface",
    matches: (d) => d.index === "sharpDown",
  },
  {
    id: "broad-up-low-vix",
    text: "Broad advances with falling volatility are the environment trend-following systems are built for; the rule is defined in advance, the exit as much as the entry.",
    courseSlug: "understanding-momentum-and-trend-following-strategies",
    matches: (d) => isUp(d) && broadUp(d) && vixDown(d),
  },
  {
    id: "broad-up",
    text: "When most constituents rise together, sector rotation is easier to see: which groups lead a broad advance says something about where the market expects earnings to come from.",
    courseSlug: "understanding-sector-rotation-and-business-cycles",
    matches: (d) => isUp(d) && broadUp(d),
  },
  {
    id: "up-vix-up",
    text: "An index rising while VIX also rises is unusual: the options market is pricing a wider range in both directions even as prices climb.",
    courseSlug: "understanding-implied-volatility-and-the-volatility-surface",
    matches: (d) => isUp(d) && vixUp(d),
  },
  {
    id: "narrow-up",
    text: "An index up day with weak breadth means the gain sits in a handful of heavyweights; the free-float weighting behind that is worth understanding before reading an index level.",
    courseSlug: "stock-market-from-zero",
    matches: (d) => isUp(d) && (d.breadth === "even" || broadDown(d)),
  },
  {
    id: "midcap-divergence",
    text: "When midcaps and the Nifty part ways by more than a few tenths, the difference is usually liquidity and flows rather than earnings; sector and size behave differently across a cycle.",
    courseSlug: "sectoral-analysis-understanding-how-different-industries-behave",
    matches: (d) => d.midcapGap !== null && Math.abs(d.midcapGap) >= 0.5,
  },
  {
    id: "flat-vix-drop",
    text: "A flat index with falling VIX is time decay working for option sellers and against buyers; theta is the cost of waiting.",
    courseSlug: "options-trading-from-zero",
    matches: (d) => d.index === "flat" && vixDown(d),
  },
  {
    id: "flat-narrow",
    text: "Quiet sessions are when sizing rules get written: deciding the maximum loss per position before the volatile day arrives is the whole point of a risk budget.",
    courseSlug: "understanding-position-sizing-and-the-kelly-criterion",
    matches: (d) => d.index === "flat" && (d.breadth === "even" || d.breadth === "leanUp" || d.breadth === "leanDown"),
  },
  {
    id: "flat-broad",
    text: "A flat index with lopsided breadth means the heavyweights offset the rest; equal-weight and free-float-weight versions of the same index can tell different stories on such days.",
    courseSlug: "stock-market-from-zero",
    matches: (d) => d.index === "flat",
  },
  {
    id: "default",
    text: "One session is one data point: the distribution of daily index moves, not any single day, is what a position size should be built around.",
    courseSlug: "understanding-position-sizing-and-the-kelly-criterion",
    matches: () => true,
  },
];

/** Every slug a tip or the fallback can link to; the home page resolves these titles. */
export const TIP_COURSE_SLUGS: string[] = Array.from(new Set([FALLBACK_COURSE, ...TIPS.map((t) => t.courseSlug)]));

export function pickTip(d: MarketDerived): MarketTip {
  return TIPS.find((t) => t.matches(d)) ?? TIPS[TIPS.length - 1];
}

// ─── Assembled note ───────────────────────────────────────────────────────────

export type MarketNote = {
  sentence: string;
  tip: MarketTip;
  cta: { slug: string; title: string; href: string; label: string };
  /** "as of 14:32 IST" */
  asOf: string;
  derived: MarketDerived;
};

export function asOfIst(fetchedAt: string): string {
  const d = new Date(fetchedAt);
  if (Number.isNaN(d.getTime())) return "";
  return `as of ${d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Kolkata" })} IST`;
}

/**
 * courseTitles maps slug → title for the courses that exist in Sanity
 * (getAllCourses()); a tip whose course is missing links to FALLBACK_COURSE.
 * Returns null when the snapshot has nothing to say (no Nifty quote).
 */
export function buildMarketNote(snapshot: MarketSnapshot, courseTitles: Record<string, string>): MarketNote | null {
  const derived = deriveMarket(snapshot);
  const sentence = composeNote(derived);
  if (!sentence) return null;
  const tip = pickTip(derived);
  const slug = courseTitles[tip.courseSlug] ? tip.courseSlug : FALLBACK_COURSE;
  const title = courseTitles[slug] ?? "Stock Market from Zero";
  return {
    sentence,
    tip,
    cta: { slug, title, href: `/courses/${slug}`, label: `Learn why: ${title} →` },
    asOf: asOfIst(snapshot.fetchedAt),
    derived,
  };
}
