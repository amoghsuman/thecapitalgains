import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getLearnerStats } from "@/lib/dashboard/stats";
import { getLearnerCatalog } from "@/lib/dashboard/catalog";

// Per-user and cookie-authenticated: never cache.
export const dynamic = "force-dynamic";

// The home page widget reads its numbers from here, so it runs the same
// getLearnerStats() as /dashboard with the same server-side Sanity catalogue.
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  try {
    const stats = await getLearnerStats(supabase, user.id, await getLearnerCatalog());
    return NextResponse.json(stats, { headers: { "Cache-Control": "private, no-store" } });
  } catch (err: unknown) {
    console.error("[learner-stats]", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "stats_unavailable" }, { status: 500 });
  }
}
