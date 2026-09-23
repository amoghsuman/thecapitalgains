// Unit-style check that the Razorpay webhook keeps the Learn and Research
// rows independent. Drives lib/payments/applyRazorpayEvent.ts (the exact
// function the route calls after signature verification) against an
// in-memory fake of the `subscriptions` table — no database, no network.
//
//   node scripts/check-webhook-stacks.mjs
//
// Exits 1 on the first failed assertion.

import { pathToFileURL } from "url";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
// The module imports "@/lib/plans"; Node cannot resolve that alias, so plans
// is loaded first and the alias is served from a tiny loader hook.
const { register } = await import("node:module");
register(
  "data:text/javascript," +
    encodeURIComponent(`
      export async function resolve(specifier, context, next) {
        if (specifier.startsWith("@/")) {
          const abs = ${JSON.stringify(pathToFileURL(ROOT + "/").href)} + specifier.slice(2) + ".ts";
          return next(abs, context);
        }
        return next(specifier, context);
      }
    `),
  pathToFileURL(ROOT + "/")
);
const { applyRazorpayEvent } = await import(pathToFileURL(path.join(ROOT, "lib/payments/applyRazorpayEvent.ts")).href);

// ── Fake Supabase: just enough of the query builder the function uses ───────
function fakeSupabase(rows) {
  const table = rows;
  return {
    rows: table,
    from(name) {
      if (name !== "subscriptions") throw new Error("unexpected table " + name);
      return {
        async upsert(row, { onConflict }) {
          if (onConflict !== "user_id,stack") return { error: { message: "upsert must conflict on (user_id, stack), got " + onConflict } };
          const i = table.findIndex((r) => r.user_id === row.user_id && r.stack === row.stack);
          if (i >= 0) table[i] = { ...table[i], ...row };
          else table.push({ ...row });
          return { error: null };
        },
        update(patch) {
          const filters = [];
          const q = {
            eq(col, val) { filters.push([col, val]); return q; },
            then(resolve) {
              for (const r of table) if (filters.every(([c, v]) => r[c] === v)) Object.assign(r, patch);
              resolve({ error: null });
            },
          };
          return q;
        },
      };
    },
  };
}

const USER = "00000000-0000-4000-8000-000000000001";
const T = 1_790_000_000; // any epoch seconds

function event(name, planKey, subId, extra = {}) {
  return {
    event: name,
    payload: {
      subscription: { entity: { id: subId, plan_id: "plan_" + planKey, current_start: T, current_end: T + 30 * 86400, notes: { user_id: USER, plan_key: planKey }, ...extra } },
      payment: { entity: { id: "pay_" + subId, amount: 99900 } },
    },
  };
}

let failures = 0;
function assert(cond, msg) {
  console.log(`${cond ? "ok  " : "FAIL"} ${msg}`);
  if (!cond) failures++;
}
const learnRow = (db) => db.rows.find((r) => r.user_id === USER && r.stack === "learn");
const researchRow = (db) => db.rows.find((r) => r.user_id === USER && r.stack === "research");

// 1. Pro activation creates the Learn row.
const db = fakeSupabase([]);
let r = await applyRazorpayEvent(db, event("subscription.activated", "pro_monthly", "sub_pro"));
assert(r.error === null && r.stack === "learn", "pro activation targets the learn stack");
assert(learnRow(db)?.tier === "pro" && learnRow(db)?.status === "active", "learn row created as pro/active");
const learnBefore = JSON.stringify(learnRow(db));

// 2. Newsletter activation creates the Research row and leaves Learn untouched.
r = await applyRazorpayEvent(db, event("subscription.activated", "newsletter_monthly", "sub_news"));
assert(r.error === null && r.stack === "research", "newsletter activation targets the research stack");
assert(researchRow(db)?.tier === "newsletter", "research row created as newsletter");
assert(JSON.stringify(learnRow(db)) === learnBefore, "learn row unchanged after research activation");
assert(db.rows.length === 2, "exactly two rows: one per stack");

// 3. Research charge (renewal) still does not touch Learn.
r = await applyRazorpayEvent(db, event("subscription.charged", "newsletter_monthly", "sub_news", { current_end: T + 60 * 86400 }));
assert(JSON.stringify(learnRow(db)) === learnBefore, "learn row unchanged after research renewal");
assert(researchRow(db)?.current_period_end === new Date((T + 60 * 86400) * 1000).toISOString(), "research period end advanced");

// 4. Research cancellation / expiry only flips the Research row.
r = await applyRazorpayEvent(db, event("subscription.cancelled", "newsletter_monthly", "sub_news"));
assert(researchRow(db)?.status === "cancelled" && learnRow(db)?.status === "active", "research cancelled, learn still active");
r = await applyRazorpayEvent(db, event("payment.failed", "essential_monthly", "sub_ess"));
assert(learnRow(db)?.status === "active", "research payment failure leaves learn active");

// 5. And the mirror: a Learn cancellation leaves Research alone.
const db2 = fakeSupabase([]);
await applyRazorpayEvent(db2, event("subscription.activated", "learner_annual", "sub_l"));
await applyRazorpayEvent(db2, event("subscription.activated", "premium_monthly", "sub_p"));
await applyRazorpayEvent(db2, event("subscription.cancelled", "learner_annual", "sub_l"));
assert(learnRow(db2)?.status === "cancelled" && researchRow(db2)?.status === "active", "learn cancelled, research still active");
assert(learnRow(db2)?.billing_cycle === "annual", "annual plan key recorded as annual");

// 6. Unknown plan keys and missing user ids are ignored, not written.
r = await applyRazorpayEvent(db2, event("subscription.activated", "doubt_monthly", "sub_x"));
assert(r.action === "ignored" && db2.rows.length === 2, "non-subscription plan key ignored");
r = await applyRazorpayEvent(db2, { event: "subscription.activated", payload: { subscription: { entity: { id: "sub_y", notes: {} } } } });
assert(r.action === "ignored" && db2.rows.length === 2, "event without user_id ignored");

console.log(failures === 0 ? "\nAll checks passed." : `\n${failures} check(s) failed.`);
process.exitCode = failures === 0 ? 0 : 1;
