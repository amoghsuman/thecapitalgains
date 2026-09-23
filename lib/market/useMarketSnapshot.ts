"use client";

import { useEffect, useState } from "react";
import { fetchMarket, isMarketError, MARKET_POLL_MS, type MarketSnapshot } from "@/lib/market/client";

export type MarketState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; data: MarketSnapshot };

// Polls /api/market every 60s while the tab is visible. Used by the ticker
// and every live widget so they all show the same snapshot.
export function useMarketSnapshot(): MarketState {
  const [state, setState] = useState<MarketState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    let controller: AbortController | null = null;

    async function load() {
      controller?.abort();
      controller = new AbortController();
      const result = await fetchMarket(controller.signal);
      if (cancelled) return;
      setState(isMarketError(result) ? { status: "error" } : { status: "ready", data: result });
    }

    function tick() {
      if (document.visibilityState === "visible") void load();
    }

    void load();
    const interval = window.setInterval(tick, MARKET_POLL_MS);
    document.addEventListener("visibilitychange", tick);

    return () => {
      cancelled = true;
      controller?.abort();
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", tick);
    };
  }, []);

  return state;
}
