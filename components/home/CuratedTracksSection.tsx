"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import LevelBadge from "@/components/courses/LevelBadge";
import { ArrowRight, BookOpen, Clock, Layers, Sparkles } from "lucide-react";
import PlaybookSneakPeekDrawer from "./PlaybookSneakPeekDrawer";

interface TrackItem {
  title: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  desc: string;
  coursesCount: string;
  duration: string;
  slug: string;
  tag: string;
  category: "equity" | "derivatives" | "structure";
  excerptId: string;
  highlights: string[];
}

const TRACKS_DATA: TrackItem[] = [
  {
    title: "Foundations of Equity & Intrinsic Valuation",
    level: "Beginner",
    desc: "Master balance sheets, operating cash flows, ratio forensics, and discounted cash flow valuation for Indian listed firms.",
    coursesCount: "3 Courses",
    duration: "~9 hrs",
    slug: "how-to-read-financial-statements",
    tag: "EQUITY RESEARCH",
    category: "equity",
    excerptId: "forensic-cfo-pat",
    highlights: ["Forensic Accruals Screen", "Ind AS 115 Revenue Red Flags", "DCF Margin of Safety"],
  },
  {
    title: "Derivatives, Options & Greek Volatility",
    level: "Intermediate",
    desc: "Comprehensive mechanics of Greeks, implied volatility surfaces, directional spreads, and portfolio delta hedging.",
    coursesCount: "2 Courses",
    duration: "~7 hrs",
    slug: "options-trading-from-zero",
    tag: "DERIVATIVES & F&O",
    category: "derivatives",
    excerptId: "options-expiry-gamma",
    highlights: ["0DTE Gamma Spikes", "Defined Risk Spread Geometry", "India VIX Regime Shifts"],
  },
  {
    title: "Market Mechanics & Technical Microstructure",
    level: "Beginner",
    desc: "Understand exchange microstructure, clearing settlement, liquidity cycles, and institutional order-flow behavior.",
    coursesCount: "2 Courses",
    duration: "~6 hrs",
    slug: "stock-market-from-zero",
    tag: "MARKET STRUCTURE",
    category: "structure",
    excerptId: "options-expiry-gamma",
    highlights: ["NSE Clearing Settlement", "Order Book Depth Dynamics", "Institutional Volume Profiling"],
  },
];

interface CuratedTracksSectionProps {
  totalCatalogCourseCount?: number;
}

export default function CuratedTracksSection({
  totalCatalogCourseCount = 6,
}: CuratedTracksSectionProps) {
  const [activeCategory, setActiveCategory] = useState<"all" | "equity" | "derivatives" | "structure">("all");
  const [previewExcerptId, setPreviewExcerptId] = useState<string | null>(null);

  const filteredTracks = TRACKS_DATA.filter((track) => {
    if (activeCategory === "all") return true;
    return track.category === activeCategory;
  });

  return (
    <section id="curated-tracks-section" className="py-16 md:py-20 bg-ivory border-b border-hairline">
      <div className="site-container space-y-9">
        {/* Section Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="font-mono text-[11px] text-gold tracking-[0.16em] font-bold uppercase mb-2">
              STRUCTURED PATHWAYS
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-olive tracking-tight">
              Curated Learning Tracks
            </h2>
            <p className="text-ink-dim text-sm sm:text-base mt-1">
              Targeted curricula designed to build practical, unconflicted competency step by step.
            </p>
          </div>

          <Link
            href="/courses"
            className="text-xs font-bold text-forest hover:text-forest-dark inline-flex items-center gap-1.5 flex-shrink-0 group py-1"
          >
            <span>View Full Catalog ({totalCatalogCourseCount} Courses)</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-hairline pb-4 overflow-x-auto">
          {[
            { id: "all", label: "All Pathways", count: TRACKS_DATA.length },
            { id: "equity", label: "Equity & Valuation", count: 1 },
            { id: "derivatives", label: "Derivatives & F&O", count: 1 },
            { id: "structure", label: "Market Microstructure", count: 1 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id as typeof activeCategory)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeCategory === tab.id
                  ? "bg-forest text-white shadow-xs font-bold"
                  : "bg-panel border border-hairline text-ink-dim hover:text-ink hover:border-forest/30"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`font-mono text-[10px] px-1.5 py-0.2 rounded ${
                  activeCategory === tab.id
                    ? "bg-white/20 text-white"
                    : "bg-ivory text-ink-dim"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Dynamic Animated Tracks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredTracks.map((track) => (
              <motion.div
                key={track.title}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.2 }}
                className="group bg-panel border border-hairline rounded-2xl p-6 hover:border-forest/40 hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-gold font-bold tracking-[0.16em] uppercase">
                      {track.tag}
                    </span>
                    <LevelBadge level={track.level} />
                  </div>

                  <h3 className="text-lg font-bold text-olive group-hover:text-forest transition-colors leading-snug">
                    <Link href={`/courses/${track.slug}`} className="hover:underline">
                      {track.title}
                    </Link>
                  </h3>

                  <p className="text-xs text-ink-dim leading-relaxed">
                    {track.desc}
                  </p>

                  {/* Syllabus Bullet Highlights */}
                  <div className="pt-2.5 pb-1 space-y-1.5 border-t border-hairline">
                    <span className="text-[10px] font-mono text-ink-muted uppercase tracking-wider block">
                      Core Frameworks
                    </span>
                    {track.highlights.map((highlight) => (
                      <div key={highlight} className="flex items-center gap-2 text-[11px] text-ink-dim font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-forest flex-shrink-0" />
                        <span>{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-hairline flex items-center justify-between text-xs text-ink-dim">
                  <div className="flex items-center gap-1 font-mono text-[11px] text-ink-muted">
                    <Clock className="w-3 h-3 text-ink-muted" />
                    <span>{track.duration}</span>
                    <span>·</span>
                    <span>{track.coursesCount}</span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setPreviewExcerptId(track.excerptId)}
                      className="text-[11px] font-bold text-ink-dim hover:text-forest underline underline-offset-2 transition-colors"
                    >
                      Sample Excerpt
                    </button>
                    <Link
                      href={`/courses/${track.slug}`}
                      className="font-bold text-forest group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-0.5"
                    >
                      <span>Explore</span>
                      <span>→</span>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Chapter Excerpt Modal Drawer */}
      <PlaybookSneakPeekDrawer
        isOpen={Boolean(previewExcerptId)}
        onClose={() => setPreviewExcerptId(null)}
        defaultExcerptId={previewExcerptId || "options-expiry-gamma"}
      />
    </section>
  );
}
