// Every market statistic quoted on the home page that is not an F&O loss
// figure (those live in lib/home/sebiStats.ts) is defined here with its
// provenance and a freshness budget. Consumers render "as of <date> · Source:
// <name>" beside a sourced fact, and render nothing for a fact whose as-of
// date is older than `staleAfterDays` (see isShowable).
//
// kind:
//   "sourced"    — a published figure; `source` and `sourceUrl` name it
//   "assumption" — a house assumption, labelled as such wherever shown
//   "derived"    — computed at render time from the inputs named in `label`
//
// Two inputs can be refreshed automatically through the market_reference
// table (lib/market/reference.ts): the 10-year G-Sec yield and the Nifty TRI
// CAGR. Pass the table rows to buildMarketFacts(); the fresher of table row
// and constant wins.

import { preferFresher, ageInDays, type ReferenceMap, type DatedValue } from "@/lib/market/reference";

export type FactKind = "sourced" | "assumption" | "derived";

export type FactId =
  | "niftyLongTermCagr"
  | "doublingYears"
  | "returnsConcentration"
  | "deepOtmExpiryProbability"
  | "hurdleRateAssumption"
  | "directPlanSavingsExample";

export type MarketFact = {
  id: FactId;
  /** Display value, e.g. "12.41%". */
  value: string;
  label: string;
  source: string;
  sourceUrl: string;
  /** YYYY-MM-DD the value was published or last checked. */
  asOf: string;
  kind: FactKind;
  /** The fact is hidden once `asOf` is older than this many days. */
  staleAfterDays: number;
};

// ─── Hand-curated inputs ──────────────────────────────────────────────────────
// TODO (ongoing): re-check each against its source before `asOf` + staleAfterDays.

/** Nifty 50 Total Return Index, annualised since base date 3 Nov 1995. */
export const NIFTY_TRI_CAGR = {
  value: 12.41,
  asOf: "2026-06-30",
  source: "NSE Indices Ltd, Nifty 50 Factsheet",
  sourceUrl: "https://niftyindices.com",
  staleAfterDays: 400,
};

export type ReturnsConcentration = {
  invested: number;
  fullyInvestedValue: number;
  missing15BestDaysValue: number;
  periodStart: string;
  periodEnd: string;
  bestWorstProximity: string;
};

export const RETURNS_CONCENTRATION: ReturnsConcentration & {
  asOf: string;
  source: string;
  sourceUrl: string;
  staleAfterDays: number;
} = {
  invested: 1_000_000,
  fullyInvestedValue: 28_400_000,
  missing15BestDaysValue: 9_500_000,
  periodStart: "1999-07",
  periodEnd: "2026-05",
  bestWorstProximity: "7 of the 10 best days fell within two weeks of the 10 worst",
  asOf: "2026-05-31",
  source: "FundsIndia Research, Wealth Conversations, June 2026",
  sourceUrl: "https://www.fundsindia.com",
  staleAfterDays: 400,
};

/** 10-year G-Sec benchmark yield fallback when market_reference has nothing fresher. */
export const GSEC_10Y_FALLBACK = {
  value: 7.02,
  asOf: "2026-09-11",
  source: "FBIL 10-year benchmark G-Sec yield",
  sourceUrl: "https://www.fbil.org.in",
};

export const EQUITY_RISK_PREMIUM_PCT = 5.0;
export const HURDLE_STALE_AFTER_DAYS = 45;

/** Delta used as the rough probability that a deep OTM option expires ITM. */
export const DEEP_OTM_DELTA = 0.08;

export const DIRECT_PLAN_INPUTS = {
  monthlySip: 25_000,
  years: 25,
  grossReturn: 12,
  expenseGapPct: 1.0,
  asOf: "2026-06-30",
  source: "Typical direct vs regular TER gap 0.5 to 1.0 pp per year, AMFI scheme TERs",
  sourceUrl: "https://www.amfiindia.com",
  staleAfterDays: 400,
};

// ─── Formulas ─────────────────────────────────────────────────────────────────

/** Standard SIP future value: P × ((1+r)^n − 1) / r × (1+r), r = annual/12, n = months. */
export function sipFutureValue(monthly: number, years: number, annualPct: number): number {
  const r = annualPct / 100 / 12;
  const n = years * 12;
  if (r === 0) return monthly * n;
  return monthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
}

export function directPlanSavings(): { gross: number; net: number; saving: number } {
  const { monthlySip, years, grossReturn, expenseGapPct } = DIRECT_PLAN_INPUTS;
  const gross = sipFutureValue(monthlySip, years, grossReturn);
  const net = sipFutureValue(monthlySip, years, grossReturn - expenseGapPct);
  return { gross, net, saving: gross - net };
}

export function formatInrCompact(v: number): string {
  if (v >= 1e7) return `₹${(v / 1e7).toFixed(1)} crore`;
  if (v >= 1e5) return `₹${Math.round(v / 1e5)} lakh`;
  return `₹${Math.round(v).toLocaleString("en-IN")}`;
}

// ─── Building the facts ───────────────────────────────────────────────────────

export type FactInputs = {
  /** Rows from getReference(["gsec_10y", "nifty_tri_cagr_inception"]). */
  reference?: ReferenceMap;
};

export type ResolvedInputs = {
  gsec10y: DatedValue;
  niftyTriCagr: DatedValue;
};

