"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  HelpCircle,
  ChevronDown,
  ShieldCheck,
  Search,
  Mail,
  ArrowRight,
  TrendingUp,
  FileSearch,
  Tag,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

export type FaqCategory = "General" | "Trading" | "Research" | "Pricing";

interface FaqItem {
  id: string;
  category: FaqCategory;
  categoryLabel: string;
  question: string;
  answer: string;
  highlight?: string;
  keywords?: string[];
}

const FAQ_ITEMS: FaqItem[] = [
  // General
  {
    id: "no-tips-advisory",
    category: "General",
    categoryLabel: "Pedagogy & Integrity",
    question: "Do you provide Telegram calls, buy/sell tips, or stock recommendations?",
    answer:
      "Strictly no. The Capital Gains is 100% independent financial architecture and research. We have zero broker referral deals, zero sponsored stock coverage, and zero advisory channels. We believe speculative tips destroy retail capital. Our mission is to teach you how to read statutory balance sheets, evaluate intrinsic free cash flows, and execute disciplined option risk budgets yourself.",
    highlight: "Zero tips. Zero broker kickbacks. 100% independent pedagogy.",
    keywords: ["telegram", "tips", "calls", "advisory", "recommendations", "broker"],
  },
  {
    id: "sebi-compliance",
    category: "General",
    categoryLabel: "Regulatory Compliance",
    question: "Are your frameworks compliant with SEBI regulations and Indian taxation?",
    answer:
      "Yes. All materials are educational and analytical frameworks, operating strictly under non-advisory educational boundaries in compliance with SEBI (Research Analysts) Regulations, 2014. Furthermore, our curricula are explicitly tailored to Indian market reality: NSE/BSE contract lots, clearing settlement mechanics, India VIX cycles, and Indian capital gains taxation (STCG, LTCG, and Section 43(5) non-speculative business income for F&O).",
    highlight: "Grounded in Indian statutory tax codes and SEBI regulatory standards.",
    keywords: ["sebi", "compliance", "taxation", "stcg", "ltcg", "regulations", "law"],
  },
  {
    id: "text-vs-video",
    category: "General",
    categoryLabel: "Format & Methodology",
    question: "How does a text playbook compare to traditional 20-hour video courses?",
    answer:
      "Video courses are notoriously inefficient: you spend 20 minutes watching someone talk through a 30-second formula, and you cannot search or reference them when analyzing a stock. Our playbooks are high-density, text-first technical manuals complete with interactive math widgets, balance sheet footnotes, and searchable checklists. You absorb concepts 3x faster and retain them as permanent operational reference guides.",
    highlight: "Searchable, dense, and referenced in seconds during real analysis.",
    keywords: ["video", "text", "playbook", "learning", "format", "efficiency"],
  },
  {
    id: "prerequisites-math",
    category: "General",
    categoryLabel: "Prerequisites",
    question: "What level of prior financial or mathematics knowledge is required?",
    answer:
      "None. Every track begins with first-principles intuition before moving to advanced mechanics. In options, we don't start with Black-Scholes partial differential equations; we start with the real-world geometry of risk, step by step. If you can read an electricity bill or understand high-school arithmetic, you can master every playbook in this curriculum.",
    highlight: "First-principles progression from zero jargon to institutional rigor.",
    keywords: ["prerequisites", "math", "beginner", "mathematics", "formulas", "basics"],
  },

  // Trading
  {
    id: "salaried-professionals",
    category: "Trading",
    categoryLabel: "F&O & Execution",
    question: "Can salaried working professionals apply these playbooks without watching screens all day?",
    answer:
      "Yes, that is exactly who this was built for. Intraday scalping is where retail investors suffer maximum churn and slippage. Our playbooks prioritize End-of-Day (EOD) swing frameworks, structural fundamental valuation, and multi-week delta-hedged option spreads. You analyze companies on weekends or after 6:00 PM, placing disciplined limit orders or systemic bracket orders without intraday screen anxiety.",
    highlight: "Designed for EOD systematic analysis, not 9:15–3:30 screen watching.",
    keywords: ["salaried", "working", "screen", "intraday", "eod", "swing", "job", "time"],
  },
  {
    id: "options-theta-trap",
    category: "Trading",
    categoryLabel: "Options & Derivatives",
    question: "How do your options playbooks protect against weekly expiry theta decay and IV crush?",
    answer:
      "We teach delta-neutral spreads, vertical credit spreads, calendar hedges, and volatility arbitrage rather than buying naked out-of-the-money (OTM) options. Our interactive options simulators demonstrate the mathematical reality of theta erosion and event IV collapse before you risk real trading margin.",
    highlight: "Probability-first risk architecture replacing speculative lottery tickets.",
    keywords: ["options", "theta", "decay", "iv crush", "expiry", "derivatives", "fno", "delta"],
  },
  {
    id: "position-sizing-stoploss",
    category: "Trading",
    categoryLabel: "Risk Management",
    question: "How do you handle position sizing, drawdown limits, and stop losses?",
    answer:
      "Every strategy specifies strict fractional Kelly and volatility-adjusted position sizing limits (typically 1.5% to 2.5% max portfolio capital at risk per idea). Stop losses are anchored to technical structural invalidation points and valuation floor cushions, eliminating emotional decision-making during flash volatility.",
    highlight: "Capital preservation precedes alpha: maximum drawdown mitigation formulas.",
    keywords: ["risk", "position sizing", "stop loss", "drawdown", "capital", "kelly"],
  },

  // Research
  {
    id: "forensic-audit-approach",
    category: "Research",
    categoryLabel: "Corporate Governance",
    question: "What makes your forensic accounting and balance sheet teardowns unique?",
    answer:
      "We focus on real Indian corporate filings, dissecting Cash Flow from Operations (CFO) vs. EBITDA divergence, promoter pledge ratios, related-party transactions, and revenue recognition red flags. You learn how credit rating agencies and forensic short-sellers identify accounting manipulation years before stock price collapses.",
    highlight: "Forensic scrutiny of statutory MCA filings, balance sheets, and audit notes.",
    keywords: ["forensic", "accounting", "balance sheet", "cfo", "ebitda", "audit", "governance"],
  },
  {
    id: "valuation-dcf-multiples",
    category: "Research",
    categoryLabel: "Valuation Science",
    question: "Do you teach discounted cash flow (DCF) or relative valuation multiples?",
    answer:
      "Both, integrated with Indian macroeconomic hurdle rates. You learn when DCF assumptions become dangerous, how to model terminal growth safely, and how to use EV/EBITDA, ROCE, and Free Cash Flow Yields instead of simplistic trailing P/E ratios.",
    highlight: "Disciplined margin of safety calculations with conservative growth gates.",
    keywords: ["valuation", "dcf", "multiples", "pe", "roce", "fcf", "discounted cash flow"],
  },

  // Pricing
  {
    id: "one-rupee-research",
    category: "Pricing",
    categoryLabel: "Fair Access Model",
    question: "Why do your deep research passes start at just ₹1?",
    answer:
      "Institutional-grade equity research in India has historically been gatekept behind ₹50,000–₹1,00,000 annual institutional subscriptions. By micro-pricing deep forensic research passes at ₹1, we eliminate friction for serious retail investors while keeping our research unconflicted and independent. You pay for what you read, with zero forced long-term lock-ins.",
    highlight: "Democratizing institutional research with zero subscription traps.",
    keywords: ["one rupee", "pricing", "cost", "passes", "subscription", "fee", "free"],
  },
  {
    id: "refund-cancellation-policy",
    category: "Pricing",
    categoryLabel: "Billing & Access",
    question: "How does access work across the plans?",
    answer:
      "Access follows the plan you hold, as defined in our pricing. Free Access gives one free lesson per course plus a newsletter preview. Learner (₹999/month) unlocks all courses and lessons with progress tracking and PDF playbooks; Pro (₹2,499/month) adds early access to new courses and workbooks. The research plans are separate: Newsletter (₹499/month) is the weekly market deep-dive; Essential Research (₹4,999/month) adds three model portfolios with rebalancing alerts; Premium Research (₹12,499/month) adds F&O notes, stock idea notes and a monthly digest. Doubt Sessions and Portfolio Reviews are one-time purchases. Annual billing is 20% cheaper per month. Access lasts for as long as the subscription is active; see the refund policy page for cancellations.",
    highlight: "Learn and Research are two separate stacks; a plan in one does not unlock the other.",
    keywords: ["refund", "policy", "lifetime", "access", "cancellation", "guarantee"],
  },
];

