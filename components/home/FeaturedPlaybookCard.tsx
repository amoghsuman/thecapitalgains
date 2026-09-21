"use client";

import Link from "next/link";
import { motion } from "motion/react";
import HeroStockChart from "./HeroStockChart";
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
  return (
    <div className="lg:col-span-5 relative group" id="featured-playbook-hero-wrapper">
      {/* Subtle refined ambient backlight */}
      <motion.div
        className="absolute -inset-0.5 bg-gradient-to-br from-forest/15 via-gold/10 to-transparent rounded-2xl blur-sm pointer-events-none"
        initial={{ opacity: 0.4 }}
        whileHover={{ opacity: 0.8 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      />

      {/* Interactive Framer Motion card container with slight scale up & shadow lift */}
      <motion.div
        id="featured-playbook-motion-card"
        whileHover={{
          scale: 1.012,
          y: -4,
          boxShadow:
            "0 20px 30px -10px rgba(27, 43, 33, 0.1), 0 8px 16px -4px rgba(27, 43, 33, 0.06)",
        }}
        whileTap={{ scale: 0.995, y: -1 }}
        transition={{
          type: "spring",
          stiffness: 380,
          damping: 24,
          mass: 0.75,
        }}
        className="relative rounded-2xl"
      >
        <Link
          href={href}
          id="featured-playbook-link"
          className="relative block bg-panel border border-hairline rounded-2xl p-6 sm:p-7 shadow-xs hover:border-forest/40 transition-colors duration-200"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              {featuredCourse?.tag && (
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-mono text-[10px] text-gold font-bold tracking-[0.16em] uppercase">
                    {featuredCourse.tag}
                  </span>
                </div>
              )}
              <h3 className="text-xl sm:text-[22px] text-olive leading-snug font-bold">
                {featuredCourse?.title || "Options Trading from Zero"}
              </h3>
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

            <div className="flex items-center justify-between px-4 py-2.5 text-xs font-bold text-forest bg-forest-surface rounded-xl group-hover:bg-forest group-hover:text-white transition-colors">
              <span>Start this playbook</span>
              <span className="font-mono text-sm">→</span>
            </div>

            {/* Interactive Price History Chart (Recharts) */}
            <HeroStockChart />
          </div>
        </Link>
      </motion.div>
    </div>
  );
}
