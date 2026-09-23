"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, ChevronRight, ChevronLeft, ArrowRight, CheckCircle2, TrendingUp, Sparkles } from "lucide-react";
import { SEBI_FO_STATS, SEBI_FO_SOURCE } from "@/lib/home/sebiStats";
import { getFact, isShowable, provenance, type MarketFact } from "@/lib/home/marketFacts";

const sebiShare = SEBI_FO_STATS.find((s) => s.id === "share-lost-fy22-24");

interface ChapterPage {
  chapterNum: string;
  discipline: string;
  title: string;
  tagline: string;
  summary: string;
  coreRule: string;
  leftPageMetric: {
    label: string;
    value: string;
    subtext: string;
  };
  fieldNotes: string[];
  graphPoints: number[];
  graphLabel: string;
  targetCourseSlug: string;
}

function buildPages(facts: MarketFact[]): ChapterPage[] {
  const hurdle = getFact(facts, "hurdleRateAssumption");
  return [
  {
    chapterNum: "CHAPTER 01",
    discipline: "FOUNDATIONS & VALUATION",
    title: "Margin of Safety in Indian Equities",
    tagline: "Ownership → Cash Flow → Sustainable Value",
    summary:
      "A stock is not a lottery ticket or an oscillating ticker; it is an undivided fractional deed to an operating business. Price is what you pay; normalized free cash flow yield is what you receive.",
    coreRule: "Rule 01: Never confuse rapid top-line revenue expansion with economic owner earnings.",
    leftPageMetric: isShowable(hurdle)
      ? { label: "Institutional Hurdle Rate", value: hurdle.value, subtext: `${hurdle.label} · ${provenance(hurdle)}` }
      : { label: "Institutional Hurdle Rate", value: "G-Sec + ERP", subtext: "10-year G-Sec yield plus a 5% equity risk premium (house assumption)" },
    fieldNotes: [
      "Distinguish cash-generative moats from debt-funded working capital surges.",
      "Calculate 5-year average Return on Capital Employed (ROCE > 20% benchmark).",
      "Stress test operating cash flows under 200 bps interest rate tightening cycles.",
    ],
    graphPoints: [18, 22, 28, 25, 34, 42, 48, 55, 68],
    graphLabel: "Economic Book Value vs Intrinsic Compounding Trajectory",
    targetCourseSlug: "how-to-read-financial-statements",
  },
  {
    chapterNum: "CHAPTER 02",
    discipline: "FORENSIC SCRUTINY",
    title: "Detecting Balance Sheet Distress & Disguised Debt",
    tagline: "Evidence → Scrutiny → Capital Protection",
    summary:
      "Institutional wealth preservation happens before the purchase order is triggered. Turn statutory financial notes into forensic interrogation before believing management presentations.",
    coreRule: "Rule 02: When CFO persistently trails EBITDA by >30% over 3 fiscal years, exit first and ask questions later.",
    leftPageMetric: {
      label: "Forensic Red Flag Index",
      value: "4 Divergences",
      subtext: "Auditor churn, promoter pledge, related-party guarantees",
    },
    fieldNotes: [
      "Cross-examine trade receivables ageing vs reported revenue velocity.",
      "Check Schedule of Related Party transactions for promoter-owned shell entities.",
      "Inspect unhedged foreign currency debt obligations & capital work-in-progress bloat.",
    ],
    graphPoints: [45, 48, 52, 49, 38, 26, 22, 14, 11],
    graphLabel: "Operating Cash Flow Decay prior to statutory debt restructuring",
    targetCourseSlug: "fundamental-analysis-masterclass",
  },
  {
    chapterNum: "CHAPTER 03",
    discipline: "DERIVATIVES & TACTICS",
    title: "Defined-Risk Options & Volatility Asymmetry",
    tagline: "Probability → Defined Risk → Tactical Edge",
    summary:
      `SEBI found ${sebiShare?.value ?? ""} ${sebiShare?.label ?? ""} (${SEBI_FO_SOURCE}). A common reason: buying naked out-of-the-money calls against structural theta decay and post-event IV crush.`,
    coreRule: "Rule 03: Professional option traders do not predict market direction; they structure defined-risk volatility spreads.",
    leftPageMetric: {
      label: "Theta Decay Realization",
      value: "T-14 Days",
      subtext: "Accelerated exponential decay curve on NIFTY/BANKNIFTY monthly expiries",
    },
    fieldNotes: [
      "Trade multi-leg spreads (Bull Call / Iron Condor) to lock down maximal loss boundaries.",
      "Never hold naked long options through monetary policy or major corporate earnings.",
      "Use Implied Volatility Percentile (IVP > 70) to identify premium-selling opportunities.",
    ],
    graphPoints: [20, 24, 30, 42, 58, 62, 54, 48, 45],
    graphLabel: "Defined Payoff Envelope vs Unbounded Tail Risk",
    targetCourseSlug: "options-trading-from-zero",
  },
  {
    chapterNum: "CHAPTER 04",
    discipline: "CAPITAL ALLOCATION",
    title: "Conviction-to-Weight Portfolio Architecture",
    tagline: "Conviction → Position Sizing → Review Rules",
    summary:
      "Even superior equity ideas create devastating drawdowns if sized incorrectly. Portfolio construction is the math of survivorship across unexpected geopolitical and liquidity shocks.",
    coreRule: "Rule 04: Cap single-stock idiosyncratic risk at 8-12% of total net asset value regardless of emotional conviction.",
    leftPageMetric: {
      label: "Max Drawdown Target",
      value: "< 14.8%",
      subtext: "House drawdown ceiling, held well inside typical unhedged index drawdowns",
    },
    fieldNotes: [
      "Maintain a 70/20/10 core-satellite framework across high-ROCE compounding engines.",
      "Institute dynamic rebalancing triggers: Trim winners when single weight breaches 15%.",
      "Preserve 10-15% dry cash liquidity for market-wide liquidity panics and margin calls.",
    ],
    graphPoints: [15, 20, 22, 28, 32, 38, 44, 52, 60],
    graphLabel: "Compounded CAGR under Systematic Rebalancing & Position Sizing",
    targetCourseSlug: "portfolio-management-asset-allocation",
  },
  ];
}