export function resolveInputs(reference: ReferenceMap = {}): ResolvedInputs {
  return {
    gsec10y: preferFresher(reference.gsec_10y, GSEC_10Y_FALLBACK),
    niftyTriCagr: preferFresher(reference.nifty_tri_cagr_inception, {
      value: NIFTY_TRI_CAGR.value,
      asOf: NIFTY_TRI_CAGR.asOf,
      source: NIFTY_TRI_CAGR.source,
      sourceUrl: NIFTY_TRI_CAGR.sourceUrl,
    }),
  };
}

export function buildMarketFacts(inputs: FactInputs = {}): MarketFact[] {
  const { gsec10y, niftyTriCagr } = resolveInputs(inputs.reference);
  const cagr = niftyTriCagr.value;
  const doubling = 72 / cagr;
  const hurdle = gsec10y.value + EQUITY_RISK_PREMIUM_PCT;
  const savings = directPlanSavings();
  const rc = RETURNS_CONCENTRATION;

  return [
    {
      id: "niftyLongTermCagr",
      value: `${cagr.toFixed(2)}%`,
      label: "Nifty 50 Total Return Index, annualised since base date 3 Nov 1995, dividends reinvested",
      source: niftyTriCagr.source,
      sourceUrl: niftyTriCagr.sourceUrl,
      asOf: niftyTriCagr.asOf,
      kind: "sourced",
      staleAfterDays: NIFTY_TRI_CAGR.staleAfterDays,
    },
    {
      id: "doublingYears",
      value: `${doubling.toFixed(1)} years`,
      label: "Rule of 72 on the since-inception TRI CAGR",
      source: niftyTriCagr.source,
      sourceUrl: niftyTriCagr.sourceUrl,
      asOf: niftyTriCagr.asOf,
      kind: "derived",
      staleAfterDays: NIFTY_TRI_CAGR.staleAfterDays,
    },
    {
      id: "returnsConcentration",
      value: `${formatInrCompact(rc.fullyInvestedValue)} vs ${formatInrCompact(rc.missing15BestDaysValue)}`,
      label: "₹10 lakh in the Nifty 50 TRI, Jul 1999 to May 2026, fully invested vs missing the 15 best days",
      source: rc.source,
      sourceUrl: rc.sourceUrl,
      asOf: rc.asOf,
      kind: "sourced",
      staleAfterDays: rc.staleAfterDays,
    },
    {
      id: "deepOtmExpiryProbability",
      value: `≈${Math.round(DEEP_OTM_DELTA * 100)}%`,
      label: "Delta as a rough probability of expiring in the money: a 0.08-delta strike ≈ 8%",
      source: "Derived from the option's delta",
      sourceUrl: "",
      // Derived from a definition, not a dated observation: never stale.
      asOf: "2026-01-01",
      kind: "derived",
      staleAfterDays: Number.POSITIVE_INFINITY,
    },
    {
      id: "hurdleRateAssumption",
      // An assumption built on a 5-point premium doesn't warrant two decimals.
      value: `≈${Math.round(hurdle)}%`,
      label: "10-year G-Sec yield plus a 5% equity risk premium (our assumption)",
      source: gsec10y.source,
      sourceUrl: gsec10y.sourceUrl,
      asOf: gsec10y.asOf,
      kind: "assumption",
      staleAfterDays: HURDLE_STALE_AFTER_DAYS,
    },
    {
      id: "directPlanSavingsExample",
      value: `≈${formatInrCompact(savings.saving)}`,
      label: `₹${DIRECT_PLAN_INPUTS.monthlySip.toLocaleString("en-IN")} monthly SIP for ${DIRECT_PLAN_INPUTS.years} years at ${DIRECT_PLAN_INPUTS.grossReturn}% gross, direct plan vs a regular plan charging ${DIRECT_PLAN_INPUTS.expenseGapPct.toFixed(1)} pp more a year`,
      source: DIRECT_PLAN_INPUTS.source,
      sourceUrl: DIRECT_PLAN_INPUTS.sourceUrl,
      asOf: DIRECT_PLAN_INPUTS.asOf,
      kind: "derived",
      staleAfterDays: DIRECT_PLAN_INPUTS.staleAfterDays,
    },
  ];
}

/** Constants-only facts, for client modules that receive no table rows. */
export const MARKET_FACTS: MarketFact[] = buildMarketFacts();

export function getFact(facts: MarketFact[], id: FactId): MarketFact | undefined {
  return facts.find((f) => f.id === id);
}

export function isFresh(fact: MarketFact, now: Date = new Date()): boolean {
  return ageInDays(fact.asOf, now) <= fact.staleAfterDays;
}

/** A fact is shown only when it has a value and is within its freshness budget. */
export function isShowable(fact: MarketFact | undefined, now: Date = new Date()): fact is MarketFact {
  return Boolean(fact) && fact!.value !== "TBD" && isFresh(fact!, now);
}

/** "as of 30 Jun 2026 · Source: NSE Indices Ltd, Nifty 50 Factsheet" */
export function provenance(fact: MarketFact): string {
  const d = new Date(`${fact.asOf}T00:00:00Z`);
  const asOf = Number.isNaN(d.getTime())
    ? fact.asOf
    : d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
  const prefix = fact.kind === "assumption" ? "Assumption" : "Source";
  return `as of ${asOf} · ${prefix}: ${fact.source}`;
}

export function staleFacts(facts: MarketFact[] = MARKET_FACTS, now: Date = new Date()): MarketFact[] {
  return facts.filter((f) => !isFresh(f, now));
}
