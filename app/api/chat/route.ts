import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getAllCourses } from "@/lib/sanity/queries";
import {
  TUTOR_MODEL,
  TUTOR_MAX_OUTPUT_TOKENS,
  TUTOR_CAPS,
  TUTOR_QUOTA_COOLDOWN_MS,
  CAP_MESSAGES,
  FREE_TIER_NOTICE,
  nextIstMidnight,
  type CapReason,
} from "@/lib/ai/tutorLimits";

export const dynamic = "force-dynamic";

// ─── Limits ───────────────────────────────────────────────────────────────────
//
// Free tier only: one model, no thinking, short answers, and three caps
// (per user per hour, per user per day, global per day) enforced atomically
// in Postgres by check_chat_caps() (migration 20260924100000). Every request
// is logged to chat_usage_log for /api/admin/tutor-stats.

const MAX_TURNS = 12;
const MAX_MESSAGE_CHARS = 2000;
const MAX_SNIPPET_CHARS = 400;

// After a Gemini 429 / quota error nothing is sent upstream until this instant.
let quotaCooldownUntil = 0;

// ─── Types ────────────────────────────────────────────────────────────────────

type Role = "user" | "model";

interface ChatMessage {
  role: Role;
  content: string;
}

interface ChatContext {
  courseSlug?: string;
  courseTitle?: string;
  lessonSlug?: string;
  lessonTitle?: string;
  activeTextSnippet?: string;
}

interface RequestBody {
  messages?: unknown;
  context?: unknown;
}

interface CatalogCourse {
  title?: string | null;
  slug?: string | null;
  topics?: string[] | null;
}

// The shape of errors thrown by @google/genai that we care about.
interface UpstreamError {
  status?: number | string;
  code?: number | string;
  message?: string;
}

function asUpstreamError(err: unknown): UpstreamError {
  if (typeof err === "object" && err !== null) return err as UpstreamError;
  return { message: String(err) };
}

// Free-tier quota exhaustion (429 / RESOURCE_EXHAUSTED). Triggers the cooldown.
function isQuotaError(err: UpstreamError): boolean {
  const msg = err.message ?? "";
  return (
    err.status === 429 ||
    err.code === 429 ||
    err.status === "RESOURCE_EXHAUSTED" ||
    msg.includes("429") ||
    msg.includes("RESOURCE_EXHAUSTED") ||
    msg.toLowerCase().includes("quota")
  );
}

// ─── Caps and logging ─────────────────────────────────────────────────────────

type CapResult =
  | { allowed: true; remaining: { hour: number; day: number; global: number } }
  | { allowed: false; reason: CapReason; reset_at: string };

function isCapReason(v: unknown): v is CapReason {
  return v === "user_hour" || v === "user_day" || v === "global_day";
}

function parseCapResult(v: unknown): CapResult | null {
  if (typeof v !== "object" || v === null) return null;
  const r = v as { allowed?: unknown; reason?: unknown; reset_at?: unknown; remaining?: unknown };
  if (r.allowed === true) {
    const rem = (r.remaining ?? {}) as { hour?: unknown; day?: unknown; global?: unknown };
    const n = (x: unknown) => (typeof x === "number" ? x : 0);
    return { allowed: true, remaining: { hour: n(rem.hour), day: n(rem.day), global: n(rem.global) } };
  }
  if (r.allowed === false && isCapReason(r.reason) && typeof r.reset_at === "string") {
    return { allowed: false, reason: r.reason, reset_at: r.reset_at };
  }
  return null;
}

function cappedResponse(reason: CapReason, resetAt: string): NextResponse {
  const retryAfter = Math.max(1, Math.round((new Date(resetAt).getTime() - Date.now()) / 1000));
  return NextResponse.json(
    { error: CAP_MESSAGES[reason], reason, resetAt },
    { status: 429, headers: { "Retry-After": String(retryAfter) } }
  );
}

type LogStatus = "ok" | "empty" | "upstream_error" | "quota" | "capped";

