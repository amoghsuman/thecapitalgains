// Capital AI tutor limits and messages. Shared by /api/chat, the admin stats
// route and the chat window, so the numbers and the wording live in one place.
// Safe to import from client components.

// gemini-2.5-flash-lite returns 404 "no longer available to new users" for this key
// (checked 2026-09-24); Google points to 3.5-flash-lite as the free-tier lite model.
export const TUTOR_MODEL = "gemini-3.5-flash-lite";
export const TUTOR_MAX_OUTPUT_TOKENS = 700;

export const TUTOR_CAPS = {
  perUserPerHour: 6,
  perUserPerDay: 25,
  globalPerDay: 800,
} as const;

/** After a Gemini quota/429 error, no request is sent upstream for this long. */
export const TUTOR_QUOTA_COOLDOWN_MS = 10 * 60 * 1000;

export type CapReason = "user_hour" | "user_day" | "global_day";

export const CAP_MESSAGES: Record<CapReason, string> = {
  user_hour: "You've reached this hour's tutor limit; it resets at the top of the hour.",
  user_day: "You've reached today's tutor limit; it resets at midnight IST",
  global_day: "The tutor is resting for today; back at midnight IST",
};

export const FREE_TIER_NOTICE =
  "The tutor runs on Google's free tier; conversations may be used by Google to improve its models. Please don't share personal or account details.";

/** "12:00 am IST" style label for a reset instant. */
export function resetLabel(resetAt: string): string {
  const d = new Date(resetAt);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" })} IST`;
}

/** Next midnight IST as an ISO instant. */
export function nextIstMidnight(now: Date = new Date()): string {
  // IST is UTC+5:30 with no DST.
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const istNow = new Date(now.getTime() + istOffsetMs);
  const nextMidnightIst = Date.UTC(istNow.getUTCFullYear(), istNow.getUTCMonth(), istNow.getUTCDate() + 1);
  return new Date(nextMidnightIst - istOffsetMs).toISOString();
}
