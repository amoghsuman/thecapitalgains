"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  BookOpen,
  ArrowRight,
  TrendingUp,
  FileText,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

interface SampleExcerpt {
  id: string;
  category: string;
  courseTitle: string;
  courseSlug: string;
  chapterTitle: string;
  readTime: string;
  level: string;
  keyRule: string;
  summary: string;
  contentSnippet: {
    heading: string;
    body: string;
    filingNote?: string;
    formula?: {
      label: string;
      equation: string;
      meaning: string;
    };
  };
}

const SAMPLE_EXCERPTS: SampleExcerpt[] = [
  {
    id: "options-expiry-gamma",
    category: "DERIVATIVES & F&O",
    courseTitle: "Options Trading from Zero",
    courseSlug: "options-trading-from-zero",
    chapterTitle: "When Delta Lies: The Expiry Day Gamma Spike",
    readTime: "4 min read",
    level: "Intermediate",
    keyRule: "Never buy out-of-the-money 0DTE options expecting Delta to remain constant.",
    summary:
      "On weekly expiry day, retail traders see an ATM option with a Delta of 0.50 and assume a 20-point Nifty move will yield a 10-point gain. By 2:30 PM, Gamma explodes, transforming the curve into a discontinuous step function.",
    contentSnippet: {
      heading: "The Discontinuous Geometry of 0DTE Options",
      body: "Delta (Δ) is the first derivative of option price with respect to underlying price. But Gamma (Γ) is the second derivative — the rate at which Delta itself changes. On Thursday at 2:00 PM with 90 minutes to settlement, an ATM Nifty option strike (e.g. 25,200) has an astronomical Gamma. A 15-point twitch in the index can sling Delta from 0.45 directly to 0.85, or crash it to 0.05 within three ticks.",
      filingNote:
        "NSE Clearing Settlement Rule: Nifty 50 and Bank Nifty weekly contracts settle against the volume-weighted average price (VWAP) of the last 30 minutes (3:00 PM – 3:30 PM), not the tick price at exactly 3:30 PM.",
      formula: {
        label: "Gamma Greek Calculation",
        equation: "Γ = [N'(d1)] / [S · σ · √T]",
        meaning:
          "As time to expiry (T) approaches 0, the denominator collapses toward zero, causing Gamma (Γ) to spike asymptotically near the strike price.",
      },
    },
  },
  {
    id: "forensic-cfo-pat",
    category: "EQUITY RESEARCH",
    courseTitle: "How to Read Financial Statements",
    courseSlug: "how-to-read-financial-statements",
    chapterTitle: "Forensic Screen: The CFO vs. PAT Divergence Trap",
    readTime: "5 min read",
    level: "Foundations",
    keyRule: "Accounting profits are an opinion; Cash Flow from Operations (CFO) is a fact.",
    summary:
      "When an Indian listed company reports 25% Profit After Tax (PAT) growth year-over-year while operating cash flows remain flat or negative, management is usually hiding unsold inventory or uncollected trade receivables.",
    contentSnippet: {
      heading: "Dissecting Accrual Quality on BSE/NSE Filings",
      body: "Companies under pressure often record aggressive revenue under Ind AS 115 by pushing unneeded stock to dealers (channel stuffing) before the March quarter closes. Revenue and Net Profit appear robust on the P&L statement, but Cash Flow from Operations shows severe negative operating drains because real cash never reached the bank account.",
      filingNote:
        "BSE Annual Report Check: Always verify Note 8 (Trade Receivables Aging Schedule) and the Cash Flow Statement reconciliation. If Days Sales Outstanding (DSO) expanded by >30 days without industry tailwinds, red flag the entire earnings quality.",
      formula: {
        label: "Accrual Ratio Metric",
        equation: "Accruals Ratio = (Net Income - CFO) / Total Average Assets",
        meaning:
          "A persistently high or rising accruals ratio indicates earnings are driven by non-cash ledger entries rather than verifiable operational collections.",
      },
    },
  },
];

interface PlaybookSneakPeekDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  defaultExcerptId?: string;
}

