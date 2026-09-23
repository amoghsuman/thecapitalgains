"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Filter, BookOpen, Clock, Tag, X, ArrowRight, Sparkles } from "lucide-react";
import type { CourseSummary } from "@/app/(site)/page";

interface HomeCourseSearchBarProps {
  courses: CourseSummary[];
}

export default function HomeCourseSearchBar({ courses }: HomeCourseSearchBarProps) {
  const [query, setQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("All");
  const [selectedTopic, setSelectedTopic] = useState<string>("All");

  // Extract unique topics from courses
  const topics = useMemo(() => {
    const set = new Set<string>();
    courses.forEach((c) => {
      if (c.topics) c.topics.forEach((t) => set.add(t));
      if (c.tag) set.add(c.tag);
    });
    return ["All", ...Array.from(set).slice(0, 8)];
  }, [courses]);

  const levels = ["All", "Beginner", "Intermediate", "Advanced"];

  const filteredCourses = useMemo(() => {
    if (!query && selectedLevel === "All" && selectedTopic === "All") {
      return [];
    }

    return courses.filter((c) => {
      const matchQuery =
        !query ||
        c.title.toLowerCase().includes(query.toLowerCase()) ||
        c.subtitle?.toLowerCase().includes(query.toLowerCase()) ||
        c.description?.toLowerCase().includes(query.toLowerCase()) ||
        c.topics?.some((t) => t.toLowerCase().includes(query.toLowerCase()));

      const matchLevel =
        selectedLevel === "All" ||
        (c.tag && c.tag.toLowerCase().includes(selectedLevel.toLowerCase()));

      const matchTopic =
        selectedTopic === "All" ||
        (c.tag && c.tag.toLowerCase() === selectedTopic.toLowerCase()) ||
        c.topics?.some((t) => t.toLowerCase() === selectedTopic.toLowerCase());

      return matchQuery && matchLevel && matchTopic;
    });
  }, [courses, query, selectedLevel, selectedTopic]);

  const isFiltering = query.length > 0 || selectedLevel !== "All" || selectedTopic !== "All";

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
              Search &amp; Filter Playbooks
            </h2>
            <p className="text-xs sm:text-sm text-ink-dim max-w-xl mt-0.5 leading-relaxed">
              Find specific frameworks across options, quantitative risk, forensic balance sheets, and Indian equity structures.
            </p>
          </div>

          <div className="text-xs font-mono text-ink-dim">
            Indexing <strong>{courses.length}</strong> audited textbooks &amp; modules
          </div>
        </div>

        {/* Search Input and Filter Row */}
        <div className="bg-ivory border border-hairline rounded-2xl p-4 sm:p-5 space-y-4 shadow-2xs">
          <div className="relative">
            <Search className="w-4 h-4 text-ink-dim absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
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

          {/* Level and Topic Pills */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs pt-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-mono text-[10px] text-ink-dim uppercase tracking-wider font-bold mr-1">
                Level:
              </span>
              {levels.map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setSelectedLevel(lvl)}
                  className={`px-3 py-1 rounded-lg font-mono text-xs transition-all cursor-pointer ${
                    selectedLevel === lvl
                      ? "bg-forest text-white font-bold shadow-2xs"
                      : "bg-panel border border-hairline text-ink-dim hover:text-ink"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-mono text-[10px] text-ink-dim uppercase tracking-wider font-bold mr-1">
                Topic:
              </span>
              {topics.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSelectedTopic(t)}
                  className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition-all cursor-pointer ${
                    selectedTopic === t
                      ? "bg-forest text-white font-bold shadow-2xs"
                      : "bg-panel border border-hairline text-ink-dim hover:text-ink"
                  }`}
                >
                  {t}
                </button>
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
              </span>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setSelectedLevel("All");
                  setSelectedTopic("All");
                }}
                className="text-forest hover:underline cursor-pointer"
              >
                Reset filters
              </button>
            </div>

            {filteredCourses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCourses.slice(0, 6).map((c) => (
                  <Link
                    key={c._id}
                    href={`/learn/${c.slug}`}
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
                      <span>{c.lessonsCount || 8} Lessons</span>
                      <span className="group-hover:translate-x-1 transition-transform">Read Playbook →</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-ivory rounded-2xl border border-hairline text-xs text-ink-dim space-y-2">
                <p className="font-medium text-sm text-olive">No exact match for your search criteria</p>
                <p>Try searching broader keywords like &quot;equity&quot;, &quot;derivatives&quot;, or &quot;valuation&quot;.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
