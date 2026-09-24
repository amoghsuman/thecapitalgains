import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { TUTOR_CAPS, TUTOR_MODEL } from "@/lib/ai/tutorLimits";

export const dynamic = "force-dynamic";

// Today's tutor usage (IST day) for admins: request count, distinct users,
// tokens and the headroom left under the global daily cap. Same admin check
// as app/(site)/admin/layout.tsx (profiles.is_admin), then service role reads.

type LogRow = { user_id: string; input_tokens: number | null; output_tokens: number | null; latency_ms: number; status: string };

function istDayStart(now: Date = new Date()): string {
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const ist = new Date(now.getTime() + istOffsetMs);
  return new Date(Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate()) - istOffsetMs).toISOString();
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return NextResponse.json({ error: "Service role not configured" }, { status: 503 });
  const admin = createSupabaseClient(url, key, { auth: { persistSession: false } });

  const dayStart = istDayStart();
  const [{ data: rows, error: logError }, { data: globalRow, error: capError }] = await Promise.all([
    admin
      .from("chat_usage_log")
      .select("user_id, input_tokens, output_tokens, latency_ms, status")
      .gte("created_at", dayStart),
    admin
      .from("chat_usage")
      .select("count")
      .eq("key", "global")
      .eq("bucket", "global_day")
      .eq("window_start", dayStart)
      .maybeSingle(),
  ]);
  if (logError || capError) {
    console.error("[tutor-stats] read failed:", logError?.message ?? capError?.message);
    return NextResponse.json({ error: "Read failed" }, { status: 500 });
  }

  const log = (rows ?? []) as LogRow[];
  const answered = log.filter((r) => r.status === "ok" || r.status === "empty");
  const byStatus: Record<string, number> = {};
  for (const r of log) byStatus[r.status] = (byStatus[r.status] ?? 0) + 1;
  const sum = (pick: (r: LogRow) => number | null) => answered.reduce((s, r) => s + (pick(r) ?? 0), 0);
  const globalCount = (globalRow as { count: number } | null)?.count ?? 0;

  return NextResponse.json({
    dayStartIst: dayStart,
    model: TUTOR_MODEL,
    requests: log.length,
    byStatus,
    distinctUsers: new Set(log.map((r) => r.user_id)).size,
    tokens: { input: sum((r) => r.input_tokens), output: sum((r) => r.output_tokens) },
    avgLatencyMs: answered.length ? Math.round(sum((r) => r.latency_ms) / answered.length) : null,
    globalCap: { limit: TUTOR_CAPS.globalPerDay, used: globalCount, headroom: Math.max(0, TUTOR_CAPS.globalPerDay - globalCount) },
    perUserCaps: { perHour: TUTOR_CAPS.perUserPerHour, perDay: TUTOR_CAPS.perUserPerDay },
  });
}
