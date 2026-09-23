"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronDown,
  Zap,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
} from "lucide-react";
import HeroStockChart from "./HeroStockChart";
import FeaturedCardTrendGraph from "./FeaturedCardTrendGraph";
import type { CourseSummary } from "@/app/(site)/page";

interface FeaturedPlaybookCardProps {
  href: string;
  featuredCourse?: CourseSummary | null;
  featuredWhyPicked?: string | null;
}

export default function FeaturedPlaybookCard({
  href,
  featuredCourse,
  featuredWhyPicked,
}: FeaturedPlaybookCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    setCursorPos({ x, y });
  };

  const handleMouseLeave = () => {
    setCursorPos(null);
  };

  // Determine fast-track link: either direct preview lesson or course link
  const fastTrackHref = href.startsWith("/learn/")
    ? href
    : (featuredCourse?.slug ? `/learn/${featuredCourse.slug}/free-preview` : href);

  const keyTakeaways = [
    "Vega decay vs IV crush during high-volatility events like earnings & Union Budget",
    "Delta-neutral vertical spreads engineered for positive expected return on Dalal Street",
    "Greeks calibration: How Theta decay accelerates inside the final 72 hours to weekly expiry",
  ];

  const prerequisites = [
    "Basic familiarity with equity market buy/sell order types (Limit, Market)",
    "Comfort with elementary algebra & profit/loss payoff diagrams",
    "Zero prior derivatives experience required (built strictly from ground zero)",
  ];

  return (
    <div
      className="lg:col-span-5 relative group"
      id="featured-playbook-hero-wrapper"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Subtle, cursor-responsive SVG trend-line background */}
      <FeaturedCardTrendGraph cursorPos={cursorPos} />

      {/* Subtle refined ambient backlight */}
      <motion.div
        className="absolute -inset-0.5 bg-gradient-to-br from-forest/15 via-gold/10 to-transparent rounded-2xl blur-sm pointer-events-none"
        initial={{ opacity: 0.4 }}
        whileHover={{ opacity: 0.85 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      />

      {/* Interactive Framer Motion card container */}
      <motion.div
        id="featured-playbook-motion-card"
        whileHover={{
          y: -3,
          boxShadow:
            "0 20px 30px -10px rgba(27, 43, 33, 0.12), 0 8px 16px -4px rgba(27, 43, 33, 0.08)",
        }}
        transition={{
          type: "spring",
          stiffness: 380,
          damping: 24,
          mass: 0.75,
        }}
        className="relative rounded-2xl bg-panel border border-hairline p-6 sm:p-7 shadow-xs hover:border-forest/40 transition-colors duration-200 z-10"
      >
        {/* Header section with course tag & playbook pill */}
        <div className="flex justify-between items-start mb-4">
          <div>
            {featuredCourse?.tag && (
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-mono text-[10px] text-gold font-bold tracking-[0.16em] uppercase">
                  {featuredCourse.tag}
                </span>
              </div>
            )}
            <Link href={href} className="group/title block">
              <h3 className="text-xl sm:text-[22px] text-olive leading-snug font-bold group-hover/title:text-forest transition-colors">
                {featuredCourse?.title || "Options Trading from Zero"}
              </h3>
            </Link>
            <div className="text-[12px] text-ink-dim mt-1.5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-forest" />
              <span>{featuredCourse?.lessonsCount || 12} playbook modules</span>
              <span>·</span>
              <span>{featuredCourse?.duration || "~4 hrs study"}</span>
            </div>
          </div>
          <span className="bg-forest text-white font-mono text-[9px] font-bold rounded-md px-2.5 py-1 tracking-widest uppercase flex-shrink-0">
            PLAYBOOK
          </span>
        </div>

        <div className="space-y-4">
          <div className="p-3.5 bg-ivory/70 border border-hairline rounded-xl">
            <p className="text-[13px] text-ink-dim leading-relaxed">
              {featuredWhyPicked ||
                "Our flagship systematic guide to Indian index and stock options. Covers payoff geometry, implied volatility, Greeks, and high-probability spread construction for retail accounts."}
            </p>
          </div>

          {/* Action Row: Primary Start + Fast-Track Free Preview Button */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <Link
              href={href}
              className="flex items-center justify-between px-4 py-2.5 text-xs font-bold text-forest bg-forest-surface rounded-xl hover:bg-forest hover:text-white transition-colors cursor-pointer"
            >
              <span>Explore Playbook</span>
              <span className="font-mono text-sm">→</span>
            </Link>

            {/* Fast-Track Button: Specifically highlighting it as the 'Quickest way to start' for new visitors */}
            <Link
              href={fastTrackHref}
              id="hero-fast-track-button"
              className="relative flex items-center justify-between px-3.5 py-2.5 text-xs font-bold text-white bg-forest hover:bg-forest-dark rounded-xl shadow-xs transition-all group/fast cursor-pointer overflow-hidden border border-forest/50"
              title="Jump directly to Free Preview Lesson 1"
            >
              <div className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-gold fill-gold" />
                <span className="tracking-tight">Fast-track</span>
              </div>
              <span className="font-mono text-[9px] text-ivory/90 font-medium px-1.5 py-0.5 rounded bg-black/20 tracking-tight">
                Quickest way to start
              </span>
            </Link>
          </div>

          {/* Expandable State Toggle Button */}
          <button
            type="button"
            id="toggle-featured-card-expand"
            onClick={() => setIsExpanded((prev) => !prev)}
            aria-expanded={isExpanded}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-ivory/80 border border-hairline hover:border-forest/40 text-[11px] font-mono font-bold text-olive transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-1.5 text-forest">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{isExpanded ? "Hide Course Scope & Prerequisites" : "View Key Takeaways & Prerequisites"}</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-ink-dim transition-transform duration-200 ${
                isExpanded ? "rotate-180 text-forest" : ""
              }`}
            />
          </button>

          {/* Expandable Panel: Key Takeaways & Prerequisites */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                id="featured-playbook-expanded-panel"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.28, ease: "easeInOut" }}
                className="overflow-hidden space-y-3 pt-1"
              >
                {/* Key Takeaways */}
                <div className="p-3.5 rounded-xl bg-forest/5 border border-forest/15 space-y-2">
                  <div className="flex items-center gap-1.5 text-forest font-mono text-[10px] font-bold uppercase tracking-wider">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Key Architectural Takeaways:</span>
                  </div>
                  <ul className="space-y-1.5">
                    {keyTakeaways.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-[11px] text-ink-dim leading-snug">
                        <span className="font-mono text-[9px] font-bold text-forest mt-0.5">0{idx + 1}.</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Prerequisites */}
                <div className="p-3.5 rounded-xl bg-ivory border border-hairline space-y-2">
                  <div className="flex items-center gap-1.5 text-gold font-mono text-[10px] font-bold uppercase tracking-wider">
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Prerequisites & Entry Requirements:</span>
                  </div>
                  <ul className="space-y-1">
                    {prerequisites.map((req, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-[11px] text-ink-dim">
                        <span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Quick Link inside expanded state */}
                <div className="flex items-center justify-between text-[11px] font-mono pt-1 text-ink-muted">
                  <span>Text-first playbook curriculum</span>
                  <Link
                    href={href}
                    className="text-forest font-bold inline-flex items-center gap-1 hover:underline"
                  >
                    <span>Full Curriculum</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Interactive Price History Chart (Recharts) */}
          <HeroStockChart />
        </div>
      </motion.div>
    </div>
  );
}
