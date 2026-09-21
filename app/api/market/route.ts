import { NextResponse } from "next/server";
import { getQuotes, QUOTE_SOURCE } from "@/lib/market/providers";
import type { MarketResponse } from "@/lib/market/client";

export const revalidate = 60;

const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
};

// Always answers 200: on upstream failure the body is { error: true } so the
// ticker can render its unavailable state instead of the page throwing.
export async function GET() {
  let body: MarketResponse;

  try {
    body = {
      indices: await getQuotes(),
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
