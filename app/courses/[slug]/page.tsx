"use client";

import { useParams } from "next/navigation";
import Link from "next/link";

type Chapter = {
  title: string;
  lessons: { title: string; free: boolean }[];
};

type Course = {
  title: string;
  tag: string;
  price: number;
  lessons: number;
  duration: string;
  exercises: number;
  badge: string | null;
  description: string;
  what_you_learn: string[];
  chapters: Chapter[];
};

const courses: Record<string, Course> = {
  "options-trading-from-zero": {
    title: "Options Trading from Zero",
    tag: "Beginner → Intermediate",
    price: 1499,
    lessons: 12,
    duration: "~4 hrs",
    exercises: 8,
    badge: "BESTSELLER",
    description:
      "A complete mental model for trading F&O profitably. From understanding what you're actually buying, to reading the options chain, to building your own entry checklist — this is the course that replaces 50 hours of YouTube.",
    what_you_learn: [
      "Understand options pricing and time decay",
      "Read the NSE options chain like a pro",
      "Use Delta, Theta and IV in real trade decisions",
      "Build a Bull Call Spread and Iron Condor",
      "Create your personal entry/exit checklist",
      "Size positions to survive losing streaks",
    ],
    chapters: [
      {
        title: "Chapter 1 — The Mental Model",
        lessons: [
          { title: "Why Most Retail Traders Lose", free: true },
          { title: "Options Basics: What You're Actually Buying", free: true },
          { title: "The Buyer vs Seller Asymmetry", free: false },
        ],
      },
      {
        title: "Chapter 2 — The Greeks",
        lessons: [
          { title: "Delta: Directional Exposure Explained", free: false },
          { title: "Theta: Time Decay & Premium Erosion", free: false },
          { title: "IV & Vega: Trading Volatility, Not Just Direction", free: false },
        ],
      },
      {
        title: "Chapter 3 — Reading the Chain",
        lessons: [
          { title: "How to Read the NSE Options Chain", free: false },
          { title: "OI, PCR and Max Pain — What They Actually Mean", free: false },
          { title: "Building Your Pre-Trade Checklist", free: false },
        ],
      },
      {
        title: "Chapter 4 — Strategies & Risk",
        lessons: [
          { title: "Bull Call Spread: Setup and Exit Rules", free: false },
          { title: "Iron Condor: When and How to Use It", free: false },
          { title: "Position Sizing for Options Traders", free: false },
        ],
      },
    ],
  },

  "equity-investing-first-portfolio": {
    title: "Equity Investing: Build Your First Portfolio",
    tag: "Beginner",
    price: 999,
    lessons: 10,
    duration: "~3.5 hrs",
    exercises: 6,
    badge: "NEW",
    description:
      "A systematic approach to picking stocks and building a portfolio that compounds over time. No tips, no FOMO — just a repeatable process.",
    what_you_learn: [
      "Screen stocks using fundamental filters",
      "Read a P&L and balance sheet in 20 minutes",
      "Value a business using PE, PB and DCF",
      "Build a diversified portfolio with allocation rules",
      "Set up a SIP strategy that matches your goals",
      "Rebalance your portfolio without emotional decisions",
    ],
    chapters: [
      {
        title: "Chapter 1 — Foundations",
        lessons: [
          { title: "What Equity Investing Actually Is", free: true },
          { title: "How the Stock Market Prices Businesses", free: true },
          { title: "The Long-Term Compounding Edge", free: false },
        ],
      },
      {
        title: "Chapter 2 — Stock Screening",
        lessons: [
          { title: "Building Your Screening Criteria", free: false },
          { title: "Reading Financials Without an MBA", free: false },
          { title: "Valuation: PE, PB and What They Mean", free: false },
        ],
      },
      {
        title: "Chapter 3 — Portfolio Construction",
        lessons: [
          { title: "Sector Allocation and Diversification Rules", free: false },
          { title: "Setting Up Your SIP Strategy", free: false },
        ],
      },
      {
        title: "Chapter 4 — Ongoing Management",
        lessons: [
          { title: "When to Exit: Sell Rules That Remove Emotion", free: false },
          { title: "Rebalancing Without Overtrading", free: false },
        ],
      },
    ],
  },

  "technical-analysis-playbook": {
    title: "Technical Analysis Playbook",
    tag: "Intermediate",
    price: 1999,
    lessons: 14,
    duration: "~5 hrs",
    exercises: 10,
    badge: null,
    description:
      "Chart patterns, indicators, and entry/exit setups that actually work in Indian markets. Built around price action first, indicators second.",
    what_you_learn: [
      "Identify support and resistance levels with precision",
      "Read candlestick patterns that actually signal reversals",
      "Use RSI, MACD and Volume as confirmation tools",
      "Set up a complete entry, stop, and target framework",
      "Trade breakouts without getting faked out",
      "Build a trading journal that improves your edge over time",
    ],
    chapters: [
      {
        title: "Chapter 1 — Price Action First",
        lessons: [
          { title: "Why Price Action Beats Indicators", free: true },
          { title: "Support and Resistance: Drawing Levels That Hold", free: true },
          { title: "Trend Structure: Higher Highs, Lower Lows", free: false },
          { title: "Candlestick Patterns That Actually Matter", free: false },
        ],
      },
      {
        title: "Chapter 2 — Indicators as Confirmation",
        lessons: [
          { title: "RSI: Using It Without Getting Trapped", free: false },
          { title: "MACD: Signal Line Crossovers and Divergence", free: false },
          { title: "Volume Analysis: Reading Conviction in a Move", free: false },
        ],
      },
      {
        title: "Chapter 3 — Setups and Execution",
        lessons: [
          { title: "Breakout Trades: Entry, Stop, Target Rules", free: false },
          { title: "Pullback to Support: The High-Probability Setup", free: false },
          { title: "Failed Breakouts and How to Spot Them Early", free: false },
        ],
      },
      {
        title: "Chapter 4 — Process and Edge",
        lessons: [
          { title: "Building Your Pre-Market Routine", free: false },
          { title: "Keeping a Trading Journal That Actually Helps", free: false },
          { title: "Reviewing Trades to Find Your Edge", free: false },
          { title: "Managing Drawdowns Without Blowing Up", free: false },
        ],
      },
    ],
  },
};

