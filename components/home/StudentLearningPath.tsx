"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { SEBI_FO_STATS, SEBI_FO_SOURCE } from "@/lib/home/sebiStats";
import { getFact, isShowable, provenance, type MarketFact } from "@/lib/home/marketFacts";
import {
  Compass,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  BookOpen,
  Award,
  Layers,
  ChevronRight,
  GraduationCap,
} from "lucide-react";

const sebiShare = SEBI_FO_STATS.find((s) => s.id === "share-lost-fy22-24");
function directPlanTakeaway(facts: MarketFact[]): string {
  const directPlan = getFact(facts, "directPlanSavingsExample");
  return isShowable(directPlan)
    ? `Direct plans avoid the regular-plan commission drag: ${directPlan.value} on ${directPlan.label}. ${provenance(directPlan)}.`
    : "Direct plans avoid the regular-plan commission drag, and over a long horizon that difference compounds into a meaningful sum.";
}

interface Milestone {
  id: string;
  stepNumber: string;
  phase: "FOUNDATIONS" | "INTERMEDIATE" | "ADVANCED" | "MASTERY";
  title: string;
  badge: string;
  description: string;
  keySkills: string[];
  courseSlug: string;
  /** Fallback only; the rendered title comes from Sanity when the course exists. */
  courseTitle: string;
  estimatedTime: string;
  checkpointExam: string;
  institutionalTakeaway: string;
}

function buildSteps(facts: MarketFact[]): Milestone[] {
  const DIRECT_PLAN_TAKEAWAY = directPlanTakeaway(facts);
  return [
  {
    id: "step-1",
    stepNumber: "01",
    phase: "FOUNDATIONS",
    title: "Market Microstructure & Capital Mechanics",
    badge: "STAGE 1 · PILLAR",
    description:
      "Understand how NSE & BSE clearing works, order types (SL, SL-M, Limit, IOC), broker slippage, and the primary compounding mathematics behind long-term equity wealth.",
    keySkills: ["Order Book Mechanics", "Rule of 72 Compounding", "Zero-Tip Filter"],
    courseSlug: "stock-market-from-zero",
    courseTitle: "Stock Market From Zero",
    estimatedTime: "2-3 hrs",
    checkpointExam: "Market Microstructure & Order Entry Audit",
    institutionalTakeaway:
      "Most early mistakes come from not understanding bid-ask spreads, liquidity and order types. Master those before anything else.",
  },
  {
    id: "step-2",
    stepNumber: "02",
    phase: "FOUNDATIONS",
    title: "Financial Statements & Forensic Forensic Audit",
    badge: "STAGE 2 · FUNDAMENTALS",
    description:
      "Dissect balance sheets, income statements, and cash flows. Learn forensic red flags to detect revenue fabrication, capitalised R&D tricks, and pledge manipulation.",
    keySkills: ["ROCE vs ROE", "Cash Flow from Operations (CFO)", "Pledged Share Warnings"],
    courseSlug: "how-to-read-financial-statements",
    courseTitle: "How to Read Financial Statements",
    estimatedTime: "4-5 hrs",
    checkpointExam: "Forensic Balance Sheet Diagnostic",
    institutionalTakeaway:
      "Never invest capital before validating that CFO matches reported net profit across 3 fiscal years.",
  },
  {
    id: "step-3",
    stepNumber: "03",
    phase: "INTERMEDIATE",
    title: "Institutional Asset Allocation & Mutual Funds",
    badge: "STAGE 3 · PORTFOLIO",
    description:
      "Systematic index investing, low-cost ETF strategies, tracking error evaluation, and total expense ratio (TER) compounding drag reduction.",
    keySkills: ["Factor Investing", "LTCG vs STCG Optimization", "Rebalancing Rules"],
    courseSlug: "mutual-funds-etfs-complete-guide",
    courseTitle: "Mutual Funds & ETFs Complete Guide",
    estimatedTime: "3-4 hrs",
    checkpointExam: "Fee & Tax Drag Optimization Audit",
    institutionalTakeaway:
      DIRECT_PLAN_TAKEAWAY,
  },
  {
    id: "step-4",
    stepNumber: "04",
    phase: "ADVANCED",
    title: "Derivatives, Options Greeks & Volatility Architecture",
    badge: "STAGE 4 · RISK MANAGEMENT",
    description:
      `Demystify Black-Scholes pricing, Theta decay curves, Vega risk, and why ${sebiShare?.value ?? ""} ${sebiShare?.label ?? ""} (${SEBI_FO_SOURCE}).`,
    keySkills: ["Delta-Neutral Spreads", "Implied Volatility (IV) Skew", "Risk-Budget Sizing"],
    courseSlug: "options-trading-from-zero",
    courseTitle: "Options Trading from Zero",
    estimatedTime: "6-8 hrs",
    checkpointExam: "Option Payoff & Greeks Calibration Challenge",
    institutionalTakeaway:
      "Treat options as precision insurance hedges and statistical spreads, never speculative lottery tickets.",
  },
  {
    id: "step-5",
    stepNumber: "05",
    phase: "MASTERY",
    title: "Macro Regime Modeling & Quantitative Execution",
    badge: "STAGE 5 · INSTITUTIONAL ALPHA",
    description:
      "Integrate RBI monetary policy stance, bond yield curves, currency flows, FII positioning, and multi-scenario hedging into a unified personal trading doctrine.",
    keySkills: ["RBI MPC Yield Analysis", "FII Open Interest Tracking", "Macro Stress Testing"],
    courseSlug: "options-trading-from-zero",
    courseTitle: "Advanced Quantitative Portfolio Strategy",
    estimatedTime: "5-6 hrs",
    checkpointExam: "Capital Preservation & Full-Cycle Terminal Defense",
    institutionalTakeaway:
      "Achieve full independent mastery with clear written rules, drawdown thresholds, and systematic discipline.",
  },
  ];
}

