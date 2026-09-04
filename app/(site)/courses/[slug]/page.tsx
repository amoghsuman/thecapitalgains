import Link from "next/link";
import { getCourseBySlug } from "@/lib/sanity/queries";
import { createClient } from "@/lib/supabase/server";
import "@/app/premium-theme.css";

export const revalidate = 0;

const TIER_RANK: Record<string, number> = {
  free: 0,
  starter: 1,
  pro: 2,
  elite: 3,
};

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <div>
          <h1 className="text-4xl font-bold text-ink mb-4">Course not found</h1>
          <Link href="/courses" className="premium-button-primary inline-block">Browse all courses</Link>
        </div>
      </div>
    );
  }

  // ── Auth + subscription ────────────────────────────────────────────────────
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let userTier = "free";
  let hasStartedCourse = false;
  let completedCount = 0;
  const firstLessonSlug = course.chapters?.[0]?.lessons?.[0]?.slug;
  let resumeLessonSlug = firstLessonSlug;

  if (user) {
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("tier, status, current_period_end")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    if (sub) {
      const notExpired =
        !sub.current_period_end ||
        new Date(sub.current_period_end) > new Date();
      if (notExpired) {
        userTier = sub.tier ?? "free";
      }
    }

    const { data: progressData } = await supabase
      .from("lesson_progress")
      .select("lesson_slug")
      .eq("user_id", user.id)
      .eq("course_slug", slug);

    completedCount = progressData?.length ?? 0;
    hasStartedCourse = completedCount > 0;

    const { data: enrollmentData } = await supabase
      .from("course_enrollments")
      .select("last_lesson_slug")
      .eq("user_id", user.id)
      .eq("course_slug", slug)
      .single();

    resumeLessonSlug = enrollmentData?.last_lesson_slug || firstLessonSlug;
  }

  const courseAccessLevel = course.accessLevel ?? "free";
  const hasAccess =
    (TIER_RANK[userTier] ?? 0) >= (TIER_RANK[courseAccessLevel] ?? 0);

  // ── Derived stats ──────────────────────────────────────────────────────────
  const totalLessons =
    course.lessonsCount ||
    course.chapters?.reduce(
      (sum: number, ch: any) => sum + (ch.lessons?.length ?? 0),
      0
    ) ||
    0;
  const progressPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  return (
    <div className="min-h-screen font-sans pb-20">

      {/* ── HEADER (Premium Dark) ── */}
      <header className="pt-32 pb-24">
        <div className="site-container">
          <div className="flex items-center gap-3 mb-8">
            <Link href="/courses" className="text-gold-text text-xs font-bold tracking-[0.2em] uppercase hover:text-ink transition-colors">
              ← Back to Curriculum
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="bg-forest-surface text-forest border border-hairline text-[10px] font-bold px-3 py-1 rounded-full tracking-widest uppercase">
              {course.tag || "CORE"}
            </span>
            {course.badge && (
              <span className="bg-forest text-white text-[10px] font-bold px-3 py-1 rounded-full tracking-widest uppercase">
                {course.badge}
              </span>
            )}
          </div>

          <h1 className="text-5xl font-bold text-ink tracking-tight leading-tight max-w-3xl mb-6">
            {course.title}
          </h1>
          <p className="text-ink-dim text-xl leading-relaxed max-w-2xl">
            {course.description || course.subtitle}
          </p>

          <div className="flex gap-12 mt-12 pt-12 border-t border-hairline">
            {[
              { label: "MODULES", val: totalLessons },
              { label: "DURATION", val: course.duration || "4 Hours" },
              { label: "FORMAT", val: "Text-First" },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-[10px] font-bold text-ink-dim tracking-[0.2em] mb-2">{s.label}</div>
                <div className="text-lg font-bold text-ink">{s.val}</div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ── CONTENT ── */}
      <main className="site-container mt-16 grid grid-cols-1 lg:grid-cols-3 gap-16">

        {/* Left: Curriculum & Learnings */}
        <div className="lg:col-span-2 space-y-16">

          {/* What you'll learn */}
          {course.whatYouLearn?.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-ink mb-8 tracking-tight">What you&apos;ll master</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {course.whatYouLearn.map((point: string) => (
                  <div key={point} className="flex gap-4 p-4 bg-panel border border-hairline rounded-2xl shadow-sm">
                    <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex-shrink-0 flex items-center justify-center">
                      <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <span className="text-[14px] text-ink-dim leading-snug font-medium">{point}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Curriculum */}
          <section>
            <h2 className="text-2xl font-bold text-ink mb-8 tracking-tight">Curriculum Breakdown</h2>
            <div className="space-y-4">
              {course.chapters?.map((chapter: any) => (
                <div key={chapter.title} className="bg-panel border border-hairline rounded-2xl overflow-hidden shadow-sm hover:border-forest/30 transition-colors">
                  <div className="px-6 py-4 bg-ivory/50 border-b border-hairline flex items-center justify-between">
                    <h3 className="font-bold text-ink text-sm tracking-tight">{chapter.title}</h3>
                    <span className="text-[10px] font-bold text-ink-dim uppercase tracking-widest">
                      {chapter.lessons?.length || 0} Lessons
                    </span>
                  </div>
                  <div className="divide-y divide-hairline">
                    {chapter.lessons?.map((lesson: any) => {
                      const lessonAccessible = lesson.isFree || hasAccess;
                      return (
                        <div
                          key={lesson.title}
                          className="px-6 py-4 flex items-center justify-between group hover:bg-ivory/50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${lessonAccessible ? "bg-emerald-50 text-emerald-600" : "bg-hairline text-ink-dim"}`}>
                              {lessonAccessible ? "▶" : "🔒"}
                            </div>
                            {lessonAccessible && lesson.slug ? (
                              <div className="flex items-center">
                                <Link
                                  href={`/learn/${slug}/${lesson.slug}`}
                                  className="text-[14px] font-semibold text-ink hover:text-forest transition-colors"
                                >
                                  {lesson.title}
                                </Link>
                                {lesson.duration && (
                                  <span className="text-[11px] text-ink-dim font-mono ml-2">{lesson.duration}</span>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <span className="text-[14px] font-semibold text-ink-dim">
                                  {lesson.title}
                                </span>
                                {lesson.duration && (
                                  <span className="text-[11px] text-ink-dim font-mono ml-2">{lesson.duration}</span>
                                )}
                              </div>
                            )}
                          </div>
                          {lesson.isFree && (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded tracking-widest uppercase">
                              Preview
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right: Sticky Action Card */}
        <div className="lg:col-span-1">
          <div className="sticky top-32 bg-panel border border-hairline rounded-3xl p-8 shadow-2xl">
            <div className="mb-8">
              <div className="text-[10px] font-bold text-ink-dim tracking-[0.2em] mb-2 uppercase">Access Level</div>
              <div className={`text-xl font-bold tracking-tight ${courseAccessLevel === "free" ? "text-emerald-600" : "text-gold"}`}>
                {courseAccessLevel.toUpperCase()}
              </div>
            </div>

            <div className="space-y-4 mb-8">
              {(hasAccess || courseAccessLevel === "free") && firstLessonSlug ? (
                <Link
                  href={`/learn/${slug}/${hasStartedCourse ? resumeLessonSlug : firstLessonSlug}`}
                  className="premium-button-primary w-full text-center block font-bold"
                >
                  {hasStartedCourse ? "Continue Learning →" : "Start Learning Now →"}
                </Link>
              ) : (
                <Link
                  href="/pricing"
                  className="premium-button-primary w-full text-center block font-bold"
                >
                  Unlock This Course →
                </Link>
              )}
              {!user && (
                <Link
                  href="/auth/login"
                  className="premium-button-outline w-full text-center block font-bold text-ink-dim"
                >
                  Sign in to resume
                </Link>
              )}
            </div>

            {user && hasStartedCourse && (
              <div style={{ marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid #DFD9C8' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#6E6A5F', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Your progress</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#1A1A18' }}>{progressPct}%</span>
                </div>
                <div style={{ height: '6px', background: '#DFD9C8', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: '#A9822F', borderRadius: '3px', width: `${progressPct}%`, transition: 'width 0.3s' }} />
                </div>
                <div style={{ fontSize: '11px', color: '#6E6A5F', marginTop: '4px' }}>
                  {completedCount} of {totalLessons} lessons complete
                </div>
              </div>
            )}

            <div className="space-y-4 pt-8 border-t border-hairline">
              <div className="text-[10px] font-bold text-ink-dim tracking-[0.2em] uppercase">Everything included</div>
              {[
                "Full Text Playbooks",
                "Actionable Exercises",
                "Mobile Reading Mode",
                "Lifetime Updates",
              ].map((item) => (
                <div key={item} className="flex gap-3 text-sm text-ink-dim font-medium">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M5 13l4 4L19 7" /></svg>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
