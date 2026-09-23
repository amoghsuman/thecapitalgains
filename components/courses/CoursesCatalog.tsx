"use client";

import { useState, useEffect, useMemo, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LEARNING_PATHS } from "@/sanity/lib/learningPaths";
import { TRACK_GROUPS } from "@/lib/home/trackGroups";
import { mapLevel } from "@/lib/courses/level";
import PillToggleGroup from "@/components/courses/PillToggle";
import TrackSection from "@/components/courses/TrackSection";
import ContinueLearningStrip, { type ContinueLearningItem } from "@/components/courses/ContinueLearningStrip";
import type { CourseCardData } from "@/components/courses/CourseCard";

const LEVEL_PILLS = [
  { value: "all", label: "Any Level" },
  { value: "Beginner", label: "Beginner" },
  { value: "Intermediate", label: "Intermediate" },
  { value: "Advanced", label: "Advanced" },
];

// ─── Types ────────────────────────────────────────────────────────────────────

export type CatalogCourse = {
  _id: string;
  title: string;
  slug: string;
  tag: string | null;
  price: number | null;
  accessLevel: string | null;
  badge: string | null;
  subtitle: string | null;
  lessonsCount: number | null;
  duration: string | null;
  description: string | null;
  topics: string[] | null;
  whatYouLearn: string[] | null;
  learningPath: string | null;
  orderRank: number | null;
};

interface CoursesCatalogProps {
  courses: CatalogCourse[];
  /** A TRACK_GROUPS slug from ?group=, already validated by the page. */
  initialGroup: string;
  /** A LEARNING_PATHS value from ?path=, already validated by the page. */
  initialPath: string;
  /** Free-text search from ?q= (the home search bar submits here). */
  initialQ: string;
  /** A LEVEL_PILLS value from ?level=, already validated by the page. */
  initialLevel: string;
  /** Server-rendered heading block, shown at the top of the hero band. */
  header: ReactNode;
}

function pathsForGroup(groupSlug: string): readonly string[] | null {
  if (groupSlug === "all") return null;
  return TRACK_GROUPS.find((g) => g.slug === groupSlug)?.paths ?? null;
}

// ─── Catalog ──────────────────────────────────────────────────────────────────

