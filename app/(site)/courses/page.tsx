"use client";

import { useState, useEffect, useMemo } from "react";
import { Source_Serif_4, IBM_Plex_Sans } from "next/font/google";
import { getAllCourses } from "@/lib/sanity/queries";
import { createClient } from "@/lib/supabase/client";
import { LEARNING_PATHS } from "@/sanity/lib/learningPaths";
import PillToggleGroup from "@/components/courses/PillToggle";
import TrackSection from "@/components/courses/TrackSection";
import ContinueLearningStrip, { type ContinueLearningItem } from "@/components/courses/ContinueLearningStrip";
import type { CourseCardData } from "@/components/courses/CourseCard";
import "@/app/premium-theme.css";

// Scoped to this page only — the rest of the site runs on Inter (see
// tailwind.config.ts). These two are new per the redesign brief; if this
// becomes a site-wide rebrand, promote them into the root layout instead.
const courseSerif = Source_Serif_4({
  variable: "--font-course-serif",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});
const coursePlexSans = IBM_Plex_Sans({
  variable: "--font-course-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const LEVEL_PILLS = [
  { value: "all", label: "Any Level" },
  { value: "Beginner", label: "Beginner" },
  { value: "Intermediate", label: "Intermediate" },
  { value: "Advanced", label: "Advanced" },
];

// ─── Types ────────────────────────────────────────────────────────────────────

type Course = {
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
  learningPath: string | null;
  orderRank: number | null;
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filterPath, setFilterPath] = useState("all");
  const [filterLevel, setFilterLevel] = useState("all");

  // ── Progress state ──────────────────────────────────────────────────────────
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  const [enrollmentMap, setEnrollmentMap] = useState<Record<string, string>>({});
  const [lastAccessedOrder, setLastAccessedOrder] = useState<string[]>([]);
  const [totalCompletedLessons, setTotalCompletedLessons] = useState(0);
  const [coursesInProgress, setCoursesInProgress] = useState<string[]>([]);

  useEffect(() => {
    getAllCourses()
      .then((data) => {
        setCourses(data as Course[]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

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

  const uniquePaths = useMemo(() => {
    const seen = new Set<string>();
    courses.forEach((c) => { if (c.learningPath) seen.add(c.learningPath); });
    return Array.from(seen);
  }, [courses]);

  const pathPills = useMemo(() => {
    const known = LEARNING_PATHS.filter((p) => uniquePaths.includes(p.value));
    return [{ value: "all", label: "All Tracks" }, ...known.map((p) => ({ value: p.value, label: p.title }))];
  }, [uniquePaths]);

  const pathTitle = (value: string) => LEARNING_PATHS.find((p) => p.value === value)?.title ?? value;

  const filtered = useMemo(() => {
    return courses.filter((c) => {
      if (search) {
        const q = search.toLowerCase();
        if (!c.title?.toLowerCase().includes(q) && !c.description?.toLowerCase().includes(q)) return false;
      }
      if (filterLevel !== "all" && c.tag?.toLowerCase() !== filterLevel.toLowerCase()) return false;
      return true;
    });
  }, [courses, search, filterLevel]);

  const toCardData = (c: Course): CourseCardData => ({
    slug: c.slug,
    title: c.title,
    tag: c.tag,
    duration: c.duration,
    description: c.description,
    completedCount: progressMap[c.slug] || 0,
    totalLessons: c.lessonsCount || 0,
    resumeLessonSlug: enrollmentMap[c.slug],
  });

  const sections = useMemo(() => {
    const paths = filterPath === "all" ? uniquePaths : uniquePaths.filter((p) => p === filterPath);
    const orderedPaths = LEARNING_PATHS.map((p) => p.value).filter((v) => paths.includes(v));
    return orderedPaths
      .map((path) => ({
        path,
        title: pathTitle(path),
        courses: filtered.filter((c) => c.learningPath === path).map(toCardData),
      }))
      .filter((section) => section.courses.length > 0);
  }, [filtered, uniquePaths, filterPath, progressMap, enrollmentMap]);

  const continueLearning: ContinueLearningItem[] = useMemo(() => {
    const order = lastAccessedOrder.length > 0 ? lastAccessedOrder : coursesInProgress;
    return order
      .map((slug) => courses.find((c) => c.slug === slug))
      .filter((c): c is Course => !!c)
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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="premium-glow-dot animate-pulse" />
    </div>
  );

  return (
    <div
      className={`${courseSerif.variable} ${coursePlexSans.variable} min-h-screen pb-20`}
      style={{ fontFamily: "var(--font-course-sans)" }}
    >

      {/* ── HEADER ── */}
      <div className="pt-32 pb-20">
        <div className="site-container">
          <div className="inline-flex items-center gap-2 bg-forest-surface border border-hairline rounded-full px-4 py-1.5 mb-6">
            <div className="premium-glow-dot" />
            <span className="text-[10px] text-gold-text tracking-[0.2em] uppercase font-semibold">Curriculum Explorer</span>
          </div>
          <h1
            className="text-4xl font-semibold text-ink tracking-tight leading-tight"
            style={{ fontFamily: "var(--font-course-serif)" }}
          >
            Our Learning Paths
          </h1>
          <p className="text-ink-dim text-[16px] mt-2 max-w-2xl leading-relaxed">
            High-density, text-first curriculum designed for quick scanning and decision making.
            No fluff. Filter by strategy to start your edge.
          </p>
        </div>
      </div>

      {/* ── CONTROLS ── */}
      <div className="site-container -mt-8 relative z-10">

        {/* Sign-in nudge — only when logged out */}
        {!user && (
          <div style={{ background: '#EDEFEE', border: '1px solid #DFD9C8', borderRadius: '12px', padding: '12px 20px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
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
          <div style={{ background: '#F6F3EA', border: '1px solid rgba(169,130,47,0.25)', borderRadius: '12px', padding: '14px 20px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
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
          <PillToggleGroup pills={pathPills} active={filterPath} onChange={setFilterPath} ariaLabel="Filter by track" />
          <PillToggleGroup pills={LEVEL_PILLS} active={filterLevel} onChange={setFilterLevel} ariaLabel="Filter by level" />
        </div>
      </div>

      {/* ── GROUPED SECTIONS ── */}
      <div className="site-container mt-8">
        {sections.length > 0 ? (
          sections.map((section) => (
            <TrackSection key={section.path} title={section.title} courses={section.courses} />
          ))
        ) : (
          <div className="text-center text-ink-dim text-sm italic py-20">
            No results found for your search criteria.
          </div>
        )}
      </div>

    </div>
  );
}
