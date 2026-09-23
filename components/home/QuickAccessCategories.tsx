"use client";

import Link from "next/link";
import { ArrowUpRight, TrendingUp, Layers, FileSearch, type LucideIcon } from "lucide-react";
import { TRACK_GROUPS } from "@/lib/home/trackGroups";
import type { CourseSummary } from "@/app/(site)/page";

// Which courses a card counts: one learning path, or every path in a track group.
type Scope = { path: string } | { group: string };

interface CategoryCard {
  title: string;
  tag: string;
  desc: string;
  href: string;
  icon: LucideIcon;
  accentBg: string;
  /** Omitted for the portfolios card, whose count comes from Sanity portfolios. */
  scope?: Scope;
}

const CATEGORIES: CategoryCard[] = [
  {
    title: "Options Trading & Volatility",
    tag: "F&O SPECIALIZATION",
    desc: "Delta hedging, Vega crush during earnings, iron condors, and mathematical margin management for Indian retail traders.",
    href: "/courses?path=options-derivatives",
    scope: { path: "options-derivatives" },
    icon: TrendingUp,
    accentBg: "bg-forest-surface text-forest",
  },
  {
    title: "Portfolio Management & Asset Allocation",
    tag: "WEALTH ARCHITECTURE",
    desc: "Rebalancing mechanics, cross-asset quilts, Sharpe frontier optimization, and dividend compounding across Indian cycles.",
    href: "/portfolios",
    icon: Layers,
    accentBg: "bg-gold-surface text-gold-text",
  },
  {
    title: "Forensic Accounting & Cash Flow Audits",
    tag: "FUNDAMENTAL RESEARCH",
    desc: "Uncovering promoter pledge traps, EBITDA-to-CFO divergence, working capital manipulation, and clean balance sheet screens.",
    href: "/courses?group=corporate-finance",
    scope: { group: "corporate-finance" },
    icon: FileSearch,
    accentBg: "bg-forest-surface text-forest",
  },
];

function pathsFor(scope: Scope): readonly string[] {
  if ("path" in scope) return [scope.path];
  return TRACK_GROUPS.find((g) => g.slug === scope.group)?.paths ?? [];
}

function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

interface QuickAccessCategoriesProps {
  courses: CourseSummary[];
  /** Number of model portfolios published in Sanity (getPortfolios()). */
  portfolioCount: number;
}

export default function QuickAccessCategories({ courses, portfolioCount }: QuickAccessCategoriesProps) {
  const trackCount = new Set(courses.map((c) => c.learningPath).filter(Boolean)).size;

  // Live counts: courses on the card's path(s) and the sum of their lessonsCount.
  const statsFor = (cat: CategoryCard): string => {
    if (!cat.scope) return plural(portfolioCount, "model portfolio");
    const paths = pathsFor(cat.scope);
    const inScope = courses.filter((c) => c.learningPath && paths.includes(c.learningPath));
    const lessons = inScope.reduce((sum, c) => sum + (c.lessonsCount ?? 0), 0);
    if (inScope.length === 0) return "Coming soon";
    return `${plural(inScope.length, "Playbook")} · ${plural(lessons, "Lesson")}`;
  };

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
            <span>Explore All {trackCount} Tracks</span>
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
                  <span className="font-semibold text-ink">{statsFor(cat)}</span>
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
