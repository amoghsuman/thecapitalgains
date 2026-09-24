import { NextResponse } from "next/server";
import {
  getQuotes,
  getExtendedQuotes,
  getDailyCloses,
  getNifty50Constituents,
  getConstituentWeights,
  HISTORY_SYMBOLS,
  QUOTE_SOURCE,
} from "@/lib/market/providers";
import { getReference, getReferenceHistory, preferFresher } from "@/lib/market/reference";
import { computeSentiment, describeSentimentInputs, toPublicSentiment } from "@/lib/market/sentiment";
import { repoRate as repoRateConstant } from "@/lib/market/constants";
import { GSEC_10Y_FALLBACK } from "@/lib/home/marketFacts";
import type { MarketResponse, MarketFlows } from "@/lib/market/client";

export const revalidate = 60;

const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
};

// Always answers 200: on upstream failure of the index quotes the body is
// { error: true } so the ticker can render its unavailable state instead of the
// page throwing. The extended fields (constituents, VIX, Brent, USD/INR) are
// each null when their own fetch fails; nothing is ever generated.
export async function GET() {
  let body: MarketResponse;

  try {
    // The constituent list (NSE CSV, daily) decides which symbols get priced.
    const list = await getNifty50Constituents();
    const [indices, extended, weights, reference, niftyCloses, bankNiftyCloses, vixCloses, fiiHistory] = await Promise.all([
      getQuotes(),
      getExtendedQuotes(list.constituents.map((c) => c.symbol)),
      getConstituentWeights(list),
      getReference(["repo_rate", "gsec_10y", "fii_net_cr", "dii_net_cr"]),
      getDailyCloses(HISTORY_SYMBOLS.nifty),
      getDailyCloses(HISTORY_SYMBOLS.bankNifty),
      getDailyCloses(HISTORY_SYMBOLS.vix),
      getReferenceHistory("fii_net_cr"),
    ]);

    const constituents = extended.constituents;
    const breadthPct =
      constituents && constituents.length > 0
        ? (constituents.filter((c) => c.changePct > 0).length / constituents.length) * 100
        : null;

    // Full breakdown is logged server-side only; the response carries the public shape.
    const sentimentFull = computeSentiment({
      niftyCloses,
      bankNiftyCloses,
      vixCloses,
      breadthPct,
      fiiNetHistory: fiiHistory.length > 0 ? fiiHistory.map((p) => p.value) : null,
    });
    console.log(`[sentiment] score=${sentimentFull.score ?? "n/a"} coverage=${sentimentFull.coverage} ${describeSentimentInputs(sentimentFull)}`);
    const sentiment = toPublicSentiment(sentimentFull);

    // Flows come only from market_reference (NSE blocks server fetches); both
    // rows must exist and share a session date, otherwise flows stay null.
    const fii = reference.fii_net_cr;
    const dii = reference.dii_net_cr;
    const flows: MarketFlows | null =
      fii && dii && fii.value !== null && dii.value !== null && fii.asOf && fii.asOf === dii.asOf
        ? { fii: fii.value, dii: dii.value, asOf: fii.asOf, source: fii.source ?? "NSE" }
        : null;

    const repo = preferFresher(reference.repo_rate, repoRateConstant);
    // The market_reference row wins when it is fresher than the hand-curated
    // FBIL constant (same rule as buildMarketFacts); gsec10y is therefore never
    // null unless neither exists.
    const gsec = preferFresher(reference.gsec_10y, GSEC_10Y_FALLBACK);

    body = {
      indices,
      sentiment,
      flows,
      reference: {
        repoRate: { value: repo.value, asOf: repo.asOf, source: repo.source },
        gsec10y: { value: gsec.value, asOf: gsec.asOf, source: gsec.source },
      },
      constituents: extended.constituents,
      weights: weights
        ? {
            constituents: weights.constituents.map((w) => ({ symbol: w.symbol, name: w.name, sector: w.sector, weight: w.weight })),
            weightsAsOf: weights.weightsAsOf,
            source: weights.source,
            approximate: true,
          }
        : null,
      indiaVix: extended.indiaVix,
      brent: extended.brent,
      usdInr: extended.usdInr,
      delayed: true,
      source: QUOTE_SOURCE,
      fetchedAt: new Date().toISOString(),
    };
  } catch (err: unknown) {
    console.error("[market] quotes failed:", err instanceof Error ? err.message : err);
    body = { error: true };
  }

  return NextResponse.json(body, { status: 200, headers: CACHE_HEADERS });
}
