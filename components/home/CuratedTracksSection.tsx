"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Layers } from "lucide-react";
import PlaybookSneakPeekDrawer from "./PlaybookSneakPeekDrawer";
import { TRACK_GROUPS, learningPathTitle } from "@/lib/home/trackGroups";
import type { CourseSummary } from "@/app/(site)/page";

// The sample-chapter drawer only has two real excerpts; only the groups they
// belong to offer the "Sample Excerpt" link.
const GROUP_EXCERPT: Record<string, string> = {
  "retail-investing": "options-expiry-gamma",
  "corporate-finance": "forensic-cfo-pat",
};

interface CuratedTracksSectionProps {
  courses: CourseSummary[];
}

export default function CuratedTracksSection({ courses }: CuratedTracksSectionProps) {
  const [activeGroup, setActiveGroup] = useState<string>("all");
  const [previewExcerptId, setPreviewExcerptId] = useState<string | null>(null);

  // Live course count per group, from the courses fetched by the page.
  const countByGroup = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const group of TRACK_GROUPS) {
      const paths: readonly string[] = group.paths;
      counts[group.slug] = courses.filter((c) => c.learningPath && paths.includes(c.learningPath)).length;
    }
    return counts;
  }, [courses]);

  const filteredGroups = TRACK_GROUPS.filter((g) => activeGroup === "all" || g.slug === activeGroup);

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
            <span>View Full Catalog ({courses.length} Courses)</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-hairline pb-4 overflow-x-auto">
          {[
            { id: "all", label: "All Pathways", count: courses.length },
            ...TRACK_GROUPS.map((g) => ({ id: g.slug, label: g.title, count: countByGroup[g.slug] ?? 0 })),
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveGroup(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeGroup === tab.id
                  ? "bg-forest text-white shadow-xs font-bold"
                  : "bg-panel border border-hairline text-ink-dim hover:text-ink hover:border-forest/30"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`font-mono text-[10px] px-1.5 py-0.2 rounded ${
                  activeGroup === tab.id
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredGroups.map((group) => {
              const count = countByGroup[group.slug] ?? 0;
              const excerptId = GROUP_EXCERPT[group.slug];
              const href = `/courses?group=${group.slug}`;

              return (
                <motion.div
                  key={group.slug}
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
                        {group.paths.length} LEARNING PATHS
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-olive group-hover:text-forest transition-colors leading-snug">
                      <Link href={href} className="hover:underline">
                        {group.title}
                      </Link>
                    </h3>

                    {/* Learning paths in this group */}
                    <div className="pt-2.5 pb-1 space-y-1.5 border-t border-hairline">
                      <span className="text-[10px] font-mono text-ink-muted uppercase tracking-wider block">
                        Learning Paths
                      </span>
                      {group.paths.map((path) => (
                        <div key={path} className="flex items-center gap-2 text-[11px] text-ink-dim font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-forest flex-shrink-0" />
                          <span>{learningPathTitle(path)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-hairline flex items-center justify-between text-xs text-ink-dim">
                    <div className="flex items-center gap-1 font-mono text-[11px] text-ink-muted">
                      <Layers className="w-3 h-3 text-ink-muted" />
                      <span>
                        {count} {count === 1 ? "Course" : "Courses"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      {excerptId && (
                        <button
                          type="button"
                          onClick={() => setPreviewExcerptId(excerptId)}
                          className="text-[11px] font-bold text-ink-dim hover:text-forest underline underline-offset-2 transition-colors"
                        >
                          Sample Excerpt
                        </button>
                      )}
                      <Link
                        href={href}
                        className="font-bold text-forest group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-0.5"
                      >
                        <span>Explore</span>
                        <span>→</span>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
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