export default function CoursesCatalog({ courses, initialGroup, initialPath, initialQ, initialLevel, header }: CoursesCatalogProps) {
  const pathname = usePathname();

  const [search, setSearch] = useState(initialQ);
  const [filterGroup, setFilterGroup] = useState(initialGroup);
  const [filterPath, setFilterPath] = useState(initialPath);
  const [filterLevel, setFilterLevel] = useState(initialLevel);

  // ── Progress state ──────────────────────────────────────────────────────────
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  const [enrollmentMap, setEnrollmentMap] = useState<Record<string, string>>({});
  const [lastAccessedOrder, setLastAccessedOrder] = useState<string[]>([]);
  const [totalCompletedLessons, setTotalCompletedLessons] = useState(0);
  const [coursesInProgress, setCoursesInProgress] = useState<string[]>([]);

  useEffect(() => {
    const supabase = createClient();
    async function loadProgress() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUser(user);

      const { data: progressRows } = await supabase
        .from("lesson_progress")
        .select("course_slug, lesson_slug")
        .eq("user_id", user.id);

      if (progressRows) {
        setTotalCompletedLessons(progressRows.length);
        const pm: Record<string, number> = {};
        progressRows.forEach((row) => {
          pm[row.course_slug] = (pm[row.course_slug] || 0) + 1;
        });
        setProgressMap(pm);
        setCoursesInProgress(Object.keys(pm));
      }

      const { data: enrollmentRows } = await supabase
        .from("course_enrollments")
        .select("course_slug, last_lesson_slug, last_accessed_at")
        .eq("user_id", user.id)
        .order("last_accessed_at", { ascending: false });

      if (enrollmentRows) {
        const em: Record<string, string> = {};
        enrollmentRows.forEach((row) => {
          if (row.last_lesson_slug) em[row.course_slug] = row.last_lesson_slug;
        });
        setEnrollmentMap(em);
        setLastAccessedOrder(enrollmentRows.map((row) => row.course_slug));
      }
    }
    loadProgress();
  }, []);

  // Keep ?group=, ?path=, ?level= and ?q= in step with the selection.
  // history.replaceState is the App Router's shallow update: the URL changes,
  // nothing is re-fetched.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (filterGroup === "all") params.delete("group");
    else params.set("group", filterGroup);
    if (filterPath === "all") params.delete("path");
    else params.set("path", filterPath);
    if (filterLevel === "all") params.delete("level");
    else params.set("level", filterLevel);
    const q = search.trim();
    if (q) params.set("q", q);
    else params.delete("q");
    const query = params.toString();
    const next = query ? `${pathname}?${query}` : pathname;
    if (next !== `${window.location.pathname}${window.location.search}`) {
      window.history.replaceState(null, "", next);
    }
  }, [filterGroup, filterPath, filterLevel, search, pathname]);

  const uniquePaths = useMemo(() => {
    const seen = new Set<string>();
    courses.forEach((c) => { if (c.learningPath) seen.add(c.learningPath); });
    return Array.from(seen);
  }, [courses]);

  const groupPills = useMemo(() => {
    const countFor = (paths: readonly string[]) =>
      courses.filter((c) => c.learningPath && paths.includes(c.learningPath)).length;
    return [
      { value: "all", label: `All (${courses.length})` },
      ...TRACK_GROUPS.map((g) => ({ value: g.slug, label: `${g.title} (${countFor(g.paths)})` })),
    ];
  }, [courses]);

  // Paths offered as pills: those with courses, narrowed to the selected group.
  const visiblePaths = useMemo(() => {
    const groupPaths = pathsForGroup(filterGroup);
    return groupPaths ? uniquePaths.filter((p) => groupPaths.includes(p)) : uniquePaths;
  }, [uniquePaths, filterGroup]);

  const pathPills = useMemo(() => {
    const known = LEARNING_PATHS.filter((p) => visiblePaths.includes(p.value));
    return [{ value: "all", label: "All Tracks" }, ...known.map((p) => ({ value: p.value, label: p.title }))];
  }, [visiblePaths]);

  function selectGroup(value: string) {
    setFilterGroup(value);
    const groupPaths = pathsForGroup(value);
    if (groupPaths && filterPath !== "all" && !groupPaths.includes(filterPath)) setFilterPath("all");
  }

  const pathTitle = (value: string) => LEARNING_PATHS.find((p) => p.value === value)?.title ?? value;

  const filtered = useMemo(() => {
    return courses.filter((c) => {
      // Case-insensitive match on title, description or any topic.
      const q = search.trim().toLowerCase();
      if (q) {
        const hit =
          c.title?.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q) ||
          (c.topics ?? []).some((t) => t.toLowerCase().includes(q));
        if (!hit) return false;
      }
      if (filterLevel !== "all" && mapLevel(c.tag) !== filterLevel) return false;
      return true;
    });
  }, [courses, search, filterLevel]);

  const toCardData = (c: CatalogCourse): CourseCardData => ({
    slug: c.slug,
    title: c.title,
    tag: c.tag,
    badge: c.badge,
    duration: c.duration,
    description: c.description,
    topics: c.topics,
    whatYouLearn: c.whatYouLearn,
    completedCount: progressMap[c.slug] || 0,
    totalLessons: c.lessonsCount || 0,
    resumeLessonSlug: enrollmentMap[c.slug],
  });

  const sections = useMemo(() => {
    const paths = filterPath === "all" ? visiblePaths : visiblePaths.filter((p) => p === filterPath);
    const orderedPaths = LEARNING_PATHS.map((p) => p.value).filter((v) => paths.includes(v));
    return orderedPaths
      .map((path) => ({
        path,
        title: pathTitle(path),
        courses: filtered.filter((c) => c.learningPath === path).map(toCardData),
      }))
      .filter((section) => section.courses.length > 0);
  }, [filtered, visiblePaths, filterPath, progressMap, enrollmentMap]);

  const continueLearning: ContinueLearningItem[] = useMemo(() => {
    const order = lastAccessedOrder.length > 0 ? lastAccessedOrder : coursesInProgress;
    return order
      .map((slug) => courses.find((c) => c.slug === slug))
      .filter((c): c is CatalogCourse => !!c)
      .map((c) => {
        const completedCount = progressMap[c.slug] || 0;
        const totalLessons = c.lessonsCount || 0;
        const pct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
        return { slug: c.slug, title: c.title, pct: Math.min(pct, 100), completedCount, totalLessons };
      })
      .filter((c) => c.completedCount > 0 && !(c.totalLessons > 0 && c.pct >= 100))
      .map((c) => ({
        slug: c.slug,
        title: c.title,
        pct: c.pct,
        href: enrollmentMap[c.slug] ? `/learn/${c.slug}/${enrollmentMap[c.slug]}` : `/courses/${c.slug}`,
      }));
  }, [lastAccessedOrder, coursesInProgress, courses, progressMap, enrollmentMap]);

  return (
    <>
      {/* ── HERO BAND — heading through the resume/sign-in strip reads as one
          composed band (panel-white against the ivory page background),
          closed with a hairline rule ── */}
      <div className="bg-panel border-b border-hairline">
        {header}

        {(!user || (user && coursesInProgress.length > 0)) && (
          <div className="site-container pb-8">
            {/* Sign-in nudge — only when logged out */}
            {!user && (
              <div style={{ background: '#EDEFEE', border: '1px solid #DFD9C8', borderRadius: '12px', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <span style={{ fontSize: '13px', color: '#6E6A5F' }}>
                  Sign in to track your progress and resume where you left off.
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <a href="/auth/login" style={{ fontSize: '13px', fontWeight: 600, color: '#1B3A2B', textDecoration: 'none' }}>Sign in</a>
                  <span style={{ color: '#6E6A5F' }}>·</span>
                  <a href="/auth/signup" style={{ fontSize: '13px', fontWeight: 600, color: '#A9822F', textDecoration: 'none' }}>Join free</a>
                </div>
              </div>
            )}

            {/* Resume banner — only when logged in with progress — unchanged */}
            {user && coursesInProgress.length > 0 && (
              <div style={{ background: '#F6F3EA', border: '1px solid rgba(169,130,47,0.25)', borderRadius: '12px', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#A9822F', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2px' }}>Pick up where you left off</div>
                  <div style={{ fontSize: '13px', color: '#1A1A18', fontWeight: 500 }}>
                    {coursesInProgress.length} course{coursesInProgress.length > 1 ? 's' : ''} in progress · {totalCompletedLessons} lessons completed
                  </div>
                </div>
                <a
                  href={
                    lastAccessedOrder[0]
                      ? (enrollmentMap[lastAccessedOrder[0]]
                          ? `/learn/${lastAccessedOrder[0]}/${enrollmentMap[lastAccessedOrder[0]]}`
                          : `/courses/${lastAccessedOrder[0]}`)
                      : "/courses"
                  }
                  style={{ background: '#1B3A2B', color: 'white', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}
                >
                  Resume learning →
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── CONTROLS ── */}
      <div className="site-container mt-8 relative z-10">

        {/* Continue learning strip */}
        <ContinueLearningStrip items={continueLearning} />

        <div className="bg-panel border border-hairline rounded-2xl p-4 shadow-xl flex flex-wrap gap-4 items-center mb-6">
          <div className="relative flex-1 min-w-[280px]">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by strategy, instrument or title..."
              className="w-full h-12 pl-12 pr-4 rounded-xl bg-ivory border-none text-[13px] font-medium
                focus:outline-none focus:ring-2 focus:ring-forest/40 motion-safe:transition-shadow"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-dim">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 mb-2">
          <PillToggleGroup pills={groupPills} active={filterGroup} onChange={selectGroup} ariaLabel="Filter by group" />
          <PillToggleGroup pills={pathPills} active={filterPath} onChange={setFilterPath} ariaLabel="Filter by track" />
          <PillToggleGroup pills={LEVEL_PILLS} active={filterLevel} onChange={setFilterLevel} ariaLabel="Filter by level" />
        </div>
      </div>

      {/* ── GROUPED SECTIONS ── */}
      <div className="site-container mt-8">
        {courses.length === 0 ? (
          <div className="text-center text-ink-dim text-sm py-20">No courses published yet.</div>
        ) : sections.length > 0 ? (
          sections.map((section) => (
            <TrackSection key={section.path} title={section.title} courses={section.courses} />
          ))
        ) : (
          <div className="text-center text-ink-dim text-sm italic py-20">
            No results found for your search criteria.
          </div>
        )}
      </div>
    </>
  );
}
