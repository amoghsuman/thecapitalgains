"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { TRACK_GROUPS } from "@/lib/home/trackGroups";
import { LEVELS, mapLevel } from "@/lib/courses/level";
import type { CourseSummary } from "@/app/(site)/page";

interface HomeCourseSearchBarProps {
  courses: CourseSummary[];
}

// Typing shows a live preview of the first six matches; submitting (Enter or
// the button) hands the term to /courses?q=, where the full catalogue filters
// on title, description and topics. The pills are plain links into the
// catalogue by track group (?group=) and by level (?level=).
export default function HomeCourseSearchBar({ courses }: HomeCourseSearchBarProps) {
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

  // Same fields as the catalogue's ?q= filter, so the preview and the results page agree.
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

  return (
    <section id="home-course-search-section" className="py-12 bg-panel border-b border-hairline">
      <div className="site-container space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="font-mono text-[10px] text-gold font-bold tracking-widest uppercase mb-1">
              INSTANT CURRICULUM EXPLORER
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-olive tracking-tight">
              Search & Filter Playbooks
            </h2>
            <p className="text-xs sm:text-sm text-ink-dim max-w-xl mt-0.5 leading-relaxed">
              Find specific frameworks across options, quantitative risk, forensic balance sheets, and Indian equity structures.
            </p>
          </div>

          <div className="text-xs font-mono text-ink-dim">
            Indexing <strong>{courses.length}</strong> audited textbooks & modules
          </div>
        </div>

        {/* Search Input and Filter Row */}
        <div className="bg-ivory border border-hairline rounded-2xl p-4 sm:p-5 space-y-4 shadow-2xs">
          <form role="search" action="/courses" method="get" onSubmit={submit} className="relative flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-ink-dim absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                name="q"
                id="home-course-search-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by topic, keyword, strike selection, or financial ratio (e.g., 'Options', 'P/E', 'EBITDA', 'Iron Condor')..."
                className="w-full pl-11 pr-10 py-3 rounded-xl border border-hairline bg-panel focus:bg-white focus:outline-none focus:ring-1 focus:ring-forest text-xs sm:text-sm text-ink placeholder:text-ink-muted"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-dim hover:text-ink text-xs p-1 cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-4 py-3 rounded-xl bg-forest hover:bg-forest-dark text-white font-mono text-xs font-bold shadow-2xs cursor-pointer shrink-0"
            >
              Search
            </button>
          </form>

          {/* Track group and level links into the catalogue */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs pt-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-mono text-[10px] text-ink-dim uppercase tracking-wider font-bold mr-1">
                Track:
              </span>
              {TRACK_GROUPS.map((g) => (
                <Link
                  key={g.slug}
                  href={`/courses?group=${g.slug}`}
                  className="px-2.5 py-1 rounded-lg font-mono text-[11px] transition-all cursor-pointer bg-panel border border-hairline text-ink-dim hover:text-ink hover:border-forest/30"
                >
                  {g.title} <span className="text-ink-muted">({groupCounts[g.slug] ?? 0})</span>
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-mono text-[10px] text-ink-dim uppercase tracking-wider font-bold mr-1">
                Level:
              </span>
              {LEVELS.map((lvl) => (
                <Link
                  key={lvl}
                  href={`/courses?level=${lvl}`}
                  className="px-3 py-1 rounded-lg font-mono text-xs transition-all cursor-pointer bg-panel border border-hairline text-ink-dim hover:text-ink hover:border-forest/30"
                >
                  {lvl} <span className="text-ink-muted">({levelCounts[lvl] ?? 0})</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Live Filter Results Display */}
        {isFiltering && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-xs font-mono text-ink-dim">
              <span>
                Found <strong>{filteredCourses.length}</strong> matching playbooks
                {filteredCourses.length > 6 && (
                  <>
                    {" · "}
                    <Link href={resultsHref} className="text-forest hover:underline">
                      See all in the catalogue →
                    </Link>
                  </>
                )}
              </span>
              <button
                type="button"
                onClick={() => setQuery("")}
                className="text-forest hover:underline cursor-pointer"
              >
                Reset
              </button>
            </div>

            {filteredCourses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCourses.slice(0, 6).map((c) => (
                  <Link
                    key={c._id}
                    href={`/courses/${c.slug}`}
                    className="p-4 rounded-xl bg-ivory border border-hairline hover:border-forest/40 hover:bg-ivory/80 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono text-[9px] font-bold text-forest uppercase bg-forest-surface px-2 py-0.5 rounded">
                          {c.tag || "General"}
                        </span>
                        <span className="font-mono text-[10px] text-ink-dim">
                          {c.duration || "Self-paced"}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-olive group-hover:text-forest transition-colors line-clamp-1">
                        {c.title}
                      </h4>
                      <p className="text-xs text-ink-dim line-clamp-2 mt-1 leading-relaxed">
                        {c.subtitle || c.description || "Structured institutional curriculum module."}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-hairline flex items-center justify-between text-xs font-mono text-forest">
                      <span>{c.lessonsCount ? `${c.lessonsCount} Lessons` : "Self-paced"}</span>
                      <span className="group-hover:translate-x-1 transition-transform">Read Playbook →</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-ivory rounded-2xl border border-hairline text-xs text-ink-dim space-y-2">
                <p className="font-medium text-sm text-olive">No exact match for your search criteria</p>
                <p>Try searching broader keywords like "equity", "derivatives", or "valuation".</p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
