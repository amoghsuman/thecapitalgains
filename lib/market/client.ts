// Browser-side contract for /api/market. Safe to import from client components.

export type MarketIndex = {
  name: string;
  last: number;
  changePct: number;
  asOf: string;
};

export type MarketSnapshot = {
  indices: MarketIndex[];
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
