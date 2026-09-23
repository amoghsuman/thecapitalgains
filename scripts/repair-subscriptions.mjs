// HOW TO RUN (from the project root):
// 1. SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL are read from .env.local.
// 2. Dry run (prints the plan, writes nothing):
//      node scripts/repair-subscriptions.mjs
// 3. Real run:
//      node scripts/repair-subscriptions.mjs --apply
//
// WHAT THIS DOES:
// Requires migration 20260923140000_subscriptions_per_stack.sql (the `stack`
// column and UNIQUE (user_id, stack)). Before it, `subscriptions` was UNIQUE on
// user_id and the webhook upserted on user_id, so a Research purchase replaced
// a user's Learn row. For every user whose only row is a Research tier, this
// looks for evidence of a Learn plan in `payment_events` (the latest
// subscription.activated / subscription.charged event for a learner/pro tier)
// and inserts the missing Learn row from it. Users with no such evidence but
// listed in MANUAL below get the row as given there. `subscriptions` has no
// memo column, so each manual restoration also writes a `payment_events` row
// of event_type "manual.restore" whose payload carries the memo — queryable,
// without changing the subscriptions schema.

import { createClient } from "@supabase/supabase-js";
import { fileURLToPath } from "url";
import path from "path";

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
try {
  process.loadEnvFile(path.join(PROJECT_ROOT, ".env.local"));
} catch (err) {
  if (err.code !== "ENOENT") throw err;
}

const APPLY = process.argv.includes("--apply");
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) {
  console.error("ERROR: NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set.");
  process.exit(1);
}

const RESEARCH_TIERS = new Set(["newsletter", "essential", "premium"]);
const LEARN_TIERS = new Set(["learner", "pro"]);
const stackOf = (tier) => (RESEARCH_TIERS.has(tier) ? "research" : "learn");

// Manual restorations (audited by hand). Keyed by email.
const MANUAL = [
  {
    email: "amoghsuman@gmail.com",
    tier: "pro",
    status: "active",
    billing_cycle: "monthly",
    current_period_end: "2026-10-12T18:30:00+00:00",
    memo: "restored after overwrite on 2026-09-21",
  },
];

const supabase = createClient(URL, KEY, { auth: { persistSession: false } });

// ── Preconditions ────────────────────────────────────────────────────────────
const probe = await supabase.from("subscriptions").select("stack").limit(1);
const MIGRATED = !(probe.error && /stack/.test(probe.error.message));
if (probe.error && MIGRATED) throw probe.error;
if (!MIGRATED && APPLY) {
  console.error("ERROR: subscriptions.stack does not exist — apply migration 20260923140000_subscriptions_per_stack.sql first.");
  process.exit(1);
}

// ── Load state ───────────────────────────────────────────────────────────────
const { data: rawRows, error: rowsErr } = await supabase
  .from("subscriptions")
  .select(`id, user_id, ${MIGRATED ? "stack, " : ""}tier, status, billing_cycle, razorpay_subscription_id, razorpay_plan_id, razorpay_payment_id, current_period_start, current_period_end, created_at, updated_at`);
if (rowsErr) throw rowsErr;
// Pre-migration the stack is implied by the tier (exactly what the backfill sets).
const rows = rawRows.map((r) => ({ ...r, stack: r.stack ?? stackOf(r.tier) }));

const { data: events, error: evErr } = await supabase
  .from("payment_events")
  .select("user_id, event_type, subscription_id, payment_id, amount_paise, tier, billing_cycle, processed_at, payload")
  .in("event_type", ["subscription.activated", "subscription.charged"])
  .order("processed_at", { ascending: false });
if (evErr) throw evErr;

// Emails for the report and for MANUAL lookups.
const { data: usersPage, error: uErr } = await supabase.auth.admin.listUsers({ perPage: 1000 });
if (uErr) throw uErr;
const emailOf = Object.fromEntries(usersPage.users.map((u) => [u.id, u.email ?? ""]));
const idOf = Object.fromEntries(usersPage.users.map((u) => [u.email ?? "", u.id]));

const byUser = {};
for (const r of rows) (byUser[r.user_id] ??= []).push(r);

// ── Plan ─────────────────────────────────────────────────────────────────────
const inserts = [];
const memos = [];

