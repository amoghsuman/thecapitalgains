"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  HelpCircle,
  ChevronDown,
  ShieldCheck,
  Briefcase,
  Layers,
  Sparkles,
  ArrowRight,
  Lock,
} from "lucide-react";
import Link from "next/link";

interface FaqItem {
  id: string;
  category: "integrity" | "format" | "schedule";
  categoryLabel: string;
  question: string;
  answer: string;
  highlight?: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    id: "no-tips-advisory",
    category: "integrity",
    categoryLabel: "Regulatory & Integrity",
    question: "Do you provide Telegram calls, buy/sell tips, or stock recommendations?",
    answer:
      "Strictly no. The Capital Gains is 100% independent financial architecture and research. We have zero broker referral deals, zero sponsored stock coverage, and zero advisory channels. We believe speculative tips destroy retail capital. Our mission is to teach you how to read statutory balance sheets, evaluate intrinsic free cash flows, and execute disciplined option risk budgets yourself.",
    highlight: "Zero tips. Zero broker kickbacks. 100% independent pedagogy.",
  },
  {
    id: "salaried-professionals",
    category: "schedule",
    categoryLabel: "F&O & Work Schedule",
    question: "Can salaried working professionals apply these playbooks without watching screens all day?",
    answer:
      "Yes, that is exactly who this was built for. Intraday scalping is where retail investors suffer maximum churn and slippage. Our playbooks prioritize End-of-Day (EOD) swing frameworks, structural fundamental valuation, and multi-week delta-hedged option spreads. You analyze companies on weekends or after 6:00 PM, placing disciplined limit orders or systemic bracket orders without intraday screen anxiety.",
    highlight: "Designed for EOD systematic analysis, not 9:15–3:30 screen watching.",
  },
  {
    id: "one-rupee-research",
    category: "integrity",
    categoryLabel: "Regulatory & Integrity",
    question: "Why do your deep research passes start at just ₹1?",
    answer:
      "Institutional-grade equity research in India has historically been gatekept behind ₹50,000–₹1,00,000 annual institutional subscriptions. By micro-pricing deep forensic research passes at ₹1, we eliminate friction for serious retail investors while keeping our research unconflicted and independent. You pay for what you read, with zero forced long-term lock-ins.",
    highlight: "Democratizing institutional research with zero subscription traps.",
  },
  {
    id: "text-vs-video",
    category: "format",
    categoryLabel: "Learning Format",
    question: "How does a text playbook compare to traditional 20-hour video courses?",
    answer:
      "Video courses are notoriously inefficient: you spend 20 minutes watching someone talk through a 30-second formula, and you cannot search or reference them when analyzing a stock. Our playbooks are high-density, text-first technical manuals complete with interactive math widgets, balance sheet footnotes, and searchable checklists. You absorb concepts 3x faster and retain them as permanent operational reference guides.",
    highlight: "Searchable, dense, and referenced in seconds during real analysis.",
  },
  {
    id: "prerequisites-math",
    category: "format",
    categoryLabel: "Learning Format",
    question: "What level of prior financial or mathematics knowledge is required?",
    answer:
      "None. Every track begins with first-principles intuition before moving to advanced mechanics. In options, we don't start with Black-Scholes partial differential equations; we start with the real-world geometry of risk, step by step. If you can read an electricity bill or understand high-school arithmetic, you can master every playbook in this curriculum.",
    highlight: "First-principles progression from zero jargon to institutional rigor.",
  },
  {
    id: "sebi-compliance",
    category: "integrity",
    categoryLabel: "Regulatory & Integrity",
    question: "Are your frameworks compliant with SEBI regulations and Indian taxation?",
    answer:
      "Yes. All materials are educational and analytical frameworks, operating strictly under non-advisory educational boundaries in compliance with SEBI (Investment Advisers) Regulations, 2013. Furthermore, our curricula are explicitly tailored to Indian market reality: NSE/BSE contract lots, clearing settlement mechanics, India VIX cycles, and Indian capital gains taxation (STCG, LTCG, and Section 43(5) non-speculative business income for F&O).",
    highlight: "Grounded in Indian statutory tax codes and SEBI regulatory standards.",
  },
];

export default function InstitutionalFaq() {
  const [activeCategory, setActiveCategory] = useState<"all" | "integrity" | "format" | "schedule">("all");
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

  const filteredItems = FAQ_ITEMS.filter((item) => {
    if (activeCategory === "all") return true;
    return item.category === activeCategory;
  });

  return (
    <section id="faq-section" className="py-16 md:py-20 bg-panel border-b border-hairline">
      <div className="site-container max-w-5xl">
        {/* Section Header */}
        <div className="max-w-2xl mx-auto text-center mb-10 space-y-3">
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

        {/* Filter Category Pills */}
        <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
          {[
            { id: "all", label: "All Questions" },
            { id: "integrity", label: "Regulatory & Integrity" },
            { id: "schedule", label: "F&O & Work Schedule" },
            { id: "format", label: "Text Playbook Format" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id as typeof activeCategory)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all border ${
                activeCategory === tab.id
                  ? "bg-forest text-white border-forest shadow-xs font-bold"
                  : "bg-panel text-ink-dim border-hairline hover:text-ink hover:border-forest/30"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Accordion Stack */}
        <div className="space-y-3.5">
          {filteredItems.map((item) => {
            const isOpen = openIds.has(item.id);
            return (
              <div
                key={item.id}
                id={`faq-item-${item.id}`}
                className={`bg-panel border rounded-2xl transition-colors duration-200 overflow-hidden ${
                  isOpen ? "border-forest/40 shadow-sm" : "border-hairline hover:border-forest/25"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  aria-expanded={isOpen}
                  className="w-full text-left p-5 sm:p-6 flex items-start justify-between gap-4 select-none cursor-pointer"
                >
                  <div className="space-y-1">
                    <span className="font-mono text-[10px] text-gold-text tracking-wider uppercase font-semibold block">
                      {item.categoryLabel}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-olive leading-snug">
                      {item.question}
                    </h3>
                  </div>

                  <span
                    className={`w-7 h-7 rounded-full border border-hairline flex items-center justify-center flex-shrink-0 mt-0.5 text-ink-dim transition-transform duration-200 ${
                      isOpen ? "rotate-180 bg-forest-surface text-forest" : "bg-ivory"
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                    >
                      <div className="px-5 sm:px-6 pb-6 pt-1 text-sm text-ink-dim leading-relaxed space-y-3 border-t border-hairline/60">
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
          })}
        </div>

        {/* Bottom Assurance Card */}
        <div className="mt-10 p-5 bg-panel border border-hairline rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-forest-surface flex items-center justify-center text-forest flex-shrink-0 border border-hairline">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-olive">Have a question not covered here?</p>
              <p className="text-ink-dim">Explore our curriculum roadmap or view syllabus details.</p>
            </div>
          </div>

          <Link
            href="/courses"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-forest-surface hover:bg-forest text-forest hover:text-white font-bold transition-colors self-start sm:self-auto"
          >
            <span>Browse Full Syllabus</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </section>
  );
}
