"use client";

import Link from "next/link";
import { ArrowUpRight, TrendingUp, Layers, FileSearch, ShieldCheck, PieChart, Activity, type LucideIcon } from "lucide-react";

interface CategoryCard {
  title: string;
  tag: string;
  desc: string;
  stats: string;
  href: string;
  icon: LucideIcon;
  accentBg: string;
}

const CATEGORIES: CategoryCard[] = [
  {
    title: "Options Trading & Volatility",
    tag: "F&O SPECIALIZATION",
    desc: "Delta hedging, Vega crush during earnings, iron condors, and mathematical margin management for Indian retail traders.",
    stats: "8 Playbooks &middot; 42 Lessons",
    href: "/courses?group=options-derivatives",
    icon: TrendingUp,
    accentBg: "bg-forest-surface text-forest",
  },
  {
    title: "Portfolio Management & Asset Allocation",
    tag: "WEALTH ARCHITECTURE",
    desc: "Rebalancing mechanics, cross-asset quilts, Sharpe frontier optimization, and dividend compounding across Indian cycles.",
    stats: "6 Playbooks &middot; 34 Lessons",
    href: "/portfolios",
    icon: Layers,
    accentBg: "bg-gold-surface text-gold-text",
  },
  {
    title: "Forensic Accounting & Cash Flow Audits",
    tag: "FUNDAMENTAL RESEARCH",
    desc: "Uncovering promoter pledge traps, EBITDA-to-CFO divergence, working capital manipulation, and clean balance sheet screens.",
    stats: "5 Playbooks &middot; 28 Lessons",
    href: "/courses?group=corporate-finance",
    icon: FileSearch,
    accentBg: "bg-forest-surface text-forest",
  },
];

export default function QuickAccessCategories() {
  return (
    <section id="quick-access-categories" className="py-12 bg-ivory border-b border-hairline">
      <div className="site-container space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="font-mono text-[10px] text-gold font-bold tracking-widest uppercase mb-1">
              FAST-TRACK CURRICULUM
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-olive tracking-tight">
              Quick Access: Core Disciplines
            </h2>
            <p className="text-xs sm:text-sm text-ink-dim max-w-xl mt-0.5 leading-relaxed">
              Jump straight into our most rigorous, battle-tested curriculum tracks designed for high-conviction decision making.
            </p>
          </div>

          <Link
            href="/courses"
            className="text-xs font-mono font-bold text-forest hover:text-forest-dark inline-flex items-center gap-1 group py-1"
          >
            <span>Explore All 32 Tracks</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>

        {/* 3 Prominent Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.title}
                href={cat.href}
                className="group p-6 rounded-2xl bg-panel border border-hairline hover:border-forest/40 hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border border-hairline ${cat.accentBg}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-mono text-[9px] font-bold text-gold tracking-widest uppercase bg-ivory px-2.5 py-1 rounded border border-hairline">
                      {cat.tag}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-olive group-hover:text-forest transition-colors leading-snug flex items-center gap-1">
                      <span>{cat.title}</span>
                      <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all text-forest" />
                    </h3>
                    <p className="text-xs text-ink-dim leading-relaxed mt-2">
                      {cat.desc}
                    </p>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-hairline flex items-center justify-between text-xs font-mono text-ink-dim">
                  <span className="font-semibold text-ink">{cat.stats}</span>
                  <span className="text-forest font-bold group-hover:underline">Launch Track →</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