console.log(`${APPLY ? "APPLY" : "DRY RUN"} — repair Learn rows overwritten by Research purchases\n`);
if (!MIGRATED) console.log("NOTE: migration 20260923140000 not applied yet — stack derived from tier for this plan; --apply will refuse until it is.\n");
console.log(`subscriptions: ${rows.length} rows across ${Object.keys(byUser).length} users · payment_events (activated/charged): ${events.length}\n`);

for (const [userId, userRows] of Object.entries(byUser)) {
  const email = emailOf[userId] ?? "(unknown)";
  const hasLearn = userRows.some((r) => r.stack === "learn");
  const research = userRows.filter((r) => r.stack === "research");
  if (hasLearn || research.length === 0) continue;

  // Evidence: the latest Learn-plan activation/charge for this user.
  const ev = events.find((e) => e.user_id === userId && LEARN_TIERS.has(e.tier));
  const manual = MANUAL.find((m) => m.email === email);

  const line = `${email.padEnd(28)} rows: ${userRows.map((r) => `${r.stack}/${r.tier}/${r.status}`).join(", ")}`;
  if (ev) {
    const entity = ev.payload?.payload?.subscription?.entity ?? {};
    const row = {
      user_id: userId,
      stack: "learn",
      tier: ev.tier,
      billing_cycle: ev.billing_cycle ?? "monthly",
      amount_paise: ev.amount_paise ?? null,
      status: "active",
      razorpay_subscription_id: ev.subscription_id ?? null,
      razorpay_plan_id: entity.plan_id ?? null,
      razorpay_payment_id: ev.payment_id ?? null,
      current_period_start: entity.current_start ? new Date(entity.current_start * 1000).toISOString() : ev.processed_at,
      current_period_end: entity.current_end ? new Date(entity.current_end * 1000).toISOString() : null,
    };
    inserts.push(row);
    console.log(`${line}\n  → insert learn/${row.tier} from payment_events ${ev.event_type} @ ${ev.processed_at} (sub ${row.razorpay_subscription_id ?? "—"}, ends ${row.current_period_end ?? "—"})`);
  } else if (manual) {
    const row = {
      user_id: userId,
      stack: "learn",
      tier: manual.tier,
      billing_cycle: manual.billing_cycle,
      amount_paise: null,
      status: manual.status,
      razorpay_subscription_id: null,
      razorpay_plan_id: null,
      razorpay_payment_id: null,
      current_period_start: null,
      current_period_end: manual.current_period_end,
    };
    inserts.push(row);
    memos.push({ user_id: userId, event_type: "manual.restore", tier: manual.tier, billing_cycle: manual.billing_cycle, payload: { memo: manual.memo, stack: "learn", current_period_end: manual.current_period_end } });
    console.log(`${line}\n  → insert learn/${row.tier} MANUAL (no payment_events evidence) · ends ${row.current_period_end} · memo "${manual.memo}"`);
  } else {
    console.log(`${line}\n  → no Learn evidence in payment_events and no manual entry; nothing to do`);
  }
}

// Manual entries whose user already has a Learn row, or is unknown, are reported.
for (const m of MANUAL) {
  const uid = idOf[m.email];
  if (!uid) { console.log(`\nMANUAL ${m.email}: user not found`); continue; }
  if ((byUser[uid] ?? []).some((r) => r.stack === "learn")) console.log(`\nMANUAL ${m.email}: already has a Learn row (${byUser[uid].filter((r) => r.stack === "learn").map((r) => `${r.tier}/${r.status}`).join(", ")}); skipped`);
}

console.log(`\nPlan: ${inserts.length} learn row insert(s), ${memos.length} memo event(s).`);
for (const r of inserts) console.log("  ", JSON.stringify(r));

if (!APPLY) {
  console.log("\nDry run only. Re-run with --apply to write.");
  process.exit(0);
}
if (inserts.length === 0) {
  console.log("Nothing to write.");
  process.exit(0);
}
const ins = await supabase.from("subscriptions").insert(inserts);
if (ins.error) throw ins.error;
if (memos.length) {
  const m = await supabase.from("payment_events").insert(memos);
  if (m.error) throw m.error;
}
console.log("Done.");
