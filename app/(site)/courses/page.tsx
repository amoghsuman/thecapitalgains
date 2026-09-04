"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAllCourses } from "@/lib/sanity/queries";
import { createClient } from "@/lib/supabase/client";
import "@/app/premium-theme.css";

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
  const router = useRouter();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [search, setSearch] = useState("");
  const [filterPath, setFilterPath] = useState("all");
  const [filterLevel, setFilterLevel] = useState("all");

  // ── Progress state ──────────────────────────────────────────────────────────
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  const [enrollmentMap, setEnrollmentMap] = useState<Record<string, string>>({});
  const [totalCompletedLessons, setTotalCompletedLessons] = useState(0);
  const [coursesInProgress, setCoursesInProgress] = useState<string[]>([]);

  useEffect(() => {
    getAllCourses()
      .then((data) => {
        setCourses(data as Course[]);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
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
        .select("course_slug, last_lesson_slug")
        .eq("user_id", user.id);

      if (enrollmentRows) {
        const em: Record<string, string> = {};
        enrollmentRows.forEach((row) => {
          if (row.last_lesson_slug) em[row.course_slug] = row.last_lesson_slug;
        });
        setEnrollmentMap(em);
      }
    }
    loadProgress();
  }, []);

  const uniquePaths = useMemo(() => {
    const seen = new Set<string>();
    courses.forEach((c) => { if (c.learningPath) seen.add(c.learningPath); });
    return Array.from(seen).sort();
  }, [courses]);

  const displayed = useMemo(() => {
    return courses.filter((c) => {
      if (search) {
        const q = search.toLowerCase();
        if (!c.title?.toLowerCase().includes(q) && !c.description?.toLowerCase().includes(q)) return false;
      }
      if (filterPath !== "all" && c.learningPath !== filterPath) return false;
      if (filterLevel !== "all" && c.tag?.toLowerCase() !== filterLevel.toLowerCase()) return false;
      return true;
    });
  }, [courses, search, filterPath, filterLevel]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="premium-glow-dot animate-pulse" />
    </div>
  );

  // Resume banner derived values
  const lastCourseSlug = Object.keys(enrollmentMap)[0];
  const lastLesson = lastCourseSlug ? enrollmentMap[lastCourseSlug] : undefined;
  const resumeUrl = lastLesson
    ? `/learn/${lastCourseSlug}/${lastLesson}`
    : lastCourseSlug ? `/courses/${lastCourseSlug}` : "/courses";

  return (
    <div className="min-h-screen pb-20 font-sans">

      {/* ── HEADER ── */}
      <div className="pt-32 pb-20">
        <div className="site-container">
          <div className="inline-flex items-center gap-2 bg-forest-surface border border-hairline rounded-full px-4 py-1.5 mb-6">
            <div className="premium-glow-dot" />
            <span className="font-mono text-[10px] text-gold-text tracking-[0.2em] uppercase">Curriculum Explorer</span>
          </div>
          <h1 className="text-4xl font-bold text-ink tracking-tight leading-tight">
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

        {/* Resume banner — only when logged in with progress */}
        {user && coursesInProgress.length > 0 && (
          <div style={{ background: '#F6F3EA', border: '1px solid rgba(169,130,47,0.25)', borderRadius: '12px', padding: '14px 20px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#A9822F', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2px' }}>Pick up where you left off</div>
              <div style={{ fontSize: '13px', color: '#1A1A18', fontWeight: 500 }}>
                {coursesInProgress.length} course{coursesInProgress.length > 1 ? 's' : ''} in progress · {totalCompletedLessons} lessons completed
              </div>
            </div>
            <a href={resumeUrl} style={{ background: '#1B3A2B', color: 'white', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}>
              Resume learning →
            </a>
          </div>
        )}

        <div className="bg-panel border border-hairline rounded-2xl p-4 shadow-xl flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[280px]">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by strategy, instrument or title..."
              className="w-full h-12 pl-12 pr-4 rounded-xl bg-ivory border-none text-[13px] font-medium focus:ring-2 focus:ring-forest/20 transition-all"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-dim">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <select
            value={filterPath}
            onChange={(e) => setFilterPath(e.target.value)}
            className="h-12 px-6 rounded-xl bg-ivory border-none text-[13px] font-bold text-ink focus:ring-2 focus:ring-forest/20"
          >
            <option value="all">All Learning Paths</option>
            {uniquePaths.map(p => <option key={p} value={p}>{p.toUpperCase()}</option>)}
          </select>

          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="h-12 px-6 rounded-xl bg-ivory border-none text-[13px] font-bold text-ink focus:ring-2 focus:ring-forest/20"
          >
            <option value="all">Any Level</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
      </div>

      {/* ── DATA TABLE ── */}
      <div className="site-container mt-12 overflow-hidden">
        <div className="bg-panel border border-hairline rounded-2xl shadow-sm overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-ivory border-b border-hairline">
                <th className="px-6 py-4 text-left font-mono text-[10px] text-ink tracking-widest uppercase font-bold">Strategy & Title</th>
                <th className="hidden md:table-cell px-6 py-4 text-left font-mono text-[10px] text-ink tracking-widest uppercase font-bold">Description</th>
                <th className="px-6 py-4 text-left font-mono text-[10px] text-ink tracking-widest uppercase font-bold">Level</th>
                <th className="px-6 py-4 text-left font-mono text-[10px] text-ink tracking-widest uppercase font-bold">Access</th>
                <th className="px-6 py-4 text-left font-mono text-[10px] text-ink tracking-widest uppercase font-bold">Duration</th>
                <th className="px-6 py-4 text-right font-mono text-[10px] text-ink tracking-widest uppercase font-bold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {displayed.length > 0 ? (
                displayed.map((course) => {
                  const completedInCourse = progressMap[course.slug] || 0;
                  const courseTotalLessons = course.lessonsCount || 0;
                  const pct = courseTotalLessons > 0 ? Math.round((completedInCourse / courseTotalLessons) * 100) : 0;
                  const hasStarted = completedInCourse > 0;
                  const isCompleted = pct === 100;
                  const lastLesson = enrollmentMap[course.slug];
                  const resumeHref = lastLesson ? `/learn/${course.slug}/${lastLesson}` : `/courses/${course.slug}`;

                  return (
                    <tr
                      key={course._id}
                      className="hover:bg-ivory/50 transition-colors cursor-pointer group"
                      onClick={() => router.push(`/courses/${course.slug}`)}
                    >
                      <td className="px-6 py-5">
                        <div>
                          <div className="text-[14px] font-bold text-ink mb-1 group-hover:text-forest transition-colors">
                            {course.title}
                          </div>
                          {course.subtitle && (
                            <div className="text-[12px] text-ink-dim line-clamp-1 max-w-lg">
                              {course.subtitle}
                            </div>
                          )}
                          {user && hasStarted && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                              <div style={{ width: '80px', height: '3px', background: '#DFD9C8', borderRadius: '2px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', background: isCompleted ? '#1B3A2B' : '#A9822F', borderRadius: '2px', width: `${pct}%` }} />
                              </div>
                              <span style={{ fontSize: '10px', color: '#6E6A5F', fontWeight: 600 }}>
                                {isCompleted ? '✓ Complete' : `${pct}% done`}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="hidden md:table-cell px-6 py-5">
                        {course.description ? (
                          <span className="block text-[12px] text-ink-dim truncate max-w-xs" title={course.description}>
                            {course.description}
                          </span>
                        ) : (
                          <span className="text-[12px] text-ink-dim/40">—</span>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                          course.tag?.includes('Beginner') ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                          course.tag?.includes('Advanced') ? 'bg-rose-50 text-rose-700 border-rose-100' :
                          'bg-forest-surface text-forest border-hairline'
                        }`}>
                          {course.tag || 'Core'}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`text-[10px] font-bold tracking-widest uppercase ${
                          course.accessLevel === 'free' ? 'text-emerald-700' : 'text-gold-text'
                        }`}>
                          {course.accessLevel || 'Learner+'}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-ink-dim text-[12px] font-mono">
                        {course.duration || '~5 Hours'}
                      </td>
                      <td className="px-6 py-5 text-right" onClick={(e) => e.stopPropagation()}>
                        {user && hasStarted ? (
                          <a href={resumeHref} style={{ fontSize: '13px', fontWeight: 700, color: isCompleted ? '#1B3A2B' : '#A9822F', letterSpacing: '0.05em' }}>
                            {isCompleted ? 'REVIEW →' : 'RESUME →'}
                          </a>
                        ) : (
                          <a href={`/courses/${course.slug}`} style={{ fontSize: '13px', fontWeight: 700, color: '#A9822F', letterSpacing: '0.05em' }}>
                            START →
                          </a>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-ink-dim text-sm italic">
                    No results found for your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