export default function InstitutionalFaq() {
  const [activeCategory, setActiveCategory] = useState<"All" | FaqCategory>("All");
  const [searchQuery, setSearchQuery] = useState("");
  // Individual expand/collapse set: each question toggles independently
  const [openIds, setOpenIds] = useState<Set<string>>(new Set(["no-tips-advisory"]));

  const toggleItem = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    setOpenIds(new Set(filteredItems.map((item) => item.id)));
  };

  const collapseAll = () => {
    setOpenIds(new Set());
  };

  // Filter questions based on Category and Search Query
  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return FAQ_ITEMS.filter((item) => {
      const matchCategory = activeCategory === "All" || item.category === activeCategory;
      if (!matchCategory) return false;
      if (!q) return true;

      const matchQuestion = item.question.toLowerCase().includes(q);
      const matchAnswer = item.answer.toLowerCase().includes(q);
      const matchLabel = item.categoryLabel.toLowerCase().includes(q);
      const matchKeywords = item.keywords?.some((k) => k.toLowerCase().includes(q));

      return matchQuestion || matchAnswer || matchLabel || matchKeywords;
    });
  }, [activeCategory, searchQuery]);

  const categories: ("All" | FaqCategory)[] = ["All", "General", "Trading", "Research", "Pricing"];

  return (
    <section id="faq-section" className="py-16 md:py-20 bg-panel border-b border-hairline">
      <div className="site-container max-w-5xl">
        {/* Section Header */}
        <div className="max-w-2xl mx-auto text-center mb-8 space-y-3">
          <div className="inline-flex items-center gap-2 bg-ivory border border-hairline rounded-full px-3.5 py-1.5 shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-forest" />
            <span className="font-mono text-[10px] text-gold tracking-[0.16em] font-bold uppercase">
              TRANSPARENCY & RIGOR
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-olive tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-ink-dim text-sm sm:text-base leading-relaxed">
            Direct, unvarnished answers about our educational standards, non-advisory stance, and playbook methodology.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-xl mx-auto mb-6">
          <div className="relative">
            <Search className="w-4 h-4 text-ink-dim absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              id="faq-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search FAQ keywords (e.g. 'Telegram', 'Options', 'SEBI', '₹1', 'Salaried')..."
              className="w-full pl-11 pr-10 py-3 rounded-xl border border-hairline bg-ivory focus:bg-white focus:outline-none focus:ring-1 focus:ring-forest text-xs sm:text-sm text-ink placeholder:text-ink-muted shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-dim hover:text-ink text-xs p-1 cursor-pointer"
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Filter Category Tabs: 'General', 'Trading', 'Research', 'Pricing' */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 pb-2 border-b border-hairline">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {categories.map((cat) => {
              const count =
                cat === "All"
                  ? FAQ_ITEMS.length
                  : FAQ_ITEMS.filter((i) => i.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all border whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    activeCategory === cat
                      ? "bg-forest text-white border-forest shadow-xs font-bold"
                      : "bg-ivory text-ink-dim border-hairline hover:text-ink hover:border-forest/30"
                  }`}
                >
                  <span>{cat === "All" ? "All Questions" : cat}</span>
                  <span
                    className={`font-mono text-[10px] px-1.5 py-0.2 rounded ${
                      activeCategory === cat ? "bg-white/20 text-white" : "bg-panel text-ink-dim"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Expand / Collapse Controls */}
          <div className="flex items-center gap-2 text-xs font-mono text-ink-dim self-end sm:self-auto shrink-0">
            <button
              type="button"
              onClick={expandAll}
              className="hover:text-forest transition-colors underline underline-offset-2 cursor-pointer"
            >
              Expand all
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={collapseAll}
              className="hover:text-forest transition-colors underline underline-offset-2 cursor-pointer"
            >
              Collapse all
            </button>
          </div>
        </div>

        {/* Accordion Stack */}
        <div className="space-y-3.5">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => {
              const isOpen = openIds.has(item.id);
              return (
                <div
                  key={item.id}
                  id={`faq-item-${item.id}`}
                  className={`bg-ivory border rounded-2xl transition-colors duration-200 overflow-hidden ${
                    isOpen ? "border-forest/40 shadow-xs" : "border-hairline hover:border-forest/25"
                  }`}
                >
                  {/* Question Header: Toggles item independently */}
                  <button
                    type="button"
                    onClick={() => toggleItem(item.id)}
                    aria-expanded={isOpen}
                    className="w-full text-left p-5 sm:p-6 flex items-start justify-between gap-4 select-none cursor-pointer"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[9px] text-forest font-bold tracking-wider uppercase bg-forest-surface px-2 py-0.5 rounded">
                          {item.category}
                        </span>
                        <span className="font-mono text-[10px] text-ink-dim tracking-wider uppercase">
                          {item.categoryLabel}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-olive leading-snug">
                        {item.question}
                      </h3>
                    </div>

                    <span
                      className={`w-7 h-7 rounded-full border border-hairline flex items-center justify-center flex-shrink-0 mt-0.5 text-ink-dim transition-transform duration-200 ${
                        isOpen ? "rotate-180 bg-forest-surface text-forest" : "bg-panel"
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </span>
                  </button>

                  {/* Collapsible Answer Body */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: "easeInOut" }}
                      >
                        <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-ink-dim leading-relaxed space-y-3 border-t border-hairline/60">
                          <p>{item.answer}</p>
                          {item.highlight && (
                            <div className="p-3 bg-forest-surface/70 border-l-2 border-forest rounded-r-lg text-xs font-semibold text-olive">
                              {item.highlight}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          ) : (
            <div className="p-10 text-center bg-ivory rounded-2xl border border-hairline text-xs text-ink-dim space-y-2">
              <p className="font-bold text-sm text-olive">No questions match your search</p>
              <p>Try searching broader terms or switch category tabs above.</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("All");
                }}
                className="mt-2 text-forest font-bold hover:underline cursor-pointer"
              >
                Clear filter
              </button>
            </div>
          )}
        </div>

        {/* Bottom Assurance Card with Direct 'Contact Support' Email Link */}
        <div className="mt-10 p-6 bg-ivory border border-hairline rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-5 text-xs shadow-2xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-forest-surface flex items-center justify-center text-forest flex-shrink-0 border border-hairline">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-olive">Still have a question or need assistance?</p>
              <p className="text-ink-dim text-xs mt-0.5">
                Our support and research desk is here to help with curriculum access, billing, and custom inquiries.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <a
              id="faq-contact-support-link"
              href="mailto:accounts@thelionslane.com?subject=The%20Capital%20Gains%20Support%20Inquiry"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-forest hover:bg-forest-dark text-white font-bold transition-all shadow-2xs"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Contact Support (accounts@thelionslane.com)</span>
            </a>

            <Link
              href="/courses"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-panel border border-hairline hover:border-forest/40 text-olive font-semibold transition-colors"
            >
              <span>Browse Syllabus</span>
              <ArrowRight className="w-3 h-3 text-forest" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
