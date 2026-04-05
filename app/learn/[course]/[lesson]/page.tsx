"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { getFullCourseForReader, getLessonBySlug } from "@/lib/sanity/queries";

// ─── Types ────────────────────────────────────────────────────────────────────

type LessonMeta = { slug: string; title: string; duration: string; isFree: boolean };
type Chapter = { title: string; lessons: LessonMeta[] };
type CourseData = { title: string; price: number; slug: string; chapters: Chapter[] };
type LessonData = { title: string; slug: string; duration: string; isFree: boolean; body: any[] };

// ─── Exercise Block (own checkbox state) ─────────────────────────────────────

function ExerciseBlock({ title, steps }: { title: string; steps: string[] }) {
  const [checked, setChecked] = useState<Set<number>>(new Set());

  function toggle(i: number) {
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  const allDone = checked.size === steps.length;

  return (
    <div className={`rounded-xl p-6 mt-10 border-2 ${allDone ? "border-[#1A7A4A] bg-[#E8F5EE]" : "border-[#0F2348] bg-white"}`}>
      <div className={`font-mono text-[11px] tracking-widest uppercase mb-4 ${allDone ? "text-[#1A7A4A]" : "text-[#0F2348]"}`}>
        Exercise · {title}
      </div>
      <div className="flex flex-col gap-3">
        {steps.map((step, i) => (
          <label key={i} className="flex items-start gap-3 cursor-pointer group">
            <div
              onClick={() => toggle(i)}
              className={`mt-0.5 w-5 h-5 flex-shrink-0 rounded border-2 flex items-center justify-center transition-all ${
                checked.has(i)
                  ? "border-[#1A7A4A] bg-[#1A7A4A]"
                  : "border-[rgba(15,35,72,0.25)] group-hover:border-[#D4860A]"
              }`}
            >
              {checked.has(i) && (
                <span className="text-white text-[11px] leading-none">✓</span>
              )}
            </div>
            <span
              onClick={() => toggle(i)}
              className={`text-[14px] leading-relaxed select-none ${
                checked.has(i) ? "text-[#9494A8] line-through" : "text-[#5A5A72]"
              }`}
            >
              {step}
            </span>
          </label>
        ))}
      </div>
      {allDone && (
        <div className="mt-4 font-mono text-[12px] text-[#1A7A4A] font-medium">
          ✓ Exercise complete — move on to the next lesson
        </div>
      )}
    </div>
  );
}

// ─── Portable Text Components ─────────────────────────────────────────────────

const portableTextComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="font-serif text-[17px] text-[#5A5A72] leading-[1.85]">{children}</p>
    ),
    h2: ({ children }) => (
      <h2 className="font-serif text-[24px] font-bold text-[#0F2348] mt-4 mb-0">{children}</h2>
    ),
    blockquote: ({ children }) => (
      <p className="font-serif text-[17px] text-[#1A1A2E] leading-[1.85] italic border-l-[3px] border-[#D4860A] pl-5 py-1">
        {children}
      </p>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="flex flex-col gap-2 pl-4 list-disc text-[16px] text-[#5A5A72]">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="flex flex-col gap-2 pl-4 list-decimal text-[16px] text-[#5A5A72]">{children}</ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li className="font-serif leading-relaxed">{children}</li>,
    number: ({ children }) => <li className="font-serif leading-relaxed">{children}</li>,
  },
  types: {
    callout: ({ value }: { value: { type?: string; text?: string } }) => {
      const isWarning = value.type === "warning";
      return isWarning ? (
        <div className="bg-[#FEF2F2] border border-[rgba(220,38,38,0.2)] rounded-xl px-5 py-4">
          <div className="font-mono text-[10px] text-[#DC2626] tracking-widest uppercase mb-2">⚠ Watch Out</div>
          <p className="text-[14px] text-[#7F1D1D] leading-relaxed">{value.text}</p>
        </div>
      ) : (
        <div className="bg-[#FDF3E3] border border-[rgba(212,134,10,0.25)] rounded-xl px-5 py-4">
          <div className="font-mono text-[10px] text-[#D4860A] tracking-widest uppercase mb-2">Key Insight</div>
          <p className="text-[14px] text-[#0F2348] leading-relaxed font-medium">{value.text}</p>
        </div>
      );
    },
    exercise: ({ value }: { value: { title?: string; steps?: string[] } }) => (
      <ExerciseBlock title={value.title ?? ""} steps={value.steps ?? []} />
    ),
  },
};

// ─── Locked Lesson State ──────────────────────────────────────────────────────

