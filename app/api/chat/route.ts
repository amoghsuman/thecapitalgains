import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@/lib/supabase/server";
import { getAllCourses } from "@/lib/sanity/queries";

export const dynamic = "force-dynamic";

// ─── Limits ───────────────────────────────────────────────────────────────────

const REQUESTS_PER_HOUR = 30;
const MAX_TURNS = 12;
const MAX_MESSAGE_CHARS = 2000;
const MAX_SNIPPET_CHARS = 400;

// Model is chosen here, never by the client. Flash first; the others are
// fallbacks for capacity errors only.
const MODEL_CANDIDATES = ["gemini-3.5-flash", "gemini-3.1-flash-lite"] as const;

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

function isCapacityError(err: UpstreamError): boolean {
  const msg = err.message ?? "";
  return (
    err.status === 503 ||
    err.code === 503 ||
    err.status === "UNAVAILABLE" ||
    msg.includes("503") ||
    msg.includes("high demand") ||
    msg.includes("overloaded") ||
    msg.includes("429") ||
    msg.includes("RESOURCE_EXHAUSTED")
  );
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

  // 4. Rate limit: 30 requests per user per hour, counted atomically in Postgres.
  const { data: allowed, error: usageError } = await supabase.rpc("increment_chat_usage", {
    p_user_id: user.id,
    p_limit: REQUESTS_PER_HOUR,
  });
  if (usageError) {
    console.error("[chat] usage check failed:", usageError.message);
    return UNAVAILABLE;
  }
  if (allowed !== true) {
    return NextResponse.json(
      { error: `You've reached the limit of ${REQUESTS_PER_HOUR} questions this hour. Please try again later.` },
      { status: 429, headers: { "Retry-After": "3600" } }
    );
  }

  // 5. Call the model, falling through the candidate list on capacity errors only.
  const ai = new GoogleGenAI({ apiKey });
  const systemInstruction = await buildSystemInstruction(context);
  const contents = messages.map((m) => ({ role: m.role, parts: [{ text: m.content }] }));

  let lastError: UpstreamError | null = null;
  for (const model of MODEL_CANDIDATES) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config: { systemInstruction, temperature: 0.4, maxOutputTokens: 1024 },
      });
      const text = response.text ?? "";
      return NextResponse.json({
        text: text || "I was unable to generate an answer. Please rephrase your question.",
        modelUsed: model,
      });
    } catch (err: unknown) {
      lastError = asUpstreamError(err);
      console.warn(`[chat] ${model} failed:`, lastError.message ?? lastError);
      if (!isCapacityError(lastError)) break;
      await new Promise((resolve) => setTimeout(resolve, 600));
    }
  }

  console.error("[chat] all models failed:", lastError?.message ?? lastError);
  return UNAVAILABLE;
}