const priceFormatted = (price: number) =>
  `₹${price.toLocaleString("en-IN")}`;

export default function CourseDetailPage() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : "";
  const course = courses[slug];

  if (!course) {
    return (
      <div className="bg-[#FAFAF7] min-h-screen">
        <div className="max-w-6xl mx-auto px-8 pt-20 text-center">
          <div className="font-mono text-[11px] text-[#9494A8] tracking-widest uppercase mb-4">
            404
          </div>
          <h1 className="font-serif text-4xl font-bold text-[#0F2348] mb-4">
            Course not found
          </h1>
          <p className="text-[16px] text-[#5A5A72] mb-8">
            We couldn&apos;t find a course at this URL.
          </p>
          <Link
            href="/courses"
            className="bg-[#D4860A] hover:bg-[#F0A020] text-white rounded-lg px-6 py-3 text-[14px] font-medium transition-colors"
          >
            Browse all courses →
          </Link>
        </div>
      </div>
    );
  }

  const totalLessons = course.chapters.reduce(
    (sum, ch) => sum + ch.lessons.length,
    0
  );

  return (
    <div className="bg-[#FAFAF7] min-h-screen overflow-x-hidden">

      {/* ── BREADCRUMB ── */}
      <div className="max-w-6xl mx-auto px-8 pt-8">
        <div className="flex items-center gap-2 font-mono text-[12px] text-[#9494A8]">
          <Link href="/courses" className="hover:text-[#0F2348] transition-colors">
            Courses
          </Link>
          <span>→</span>
          <span className="text-[#0F2348]">{course.title}</span>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="max-w-6xl mx-auto px-8 mt-6 pb-20 grid grid-cols-1 lg:grid-cols-3 gap-12">

        {/* ── LEFT COLUMN ── */}
        <div className="lg:col-span-2">

          {/* Badge + tag */}
          <div className="flex items-center gap-2 mb-3">
            {course.badge && (
              <span className="font-mono text-[9px] font-medium bg-[rgba(212,134,10,0.15)] text-[#D4860A] rounded px-2 py-1 tracking-wider">
                {course.badge}
              </span>
            )}
            <span className="font-mono text-[11px] text-[#9494A8] tracking-widest uppercase">
              {course.tag}
            </span>
          </div>

          {/* Title */}
          <h1 className="font-serif text-4xl font-bold text-[#0F2348] leading-[1.1] mb-4">
            {course.title}
          </h1>

          {/* Description */}
          <p className="text-[16px] text-[#5A5A72] leading-relaxed mb-6">
            {course.description}
          </p>

          {/* Stats row */}
          <div className="flex flex-wrap gap-5 mb-8 pb-8 border-b border-[rgba(15,35,72,0.1)]">
            {[
              { label: "Lessons", val: `${totalLessons}` },
              { label: "Duration", val: course.duration },
              { label: "Exercises", val: `${course.exercises}` },
              { label: "Level", val: course.tag },
            ].map((s) => (
              <div key={s.label} className="flex flex-col">
                <span className="font-mono text-[11px] text-[#9494A8] tracking-widest uppercase mb-1">
                  {s.label}
                </span>
                <span className="font-mono text-[15px] font-medium text-[#0F2348]">
                  {s.val}
                </span>
              </div>
            ))}
          </div>

          {/* What you'll learn */}
          <div className="mb-10">
            <h2 className="font-serif text-[22px] font-bold text-[#0F2348] mb-5">
              What you&apos;ll learn
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {course.what_you_learn.map((point) => (
                <div key={point} className="flex gap-3 items-start">
                  <span className="text-[#1A7A4A] mt-0.5 flex-shrink-0">✓</span>
                  <span className="text-[14px] text-[#5A5A72] leading-snug">{point}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Curriculum */}
          <div>
            <h2 className="font-serif text-[22px] font-bold text-[#0F2348] mb-5">
              Curriculum
            </h2>
            <div className="flex flex-col gap-4">
              {course.chapters.map((chapter) => (
                <div
                  key={chapter.title}
                  className="border border-[rgba(15,35,72,0.1)] rounded-xl overflow-hidden"
                >
                  <div className="bg-[#F4F1EB] px-5 py-3">
                    <span className="font-mono text-[12px] font-medium text-[#0F2348]">
                      {chapter.title}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    {chapter.lessons.map((lesson, i) => (
                      <div
                        key={lesson.title}
                        className={`flex items-center justify-between px-5 py-3 ${
                          i !== chapter.lessons.length - 1
                            ? "border-b border-[rgba(15,35,72,0.06)]"
                            : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-[14px] text-[#9494A8] flex-shrink-0">
                            {lesson.free ? "▶" : "🔒"}
                          </span>
                          <span
                            className={`text-[14px] ${
                              lesson.free ? "text-[#0F2348]" : "text-[#9494A8]"
                            }`}
                          >
                            {lesson.title}
                          </span>
                        </div>
                        {lesson.free && (
                          <span className="font-mono text-[10px] text-[#1A7A4A] bg-[#E8F5EE] rounded px-2 py-0.5 flex-shrink-0 ml-3">
                            Free preview
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN — STICKY PURCHASE CARD ── */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white border border-[rgba(15,35,72,0.1)] rounded-2xl p-6 shadow-[0_4px_32px_rgba(15,35,72,0.08)]">

            {/* Price */}
            <div className="mb-1">
              <span className="font-mono text-[36px] font-bold text-[#0F2348] leading-none">
                {priceFormatted(course.price)}
              </span>
            </div>
            <div className="text-[12px] text-[#9494A8] mb-5">
              one-time · lifetime access
            </div>

            {/* Enroll CTA */}
            <button className="w-full bg-[#D4860A] hover:bg-[#F0A020] text-white rounded-lg py-3.5 text-[15px] font-medium transition-colors mb-4">
              Enroll Now — {priceFormatted(course.price)}
            </button>

            {/* Divider + subscription nudge */}
            <div className="border-t border-[rgba(15,35,72,0.08)] pt-4 mb-5">
              <div className="text-[13px] text-[#5A5A72] mb-1">
                Or subscribe for all courses
              </div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[14px] font-medium text-[#0F2348]">
                  from ₹299
                  <span className="font-normal text-[#9494A8] text-[12px]">/month</span>
                </span>
                <Link
                  href="/pricing"
                  className="font-mono text-[12px] text-[#D4860A] hover:text-[#F0A020] transition-colors"
                >
                  Compare plans →
                </Link>
              </div>
            </div>

            {/* Included */}
            <div className="border-t border-[rgba(15,35,72,0.08)] pt-4 mb-5">
              <div className="font-mono text-[11px] text-[#9494A8] tracking-widest uppercase mb-3">
                What&apos;s included
              </div>
              <div className="flex flex-col gap-2">
                {[
                  "Lifetime access",
                  "All exercises",
                  "Mobile friendly",
                  "Certificate on completion",
                ].map((item) => (
                  <div key={item} className="flex gap-2 text-[13px] text-[#5A5A72]">
                    <span className="text-[#1A7A4A] flex-shrink-0">✓</span>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Refund note */}
            <p className="text-[12px] text-[#9494A8] text-center leading-snug">
              30-day refund if you&apos;re not satisfied. No questions asked.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
