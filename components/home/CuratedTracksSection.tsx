"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, BookOpen, Clock, Target, CheckCircle2, Eye } from "lucide-react";
import PlaybookSneakPeekDrawer from "./PlaybookSneakPeekDrawer";
import { TRACK_GROUPS, learningPathTitle } from "@/lib/home/trackGroups";
import { LEVELS, mapLevel, parseDurationHours, type Level } from "@/lib/courses/level";
import { estimateCourseReadingTime } from "@/lib/courses/readingTime";
import type { CourseSummary } from "@/app/(site)/page";

const GROUP_EXCERPT: Record<string, string> = {
  "retail-investing": "options-expiry-gamma",
  "corporate-finance": "forensic-cfo-pat",
};

const VISIBLE_PATH_NAMES = 4;

type GroupStats = {
  courseCount: number;
  levelMix: Record<Level, number>;
  hours: number;
  timedCourses: number;
  sampleOutcomes: string[];
  topCourses: CourseSummary[];
};

interface CuratedTracksSectionProps {
  courses: CourseSummary[];
}

export default function CuratedTracksSection({ courses }: CuratedTracksSectionProps) {
  const [activeGroup, setActiveGroup] = useState<string>("all");
  const [previewExcerptId, setPreviewExcerptId] = useState<string | null>(null);
  const [hoveredCourse, setHoveredCourse] = useState<CourseSummary | null>(null);

  const statsByGroup = useMemo(() => {
    const out: Record<string, GroupStats> = {};
    for (const group of TRACK_GROUPS) {
      const paths: readonly string[] = group.paths;
      const inGroup = courses.filter((c) => c.learningPath && paths.includes(c.learningPath));
      const levelMix: Record<Level, number> = { Beginner: 0, Intermediate: 0, Advanced: 0 };
      let hours = 0;
      let timedCourses = 0;
      const sampleOutcomes: string[] = [];

      for (const c of inGroup) {
        const level = mapLevel(c.tag);
        if (level) levelMix[level] += 1;
        const h = parseDurationHours(c.duration);
        if (h !== null) {
          hours += h;
          timedCourses += 1;
        }
        if (c.whatYouLearn && c.whatYouLearn.length > 0 && sampleOutcomes.length < 3) {
          sampleOutcomes.push(c.whatYouLearn[0]);
        }
      }

      out[group.slug] = {
        courseCount: inGroup.length,
        levelMix,
        hours,
        timedCourses,
        sampleOutcomes,
        topCourses: inGroup.slice(0, 3),
      };
    }
    return out;
  }, [courses]);

  const filteredGroups = TRACK_GROUPS.filter((g) => activeGroup === "all" || g.slug === activeGroup);

  return (
    <section id="curated-tracks-section" className="py-16 md:py-20 bg-ivory border-b border-hairline relative">
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
              Targeted curricula designed to build practical, unconflicted competency step by step. Hover over course tags to inspect immediate learning outcomes.
            </p>
          </div>

          <Link
            href="/courses"
            className="text-xs font-bold text-forest hover:text-forest-dark inline-flex items-center gap-1.5 flex-shrink-0 group py-1"
          >
            <span>View Full Catalog ({courses.length} Courses)</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-hairline pb-4 overflow-x-auto">
          {[
            { id: "all", label: "All Pathways", count: courses.length },
            ...TRACK_GROUPS.map((g) => ({ id: g.slug, label: g.title, count: statsByGroup[g.slug]?.courseCount ?? 0 })),
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveGroup(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                activeGroup === tab.id
                  ? "bg-forest text-white shadow-xs font-bold"
                  : "bg-panel border border-hairline text-ink-dim hover:text-ink hover:border-forest/30"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`font-mono text-[10px] px-1.5 py-0.2 rounded ${
                  activeGroup === tab.id ? "bg-white/20 text-white" : "bg-ivory text-ink-dim"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Dynamic Animated Tracks Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <AnimatePresence mode="popLayout">
            {filteredGroups.map((group) => {
              const stats = statsByGroup[group.slug];
              const hasCourses = stats.courseCount > 0;
              const excerptId = GROUP_EXCERPT[group.slug];
              const href = `/courses?group=${group.slug}`;
              const names = group.paths.map(learningPathTitle);
              const shown = names.slice(0, VISIBLE_PATH_NAMES);
              const hiddenCount = names.length - shown.length;
              const mix = LEVELS.filter((l) => stats.levelMix[l] > 0).map((l) => `${stats.levelMix[l]} ${l}`);

              return (
                <motion.div
                  key={group.slug}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  className="group h-full bg-panel border border-hairline rounded-2xl p-5 hover:border-forest/40 hover:shadow-xs transition-all flex flex-col justify-between relative"
                >
                  <div className="space-y-2.5">
                    <h3 className="text-lg font-bold text-olive group-hover:text-forest transition-colors leading-snug">
                      <Link href={href} className="hover:underline">
                        {group.title}
                      </Link>
                    </h3>

                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 font-mono text-[11px] text-ink-muted">
                      <span>{group.paths.length} paths</span>
                      <span>·</span>
                      <span>
                        {hasCourses
                          ? `${stats.courseCount} ${stats.courseCount === 1 ? "course" : "courses"}`
                          : "Coming soon"}
                      </span>
                      {mix.length > 0 && (
                        <>
                          <span>·</span>
                          <span>{mix.join(" / ")}</span>
                        </>
                      )}
                    </div>

                    {/* Total study hours */}
                    {hasCourses && stats.timedCourses > 0 && (
                      <div className="font-mono text-[11px] text-ink-muted">
                        <span className="text-ink-dim font-semibold">~{Math.round(stats.hours)} hrs</span>
                        {stats.timedCourses < stats.courseCount && (
                          <span> across {stats.timedCourses} of {stats.courseCount} courses</span>
                        )}
                      </div>
                    )}

                    {/* Learning outcomes preview pills with hover quick-view */}
                    <div className="pt-2 border-t border-hairline space-y-1.5">
                      <div className="font-mono text-[10px] text-gold font-bold uppercase tracking-wider flex items-center gap-1">
                        <Eye className="w-3 h-3 text-gold" />
                        <span>Featured Playbooks (Hover Quick View):</span>
                      </div>
                      <div className="space-y-1">
                        {stats.topCourses.map((c) => (
                          <div
                            key={c._id}
                            onMouseEnter={() => setHoveredCourse(c)}
                            className="p-1.5 rounded-lg bg-ivory/80 hover:bg-forest-surface hover:border-forest/40 border border-hairline/60 transition-colors cursor-pointer text-left"
                          >
                            <div className="font-bold text-xs text-olive truncate">
                              {c.title}
                            </div>
                            <div className="text-[10px] text-ink-dim font-mono flex items-center justify-between mt-0.5">
                              <span>{c.duration || "Self-paced"}</span>
                              <span className="text-forest font-semibold">Quick View →</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Learning path names compact */}
                    <p className="text-[11px] text-ink-dim font-medium leading-relaxed line-clamp-2 pt-1">
                      {shown.join(", ")}
                      {hiddenCount > 0 && <span className="text-ink-muted">, +{hiddenCount} more</span>}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-hairline flex items-center justify-between text-xs text-ink-dim">
                    {excerptId ? (
                      <button
                        type="button"
                        onClick={() => setPreviewExcerptId(excerptId)}
                        className="text-[11px] font-bold text-ink-dim hover:text-forest underline underline-offset-2 transition-colors cursor-pointer"
                      >
                        Sample Excerpt
                      </button>
                    ) : (
                      <span />
                    )}
                    <Link
                      href={href}
                      className="font-bold text-forest group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>Explore</span>
                      <span>→</span>
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Floating Quick View Modal / Popover on hover */}
      <AnimatePresence>
        {hoveredCourse && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-x-4 bottom-6 md:inset-auto md:right-8 md:bottom-8 z-40 max-w-md bg-panel border-2 border-forest/40 rounded-2xl p-5 shadow-2xl space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="font-mono text-[9px] font-bold text-gold uppercase tracking-widest bg-forest-surface px-2 py-0.5 rounded">
                  Quick View &middot; Learning Outcomes
                </span>
                <h4 className="font-bold text-sm sm:text-base text-olive mt-1 leading-snug">
                  {hoveredCourse.title}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setHoveredCourse(null)}
                className="text-xs text-ink-dim hover:text-ink p-1 rounded hover:bg-forest-surface cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-ink-dim leading-relaxed line-clamp-2">
              {hoveredCourse.subtitle || hoveredCourse.description || "Comprehensive NSE/BSE institutional syllabus."}
            </p>

            {/* What you learn takeaways */}
            <div className="space-y-1.5 pt-2 border-t border-hairline">
              <div className="font-mono text-[10px] text-olive font-bold uppercase tracking-wider">
                Key Learning Outcomes:
              </div>
              <div className="space-y-1">
                {(hoveredCourse.whatYouLearn && hoveredCourse.whatYouLearn.length > 0
                  ? hoveredCourse.whatYouLearn.slice(0, 3)
                  : [
                      "Empirical valuation and balance sheet forensic analysis.",
                      "Systematic risk mitigation and downside margin of safety.",
                      "Real-world trade execution and portfolio construction rules.",
                    ]
                ).map((outcome, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-[11px] text-ink-dim">
                    <CheckCircle2 className="w-3.5 h-3.5 text-forest shrink-0 mt-0.5" />
                    <span>{outcome}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] text-ink-dim">
                  {hoveredCourse.duration || "Self-Paced"} &middot; {hoveredCourse.lessonsCount || 8} Lessons
                </span>
                <span className="inline-flex items-center gap-1 font-mono text-[10px] text-forest bg-forest-surface px-2 py-0.5 rounded-full border border-forest/20">
                  <BookOpen className="w-2.5 h-2.5" />
                  <span>
                    {estimateCourseReadingTime({
                      description: hoveredCourse.description,
                      whatYouLearn: hoveredCourse.whatYouLearn,
                      topics: hoveredCourse.topics,
                      lessonsCount: hoveredCourse.lessonsCount,
                      duration: hoveredCourse.duration,
                    }).formatted}
                  </span>
                </span>
              </div>
              <Link
                href={`/learn/${hoveredCourse.slug}`}
                className="px-3.5 py-1.5 bg-forest hover:bg-forest-dark text-white rounded-lg text-xs font-mono font-bold inline-flex items-center gap-1 shadow-xs cursor-pointer"
              >
                <span>Full Syllabus</span>
                <span>→</span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chapter Excerpt Modal Drawer */}
      <PlaybookSneakPeekDrawer
        isOpen={Boolean(previewExcerptId)}
        onClose={() => setPreviewExcerptId(null)}
        defaultExcerptId={previewExcerptId || "options-expiry-gamma"}
      />
    </section>
  );
}