// Service-role insert; the log table has no RLS policies on purpose.
async function logRequest(row: {
  userId: string;
  inputTokens: number | null;
  outputTokens: number | null;
  latencyMs: number;
  status: LogStatus;
}): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return;
  const admin = createSupabaseClient(url, key, { auth: { persistSession: false } });
  const { error } = await admin.from("chat_usage_log").insert({
    user_id: row.userId,
    model: TUTOR_MODEL,
    input_tokens: row.inputTokens,
    output_tokens: row.outputTokens,
    latency_ms: row.latencyMs,
    status: row.status,
  });
  if (error) console.error("[chat] log insert failed:", error.message);
}

// ─── Input validation ─────────────────────────────────────────────────────────

function parseMessages(input: unknown): ChatMessage[] | null {
  if (!Array.isArray(input) || input.length === 0) return null;
  const out: ChatMessage[] = [];
  for (const item of input) {
    if (typeof item !== "object" || item === null) return null;
    const { role, content } = item as { role?: unknown; content?: unknown };
    if ((role !== "user" && role !== "model") || typeof content !== "string") return null;
    const trimmed = content.trim();
    if (!trimmed) continue;
    out.push({ role, content: trimmed.slice(0, MAX_MESSAGE_CHARS) });
  }
  if (out.length === 0 || out[out.length - 1].role !== "user") return null;
  // Keep only the most recent turns.
  return out.slice(-MAX_TURNS);
}

function parseContext(input: unknown): ChatContext | undefined {
  if (typeof input !== "object" || input === null) return undefined;
  const raw = input as Record<string, unknown>;
  const str = (k: string) => (typeof raw[k] === "string" ? (raw[k] as string).slice(0, 300) : undefined);
  return {
    courseSlug: str("courseSlug"),
    courseTitle: str("courseTitle"),
    lessonSlug: str("lessonSlug"),
    lessonTitle: str("lessonTitle"),
    activeTextSnippet: typeof raw.activeTextSnippet === "string" ? raw.activeTextSnippet.slice(0, MAX_SNIPPET_CHARS) : undefined,
  };
}

// ─── System prompt ────────────────────────────────────────────────────────────

async function buildSystemInstruction(context: ChatContext | undefined): Promise<string> {
  let catalogSnippet = "Syllabus covers NSE/BSE Equity Investing, Options Greeks, Forensics, and Technical Execution.";
  try {
    const courses = (await getAllCourses()) as CatalogCourse[] | null;
    if (Array.isArray(courses) && courses.length > 0) {
      catalogSnippet = courses
        .slice(0, 15)
        .map((c) => `• ${c.title ?? ""} (Slug: ${c.slug ?? ""}, Topics: ${(c.topics ?? []).slice(0, 4).join(", ")})`)
        .join("\n");
    }
  } catch {
    // Sanity unavailable: the generic line above stands in.
  }

  let systemInstruction = `You are "Capital AI", an institutional financial markets tutor and research mentor for The Capital Gains (thecapitalgains.com) — an Indian market education academy dedicated to NSE & BSE equity research, derivatives, forensic accounting, and disciplined portfolio management.

CORE IDENTITY & TONE:
- Authoritative, educational, precise, disciplined, and rigorous (inspired by Howard Marks, Benjamin Graham, and institutional desks).
- Strictly adhere to educational mandates: NEVER provide personalized investment advice, stock tips, buy/sell targets, or guaranteed return promises (complying strictly with SEBI Research Analyst / Investment Adviser guidelines). Always frame explanations conceptually with empirical examples (e.g., using historical Nifty 50, Bank Nifty, Reliance, Infosys, or HDFC Bank cases).
- Format replies cleanly using Markdown with concise headings, bullet points, and code/formula snippets where helpful.
- Emphasize risk mitigation, margin of safety, and cost of capital before profit potential.
- ${FREE_TIER_NOTICE} If a student shares personal, account, broker or payment details, do not repeat them back; remind them once, briefly, not to share such details here.

AVAILABLE CURRICULUM SYLLABUS:
${catalogSnippet}
`;

  if (context?.courseTitle || context?.lessonTitle) {
    systemInstruction += `\nCURRENT STUDENT CONTEXT:
The student is currently studying:
- Course: ${context.courseTitle || context.courseSlug || "General Curriculum"}
- Current Lesson: ${context.lessonTitle || context.lessonSlug || "Overview"}
${context.activeTextSnippet ? `- Active Concept on Screen: "${context.activeTextSnippet}..."` : ""}
Ground your explanation primarily around this lesson topic while maintaining big-picture clarity.`;
  }

  return systemInstruction;
}

