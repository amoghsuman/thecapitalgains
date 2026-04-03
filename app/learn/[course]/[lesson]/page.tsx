"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

// ─── Types ───────────────────────────────────────────────────────────────────

type LessonMeta = { slug: string; title: string; duration: string; free: boolean };
type Chapter = { title: string; lessons: LessonMeta[] };
type CourseData = { title: string; price: number; chapters: Chapter[] };

type Block =
  | { type: "intro"; text: string }
  | { type: "h2"; text: string }
  | { type: "p"; text: string }
  | { type: "insight"; text: string }
  | { type: "warning"; text: string }
  | { type: "numbered-list"; items: { title: string; body: string }[] }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "exercise"; title: string; steps: string[] };

type LessonContent = {
  title: string;
  duration: string;
  free: boolean;
  blocks: Block[];
};

// ─── Course Data ─────────────────────────────────────────────────────────────

const courseData: Record<string, CourseData> = {
  "options-trading-from-zero": {
    title: "Options Trading from Zero",
    price: 1499,
    chapters: [
      {
        title: "Chapter 1 — The Mental Model",
        lessons: [
          { slug: "why-most-retail-traders-lose", title: "Why Most Retail Traders Lose", duration: "8 min", free: true },
          { slug: "options-basics", title: "Options Basics: What You're Actually Buying", duration: "12 min", free: true },
          { slug: "buyer-vs-seller-asymmetry", title: "The Buyer vs Seller Asymmetry", duration: "10 min", free: false },
        ],
      },
      {
        title: "Chapter 2 — The Greeks",
        lessons: [
          { slug: "delta-explained", title: "Delta: Directional Exposure Explained", duration: "11 min", free: false },
          { slug: "theta-time-decay", title: "Theta: Time Decay & Premium Erosion", duration: "10 min", free: false },
          { slug: "iv-and-vega", title: "IV & Vega: Trading Volatility, Not Just Direction", duration: "13 min", free: false },
        ],
      },
      {
        title: "Chapter 3 — Reading the Chain",
        lessons: [
          { slug: "reading-options-chain", title: "How to Read the NSE Options Chain", duration: "14 min", free: false },
          { slug: "oi-pcr-max-pain", title: "OI, PCR and Max Pain — What They Actually Mean", duration: "12 min", free: false },
          { slug: "pre-trade-checklist", title: "Building Your Pre-Trade Checklist", duration: "9 min", free: false },
        ],
      },
      {
        title: "Chapter 4 — Strategies & Risk",
        lessons: [
          { slug: "bull-call-spread", title: "Bull Call Spread: Setup and Exit Rules", duration: "15 min", free: false },
          { slug: "iron-condor", title: "Iron Condor: When and How to Use It", duration: "14 min", free: false },
          { slug: "position-sizing", title: "Position Sizing for Options Traders", duration: "11 min", free: false },
        ],
      },
    ],
  },
};

// ─── Lesson Content ───────────────────────────────────────────────────────────