export default function PlaybookSneakPeekDrawer({
  isOpen,
  onClose,
  defaultExcerptId = "options-expiry-gamma",
}: PlaybookSneakPeekDrawerProps) {
  const [selectedExcerptId, setSelectedExcerptId] = useState<string>(defaultExcerptId);
  const [interactiveSpotOffset, setInteractiveSpotOffset] = useState<number>(0);

  // Sync selected excerpt when modal opens with a different default
  useEffect(() => {
    if (defaultExcerptId) {
      setSelectedExcerptId(defaultExcerptId);
    }
  }, [defaultExcerptId]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const activeExcerpt =
    SAMPLE_EXCERPTS.find((ex) => ex.id === selectedExcerptId) || SAMPLE_EXCERPTS[0];

  // Dynamic calculation for the interactive demo in Excerpt 1
  const baseDelta = 0.5;
  const simulatedGamma = 0.045; // High 0DTE gamma
  const computedDelta = Math.min(
    0.99,
    Math.max(0.01, +(baseDelta + (interactiveSpotOffset * simulatedGamma) / 10).toFixed(2))
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end" id="playbook-sneak-peek-overlay">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-ink/60 backdrop-blur-xs"
            aria-hidden="true"
          />

          {/* Slide-over Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="relative w-full max-w-2xl h-full bg-panel shadow-2xl border-l border-hairline flex flex-col z-10 overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sneak-peek-title"
          >
            {/* Drawer Header */}
            <div className="p-5 sm:p-6 border-b border-hairline bg-ivory/80 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-forest text-white flex items-center justify-center font-mono text-xs font-bold shadow-xs">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-forest">
                      CURRICULUM SNEAK PEEK
                    </span>
                    <span className="text-[10px] bg-forest-surface text-forest px-1.5 py-0.5 rounded font-mono font-bold">
                      FREE EXCERPT
                    </span>
                  </div>
                  <h3 id="sneak-peek-title" className="text-base sm:text-lg font-bold text-olive">
                    Institutional Playbook Reading Experience
                  </h3>
                </div>
              </div>

              <button
                onClick={onClose}
                id="close-sneak-peek-btn"
                className="w-8 h-8 rounded-lg border border-hairline bg-panel hover:bg-olive-surface text-ink-dim hover:text-ink flex items-center justify-center transition-colors"
                aria-label="Close sample preview"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Excerpt Selector Tabs */}
            <div className="px-5 sm:px-6 py-2.5 bg-olive-surface/50 border-b border-hairline flex items-center gap-2 overflow-x-auto">
              <span className="text-[11px] font-mono text-ink-dim uppercase whitespace-nowrap">
                Sample:
              </span>
              {SAMPLE_EXCERPTS.map((excerpt) => (
                <button
                  key={excerpt.id}
                  onClick={() => {
                    setSelectedExcerptId(excerpt.id);
                    setInteractiveSpotOffset(0);
                  }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    selectedExcerptId === excerpt.id
                      ? "bg-panel text-forest shadow-xs border border-hairline font-bold"
                      : "text-ink-dim hover:text-ink"
                  }`}
                >
                  <span>{excerpt.category === "DERIVATIVES & F&O" ? "⚡ Options & Greeks" : "📊 Forensic Financials"}</span>
                  <span className="text-[10px] opacity-70">({excerpt.readTime})</span>
                </button>
              ))}
            </div>

            {/* Scrollable Chapter Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
              {/* Meta Card */}
              <div className="bg-ivory/80 border border-hairline rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-ink-dim">
                  <span className="text-gold-text font-bold uppercase">{activeExcerpt.category}</span>
                  <span>{activeExcerpt.readTime} · {activeExcerpt.level}</span>
                </div>
                <h4 className="text-lg sm:text-xl font-bold text-olive">
                  {activeExcerpt.chapterTitle}
                </h4>
                <p className="text-xs text-ink-dim leading-relaxed">
                  From the core syllabus: <strong className="text-ink">{activeExcerpt.courseTitle}</strong>
                </p>

                {/* Core Rule Callout */}
                <div className="mt-3 p-3 bg-forest-surface/80 border-l-2 border-forest rounded-r-lg">
                  <span className="text-[10px] font-mono text-forest font-bold uppercase tracking-wider block">
                    FOUNDATIONAL TAKEAWAY
                  </span>
                  <p className="text-xs font-semibold text-olive mt-0.5">
                    {activeExcerpt.keyRule}
                  </p>
                </div>
              </div>

              {/* Real Reading Snippet */}
              <div className="space-y-4">
                <h5 className="text-base font-bold text-olive">
                  {activeExcerpt.contentSnippet.heading}
                </h5>
                <p className="text-sm text-ink-dim leading-relaxed">
                  {activeExcerpt.contentSnippet.body}
                </p>

                {/* Formula Highlight */}
                {activeExcerpt.contentSnippet.formula && (
                  <div className="bg-panel border border-hairline rounded-xl p-4 space-y-1.5 shadow-xs">
                    <span className="font-mono text-[10px] text-ink-dim uppercase font-bold tracking-wider">
                      {activeExcerpt.contentSnippet.formula.label}
                    </span>
                    <div className="p-2.5 bg-ivory font-mono text-sm font-bold text-olive border border-hairline rounded-lg text-center">
                      {activeExcerpt.contentSnippet.formula.equation}
                    </div>
                    <p className="text-[11px] text-ink-dim italic">
                      {activeExcerpt.contentSnippet.formula.meaning}
                    </p>
                  </div>
                )}

                {/* Interactive Inline Mini-Tool (For Excerpt 1) */}
                {activeExcerpt.id === "options-expiry-gamma" && (
                  <div className="bg-ivory/90 border border-hairline rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-olive flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5 text-forest" />
                        Interactive Sensitivity: 0DTE Nifty Delta Shift
                      </span>
                      <span className="font-mono text-[10px] bg-forest-surface text-forest px-2 py-0.5 rounded font-bold">
                        LIVE FORMULA
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-ink-dim">Nifty Move from Strike:</span>
                        <span className="font-bold text-ink">
                          {interactiveSpotOffset > 0 ? `+${interactiveSpotOffset}` : interactiveSpotOffset} points
                        </span>
                      </div>
                      <input
                        type="range"
                        min="-60"
                        max="60"
                        step="5"
                        value={interactiveSpotOffset}
                        onChange={(e) => setInteractiveSpotOffset(Number(e.target.value))}
                        className="w-full accent-forest h-1.5 bg-hairline rounded-lg cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] font-mono text-ink-dim">
                        <span>-60 pts (OTM collapse)</span>
                        <span>ATM (₹25,200)</span>
                        <span>+60 pts (ITM rocket)</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="bg-panel p-2.5 rounded-lg border border-hairline">
                        <span className="text-[10px] font-mono text-ink-dim uppercase block">Dynamic Delta (Δ)</span>
                        <span className="text-base font-bold font-mono text-forest">
                          {computedDelta.toFixed(2)}
                        </span>
                      </div>
                      <div className="bg-panel p-2.5 rounded-lg border border-hairline">
                        <span className="text-[10px] font-mono text-ink-dim uppercase block">Greeks Regime</span>
                        <span className="text-xs font-bold text-ink mt-0.5 block">
                          {Math.abs(interactiveSpotOffset) < 15
                            ? "Extreme Gamma Zone ⚡"
                            : interactiveSpotOffset > 0
                            ? "Deep ITM Delta ≈ 1.0"
                            : "OTM Premium Decay"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Filing / Statutory Footnote */}
                {activeExcerpt.contentSnippet.filingNote && (
                  <div className="p-3 bg-panel border border-hairline rounded-xl flex items-start gap-2.5 text-xs text-ink-dim">
                    <FileText className="w-4 h-4 text-gold-text flex-shrink-0 mt-0.5" />
                    <span className="leading-relaxed">
                      <strong className="text-ink font-semibold">Regulatory Reference: </strong>
                      {activeExcerpt.contentSnippet.filingNote}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Drawer Bottom CTA Action */}
            <div className="p-4 sm:p-5 border-t border-hairline bg-panel flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-mono text-[10px] text-ink-dim uppercase tracking-wider block">
                  READY FOR THE COMPLETE PLAYBOOK?
                </span>
                <span className="text-xs font-bold text-olive">
                  {activeExcerpt.courseTitle}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="px-3 py-2 text-xs font-semibold text-ink-dim hover:text-ink rounded-lg transition-colors"
                >
                  Close
                </button>
                <Link
                  href={`/courses/${activeExcerpt.courseSlug}`}
                  onClick={onClose}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-forest hover:bg-forest-dark text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                >
                  <span>Open Full Syllabus</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