interface StudentLearningPathProps {
  facts: MarketFact[];
  /** Real course titles by slug from getAllCourses(). */
  courseTitles: Record<string, string>;
}

export default function StudentLearningPath({ facts, courseTitles }: StudentLearningPathProps) {
  const ROADMAP_STEPS = buildSteps(facts).map((step) => ({
    ...step,
    courseTitle: courseTitles[step.courseSlug] ?? step.courseTitle,
  }));
  const [completedSteps, setCompletedSteps] = useState<number[]>([0, 1]); // Steps 1 and 2 completed by default to show progress
  const [activeStepIndex, setActiveStepIndex] = useState<number>(2); // Current active step

  const toggleStepCompleted = (index: number) => {
    setCompletedSteps((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index);
      } else {
        const updated = [...prev, index];
        // If completing current step, nudge to next
        if (index === activeStepIndex && index < ROADMAP_STEPS.length - 1) {
          setActiveStepIndex(index + 1);
        }
        return updated;
      }
    });
  };

  const progressPercent = Math.round((completedSteps.length / ROADMAP_STEPS.length) * 100);
  const activeStep = ROADMAP_STEPS[activeStepIndex];

  return (
    <section id="roadmap-section" className="py-20 md:py-24 bg-panel border-b border-hairline scroll-mt-12">
      <div className="site-container space-y-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-hairline/80">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 bg-ivory border border-hairline rounded-full px-3.5 py-1 text-gold">
              <Compass className="w-3.5 h-3.5 text-forest" />
              <span className="font-mono text-[10px] tracking-[0.18em] font-bold uppercase">
                SYSTEMATIC ROADMAP · FROM FOUNDATIONS TO MASTERY
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-olive tracking-tight">
              Vertical Learning Path: The Investor Progression Framework
            </h2>
            <p className="text-sm sm:text-base text-ink-dim leading-relaxed">
              Step out of disjointed tips into a structured sequential syllabus. Track your journey from foundational market microstructure to balance sheet forensics, portfolio asset allocation, and advanced volatility modeling.
            </p>
          </div>

          {/* Interactive Progress Meter */}
          <div className="p-4 rounded-2xl bg-ivory border border-hairline shrink-0 min-w-[240px] space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-ink-dim uppercase">Roadmap Progress:</span>
              <span className="font-bold text-forest">{progressPercent}% Completed</span>
            </div>
            {/* Visual Progress Bar */}
            <div className="h-2 w-full bg-panel rounded-full overflow-hidden border border-hairline">
              <motion.div
                className="h-full bg-forest rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono text-ink-muted">
              <span>{completedSteps.length} of {ROADMAP_STEPS.length} Stages</span>
              <span className="text-gold font-semibold">Click nodes to toggle</span>
            </div>
          </div>
        </div>

        {/* 2-Column Responsive Layout: Vertical Path (Left) + Detail Card (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Vertical Path Stepper (Left 7 Cols) */}
          <div className="lg:col-span-7 relative">
            {/* Dynamic Background SVG Progress Line */}
            <div className="absolute left-[27px] sm:left-[35px] top-6 bottom-6 w-1 bg-hairline/60 rounded-full overflow-hidden">
              <motion.div
                className="w-full bg-forest rounded-full"
                initial={{ height: 0 }}
                animate={{
                  height: `${(Math.max(...completedSteps, 0) / (ROADMAP_STEPS.length - 1)) * 100}%`,
                }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              />
            </div>

            <div className="space-y-6 sm:space-y-8 relative">
              {ROADMAP_STEPS.map((step, idx) => {
                const isCompleted = completedSteps.includes(idx);
                const isActive = activeStepIndex === idx;

                return (
                  <div
                    key={step.id}
                    className={`relative flex items-start gap-4 sm:gap-6 p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
                      isActive
                        ? "bg-ivory border-forest shadow-sm"
                        : "bg-panel border-hairline hover:border-forest/40"
                    }`}
                    onClick={() => setActiveStepIndex(idx)}
                  >
                    {/* Step Icon / Status Circle */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStepCompleted(idx);
                      }}
                      title={isCompleted ? "Mark as in-progress" : "Mark as completed"}
                      className={`relative z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 font-mono text-xs sm:text-sm font-bold transition-transform hover:scale-105 cursor-pointer shadow-2xs ${
                        isCompleted
                          ? "bg-forest text-white"
                          : isActive
                          ? "bg-ivory border-2 border-forest text-forest"
                          : "bg-ivory border border-hairline text-ink-dim"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
                      ) : (
                        <span>{step.stepNumber}</span>
                      )}
                    </button>

                    {/* Step Content Overview */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-mono text-[10px] text-gold font-bold tracking-wider uppercase">
                          {step.badge}
                        </span>
                        <span className="text-[11px] font-mono text-ink-muted">
                          {step.estimatedTime}
                        </span>
                      </div>

                      <h3
                        className={`text-base sm:text-lg font-bold tracking-tight mb-1.5 transition-colors ${
                          isActive ? "text-olive" : "text-ink"
                        }`}
                      >
                        {step.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-ink-dim leading-relaxed line-clamp-2 mb-3">
                        {step.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-1.5">
                        {step.keySkills.map((skill) => (
                          <span
                            key={skill}
                            className="font-mono text-[9px] px-2 py-0.5 rounded bg-panel border border-hairline text-ink-dim"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <ChevronRight
                      className={`w-5 h-5 shrink-0 transition-transform mt-3 ${
                        isActive ? "text-forest rotate-90 sm:rotate-0" : "text-ink-muted"
                      }`}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Milestone Deep-Dive Card (Right 5 Cols Sticky) */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="bg-ivory border-2 border-forest/30 rounded-2xl p-6 sm:p-7 shadow-sm space-y-6"
              >
                <div className="flex items-center justify-between border-b border-hairline pb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-forest/10 text-forest flex items-center justify-center font-mono font-bold text-xs">
                      {activeStep.stepNumber}
                    </span>
                    <div>
                      <span className="font-mono text-[10px] text-gold tracking-widest font-bold uppercase">
                        CURRENT MILESTONE FOCUS
                      </span>
                      <h3 className="text-lg font-bold text-olive">{activeStep.title}</h3>
                    </div>
                  </div>
                  <span
                    className={`font-mono text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                      completedSteps.includes(activeStepIndex)
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-forest/10 text-forest"
                    }`}
                  >
                    {completedSteps.includes(activeStepIndex) ? "Completed" : "In Progress"}
                  </span>
                </div>

                <div className="space-y-4 text-xs sm:text-sm">
                  <div>
                    <h4 className="font-mono text-[10px] text-ink-muted uppercase font-bold mb-1">
                      Curriculum Objective:
                    </h4>
                    <p className="text-ink-dim leading-relaxed">{activeStep.description}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-panel border border-hairline space-y-1.5">
                    <div className="flex items-center gap-1.5 text-forest font-mono text-[10px] font-bold uppercase">
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>Checkpoint Certification Audit:</span>
                    </div>
                    <div className="text-xs font-semibold text-olive">
                      {activeStep.checkpointExam}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-forest/5 border border-forest/15 space-y-1">
                    <span className="font-mono text-[10px] text-forest font-bold uppercase">
                      Institutional Ground Rule:
                    </span>
                    <p className="text-xs text-[#2c3731] leading-relaxed">
                      {activeStep.institutionalTakeaway}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-hairline space-y-3">
                  <button
                    type="button"
                    onClick={() => toggleStepCompleted(activeStepIndex)}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold font-mono transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      completedSteps.includes(activeStepIndex)
                        ? "bg-panel border border-hairline text-ink-dim hover:bg-ivory"
                        : "bg-forest text-white hover:bg-forest-dark shadow-2xs"
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {completedSteps.includes(activeStepIndex)
                        ? "Mark as Uncompleted"
                        : "Mark Stage as Completed"}
                    </span>
                  </button>

                  <Link
                    href={`/courses/${activeStep.courseSlug}`}
                    className="w-full inline-flex items-center justify-between px-4 py-2.5 rounded-xl bg-panel border border-hairline hover:border-forest/40 hover:bg-ivory text-xs font-bold text-olive group transition-all"
                  >
                    <span className="truncate">Open Playbook: {activeStep.courseTitle}</span>
                    <ArrowRight className="w-4 h-4 text-forest group-hover:translate-x-1 transition-transform shrink-0" />
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
