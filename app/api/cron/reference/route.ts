import { NextRequest, NextResponse } from "next/server";
import { MARKET_FACTS, staleFacts } from "@/lib/home/marketFacts";
import { SEBI_FO_STATS } from "@/lib/home/sebiStats";
import { niftyWeights, repoRate } from "@/lib/market/constants";
import { getReference, ageInDays, REFERENCE_KEYS, type ReferenceKey } from "@/lib/market/reference";

// Daily reference refresh + staleness audit. Scheduled by vercel.json at
// 03:00 UTC; Vercel calls it with `Authorization: Bearer <CRON_SECRET>`.
//
// Writes only values it could fetch AND parse; a failed source is skipped and
// reported, never filled with a guess.

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

type Upsert = {
  key: ReferenceKey;
  value: number;
  as_of: string;
  source: string;
  source_url: string;
};

type StaleItem = { kind: "fact" | "constant" | "reference"; id: string; asOf: string; staleAfterDays: number; ageDays: number };

// Freshness budgets for the market_reference rows themselves.
const REFERENCE_STALE_AFTER_DAYS: Record<ReferenceKey, number> = {
  repo_rate: 75,
  gsec_10y: 45,
  fii_net_cr: 7,
  dii_net_cr: 7,
  nifty_tri_cagr_inception: 400,
};

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

// ─── Sources ──────────────────────────────────────────────────────────────────

// RBI's homepage renders "Policy Repo Rate : 5.25%" in a server-side table.
async function fetchRepoRate(): Promise<Upsert> {
  const res = await fetch("https://www.rbi.org.in/", {
    headers: { "User-Agent": UA, Accept: "text/html" },
    cache: "no-store",
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new Error(`RBI HTTP ${res.status}`);
  const html = (await res.text()).replace(/\s+/g, " ");
  const m = html.match(/Policy Repo Rate[^0-9]{0,80}?(\d{1,2}\.\d{1,2})\s*%/i);
  if (!m) throw new Error("repo rate not found on page");
  const value = Number(m[1]);
  if (!(value > 2 && value < 12)) throw new Error(`implausible repo rate ${value}`);
  return {
    key: "repo_rate",
    value,
    as_of: today(),
    source: "RBI current rates (homepage)",
    source_url: "https://www.rbi.org.in",
  };
}

// The Nifty 50 factsheet is a PDF linked from the factsheets page. The
// since-inception TRI CAGR is only inside the PDF, which this route cannot
// parse, so this succeeds only if the HTML page itself ever carries the figure.
async function fetchNiftyTriCagr(): Promise<Upsert> {
  const res = await fetch("https://www.niftyindices.com/reports/factsheets", {
    headers: { "User-Agent": UA, Accept: "text/html" },
    cache: "no-store",
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new Error(`niftyindices HTTP ${res.status}`);
  const html = (await res.text()).replace(/\s+/g, " ");
  const m = html.match(/Nifty 50[^%]{0,200}?Since Inception[^0-9]{0,60}?(\d{1,2}\.\d{2})\s*%/i);
  if (!m) throw new Error("since-inception TRI figure is inside the PDF, not on the page");
  const value = Number(m[1]);
  if (!(value > 5 && value < 25)) throw new Error(`implausible CAGR ${value}`);
  return {
    key: "nifty_tri_cagr_inception",
    value,
    as_of: today(),
    source: "NSE Indices Ltd, Nifty 50 Factsheet",
    source_url: "https://niftyindices.com",
  };
}

// ─── Write ────────────────────────────────────────────────────────────────────

async function upsert(rows: Upsert[]): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("SUPABASE_SERVICE_ROLE_KEY not configured");
  const res = await fetch(`${url}/rest/v1/market_reference?on_conflict=key`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify(rows),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`upsert HTTP ${res.status}: ${await res.text()}`);
}

// ─── Staleness audit ──────────────────────────────────────────────────────────

async function auditStaleness(now: Date): Promise<StaleItem[]> {
  const stale: StaleItem[] = [];

  for (const f of staleFacts(MARKET_FACTS, now)) {
    stale.push({ kind: "fact", id: f.id, asOf: f.asOf, staleAfterDays: f.staleAfterDays, ageDays: Math.floor(ageInDays(f.asOf, now)) });
  }
  for (const s of SEBI_FO_STATS) {
    const age = ageInDays(s.asOf, now);
    if (age > s.staleAfterDays) stale.push({ kind: "fact", id: `sebiStats.${s.id}`, asOf: s.asOf, staleAfterDays: s.staleAfterDays, ageDays: Math.floor(age) });
  }
  for (const [id, c] of [
    ["constants.repoRate", repoRate],
    ["constants.niftyWeights", niftyWeights],
  ] as const) {
    const age = ageInDays(c.asOf, now);
    if (age > c.staleAfterDays) stale.push({ kind: "constant", id, asOf: c.asOf, staleAfterDays: c.staleAfterDays, ageDays: Math.floor(age) });
  }

  const reference = await getReference(REFERENCE_KEYS);
  for (const key of REFERENCE_KEYS) {
    const row = reference[key];
    const budget = REFERENCE_STALE_AFTER_DAYS[key];
    if (!row) {
      stale.push({ kind: "reference", id: key, asOf: "missing", staleAfterDays: budget, ageDays: Infinity });
      continue;
    }
    const age = ageInDays(row.asOf, now);
    if (age > budget) stale.push({ kind: "reference", id: key, asOf: row.asOf ?? "missing", staleAfterDays: budget, ageDays: Math.floor(age) });
  }
  return stale;
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const written: string[] = [];
  const skipped: string[] = [];
  const rows: Upsert[] = [];

  for (const [name, fetcher] of [
    ["repo_rate", fetchRepoRate],
    ["nifty_tri_cagr_inception", fetchNiftyTriCagr],
  ] as const) {
    try {
      rows.push(await fetcher());
    } catch (err: unknown) {
      skipped.push(`${name}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  if (rows.length > 0) {
    try {
      await upsert(rows);
      written.push(...rows.map((r) => `${r.key}=${r.value} (as of ${r.as_of})`));
    } catch (err: unknown) {
      skipped.push(`upsert: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  const stale = await auditStaleness(now);

  // There is no admin-notification path on /api/newsletter (it only stores
  // subscriber emails), so stale items are logged at error level and returned.
  if (stale.length > 0) {
    const summary = stale.map((s) => `${s.kind}:${s.id} (as of ${s.asOf}, budget ${s.staleAfterDays}d)`).join("; ");
    console.error(`[cron/reference] STALE DATA — ${summary}`);
  }

  return NextResponse.json({
    ok: true,
    ranAt: now.toISOString(),
    written,
    skipped,
    stale,
    notified: false,
  });
}