function LockedLesson() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
      <div className="w-16 h-16 bg-[#F4F1EB] rounded-full flex items-center justify-center text-[28px] mb-5">
        🔒
      </div>
      <h2 className="font-serif text-[22px] font-bold text-[#0F2348] mb-2">
        Subscribe to access this lesson
      </h2>
      <p className="text-[15px] text-[#5A5A72] mb-8 max-w-sm">
        This lesson is part of the full course. Subscribe for access to all courses.
      </p>
      <Link
        href="/pricing"
        className="bg-[#D4860A] hover:bg-[#F0A020] text-white rounded-lg px-8 py-3.5 text-[15px] font-medium transition-colors mb-3"
      >
        View Subscription Plans →
      </Link>
      <Link
        href="/auth/login"
        className="border border-[rgba(15,35,72,0.2)] hover:border-[#0F2348] text-[#5A5A72] hover:text-[#0F2348] rounded-lg px-8 py-3.5 text-[15px] font-medium transition-colors"
      >
        Sign in if subscribed →
      </Link>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ReaderPage() {
  const params = useParams();
  const courseSlug = typeof params.course === "string" ? params.course : "";
  const lessonSlug = typeof params.lesson === "string" ? params.lesson : "";

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [activeLesson, setActiveLesson] = useState(lessonSlug);

  const [course, setCourse] = useState<CourseData | null>(null);
  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (lessonSlug) setActiveLesson(lessonSlug);
  }, [lessonSlug]);

  // Fetch course structure
  useEffect(() => {
    if (!courseSlug) return;
    getFullCourseForReader(courseSlug)
      .then((data: CourseData | null) => {
        if (!data) setError(true);
        else setCourse(data);
      })
      .catch(() => setError(true));
  }, [courseSlug]);

  // Fetch lesson content
  useEffect(() => {
    if (!courseSlug || !activeLesson) return;
    setLesson(null);
    getLessonBySlug(courseSlug, activeLesson)
      .then((data: { lesson: LessonData | null } | null) => {
        if (data?.lesson) setLesson(data.lesson);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [courseSlug, activeLesson]);

  if (!lessonSlug) {
    return (
      <div className="flex-1 flex items-center justify-center text-[#9494A8] font-mono text-[13px]">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-[#5A5A72]">
        Course not found.{" "}
        <Link href="/courses" className="text-[#D4860A] ml-1">
          Browse courses →
        </Link>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex-1 flex items-center justify-center text-[#9494A8] font-mono text-[13px]">
        Loading...
      </div>
    );
  }

  const allLessons = course.chapters.flatMap((ch) => ch.lessons);
  const lessonIndex = allLessons.findIndex((l) => l.slug === activeLesson);
  const nextLesson = lessonIndex < allLessons.length - 1 ? allLessons[lessonIndex + 1] : null;
  const prevLesson = lessonIndex > 0 ? allLessons[lessonIndex - 1] : null;
  const progressPct = allLessons.length > 0 ? Math.round((completedLessons.size / allLessons.length) * 100) : 0;

  const currentMeta = allLessons.find((l) => l.slug === activeLesson) || allLessons.find((l) => l.slug === lessonSlug);
  const isLocked = currentMeta ? !currentMeta.isFree : true;

  function markCompleteAndNext() {
    setCompletedLessons((prev) => new Set([...prev, activeLesson]));
    if (nextLesson) setActiveLesson(nextLesson.slug);
  }

  return (
    <div className="flex overflow-hidden bg-[#FAFAF7]" style={{ height: "calc(100vh - 96px)" }}>

      {/* ── SIDEBAR ── */}
      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } absolute lg:relative lg:translate-x-0 z-30 flex-shrink-0 flex flex-col bg-white border-r border-[rgba(15,35,72,0.1)] overflow-y-auto transition-transform duration-200`}
        style={{ width: 280, height: "100%" }}
      >
        {/* Back + course info */}
        <div className="px-4 py-4 border-b border-[rgba(15,35,72,0.07)]">
          <Link
            href="/courses"
            className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[#9494A8] hover:text-[#D4860A] transition-colors mb-3"
          >
            ← All courses
          </Link>
          <div className="font-serif text-[14px] text-[#0F2348] leading-snug mb-1">
            {course.title}
          </div>
          <div className="font-mono text-[11px] text-[#9494A8]">
            {allLessons.length} lessons
          </div>
        </div>

        {/* Progress bar */}
        <div className="px-4 py-3 border-b border-[rgba(15,35,72,0.07)]">
          <div className="flex justify-between items-center mb-1.5">
            <span className="font-mono text-[10px] text-[#9494A8] tracking-widest uppercase">Progress</span>
            <span className="font-mono text-[11px] text-[#0F2348]">{progressPct}%</span>
          </div>
          <div className="h-[3px] bg-[#EDE9E0] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#D4860A] rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Chapters + lessons */}
        <div className="flex-1 py-2">
          {course.chapters.map((chapter) => (
            <div key={chapter.title} className="mb-1">
              <div className="px-4 py-2 font-mono text-[9px] text-[#9494A8] tracking-widest uppercase">
                {chapter.title}
              </div>
              {chapter.lessons.map((l) => {
                const isActive = l.slug === activeLesson;
                const isDone = completedLessons.has(l.slug);
                const isAccessible = l.isFree;

                return (
                  <button
                    key={l.slug}
                    onClick={() => setActiveLesson(l.slug)}
                    className={`w-full text-left flex items-start gap-3 px-4 py-2.5 border-l-[3px] transition-all ${
                      isActive
                        ? "border-[#D4860A] bg-[#F4F1EB]"
                        : "border-transparent hover:bg-[#F4F1EB]/60"
                    }`}
                  >
                    <div
                      className={`mt-0.5 w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] ${
                        isDone
                          ? "bg-[#1A7A4A] text-white"
                          : isActive
                          ? "bg-[#D4860A] text-white"
                          : isAccessible
                          ? "border-2 border-[rgba(15,35,72,0.2)] text-[#9494A8]"
                          : "bg-[#EDE9E0] text-[#9494A8]"
                      }`}
                    >
                      {isDone ? "✓" : isActive ? "▶" : isAccessible ? "" : "🔒"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-[13px] leading-snug ${
                          isActive ? "text-[#0F2348] font-medium" : isDone ? "text-[#9494A8]" : "text-[#5A5A72]"
                        }`}
                      >
                        {l.title}
                      </div>
                      <div className="font-mono text-[10px] text-[#9494A8] mt-0.5">{l.duration}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Subscribe card */}
        <div className="p-4 border-t border-[rgba(15,35,72,0.08)] bg-[#F4F1EB]">
          <div className="font-mono text-[10px] text-[#9494A8] tracking-widest uppercase mb-2">Full Access</div>
          <div className="font-mono text-[13px] text-[#5A5A72] mb-3">
            Subscribe once. Access all courses.
          </div>
          <Link
            href="/pricing"
            className="block w-full text-center bg-[#D4860A] hover:bg-[#F0A020] text-white rounded-lg py-2.5 text-[13px] font-medium transition-colors"
          >
            View plans →
          </Link>
        </div>
      </aside>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-20 bg-black/30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── MAIN PANEL ── */}
      <div className="flex-1 flex flex-col min-w-0 h-full">

        {/* Top bar */}
        <div className="flex-shrink-0 flex items-center justify-between px-5 py-3 bg-white border-b border-[rgba(15,35,72,0.1)]">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-[#5A5A72] hover:text-[#0F2348] transition-colors"
              aria-label="Toggle sidebar"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M2 5h16M2 10h16M2 15h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-20 bg-[#EDE9E0] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#D4860A] rounded-full transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <span className="font-mono text-[11px] text-[#9494A8]">{progressPct}% complete</span>
            </div>
          </div>
          <span className="font-mono text-[12px] text-[#0F2348] hidden sm:block">The Capital Gains</span>
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto">
          {isLocked ? (
            <LockedLesson />
          ) : loading ? (
            <div className="flex items-center justify-center py-24 font-mono text-[13px] text-[#9494A8]">
              Loading lesson...
            </div>
          ) : lesson ? (
            <div className="max-w-[720px] mx-auto px-8 py-12">
              {/* Disclaimer */}
              <div className="font-mono text-[11px] text-[#9494A8] mb-6">
                Educational content only · Not investment advice
              </div>

              {/* Lesson header */}
              <h1 className="font-serif text-[30px] font-bold text-[#0F2348] leading-[1.1] mb-3">
                {lesson.title}
              </h1>
              <div className="flex items-center gap-3 mb-8 pb-6 border-b border-[rgba(15,35,72,0.08)]">
                <span className="font-mono text-[12px] text-[#9494A8]">{lesson.duration} read</span>
                {lesson.isFree && (
                  <span className="font-mono text-[10px] text-[#1A7A4A] bg-[#E8F5EE] rounded px-2 py-0.5">
                    Free preview
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="flex flex-col gap-5">
                <PortableText value={lesson.body || []} components={portableTextComponents} />
              </div>

              {/* Nav footer */}
              <div className="flex items-center justify-between mt-12 pt-6 border-t border-[rgba(15,35,72,0.08)]">
                {prevLesson ? (
                  <button
                    onClick={() => setActiveLesson(prevLesson.slug)}
                    className="font-mono text-[13px] text-[#5A5A72] hover:text-[#0F2348] transition-colors"
                  >
                    ← {prevLesson.title}
                  </button>
                ) : (
                  <div />
                )}
                {nextLesson ? (
                  <button
                    onClick={markCompleteAndNext}
                    className="bg-[#D4860A] hover:bg-[#F0A020] text-white rounded-lg px-6 py-2.5 font-mono text-[13px] font-medium transition-colors"
                  >
                    Next: {nextLesson.title} →
                  </button>
                ) : (
                  <button
                    onClick={() => setCompletedLessons((prev) => new Set([...prev, activeLesson]))}
                    className="bg-[#1A7A4A] hover:bg-[#15623C] text-white rounded-lg px-6 py-2.5 font-mono text-[13px] font-medium transition-colors"
                  >
                    Mark complete ✓
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="max-w-[720px] mx-auto px-8 py-12">
              <div className="font-mono text-[11px] text-[#9494A8] mb-6">Educational content only · Not investment advice</div>
              <div className="font-mono text-[12px] text-[#9494A8]">Content coming soon for this lesson.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
