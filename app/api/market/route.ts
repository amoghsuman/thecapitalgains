import { NextResponse } from "next/server";
import { getQuotes, getExtendedQuotes, QUOTE_SOURCE } from "@/lib/market/providers";
import { getReference, preferFresher } from "@/lib/market/reference";
import { repoRate as repoRateConstant } from "@/lib/market/constants";
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
    const [indices, extended, reference] = await Promise.all([
      getQuotes(),
      getExtendedQuotes(),
      getReference(["repo_rate", "gsec_10y", "fii_net_cr", "dii_net_cr"]),
    ]);

    // Flows come only from market_reference (NSE blocks server fetches); both
    // rows must exist and share a session date, otherwise flows stay null.
    const fii = reference.fii_net_cr;
    const dii = reference.dii_net_cr;
    const flows: MarketFlows | null =
      fii && dii && fii.value !== null && dii.value !== null && fii.asOf && fii.asOf === dii.asOf
        ? { fii: fii.value, dii: dii.value, asOf: fii.asOf, source: fii.source ?? "NSE" }
        : null;

    const repo = preferFresher(reference.repo_rate, repoRateConstant);
    const gsec = reference.gsec_10y;

    body = {
      indices,
      flows,
      reference: {
        repoRate: { value: repo.value, asOf: repo.asOf, source: repo.source },
        gsec10y:
          gsec && gsec.value !== null && gsec.asOf
            ? { value: gsec.value, asOf: gsec.asOf, source: gsec.source ?? "FBIL" }
            : null,
      },
      constituents: extended.constituents,
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
