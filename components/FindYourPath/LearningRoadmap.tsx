"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Compass,
  TrendingUp,
  ShieldAlert,
  Binary,
  Layers,
  Award,
  ChevronRight,
  Sparkles,
} from "lucide-react";

interface Milestone {
  id: string;
  stage: "Beginner" | "Intermediate" | "Advanced";
  title: string;
  phase: string;
  duration: string;
  tagline: string;
  icon: typeof Compass;
  concepts: {
    term: string;
    description: string;
  }[];
  practicalApplication: string;
  playbookSlug: string;
}

const MILESTONES: Milestone[] = [
  {
    id: "m1",
    stage: "Beginner",
    title: "Market Microstructure & Capital Protection",
    phase: "Phase 01",
    duration: "Weeks 1–3",
    tagline: "Unpack clearing mechanisms, order books, and equity compounding without hype.",
    icon: Compass,
    concepts: [
      {
        term: "NSE/BSE Order Matching",
        description: "How limit orders, stop-losses, and market makers interact in continuous trade execution.",
      },
      {
        term: "Margin of Safety & Liquidity",
        description: "Calculating cash runway and avoiding illiquid small-cap bid-ask spreads.",
      },
      {
        term: "Asset Allocation (80/20 Rule)",
        description: "Structuring emergency liquidity, index ETFs, and core defensive holdings.",
      },
    ],
    practicalApplication: "Calculate real portfolio drawdown tolerance and set up structured index SIPs.",
    playbookSlug: "stock-market-from-zero",
  },
  {
    id: "m2",
    stage: "Beginner",
    title: "Forensic Accounting & Financial Statements",
    phase: "Phase 02",
    duration: "Weeks 4–6",
    tagline: "Read annual reports and detect creative balance sheet maneuvers before earnings.",
    icon: Layers,
    concepts: [
      {
        term: "Cash Flow vs Net Income",
        description: "Spotting aggressive revenue recognition when CFO lags reported profit after tax.",
      },
      {
        term: "ROCE, ROE & Cost of Capital (WACC)",
        description: "Dissecting capital allocation quality and economic value added across industry peers.",
      },
      {
        term: "Promoter Pledging & Debt Ladders",
        description: "Auditing contingent liabilities, related-party transactions, and debt repayment schedules.",
      },
    ],
    practicalApplication: "Evaluate a company's 10-year financials and red-flag score before investing ₹1.",
    playbookSlug: "how-to-read-financial-statements",
  },
  {
    id: "m3",
    stage: "Intermediate",
    title: "Market Cycles & Systematic Chart Structures",
    phase: "Phase 03",
    duration: "Weeks 7–9",
    tagline: "Map liquidity pools, institutional accumulation, and cyclical sector rotations.",
    icon: TrendingUp,
    concepts: [
      {
        term: "Wyckoff Volume Spread Dynamics",
        description: "Recognizing absorption vs distribution zones using price and volume confluence.",
      },
      {
        term: "Macro Indicators & Yield Curves",
        description: "Tracking RBI repo rate decisions, USDINR currency flows, and FII/DII liquidity prints.",
      },
      {
        term: "Risk-to-Reward Skew (1:3+ Ratio)",
        description: "Filtering high-probability pivot breakouts with mathematical invalidation levels.",
      },
    ],
    practicalApplication: "Execute weekly sector rotation screening based on relative strength vs Nifty 50.",
    playbookSlug: "technical-analysis-charts-patterns-indicators",
  },
  {
    id: "m4",
    stage: "Advanced",
    title: "Options Payoffs, Greeks & Volatility Regimes",
    phase: "Phase 04",
    duration: "Weeks 10–13",
    tagline: "Master non-linear payoff geometry, implied volatility surfaces, and risk neutrality.",
    icon: Binary,
    concepts: [
      {
        term: "Option Greeks Matrix (Δ, Γ, Θ, ν)",
        description: "Managing theta decay vs delta exposure, and hedging gamma acceleration near expiry.",
      },
      {
        term: "IV Skew & India VIX Behavior",
        description: "Exploiting volatility mispricing during corporate earnings and budget announcements.",
      },
      {
        term: "Systematic Multi-Leg Spreads",
        description: "Constructing defined-risk Iron Condors, Ratio Spreads, and Calendar hedges.",
      },
    ],
    practicalApplication: "Run scenario analysis on active option portfolios under +20% / -20% volatility shocks.",
    playbookSlug: "options-trading-from-zero",
  },
  {
    id: "m5",
    stage: "Advanced",
    title: "Institutional Portfolio Architecture & Hedging",
    phase: "Phase 05",
    duration: "Weeks 14+",
    tagline: "Deploy sovereign hedges, factor tilts, and dynamic rebalancing across market regimes.",
    icon: Award,
    concepts: [
      {
        term: "Tail Risk & Dynamic Futures Beta",
        description: "Shorting index futures to hedge systemic equity drawdowns without triggering tax events.",
      },
      {
        term: "Multi-Factor Quality & Momentum",
        description: "Engineering rules-based rebalancing to harvest value and low-volatility risk premia.",
      },
      {
        term: "Tax-Loss Harvesting & Rebalance Discipline",
        description: "Optimizing Long-Term Capital Gains (LTCG) thresholds and STT slippage costs.",
      },
    ],
    practicalApplication: "Build and stress-test an all-weather Indian model portfolio with quarterly rebalancing.",
    playbookSlug: "futures-derivatives-explained",
  },
];

