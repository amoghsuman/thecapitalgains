// Server-side reader for the `market_reference` table: slow-moving reference
// numbers (repo rate, 10-year G-Sec yield, FII/DII flows, Nifty TRI CAGR)
// refreshed by scripts/refresh-market-reference.mjs and
// app/api/cron/reference/route.ts. Public read via RLS; writes need the
// service role. Reads go through PostgREST directly so Next's fetch cache can
// hold them for an hour.

export const REFERENCE_KEYS = [
  "repo_rate",
  "gsec_10y",
  "fii_net_cr",
  "dii_net_cr",
  "nifty_tri_cagr_inception",
] as const;

export type ReferenceKey = (typeof REFERENCE_KEYS)[number];

export type ReferenceValue = {
  key: ReferenceKey;
  value: number | null;
  valueText: string | null;
  /** YYYY-MM-DD */
  asOf: string | null;
  source: string | null;
  sourceUrl: string | null;
  updatedAt: string | null;
};

export type ReferenceMap = Partial<Record<ReferenceKey, ReferenceValue>>;

type Row = {
  key: string;
  value: number | string | null;
  value_text: string | null;
  as_of: string | null;
  source: string | null;
  source_url: string | null;
  updated_at: string | null;
};

export const REFERENCE_REVALIDATE_SECONDS = 3600;

function isReferenceKey(k: string): k is ReferenceKey {
  return (REFERENCE_KEYS as readonly string[]).includes(k);
}

export async function getReference(keys: readonly ReferenceKey[]): Promise<ReferenceMap> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey || keys.length === 0) return {};

  const params = new URLSearchParams({
    select: "key,value,value_text,as_of,source,source_url,updated_at",
    key: `in.(${keys.join(",")})`,
  });

  try {
    const res = await fetch(`${url}/rest/v1/market_reference?${params.toString()}`, {
      headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
      next: { revalidate: REFERENCE_REVALIDATE_SECONDS },
    });
    if (!res.ok) {
      console.error("[reference] read failed:", res.status);
      return {};
    }
    const rows = (await res.json()) as Row[];
    const out: ReferenceMap = {};
    for (const row of rows) {
      if (!isReferenceKey(row.key)) continue;
      const num = row.value === null ? null : Number(row.value);
      out[row.key] = {
        key: row.key,
        value: Number.isFinite(num) ? num : null,
        valueText: row.value_text,
        asOf: row.as_of,
        source: row.source,
        sourceUrl: row.source_url,
        updatedAt: row.updated_at,
      };
    }
    return out;
  } catch (err: unknown) {
    console.error("[reference] read failed:", err instanceof Error ? err.message : err);
    return {};
  }
}

/** A dated number from either the table or a hand-curated constant. */
export type DatedValue = {
  value: number;
  /** YYYY-MM-DD */
  asOf: string;
  source: string;
  sourceUrl: string;
  origin: "table" | "constant";
};

/**
 * Prefer the table row when it has a numeric value and is at least as fresh as
 * the constant; otherwise fall back to the constant. Always carries an as-of.
 */
export function preferFresher(
  row: ReferenceValue | undefined,
  constant: { value: number; asOf: string; source: string; sourceUrl: string }
): DatedValue {
  if (row && row.value !== null && row.asOf && row.asOf >= constant.asOf) {
    return {
      value: row.value,
      asOf: row.asOf,
      source: row.source ?? constant.source,
      sourceUrl: row.sourceUrl ?? constant.sourceUrl,
      origin: "table",
    };
  }
  return { ...constant, origin: "constant" };
}

/** Days between an as-of date and now; Infinity when the date is unparseable. */
export function ageInDays(asOf: string | null | undefined, now: Date = new Date()): number {
  if (!asOf) return Infinity;
  const t = Date.parse(`${asOf}T00:00:00Z`);
  if (Number.isNaN(t)) return Infinity;
  return (now.getTime() - t) / 86_400_000;
}

// ─── Dated history rows ───────────────────────────────────────────────────────
//
// The table is keyed one-row-per-key, so a series is stored as dated copies:
// "fii_net_cr:2026-09-22". scripts/refresh-market-reference.mjs writes one per
// session alongside the current row; the sentiment index reads them back.

export type ReferencePoint = { asOf: string; value: number };

export async function getReferenceHistory(key: ReferenceKey, limit = 300): Promise<ReferencePoint[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return [];

  const params = new URLSearchParams({
    select: "key,value,as_of",
    key: `like.${key}:*`,
    order: "as_of.asc",
    limit: String(limit),
  });

  try {
    const res = await fetch(`${url}/rest/v1/market_reference?${params.toString()}`, {
      headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
      next: { revalidate: REFERENCE_REVALIDATE_SECONDS },
    });
    if (!res.ok) return [];
    const rows = (await res.json()) as Array<{ key: string; value: number | string | null; as_of: string | null }>;
    const out: ReferencePoint[] = [];
    for (const r of rows) {
      const v = r.value === null ? NaN : Number(r.value);
      if (Number.isFinite(v) && r.as_of) out.push({ asOf: r.as_of, value: v });
    }
    return out;
  } catch {
    return [];
  }
}
