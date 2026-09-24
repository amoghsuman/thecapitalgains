"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, BookOpen, Clock, ExternalLink } from "lucide-react";
import { TRACK_GROUPS, learningPathTitle } from "@/lib/home/trackGroups";
import { LEVELS, mapLevel, parseDurationHours, type Level } from "@/lib/courses/level";
import type { CourseSummary } from "@/app/(site)/page";
import type { FeaturedLearningPath } from "@/lib/sanity/queries";

type PathStats = {
  courseCount: number;
  levelMix: Record<Level, number>;
  hours: number;
};

interface FindYourCourseSectionProps {
  courses: CourseSummary[];
  featuredPaths: FeaturedLearningPath[];
}

export default function FindYourCourseSection({ courses, featuredPaths }: FindYourCourseSectionProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const groupCounts = useMemo(() => {
    const out: Record<string, number> = {};
    for (const g of TRACK_GROUPS) {
      const paths: readonly string[] = g.paths;
      out[g.slug] = courses.filter((c) => c.learningPath && paths.includes(c.learningPath)).length;
    }
    return out;
  }, [courses]);

  const levelCounts = useMemo(() => {
    const out: Record<string, number> = {};
    for (const l of LEVELS) out[l] = courses.filter((c) => mapLevel(c.tag) === l).length;
    return out;
  }, [courses]);

  const term = query.trim();

  const filteredCourses = useMemo(() => {
    const q = term.toLowerCase();
    if (!q) return [];
    return courses.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.topics?.some((t) => t.toLowerCase().includes(q))
    );
  }, [courses, term]);

  const isFiltering = term.length > 0;
  const resultsHref = `/courses?q=${encodeURIComponent(term)}`;

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    router.push(term ? resultsHref : "/courses");
  }

  const statsByPath = useMemo(() => {
    const out: Record<string, PathStats> = {};
    for (const fp of featuredPaths) {
      const inPath = courses.filter((c) => c.learningPath === fp.path);
      const levelMix: Record<Level, number> = { Beginner: 0, Intermediate: 0, Advanced: 0 };
      let hours = 0;

      for (const c of inPath) {
        const level = mapLevel(c.tag);
        if (level) levelMix[level] += 1;
        const h = parseDurationHours(c.duration);
        if (h !== null) hours += h;
      }

      out[fp.path] = {
        courseCount: inPath.length,
        levelMix,
        hours,
      };
    }
    return out;
  }, [courses, featuredPaths]);

  return (
    <section id="courses-section" className="py-16 md:py-20 bg-ivory border-b border-hairline">
      <div className="site-container space-y-10">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="font-mono text-[11px] text-gold tracking-[0.16em] font-bold uppercase mb-2">
              CURRICULUM ARCHITECTURE
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-olive tracking-tight">
              Find Your Course
            </h2>
            <p className="text-ink-dim text-sm sm:text-base mt-1 max-w-2xl leading-relaxed">
              Targeted playbooks designed to build practical, unconflicted competency step by step.
            </p>
          </div>

          <Link
            href="/courses"
            className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-forest hover:text-forest-dark transition-colors self-start sm:self-auto shrink-0"
          >
            <span>View full catalogue ({courses.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Search Bar + Live Dropdown */}
        <div className="space-y-4">
          <form onSubmit={submit} className="relative max-w-3xl">
            <Search className="w-4 h-4 text-ink-dim absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search across all playbooks (e.g. 'Options', 'Forensic', 'Cash Flow', 'WACC')..."
              className="w-full pl-11 pr-24 py-3.5 rounded-2xl border border-hairline bg-panel focus:bg-white focus:outline-none focus:ring-1 focus:ring-forest text-sm text-ink placeholder:text-ink-muted shadow-2xs"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-14 top-1/2 -translate-y-1/2 text-ink-dim hover:text-ink text-xs p-1"
                title="Clear query"
              >
                ✕
              </button>
            ) : null}
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-forest hover:bg-forest-dark text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Search
            </button>

            {/* Live Filter Preview Dropdown */}
            {isFiltering && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-panel border border-hairline rounded-2xl shadow-xl z-30 max-h-80 overflow-y-auto p-2">
                {filteredCourses.length > 0 ? (
                  <div className="space-y-1">
                    <div className="px-3 py-1.5 text-[11px] font-mono text-ink-muted uppercase border-b border-hairline">
                      Matches ({filteredCourses.length})
                    </div>
                    {filteredCourses.slice(0, 6).map((c) => (
                      <Link
                        key={c.slug}
                        href={`/courses/${c.slug}`}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-ivory text-xs group transition-colors"
                      >
                        <div className="min-w-0 pr-3">
                          <div className="font-semibold text-olive group-hover:text-forest truncate">
                            {c.title}
                          </div>
                          {c.description && (
                            <div className="text-[11px] text-ink-dim truncate">
                              {c.description}
                            </div>
                          )}
                        </div>
                        <span className="font-mono text-[10px] text-ink-dim bg-ivory px-2 py-0.5 rounded border border-hairline shrink-0">
                          {c.tag || "Course"}
                        </span>
                      </Link>
                    ))}
                    {filteredCourses.length > 6 && (
                      <Link
                        href={resultsHref}
                        className="block text-center p-2 text-xs font-mono font-semibold text-forest hover:underline"
                      >
                        View all {filteredCourses.length} results →
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs text-ink-dim font-mono">
                    No playbooks found matching &ldquo;{query}&rdquo;
                  </div>
                )}
              </div>
            )}
          </form>

          {/* Group and Level Pills */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-mono text-[10px] uppercase font-bold text-ink-muted mr-1">
                Tracks:
              </span>
              {TRACK_GROUPS.map((g) => {
                const count = groupCounts[g.slug] ?? 0;
                return (
                  <Link
                    key={g.slug}
                    href={`/courses?group=${g.slug}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-panel border border-hairline hover:border-forest/40 hover:bg-ivory text-olive transition-all font-medium"
                  >
                    <span>{g.title}</span>
                    <span className="font-mono text-[10px] text-ink-dim">({count})</span>
                  </Link>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-mono text-[10px] uppercase font-bold text-ink-muted mr-1">
                Level:
              </span>
              {LEVELS.map((lvl) => {
                const count = levelCounts[lvl] ?? 0;
                return (
                  <Link
                    key={lvl}
                    href={`/courses?level=${lvl}`}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] bg-panel border border-hairline hover:border-forest/40 hover:bg-ivory text-ink-dim hover:text-ink transition-all font-mono"
                  >
                    <span>{lvl}</span>
                    <span>({count})</span>
                  </Link>
                );
              })}
            </div>

            {/* Quick Access Text Links */}
            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-ink-dim">
              <span className="font-mono text-[10px] uppercase font-bold text-ink-muted">
                Quick jumps:
              </span>
              <Link
                href="/courses?path=options-derivatives"
                className="hover:text-forest underline underline-offset-2 transition-colors font-medium"
              >
                Options path
              </Link>
              <span className="text-hairline">·</span>
              <Link
                href="/courses?group=corporate-finance"
                className="hover:text-forest underline underline-offset-2 transition-colors font-medium"
              >
                Corporate finance group
              </Link>
              <span className="text-hairline">·</span>
              <Link
                href="/portfolios"
                className="hover:text-forest underline underline-offset-2 transition-colors font-medium"
              >
                Portfolios
              </Link>
            </div>
          </div>
        </div>

        {/* Featured Learning Path Cards (3-column grid, 2 on tablet, 1 on mobile) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredPaths.map((fp) => {
            const stats = statsByPath[fp.path] || {
              courseCount: 0,
              levelMix: { Beginner: 0, Intermediate: 0, Advanced: 0 },
              hours: 0,
            };
            const parentGroup = TRACK_GROUPS.find((g) => g.paths.includes(fp.path));

            return (
              <div
                key={fp.path}
                className="bg-panel border border-hairline rounded-2xl p-6 flex flex-col justify-between hover:border-forest/40 transition-all hover:shadow-xs group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-forest/10 text-forest border border-forest/20">
                      {parentGroup?.title ?? "PATHWAY"}
                    </span>
                    <span className="font-mono text-[10px] text-ink-muted">
                      {stats.hours > 0 ? `~${Math.round(stats.hours)} hrs` : "Self-paced"}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-olive group-hover:text-forest transition-colors leading-snug">
                    {learningPathTitle(fp.path)}
                  </h3>

                  <p className="text-xs text-ink-dim leading-relaxed">
                    {fp.blurb}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-hairline flex items-center justify-between">
                  <span className="font-mono text-xs font-medium text-ink-dim flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-forest" />
                    <span>
                      {stats.courseCount} {stats.courseCount === 1 ? "course" : "courses"}
                    </span>
                  </span>

                  <Link
                    href={`/courses?path=${fp.path}`}
                    className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-forest group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>Explore</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