interface PlaybookPageTurnStageProps {
  facts: MarketFact[];
  /** Slugs of the courses that exist in Sanity (getAllCourses()); chapters whose course is missing show "Coming soon" and no link. */
  courseSlugs: string[];
}

export default function PlaybookPageTurnStage({ facts, courseSlugs }: PlaybookPageTurnStageProps) {
  const PLAYBOOK_PAGES = buildPages(facts);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);

  const currentPage = PLAYBOOK_PAGES[activePageIndex];
  const totalPages = PLAYBOOK_PAGES.length;

  const handleNext = () => {
    if (isFlipping) return;
    setIsFlipping(true);
    setTimeout(() => {
      setActivePageIndex((prev) => (prev + 1) % totalPages);
      setIsFlipping(false);
    }, 280);
  };

  const handlePrev = () => {
    if (isFlipping) return;
    setIsFlipping(true);
    setTimeout(() => {
      setActivePageIndex((prev) => (prev === 0 ? totalPages - 1 : prev - 1));
      setIsFlipping(false);
    }, 280);
  };

  // SVG sparkline path calculation
  const points = currentPage.graphPoints;
  const maxVal = Math.max(...points);
  const minVal = Math.min(...points);
  const range = maxVal - minVal || 1;
  const svgWidth = 280;
  const svgHeight = 70;
  const coordinates = points.map((p, idx) => {
    const x = (idx / (points.length - 1)) * (svgWidth - 20) + 10;
    const y = svgHeight - 12 - ((p - minVal) / range) * (svgHeight - 24);
    return `${x},${y}`;
  });
  const pathD = `M ${coordinates.join(" L ")}`;

  return (
    <section id="tactile-playbook-stage" className="py-16 md:py-24 bg-ivory border-b border-hairline relative overflow-hidden">
      {/* Background ambient editorial texture accents */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(#1d2e28_1px,transparent_1px)] [background-size:20px_20px]" />
      
      <div className="site-container relative z-10 space-y-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-hairline/70">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 bg-panel border border-hairline rounded-full px-3.5 py-1 text-gold">
              <BookOpen className="w-3.5 h-3.5" />
              <span className="font-mono text-[10px] tracking-[0.18em] font-bold uppercase">
                TACTILE FIELD DISCIPLINE · 01 / THE PLAYBOOK
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-olive tracking-tight">
              Some things are understood one page at a time.
            </h2>
            <p className="text-sm sm:text-base text-ink-dim leading-relaxed">
              Step through our research field notebook. No hype, no noisy video filler—just institutional mental models, margin-of-safety screeners, and allocation rules.
            </p>
          </div>

          {/* Page Indicators & Turn Buttons */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:flex items-center gap-1.5 font-mono text-xs text-ink-dim mr-2 bg-panel border border-hairline px-3 py-1.5 rounded-lg">
              <span className="font-bold text-forest">{String(activePageIndex + 1).padStart(2, "0")}</span>
              <span>/</span>
              <span>{String(totalPages).padStart(2, "0")}</span>
            </div>
            <button
              onClick={handlePrev}
              aria-label="Previous Page"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-panel border border-hairline text-ink hover:text-forest hover:border-forest/40 text-xs font-semibold transition-all shadow-2xs hover:-translate-y-0.5 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Previous</span>
            </button>
            <button
              onClick={handleNext}
              aria-label="Next Page"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forest-dark transition-all shadow-xs hover:-translate-y-0.5 cursor-pointer"
            >
              <span>Turn Page</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3D Physical Book Leather & Parchment Desk Stage */}
        <div className="w-full max-w-5xl mx-auto rounded-3xl p-3 sm:p-6 md:p-8 bg-[#ebe4d5] border border-[#d2c5b0] shadow-[0_20px_50px_-15px_rgba(23,38,31,0.18)]">
          {/* Top chapter pill navigation */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-4 mb-4 border-b border-[#ded5c3] text-xs font-mono">
            <div className="flex items-center gap-2">
              {PLAYBOOK_PAGES.map((page, idx) => (
                <button
                  key={page.chapterNum}
                  onClick={() => {
                    if (isFlipping) return;
                    setIsFlipping(true);
                    setTimeout(() => {
                      setActivePageIndex(idx);
                      setIsFlipping(false);
                    }, 240);
                  }}
                  className={`px-3 py-1.5 rounded-lg transition-all text-[11px] whitespace-nowrap font-medium cursor-pointer ${
                    idx === activePageIndex
                      ? "bg-forest text-white font-bold shadow-xs"
                      : "bg-[#f5f0e6] text-[#4d5b54] hover:bg-[#faf7f0] border border-[#ded5c3]"
                  }`}
                >
                  {page.chapterNum}: {page.discipline.split(" ")[0]}
                </button>
              ))}
            </div>
            <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-[#718077]">
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              <span>Interactive Field Notebook</span>
            </div>
          </div>

          {/* Open Book Spread Container */}
          <div
            className={`grid grid-cols-1 lg:grid-cols-2 gap-0 relative bg-[#faf7f0] rounded-2xl border border-[#d8cfbd] shadow-[0_12px_32px_rgba(29,46,40,0.08)] transition-all duration-300 ${
              isFlipping ? "opacity-60 scale-[0.99] filter blur-[0.5px]" : "opacity-100 scale-100"
            }`}
          >
            {/* Center Book Spine Divider on Large screens */}
            <div className="hidden lg:block absolute top-0 bottom-0 left-1/2 -ml-[1px] w-[2px] bg-gradient-to-r from-[#d5caa4]/70 via-[#bba882]/40 to-[#d5caa4]/70 z-20 pointer-events-none shadow-sm" />

            {/* LEFT SPREAD: Framework & Conceptual Foundations */}
            <div className="p-6 sm:p-8 lg:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#e8dfce] relative bg-gradient-to-br from-[#faf7f0] via-[#f8f4ec] to-[#f4eee2]">
              <div className="space-y-6">
                {/* Header Tagging */}
                <div className="flex items-center justify-between border-b border-[#ded5c3] pb-3">
                  <div className="font-mono text-[11px] text-forest font-bold tracking-widest uppercase">
                    {currentPage.chapterNum} · {currentPage.discipline}
                  </div>
                  <span className="font-mono text-[10px] text-[#86948b] bg-[#ece5d6] px-2 py-0.5 rounded">
                    FIELD MANUAL
                  </span>
                </div>

                {/* Chapter Title */}
                <div className="space-y-2">
                  <h3 className="text-xl sm:text-2xl font-bold text-olive tracking-tight leading-snug">
                    {currentPage.title}
                  </h3>
                  <p className="font-mono text-xs text-gold font-semibold tracking-wide">
                    {currentPage.tagline}
                  </p>
                </div>

                {/* Core Thesis Paragraph */}
                <p className="text-sm text-[#3b4741] leading-relaxed font-normal">
                  {currentPage.summary}
                </p>

                {/* Core Rule Callout Block */}
                <div className="p-4 rounded-xl bg-[#f2ecde] border-l-4 border-forest border-y border-r border-[#ded5c3] space-y-1">
                  <div className="font-mono text-[10px] uppercase font-bold text-forest tracking-wider">
                    NON-NEGOTIABLE OPERATING RULE
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-olive leading-normal">
                    {currentPage.coreRule}
                  </div>
                </div>
              </div>

              {/* Left Page Bottom Metric Highlight */}
              <div className="pt-6 mt-6 border-t border-[#ded5c3] grid grid-cols-2 gap-4 items-center">
                <div>
                  <div className="text-[11px] font-mono text-[#718077] uppercase tracking-wide">
                    {currentPage.leftPageMetric.label}
                  </div>
                  <div className="text-xl font-mono font-bold text-forest tracking-tight">
                    {currentPage.leftPageMetric.value}
                  </div>
                  <div className="text-[10px] text-[#86948b] truncate">
                    {currentPage.leftPageMetric.subtext}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[11px] font-mono text-[#718077] uppercase tracking-wide">
                    STATUS
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-emerald-800 bg-emerald-100/70 border border-emerald-300/60 px-2.5 py-1 rounded-md mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>VERIFIED RULE</span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT SPREAD: Field Notes, Sparkline Geometry & Actionable Step */}
            <div className="p-6 sm:p-8 lg:p-10 flex flex-col justify-between relative bg-gradient-to-bl from-[#faf7f0] via-[#f7f2e8] to-[#f2ecde]">
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-[#ded5c3] pb-3">
                  <span className="font-mono text-[11px] text-[#718077] uppercase font-semibold">
                    FORENSIC FIELD CHECKLIST
                  </span>
                  <span className="font-mono text-[10px] text-[#86948b]">
                    EXECUTION PROTOCOL
                  </span>
                </div>

                {/* Practical Checklist Bullet Items */}
                <div className="space-y-3">
                  {currentPage.fieldNotes.map((note, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[#f5efe2] border border-[#ded5c3] flex items-start gap-3 hover:bg-[#ede5d4] transition-colors"
                    >
                      <span className="w-5 h-5 rounded-md bg-forest/10 text-forest font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-xs text-[#2c3731] leading-relaxed font-medium">
                        {note}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Mathematical Geometry Sparkline Canvas / SVG */}
                <div className="p-4 rounded-xl bg-[#ece3d1] border border-[#d8ccb6] space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="font-bold text-olive flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-forest" />
                      <span>{currentPage.graphLabel}</span>
                    </span>
                    <span className="text-[10px] text-[#718077]">5-Yr Cycle</span>
                  </div>

                  {/* Dynamic SVG Sparkline */}
                  <div className="h-16 w-full flex items-center justify-center relative overflow-hidden bg-[#f7f2e6] rounded-lg border border-[#ded5c3]">
                    <svg
                      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                      className="w-full h-full"
                      preserveAspectRatio="none"
                    >
                      {/* Grid hairline lines */}
                      <line x1="0" y1="20" x2={svgWidth} y2="20" stroke="#ded5c3" strokeDasharray="3 3" />
                      <line x1="0" y1="45" x2={svgWidth} y2="45" stroke="#ded5c3" strokeDasharray="3 3" />
                      {/* Trend Curve */}
                      <path
                        d={pathD}
                        fill="none"
                        stroke="#1d5c42"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {/* Final Dot Indicator */}
                      {coordinates.length > 0 && (
                        <circle
                          cx={coordinates[coordinates.length - 1].split(",")[0]}
                          cy={coordinates[coordinates.length - 1].split(",")[1]}
                          r="4"
                          fill="#c49a45"
                          stroke="#faf7f0"
                          strokeWidth="2"
                        />
                      )}
                    </svg>
                  </div>
                </div>
              </div>

              {/* Bottom Right CTA to Study Connected Course */}
              <div className="pt-6 mt-6 border-t border-[#ded5c3] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs text-[#526058] font-mono">
                  <span>Included in </span>
                  <strong className="text-olive underline underline-offset-2">
                    Research Pass
                  </strong>
                </div>

                {courseSlugs.includes(currentPage.targetCourseSlug) ? (
                  <Link
                    href={`/courses/${currentPage.targetCourseSlug}`}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-forest hover:bg-forest-dark text-white text-xs font-bold shadow-2xs hover:shadow-xs transition-all transform hover:-translate-y-0.5"
                  >
                    <span>Open Full Chapter Course</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <span className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-ivory border border-hairline text-ink-dim text-xs font-bold font-mono uppercase tracking-wider">
                    Course coming soon
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Book Footer Indicator */}
          <div className="flex items-center justify-between pt-4 text-[11px] font-mono text-[#718077] px-2">
            <span>The Capital Gains · Institutional Field Playbook</span>
            <span>Printed for Disciplined Indian Retail Investors</span>
          </div>
        </div>
      </div>
    </section>
  );
}
