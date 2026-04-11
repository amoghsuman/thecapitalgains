import Link from "next/link";
import { getCourseBySlug } from "@/lib/sanity/queries";
import "@/app/premium-theme.css";

export const revalidate = 0

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);

  if (!course) {
    return (
      <div className="bg-[#F8FAFC] min-h-screen flex items-center justify-center text-center">
        <div>
          <h1 className="text-4xl font-bold text-[#1C0F3F] mb-4">Course not found</h1>
          <Link href="/courses" className="premium-button-primary inline-block">Browse all courses</Link>
        </div>
      </div>
    );
  }

  const totalLessons = course.lessonsCount || course.chapters?.reduce((sum: number, ch: any) => sum + (ch.lessons?.length ?? 0), 0) || 0;

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans pb-20">
      
      {/* ── HEADER (Premium Dark) ── */}
      <header className="premium-dark pt-32 pb-24 border-b border-[rgba(255,255,255,0.05)]">
        <div className="max-w-6xl mx-auto px-8">
          <div className="flex items-center gap-3 mb-8">
            <Link href="/courses" className="text-[#A78BFA] text-xs font-bold tracking-[0.2em] uppercase hover:text-white transition-colors">
              ← Back to Curriculum
            </Link>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="bg-violet-500/20 text-violet-300 border border-violet-500/30 text-[10px] font-bold px-3 py-1 rounded-full tracking-widest uppercase">
              {course.tag || "CORE"}
            </span>
            {course.badge && (
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold px-3 py-1 rounded-full tracking-widest uppercase">
                {course.badge}
              </span>
            )}
          </div>

          <h1 className="text-5xl font-bold text-white tracking-tight leading-tight max-w-3xl mb-6">
            {course.title}
          </h1>
          <p className="text-[#94A3B8] text-xl leading-relaxed max-w-2xl">
            {course.description || course.subtitle}
          </p>

          <div className="flex gap-12 mt-12 pt-12 border-t border-[rgba(255,255,255,0.05)]">
            {[
              { label: "MODULES", val: totalLessons },
              { label: "DURATION", val: course.duration || "4 Hours" },
              { label: "FORMAT", val: "Text-First" },
            ].map(s => (
              <div key={s.label}>
                <div className="text-[10px] font-bold text-[#64748B] tracking-[0.2em] mb-2">{s.label}</div>
                <div className="text-lg font-bold text-white">{s.val}</div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ── CONTENT ── */}
      <main className="max-w-6xl mx-auto px-8 mt-16 grid grid-cols-1 lg:grid-cols-3 gap-16">
        
        {/* Left: Curriculum & Learnings */}
        <div className="lg:col-span-2 space-y-16">
          
          {/* What you'll learn */}
          {course.whatYouLearn?.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-[#1C0F3F] mb-8 tracking-tight">What you&apos;ll master</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {course.whatYouLearn.map((point: string) => (
                  <div key={point} className="flex gap-4 p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
                    <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex-shrink-0 flex items-center justify-center">
                      <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <span className="text-[14px] text-[#4B3F6B] leading-snug font-medium">{point}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Curriculum */}
          <section>
            <h2 className="text-2xl font-bold text-[#1C0F3F] mb-8 tracking-tight">Curriculum Breakdown</h2>
            <div className="space-y-4">
              {course.chapters?.map((chapter: any) => (
                <div key={chapter.title} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:border-violet-200 transition-colors">
                  <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-[#1C0F3F] text-sm tracking-tight">{chapter.title}</h3>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{chapter.lessons?.length || 0} Lessons</span>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {chapter.lessons?.map((lesson: any) => (
                      <div key={lesson.title} className="px-6 py-4 flex items-center justify-between group hover:bg-violet-50/30 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${lesson.isFree ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                            {lesson.isFree ? "▶" : "🔒"}
                          </div>
                          <span className={`text-[14px] font-semibold ${lesson.isFree ? 'text-[#1C0F3F]' : 'text-slate-400'}`}>{lesson.title}</span>
                        </div>
                        {lesson.isFree && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded tracking-widest uppercase">Preview</span>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right: Sticky Action Card */}
        <div className="lg:col-span-1">
          <div className="sticky top-32 bg-white border border-slate-200 rounded-3xl p-8 shadow-2xl">
            <div className="mb-8">
              <div className="text-[10px] font-bold text-slate-400 tracking-[0.2em] mb-2 uppercase">Access Level</div>
              <div className={`text-xl font-bold tracking-tight ${course.accessLevel === 'pro' ? 'text-[#D4860A]' : 'text-emerald-600'}`}>
                {course.accessLevel?.toUpperCase() || 'LEARNER+'}
              </div>
            </div>

            <div className="space-y-4 mb-8">
              {course.accessLevel === "free" ? (
                <Link href="#" className="premium-button-primary w-full text-center block font-bold">Start Learning Now</Link>
              ) : (
                <Link href="/pricing" className="premium-button-primary w-full text-center block font-bold">Unlock This Course</Link>
              )}
              <Link href="/auth/login" className="premium-button-outline w-full text-center block font-bold text-slate-600">Sign in to resume</Link>
            </div>

            <div className="space-y-4 pt-8 border-t border-slate-100">
              <div className="text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase">Everything included</div>
              {[
                "Full Text Playbooks",
                "Actionable Exercises",
                "Mobile Reading Mode",
                "Lifetime Updates",
              ].map(item => (
                <div key={item} className="flex gap-3 text-sm text-[#4B3F6B] font-medium">
                  <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M5 13l4 4L19 7" /></svg>
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