const STAGE_COLORS: Record<string, { badgeBg: string; badgeText: string; dot: string; border: string }> = {
  Beginner: {
    badgeBg: "bg-emerald-50 border-emerald-200/70",
    badgeText: "text-emerald-800",
    dot: "bg-emerald-600",
    border: "border-emerald-500/30",
  },
  Intermediate: {
    badgeBg: "bg-amber-50 border-amber-200/70",
    badgeText: "text-amber-900",
    dot: "bg-amber-600",
    border: "border-amber-500/30",
  },
  Advanced: {
    badgeBg: "bg-stone-100 border-stone-300",
    badgeText: "text-forest",
    dot: "bg-forest",
    border: "border-forest/40",
  },
};

export default function LearningRoadmap() {
  const [activeMilestoneId, setActiveMilestoneId] = useState<string>("m1");

  const activeMilestone = MILESTONES.find((m) => m.id === activeMilestoneId) || MILESTONES[0];

  return (
    <div className="mt-14 pt-10 border-t border-hairline">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-gold" />
            <span className="font-mono text-[11px] text-gold-text tracking-[0.18em] font-bold uppercase">
              STRUCTURED PROGRESSION · 5 PHASES
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-olive tracking-tight">
            The Investor Progression Roadmap
          </h3>
          <p className="text-xs sm:text-sm text-ink-dim max-w-xl mt-1">
            Hover over any milestone to preview foundational mental models, quantitative metrics, and execution playbooks.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-ink-dim">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600" /> Beginner
          </span>
          <span>·</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-600" /> Intermediate
          </span>
          <span>·</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-forest" /> Advanced
          </span>
        </div>
      </div>

      {/* Main Roadmap Container: Left Vertical Timeline + Right Deep-Dive Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Vertical Timeline Steps */}
        <div className="lg:col-span-5 relative space-y-3">
          {/* Vertical Track Line */}
          <div className="absolute left-[23px] top-6 bottom-6 w-[2px] bg-gradient-to-b from-emerald-500/40 via-amber-500/40 to-forest/50 pointer-events-none" />

          {MILESTONES.map((m, idx) => {
            const isSelected = m.id === activeMilestoneId;
            const Icon = m.icon;
            const colors = STAGE_COLORS[m.stage];

            return (
              <motion.div
                key={m.id}
                onMouseEnter={() => setActiveMilestoneId(m.id)}
                onClick={() => setActiveMilestoneId(m.id)}
                whileHover={{ x: 4 }}
                transition={{ duration: 0.15 }}
                className={`relative flex items-start gap-4 p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-panel shadow-md border-forest/50"
                    : "bg-panel/60 border-hairline hover:border-hairline/80 hover:bg-panel"
                }`}
              >
                {/* Timeline Icon Node */}
                <div
                  className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-transform ${
                    isSelected
                      ? "bg-forest text-white shadow-sm ring-4 ring-forest/15 scale-105"
                      : "bg-forest-surface text-forest border border-hairline"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                {/* Milestone Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-mono text-[10px] text-ink-dim font-bold uppercase tracking-wider">
                      {m.phase} · {m.duration}
                    </span>
                    <span
                      className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${colors.badgeBg} ${colors.badgeText}`}
                    >
                      {m.stage}
                    </span>
                  </div>

                  <h4 className={`text-xs sm:text-sm font-bold truncate ${isSelected ? "text-forest" : "text-ink"}`}>
                    {m.title}
                  </h4>

                  <p className="text-[11px] text-ink-dim line-clamp-1 mt-0.5">
                    {m.tagline}
                  </p>
                </div>

                <ChevronRight
                  className={`w-4 h-4 flex-shrink-0 transition-transform ${
                    isSelected ? "text-forest translate-x-0.5" : "text-ink-dim/40"
                  }`}
                />
              </motion.div>
            );
          })}
        </div>

        {/* Right Column: Deep-Dive Preview Card (Framer Motion Animated) */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeMilestone.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="bg-panel border border-hairline rounded-2xl p-6 sm:p-7 shadow-md relative overflow-hidden"
            >
              {/* Background ambient accent */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-forest/5 via-gold/5 to-transparent rounded-bl-full pointer-events-none" />

              {/* Stage & Title */}
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <span
                    className={`font-mono text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                      STAGE_COLORS[activeMilestone.stage].badgeBg
                    } ${STAGE_COLORS[activeMilestone.stage].badgeText}`}
                  >
                    {activeMilestone.stage} Mastery
                  </span>
                  <span className="font-mono text-[11px] text-ink-dim">
                    {activeMilestone.phase} ({activeMilestone.duration})
                  </span>
                </div>

                <div className="flex items-center gap-1 text-gold text-xs font-mono">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Key Concepts</span>
                </div>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-olive tracking-tight mb-2">
                {activeMilestone.title}
              </h3>
              <p className="text-xs sm:text-sm text-ink-dim leading-relaxed mb-6">
                {activeMilestone.tagline}
              </p>

              {/* Core Concepts Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="font-mono text-[10px] font-bold text-gold-text tracking-[0.18em] uppercase">
                  MASTERED CONCEPTS &amp; SCREENERS
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {activeMilestone.concepts.map((c, i) => (
                    <motion.div
                      key={c.term}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 + 0.1 }}
                      className="p-3 bg-ivory/80 border border-hairline rounded-xl hover:border-forest/40 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-forest" />
                        <span className="text-xs font-bold text-ink">{c.term}</span>
                      </div>
                      <p className="text-[11px] text-ink-dim leading-relaxed pl-3.5">
                        {c.description}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Practical Execution Box */}
              <div className="p-3.5 bg-forest-surface/80 border border-hairline rounded-xl flex items-start gap-3 mb-6">
                <div className="w-6 h-6 rounded-md bg-forest text-white flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                  ✓
                </div>
                <div>
                  <div className="text-[11px] font-bold text-forest uppercase tracking-wider font-mono">
                    Practical Application Target
                  </div>
                  <p className="text-xs text-ink-dim mt-0.5">
                    {activeMilestone.practicalApplication}
                  </p>
                </div>
              </div>

              {/* CTA link to playbook */}
              <div className="flex items-center justify-between pt-4 border-t border-hairline">
                <span className="text-xs text-ink-dim font-mono">
                  Included in curriculum pass
                </span>
                <a
                  href={`/courses/${activeMilestone.playbookSlug}`}
                  className="inline-flex items-center gap-2 text-xs font-bold text-white bg-forest hover:bg-forest-dark px-4 py-2 rounded-xl transition-colors shadow-xs"
                >
                  <span>Open Playbook</span>
                  <span>→</span>
                </a>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