// ─── Handler ──────────────────────────────────────────────────────────────────

const UNAVAILABLE = NextResponse.json(
  { error: "The tutor is not available right now. Please try again later." },
  { status: 503 }
);

export async function POST(req: NextRequest) {
  // 1. Auth: a Supabase session is required.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to use the tutor." }, { status: 401 });
  }

  // 2. Configuration: fail closed with a generic message.
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return UNAVAILABLE;

  // 3. Input.
  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const messages = parseMessages(body.messages);
  if (!messages) {
    return NextResponse.json({ error: "A non-empty messages array ending with a user turn is required." }, { status: 400 });
  }
  const context = parseContext(body.context);

  // 4. Quota cooldown: after an upstream 429 the tutor rests without touching
  //    the caps, so users see the global message and Gemini is not hammered.
  if (Date.now() < quotaCooldownUntil) {
    return cappedResponse("global_day", nextIstMidnight());
  }

  // 5. Caps: 6/hour and 25/day per user, 800/day site-wide, one atomic call.
  const { data: capData, error: capError } = await supabase.rpc("check_chat_caps", {
    p_user_id: user.id,
    p_hour_limit: TUTOR_CAPS.perUserPerHour,
    p_day_limit: TUTOR_CAPS.perUserPerDay,
    p_global_limit: TUTOR_CAPS.globalPerDay,
  });
  const cap = parseCapResult(capData);
  if (capError || !cap) {
    console.error("[chat] cap check failed:", capError?.message ?? "unexpected result");
    return UNAVAILABLE;
  }
  if (!cap.allowed) {
    await logRequest({ userId: user.id, inputTokens: null, outputTokens: null, latencyMs: 0, status: "capped" });
    return cappedResponse(cap.reason, cap.reset_at);
  }

  // 6. Call the model: free-tier flash-lite only, thinking off, short answers.
  const ai = new GoogleGenAI({ apiKey });
  const systemInstruction = await buildSystemInstruction(context);
  const contents = messages.map((m) => ({ role: m.role, parts: [{ text: m.content }] }));
  const startedAt = Date.now();

  try {
    const response = await ai.models.generateContent({
      model: TUTOR_MODEL,
      contents,
      config: {
        systemInstruction,
        temperature: 0.4,
        maxOutputTokens: TUTOR_MAX_OUTPUT_TOKENS,
        // 3.x models take thinkingLevel (thinkingBudget: 0 is rejected); "minimal" is thinking off.
        thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
      },
    });
    const text = response.text ?? "";
    const usage = response.usageMetadata;
    const inputTokens = usage?.promptTokenCount ?? null;
    const outputTokens = usage?.candidatesTokenCount ?? null;
    await logRequest({
      userId: user.id,
      inputTokens,
      outputTokens,
      latencyMs: Date.now() - startedAt,
      status: text ? "ok" : "empty",
    });
    return NextResponse.json({
      text: text || "I was unable to generate an answer. Please rephrase your question.",
      modelUsed: TUTOR_MODEL,
      usage: { inputTokens, outputTokens },
      remaining: cap.remaining,
    });
  } catch (err: unknown) {
    const upstream = asUpstreamError(err);
    const quota = isQuotaError(upstream);
    console.error(`[chat] ${TUTOR_MODEL} failed${quota ? " (quota)" : ""}:`, upstream.message ?? upstream);
    await logRequest({
      userId: user.id,
      inputTokens: null,
      outputTokens: null,
      latencyMs: Date.now() - startedAt,
      status: quota ? "quota" : "upstream_error",
    });
    if (quota) {
      quotaCooldownUntil = Date.now() + TUTOR_QUOTA_COOLDOWN_MS;
      return cappedResponse("global_day", nextIstMidnight());
    }
    return UNAVAILABLE;
  }
}