const lessonContent: Record<string, LessonContent> = {
  "why-most-retail-traders-lose": {
    title: "Why Most Retail Traders Lose",
    duration: "8 min",
    free: true,
    blocks: [
      {
        type: "intro",
        text: "Before we talk about strategies, charts, or Greeks — we need to talk about why 90% of retail traders blow up their accounts within 12 months. The answer isn't bad luck. It's structural.",
      },
      { type: "h2", text: "The Casino is Inside Your Head" },
      {
        type: "p",
        text: "Retail traders lose not because markets are random, but because they approach structured probability games with unstructured psychology. Every trade is a bet on an outcome. The edge comes from knowing when the odds are in your favour — not from gut feel.",
      },
      {
        type: "insight",
        text: "Institutions don't have better information than you. They have better process. That's the entire edge.",
      },
      { type: "h2", text: "The Three Killers" },
      {
        type: "numbered-list",
        items: [
          {
            title: "Position sizing",
            body: "Putting 40% of capital in a single trade. One loss wipes months of gains.",
          },
          {
            title: "Revenge trading",
            body: "Doubling down after a loss to recover. The market doesn't owe you a recovery.",
          },
          {
            title: "No exit plan",
            body: "Entering a trade with hope, exiting on panic. Always define your stop before entry.",
          },
        ],
      },
      {
        type: "exercise",
        title: "Apply It",
        steps: [
          "Open your last 10 trades in your broker app.",
          "For each trade, note: Did you have a stop loss defined before entry? Y/N",
          "Calculate your hit rate. If above 50% but still losing — your sizing is the problem.",
        ],
      },
    ],
  },

  "options-basics": {
    title: "Options Basics: What You're Actually Buying",
    duration: "12 min",
    free: true,
    blocks: [
      {
        type: "intro",
        text: "An option is not a stock. It's a contract that gives you the right — not the obligation — to buy or sell an asset at a fixed price before a fixed date.",
      },
      { type: "h2", text: "The Two Types" },
      {
        type: "table",
        headers: ["", "Call Option", "Put Option"],
        rows: [
          ["What you're buying", "Right to BUY at strike price", "Right to SELL at strike price"],
          ["Profit direction", "Stock goes UP", "Stock goes DOWN"],
          ["Max loss (buyer)", "Premium paid", "Premium paid"],
          ["Max loss (seller)", "Unlimited", "Theoretically unlimited"],
        ],
      },
      { type: "h2", text: "The Strike Price Mental Model" },
      {
        type: "p",
        text: "The strike price is the price at which you have the right to buy or sell. If you buy a Call at a strike of ₹500, you can buy the stock at ₹500 — even if it's trading at ₹600 in the market. That ₹100 gap is your intrinsic value.",
      },
      {
        type: "warning",
        text: "Buying deep OTM options because they're cheap is one of the most common beginner mistakes. Cheap premium = low probability of profit.",
      },
      {
        type: "exercise",
        title: "Apply It",
        steps: [
          "Open the NSE option chain for NIFTY (nseindia.com → Derivatives → Option Chain).",
          "Find the current At-The-Money (ATM) strike — the one closest to the current index price.",
          "Note the premium for that strike Call and Put. Observe that they are roughly equal — this is Put-Call parity at work.",
        ],
      },
    ],
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getAllLessons(course: CourseData): LessonMeta[] {
  return course.chapters.flatMap((ch) => ch.lessons);
}

// ─── Exercise Block (own checkbox state) ─────────────────────────────────────

function ExerciseBlock({ title, steps }: { title: string; steps: string[] }) {
  const [checked, setChecked] = useState<Set<number>>(new Set());

  function toggle(i: number) {
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  const allDone = checked.size === steps.length;

  return (
    <div className={`rounded-xl p-6 mt-10 border-2 ${allDone ? "border-[#1A7A4A] bg-[#E8F5EE]" : "border-[#0F2348] bg-white"}`}>
      <div className={`font-mono text-[11px] tracking-widest uppercase mb-4 ${allDone ? "text-[#1A7A4A]" : "text-[#0F2348]"}`}>
        Exercise · {title}
      </div>
      <div className="flex flex-col gap-3">
        {steps.map((step, i) => (
          <label key={i} className="flex items-start gap-3 cursor-pointer group">
            <div
              onClick={() => toggle(i)}
              className={`mt-0.5 w-5 h-5 flex-shrink-0 rounded border-2 flex items-center justify-center transition-all ${
                checked.has(i)
                  ? "border-[#1A7A4A] bg-[#1A7A4A]"
                  : "border-[rgba(15,35,72,0.25)] group-hover:border-[#D4860A]"
              }`}
            >
              {checked.has(i) && (
                <span className="text-white text-[11px] leading-none">✓</span>
              )}
            </div>
            <span
              onClick={() => toggle(i)}
              className={`text-[14px] leading-relaxed select-none ${
                checked.has(i) ? "text-[#9494A8] line-through" : "text-[#5A5A72]"
              }`}
            >
              {step}
            </span>
          </label>
        ))}
      </div>
      {allDone && (
        <div className="mt-4 font-mono text-[12px] text-[#1A7A4A] font-medium">
          ✓ Exercise complete — move on to the next lesson
        </div>
      )}
    </div>
  );
}

// ─── Block Renderer ───────────────────────────────────────────────────────────

function BlockRenderer({ blocks }: { blocks: Block[] }) {
  return (
    <div className="flex flex-col gap-5">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "intro":
            return (
              <p
                key={i}
                className="text-[17px] text-[#1A1A2E] leading-relaxed italic border-l-[3px] border-[#D4860A] pl-5 py-1"
              >
                {block.text}
              </p>
            );
          case "h2":
            return (
              <h2 key={i} className="font-serif text-[22px] font-bold text-[#0F2348] mt-4 mb-0">
                {block.text}
              </h2>
            );
          case "p":
            return (
              <p key={i} className="text-[15px] text-[#5A5A72] leading-relaxed">
                {block.text}
              </p>
            );
          case "insight":
            return (
              <div key={i} className="bg-[#FDF3E3] border border-[rgba(212,134,10,0.25)] rounded-xl px-5 py-4">
                <div className="font-mono text-[10px] text-[#D4860A] tracking-widest uppercase mb-2">Key Insight</div>
                <p className="text-[14px] text-[#0F2348] leading-relaxed font-medium">{block.text}</p>
              </div>
            );
          case "warning":
            return (
              <div key={i} className="bg-[#FEF2F2] border border-[rgba(220,38,38,0.2)] rounded-xl px-5 py-4">
                <div className="font-mono text-[10px] text-[#DC2626] tracking-widest uppercase mb-2">⚠ Watch Out</div>
                <p className="text-[14px] text-[#7F1D1D] leading-relaxed">{block.text}</p>
              </div>
            );
          case "numbered-list":
            return (
              <div key={i} className="flex flex-col gap-3">
                {block.items.map((item, j) => (
                  <div key={j} className="flex gap-4 bg-white border border-[rgba(15,35,72,0.1)] rounded-xl p-4">
                    <div className="font-mono text-[22px] font-medium text-[#EDE9E0] flex-shrink-0 leading-none mt-1">
                      {String(j + 1).padStart(2, "0")}
                    </div>
                    <div>
                      <div className="text-[14px] font-medium text-[#0F2348] mb-1">{item.title}</div>
                      <div className="text-[13px] text-[#5A5A72] leading-relaxed">{item.body}</div>
                    </div>
                  </div>
                ))}
              </div>
            );
          case "table":
            return (
              <div key={i} className="rounded-xl overflow-hidden border border-[rgba(15,35,72,0.1)]">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="bg-[#0F2348]">
                      {block.headers.map((h, j) => (
                        <th key={j} className="px-4 py-3 text-left font-mono text-[11px] text-white tracking-widest uppercase">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, j) => (
                      <tr key={j} className={j % 2 === 0 ? "bg-white" : "bg-[#F4F1EB]"}>
                        {row.map((cell, k) => (
                          <td key={k} className={`px-4 py-3 leading-snug ${k === 0 ? "font-medium text-[#0F2348]" : "text-[#5A5A72]"}`}>
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          case "exercise":
            return <ExerciseBlock key={i} title={block.title} steps={block.steps} />;
          default:
            return null;
        }
      })}
    </div>
  );
}

// ─── Locked Lesson State ──────────────────────────────────────────────────────

function LockedLesson({ price }: { price: number }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
      <div className="w-16 h-16 bg-[#F4F1EB] rounded-full flex items-center justify-center text-[28px] mb-5">
        🔒
      </div>
      <h2 className="font-serif text-[22px] font-bold text-[#0F2348] mb-2">
        Enroll to access this lesson
      </h2>
      <p className="text-[15px] text-[#5A5A72] mb-8 max-w-sm">
        This lesson is part of the full course. Enroll once for lifetime access.
      </p>
      <button className="bg-[#D4860A] hover:bg-[#F0A020] text-white rounded-lg px-8 py-3.5 text-[15px] font-medium transition-colors mb-3">
        Enroll Now — ₹{price.toLocaleString("en-IN")}
      </button>
      <Link href="/pricing" className="font-mono text-[12px] text-[#9494A8] hover:text-[#D4860A] transition-colors">
        Or subscribe from ₹299/month →
      </Link>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ReaderPage() {
  const params = useParams();
  const courseSlug = typeof params.course === "string" ? params.course : "";
  const lessonSlug = typeof params.lesson === "string" ? params.lesson : "";

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [activeLesson, setActiveLesson] = useState(lessonSlug);

  useEffect(() => {
    if (lessonSlug) setActiveLesson(lessonSlug);
  }, [lessonSlug]);

  const course = courseData[courseSlug];
  if (!course) {
    return (
      <div className="flex items-center justify-center h-64 text-[#5A5A72]">
        Course not found.{" "}
        <Link href="/courses" className="text-[#D4860A] ml-1">
          Browse courses →
        </Link>
      </div>
    );
  }

  const allLessons = getAllLessons(course);
  const lessonIndex = allLessons.findIndex((l) => l.slug === activeLesson);
  const nextLesson = lessonIndex < allLessons.length - 1 ? allLessons[lessonIndex + 1] : null;
  const prevLesson = lessonIndex > 0 ? allLessons[lessonIndex - 1] : null;
  const progressPct = allLessons.length > 0 ? Math.round((completedLessons.size / allLessons.length) * 100) : 0;
  const content = lessonContent[activeLesson];

  if (!lessonSlug) return <div className="flex-1 flex items-center justify-center text-[#9494A8] font-mono text-[13px]">Loading...</div>

  const currentMeta = allLessons.find((l) => l.slug === activeLesson) || allLessons.find((l) => l.slug === lessonSlug);
  const isLocked = currentMeta ? !currentMeta.free : true;

  function markCompleteAndNext() {
    setCompletedLessons((prev) => new Set([...prev, activeLesson]));
    if (nextLesson) setActiveLesson(nextLesson.slug);
  }

  return (
    <div className="flex overflow-hidden bg-[#FAFAF7]" style={{ height: "calc(100vh - 96px)" }}>

      {/* ── SIDEBAR ── */}
      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } absolute lg:relative lg:translate-x-0 z-30 flex-shrink-0 flex flex-col bg-white border-r border-[rgba(15,35,72,0.1)] overflow-y-auto transition-transform duration-200`}
        style={{ width: 280, height: "100%" }}
      >
        {/* Back + course info */}
        <div className="px-4 py-4 border-b border-[rgba(15,35,72,0.07)]">
          <Link
            href="/courses"
            className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[#9494A8] hover:text-[#D4860A] transition-colors mb-3"
          >
            ← All courses
          </Link>
          <div className="font-serif text-[14px] text-[#0F2348] leading-snug mb-1">
            {course.title}
          </div>
          <div className="font-mono text-[11px] text-[#9494A8]">
            {allLessons.length} lessons
          </div>
        </div>

        {/* Progress bar */}
        <div className="px-4 py-3 border-b border-[rgba(15,35,72,0.07)]">
          <div className="flex justify-between items-center mb-1.5">
            <span className="font-mono text-[10px] text-[#9494A8] tracking-widest uppercase">Progress</span>
            <span className="font-mono text-[11px] text-[#0F2348]">{progressPct}%</span>
          </div>
          <div className="h-[3px] bg-[#EDE9E0] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#D4860A] rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Chapters + lessons */}
        <div className="flex-1 py-2">
          {course.chapters.map((chapter) => (
            <div key={chapter.title} className="mb-1">
              <div className="px-4 py-2 font-mono text-[9px] text-[#9494A8] tracking-widest uppercase">
                {chapter.title}
              </div>
              {chapter.lessons.map((lesson) => {
                const isActive = lesson.slug === activeLesson;
                const isDone = completedLessons.has(lesson.slug);
                const isAccessible = lesson.free;

                return (
                  <button
                    key={lesson.slug}
                    onClick={() => setActiveLesson(lesson.slug)}
                    className={`w-full text-left flex items-start gap-3 px-4 py-2.5 border-l-[3px] transition-all ${
                      isActive
                        ? "border-[#D4860A] bg-[#F4F1EB]"
                        : "border-transparent hover:bg-[#F4F1EB]/60"
                    }`}
                  >
                    {/* Circle indicator */}
                    <div
                      className={`mt-0.5 w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] ${
                        isDone
                          ? "bg-[#1A7A4A] text-white"
                          : isActive
                          ? "bg-[#D4860A] text-white"
                          : isAccessible
                          ? "border-2 border-[rgba(15,35,72,0.2)] text-[#9494A8]"
                          : "bg-[#EDE9E0] text-[#9494A8]"
                      }`}
                    >
                      {isDone ? "✓" : isActive ? "▶" : isAccessible ? "" : "🔒"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-[13px] leading-snug ${
                          isActive ? "text-[#0F2348] font-medium" : isDone ? "text-[#9494A8]" : "text-[#5A5A72]"
                        }`}
                      >
                        {lesson.title}
                      </div>
                      <div className="font-mono text-[10px] text-[#9494A8] mt-0.5">{lesson.duration}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Enroll card */}
        <div className="p-4 border-t border-[rgba(15,35,72,0.08)] bg-[#F4F1EB]">
          <div className="font-mono text-[10px] text-[#9494A8] tracking-widest uppercase mb-1">Full Course</div>
          <div className="font-mono text-[20px] font-medium text-[#0F2348] mb-3">
            ₹{course.price.toLocaleString("en-IN")}
            <span className="text-[12px] font-normal text-[#9494A8] ml-1">one-time</span>
          </div>
          <button className="w-full bg-[#D4860A] hover:bg-[#F0A020] text-white rounded-lg py-2.5 text-[13px] font-medium transition-colors">
            Enroll Now
          </button>
        </div>
      </aside>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-20 bg-black/30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── MAIN PANEL ── */}
      <div className="flex-1 flex flex-col min-w-0 h-full">

        {/* Top bar */}
        <div className="flex-shrink-0 flex items-center justify-between px-5 py-3 bg-white border-b border-[rgba(15,35,72,0.1)]">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-[#5A5A72] hover:text-[#0F2348] transition-colors"
              aria-label="Toggle sidebar"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M2 5h16M2 10h16M2 15h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-20 bg-[#EDE9E0] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#D4860A] rounded-full transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <span className="font-mono text-[11px] text-[#9494A8]">{progressPct}% complete</span>
            </div>
          </div>
          <span className="font-mono text-[12px] text-[#0F2348] hidden sm:block">The Capital Gains</span>
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto">
          {isLocked ? (
            <LockedLesson price={course.price} />
          ) : content ? (
            <div className="max-w-[720px] mx-auto px-8 py-12">
              {/* Disclaimer */}
              <div className="font-mono text-[11px] text-[#9494A8] mb-6">
                Educational content only · Not investment advice
              </div>

              {/* Lesson header */}
              <h1 className="font-serif text-[30px] font-bold text-[#0F2348] leading-[1.1] mb-3">
                {content.title}
              </h1>
              <div className="flex items-center gap-3 mb-8 pb-6 border-b border-[rgba(15,35,72,0.08)]">
                <span className="font-mono text-[12px] text-[#9494A8]">{content.duration} read</span>
                {content.free && (
                  <span className="font-mono text-[10px] text-[#1A7A4A] bg-[#E8F5EE] rounded px-2 py-0.5">
                    Free preview
                  </span>
                )}
              </div>

              {/* Content blocks */}
              <BlockRenderer blocks={content.blocks} />

              {/* Nav footer */}
              <div className="flex items-center justify-between mt-12 pt-6 border-t border-[rgba(15,35,72,0.08)]">
                {prevLesson ? (
                  <button
                    onClick={() => setActiveLesson(prevLesson.slug)}
                    className="font-mono text-[13px] text-[#5A5A72] hover:text-[#0F2348] transition-colors"
                  >
                    ← {prevLesson.title}
                  </button>
                ) : (
                  <div />
                )}
                {nextLesson ? (
                  <button
                    onClick={markCompleteAndNext}
                    className="bg-[#D4860A] hover:bg-[#F0A020] text-white rounded-lg px-6 py-2.5 font-mono text-[13px] font-medium transition-colors"
                  >
                    Next: {nextLesson.title} →
                  </button>
                ) : (
                  <button
                    onClick={() => setCompletedLessons((prev) => new Set([...prev, activeLesson]))}
                    className="bg-[#1A7A4A] hover:bg-[#15623C] text-white rounded-lg px-6 py-2.5 font-mono text-[13px] font-medium transition-colors"
                  >
                    Mark complete ✓
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="max-w-[720px] mx-auto px-8 py-12">
              <div className="font-mono text-[11px] text-[#9494A8] mb-6">Educational content only · Not investment advice</div>
              <div className="font-mono text-[12px] text-[#9494A8]">Content coming soon for this lesson.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
