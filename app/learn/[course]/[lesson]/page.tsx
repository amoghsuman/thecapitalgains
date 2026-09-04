"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import katex from "katex";
import { getFullCourseForReader, getLessonBySlug } from "@/lib/sanity/queries";
import { createClient } from "@/lib/supabase/client";
import { canAccessLesson, lessonLockReason } from "@/lib/access";

// ─── Types ────────────────────────────────────────────────────────────────────

type LessonMeta = { slug: string; title: string; duration: string; isFree: boolean };
type Chapter = { title: string; lessons: LessonMeta[] };
type CourseData = { title: string; price: number; slug: string; accessLevel?: string; chapters: Chapter[] };
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
    <div className={`rounded-xl p-6 mt-10 border-2 ${allDone ? "border-forest bg-forest-surface" : "border-ink bg-panel"}`}>
      <div className={`font-mono text-[11px] tracking-widest uppercase mb-4 ${allDone ? "text-forest" : "text-ink"}`}>
        Exercise · {title}
      </div>
      <div className="flex flex-col gap-3">
        {steps.map((step, i) => (
          <label key={i} className="flex items-start gap-3 cursor-pointer group">
            <div
              onClick={() => toggle(i)}
              className={`mt-0.5 w-5 h-5 flex-shrink-0 rounded border-2 flex items-center justify-center transition-all ${
                checked.has(i)
                  ? "border-forest bg-forest"
                  : "border-hairline group-hover:border-gold"
              }`}
            >
              {checked.has(i) && (
                <span className="text-white text-[11px] leading-none">✓</span>
              )}
            </div>
            <span
              onClick={() => toggle(i)}
              className={`text-[14px] leading-relaxed select-none ${
                checked.has(i) ? "text-ink-dim/60 line-through" : "text-ink-dim"
              }`}
            >
              {step}
            </span>
          </label>
        ))}
      </div>
      {allDone && (
        <div className="mt-4 font-mono text-[12px] text-forest font-medium">
          ✓ Exercise complete, move on to the next lesson
        </div>
      )}
    </div>
  );
}

// ─── Scenario Exercise (revealable model answer) ─────────────────────────────

function ScenarioExercise({
  title,
  scenario,
  prompt,
  modelAnswer,
}: {
  title: string;
  scenario: string;
  prompt?: string;
  modelAnswer: string;
}) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="rounded-xl p-6 mt-10 border-2 border-hairline bg-panel">
      <div className="font-mono text-[11px] tracking-widest uppercase mb-4 text-ink">
        Scenario · {title}
      </div>
      <p className="text-[15px] text-ink leading-relaxed mb-4">{scenario}</p>
      {prompt && (
        <p className="text-[15px] text-ink-dim italic leading-relaxed mb-5">{prompt}</p>
      )}
      {!revealed ? (
        <button
          onClick={() => setRevealed(true)}
          className="bg-forest hover:bg-forest-dark text-white rounded-lg px-5 py-2.5 text-[13px] font-medium transition-colors"
        >
          Show model answer
        </button>
      ) : (
        <div className="mt-2 border-t border-hairline pt-4">
          <div className="font-mono text-[10px] text-forest tracking-widest uppercase mb-2">
            Model Answer
          </div>
          <p className="text-[14px] text-ink-dim leading-relaxed">{modelAnswer}</p>
        </div>
      )}
    </div>
  );
}

// ─── Quiz Exercise (multiple choice) ──────────────────────────────────────────

function QuizExercise({
  title,
  question,
  options,
  correctIndex,
  explanation,
}: {
  title: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const answered = selected !== null;
  const isCorrect = selected === correctIndex;

  return (
    <div className="rounded-xl p-6 mt-10 border-2 border-hairline bg-panel">
      <div className="font-mono text-[11px] tracking-widest uppercase mb-4 text-ink">
        Quick Check · {title}
      </div>
      <p className="text-[15px] text-ink leading-relaxed mb-4 font-medium">{question}</p>
      <div className="flex flex-col gap-2.5">
        {options.map((opt, i) => {
          const isSelected = selected === i;
          const isThisCorrect = i === correctIndex;
          let stateClasses = "border-hairline hover:border-gold";
          if (answered && isSelected && isThisCorrect) stateClasses = "border-forest bg-forest-surface";
          else if (answered && isSelected && !isThisCorrect) stateClasses = "border-[#DC2626] bg-[#FEF2F2]";
          else if (answered && isThisCorrect) stateClasses = "border-forest";

          return (
            <button
              key={i}
              onClick={() => !answered && setSelected(i)}
              disabled={answered}
              className={`text-left px-4 py-3 rounded-lg border-2 text-[14px] text-ink transition-colors ${stateClasses} ${
                answered ? "cursor-default" : "cursor-pointer"
              }`}
            >
              {opt}
              {answered && isSelected && (isThisCorrect ? " ✓" : " ✗")}
              {answered && !isSelected && isThisCorrect && " ✓"}
            </button>
          );
        })}
      </div>
      {answered && explanation && (
        <div className="mt-4 pt-4 border-t border-hairline">
          <div className={`font-mono text-[10px] tracking-widest uppercase mb-2 ${isCorrect ? "text-forest" : "text-[#DC2626]"}`}>
            {isCorrect ? "Correct" : "Not quite"}
          </div>
          <p className="text-[14px] text-ink-dim leading-relaxed">{explanation}</p>
        </div>
      )}
    </div>
  );
}

// ─── Table Block ──────────────────────────────────────────────────────────────

function TableBlock({ value }: { value: { caption?: string; headers?: string[]; rows?: string[][] } }) {
  const headers = value.headers ?? [];
  const rows = value.rows ?? [];

  return (
    <div className="my-6 overflow-x-auto">
      {value.caption && (
        <p className="font-mono text-[11px] text-ink-dim uppercase tracking-wide mb-2">{value.caption}</p>
      )}
      <table className="w-full border-collapse text-[14px]">
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th
                key={i}
                className="text-left font-semibold text-ink bg-ivory border border-hairline px-4 py-2.5 whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td key={ci} className="text-ink border border-hairline px-4 py-2.5 align-top">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Stat Grid Block ──────────────────────────────────────────────────────────

function StatGridBlock({ value }: { value: { stats?: { label?: string; value?: string; context?: string }[] } }) {
  const stats = value.stats ?? [];
  const colsClass =
    stats.length >= 4 ? "sm:grid-cols-2 lg:grid-cols-4" : stats.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2";

  return (
    <div className={`my-6 grid grid-cols-1 ${colsClass} gap-4`}>
      {stats.map((s, i) => (
        <div key={i} className="border border-hairline rounded-xl px-5 py-4 flex flex-col gap-1">
          <div className="font-mono text-[10px] text-ink-dim tracking-widest uppercase">{s.label}</div>
          <div className="text-[20px] font-bold text-forest leading-tight">{s.value}</div>
          {s.context && <div className="text-[12px] text-ink-dim">{s.context}</div>}
        </div>
      ))}
    </div>
  );
}

// ─── Portable Text Components ─────────────────────────────────────────────────

const portableTextComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="text-[17px] text-ink leading-[1.85] mb-5">{children}</p>
    ),
    h2: ({ children }) => (
      <h2 className="text-[22px] font-bold text-ink mt-8 mb-4 leading-snug">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-[18px] font-bold text-ink mt-6 mb-3">{children}</h3>
    ),
    blockquote: ({ children }) => (
      <p className="text-[17px] text-ink leading-[1.85] italic border-l-[3px] border-gold pl-5 py-1">
        {children}
      </p>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="flex flex-col gap-2 pl-4 list-disc text-[16px] text-ink">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="flex flex-col gap-2 pl-4 list-decimal text-[16px] text-ink">{children}</ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li className="text-[16px] text-ink leading-relaxed">{children}</li>,
    number: ({ children }) => <li className="text-[16px] text-ink leading-relaxed">{children}</li>,
  },
  types: {
    callout: ({ value }: { value: { type?: string; text?: string } }) => {
      const isWarning = value.type === "warning";
      return isWarning ? (
        <div className="bg-[#FEF2F2] border border-[rgba(220,38,38,0.2)] rounded-xl px-5 py-4">
          <div className="font-mono text-[10px] text-[#DC2626] tracking-widest uppercase mb-2">⚠ Watch Out</div>
          <p className="text-[14px] text-[#7A2010] leading-relaxed">{value.text}</p>
        </div>
      ) : (
        <div className="bg-gold-surface border border-gold rounded-xl px-5 py-4">
          <div className="font-mono text-[10px] text-gold-text tracking-widest uppercase mb-2">Key Insight</div>
          <p className="text-[14px] text-gold-text leading-relaxed font-medium">{value.text}</p>
        </div>
      );
    },
    exercise: ({ value }: { value: any }) => {
      const variant = value.variant ?? "checklist"; // missing variant = pre-existing checklist content
      if (variant === "scenario") {
        return (
          <ScenarioExercise
            title={value.title ?? ""}
            scenario={value.scenario ?? ""}
            prompt={value.prompt}
            modelAnswer={value.modelAnswer ?? ""}
          />
        );
      }
      if (variant === "quiz") {
        return (
          <QuizExercise
            title={value.title ?? ""}
            question={value.question ?? ""}
            options={value.options ?? []}
            correctIndex={value.correctIndex ?? 0}
            explanation={value.explanation}
          />
        );
      }
      return <ExerciseBlock title={value.title ?? ""} steps={value.steps ?? []} />;
    },
    table: ({ value }: { value: { caption?: string; headers?: string[]; rows?: string[][] } }) => (
      <TableBlock value={value} />
    ),
    statGrid: ({ value }: { value: { stats?: { label?: string; value?: string; context?: string }[] } }) => (
      <StatGridBlock value={value} />
    ),
    mathBlock: ({ value }: { value: { latex?: string; caption?: string } }) => {
      let html = "";
      try {
        html = katex.renderToString(value.latex ?? "", { displayMode: true, throwOnError: false });
      } catch {
        html = `<span style="color:#DC2626">${value.latex}</span>`;
      }
      return (
        <div className="my-6 overflow-x-auto">
          <div className="bg-forest-surface rounded-xl px-6 py-5 text-center" dangerouslySetInnerHTML={{ __html: html }} />
          {value.caption && (
            <p className="font-mono text-[11px] text-ink-dim text-center mt-2 tracking-wide">{value.caption}</p>
          )}
        </div>
      );
    },
    keyFact: ({ value }: { value: { label?: string; value?: string; context?: string } }) => (
      <div className="my-5 border border-hairline rounded-xl px-6 py-4 flex flex-col gap-1">
        <div className="font-mono text-[10px] text-ink-dim tracking-widest uppercase">{value.label}</div>
        <div className="text-[22px] font-bold text-ink leading-tight">{value.value}</div>
        {value.context && (
          <div className="text-[13px] text-ink-dim">{value.context}</div>
        )}
      </div>
    ),
  },
};

// ─── Locked Lesson State ──────────────────────────────────────────────────────

function LockedLesson({
  isLoggedIn,
  reason,
}: {
  isLoggedIn: boolean;
  reason: "needs-subscription" | "needs-pro";
}) {
  const isPro = reason === "needs-pro";
  return (
    <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
      <div className="w-16 h-16 bg-forest-surface rounded-full flex items-center justify-center text-[28px] mb-5">
        🔒
      </div>
      <h2 className="text-[22px] font-bold text-ink mb-2">
        {isPro ? "Upgrade to Pro to access this course" : "Subscribe to access this lesson"}
      </h2>
      <p className="text-[15px] text-ink-dim mb-8 max-w-sm">
        {isPro
          ? "This is a Pro course. Upgrade from Learner to Pro to unlock it, along with early access to new courses and workbooks."
          : "This lesson is part of the full course. Subscribe for access to all courses."}
      </p>
      <Link
        href="/pricing"
        className="bg-forest hover:bg-forest-dark text-white rounded-lg px-8 py-3.5 text-[15px] font-medium transition-colors mb-3"
      >
        View Subscription Plans →
      </Link>
      {!isLoggedIn && (
        <Link
          href="/auth/login"
          className="border border-hairline hover:border-ink text-ink-dim hover:text-ink rounded-lg px-8 py-3.5 text-[15px] font-medium transition-colors"
        >
          Sign in if subscribed →
        </Link>
      )}
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

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userTier, setUserTier] = useState<string>("free");
  const [authLoading, setAuthLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const supabaseRef = useRef(createClient());

  useEffect(() => {
    if (lessonSlug) setActiveLesson(lessonSlug);
  }, [lessonSlug]);

  // Auth + subscription + existing progress
  useEffect(() => {
    async function loadAuthAndProgress() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setAuthLoading(false);
        return;
      }
      setIsLoggedIn(true);
      setUserId(user.id);

      const { data: sub } = await supabase
        .from("subscriptions")
        .select("tier, status, current_period_end")
        .eq("user_id", user.id)
        .eq("status", "active")
        .single();
      if (sub) {
        const isValid = !sub.current_period_end || new Date(sub.current_period_end) > new Date();
        if (isValid) setUserTier(sub.tier);
      }

      const { data: progress } = await supabase
        .from("lesson_progress")
        .select("lesson_slug")
        .eq("user_id", user.id)
        .eq("course_slug", courseSlug);
      if (progress) {
        setCompletedLessons(new Set(progress.map((p: { lesson_slug: string }) => p.lesson_slug)));
      }

      setAuthLoading(false);
    }
    loadAuthAndProgress();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseSlug]);

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
      <div className="flex-1 flex items-center justify-center text-ink-dim font-mono text-[13px]">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-ink-dim">
        Course not found.{" "}
        <Link href="/courses" className="text-gold-text ml-1">
          Browse courses →
        </Link>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex-1 flex items-center justify-center text-ink-dim font-mono text-[13px]">
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
  const lockReason = authLoading
    ? null
    : lessonLockReason(userTier, course.accessLevel, currentMeta?.isFree);
  const isLocked = lockReason !== null;

  async function markCompleteAndNext() {
    setCompletedLessons((prev) => new Set([...prev, activeLesson]));
    if (userId) {
      const supabase = supabaseRef.current;
      await supabase
        .from("lesson_progress")
        .upsert(
          {
            user_id: userId,
            course_slug: courseSlug,
            lesson_slug: activeLesson,
            last_accessed_at: new Date().toISOString(),
          },
          { onConflict: "user_id,course_slug,lesson_slug" }
        );
      await supabase
        .from("course_enrollments")
        .upsert(
          {
            user_id: userId,
            course_slug: courseSlug,
            last_lesson_slug: activeLesson,
            last_accessed_at: new Date().toISOString(),
          },
          { onConflict: "user_id,course_slug" }
        );
    }
    if (nextLesson) setActiveLesson(nextLesson.slug);
  }

  async function markFinalComplete() {
    setCompletedLessons((prev) => new Set([...prev, activeLesson]));
    if (userId) {
      const supabase = supabaseRef.current;
      const now = new Date().toISOString();
      await supabase
        .from("lesson_progress")
        .upsert(
          {
            user_id: userId,
            course_slug: courseSlug,
            lesson_slug: activeLesson,
            last_accessed_at: now,
          },
          { onConflict: "user_id,course_slug,lesson_slug" }
        );
      const allLessonsCount = (course?.chapters?.flatMap((ch) => ch.lessons) ?? []).length;
      const newCompleted = completedLessons.size + 1;
      await supabase
        .from("course_enrollments")
        .upsert(
          {
            user_id: userId,
            course_slug: courseSlug,
            last_lesson_slug: activeLesson,
            last_accessed_at: now,
            completed_at: newCompleted >= allLessonsCount ? now : null,
          },
          { onConflict: "user_id,course_slug" }
        );
    }
  }

  return (
    <div className="flex overflow-hidden bg-panel" style={{ height: "calc(100vh - 96px)" }}>

      {/* ── SIDEBAR ── */}
      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } absolute lg:relative lg:translate-x-0 z-30 flex-shrink-0 flex flex-col bg-panel border-r border-hairline overflow-y-auto transition-transform duration-200`}
        style={{ width: 280, height: "100%" }}
      >
        {/* Back + course info */}
        <div className="px-4 py-4 border-b border-hairline">
          <Link
            href="/courses"
            className="inline-flex items-center gap-1.5 font-mono text-[11px] text-ink-dim hover:text-gold-text transition-colors mb-3"
          >
            ← All courses
          </Link>
          <div className="text-[14px] text-ink leading-snug mb-1">
            {course.title}
          </div>
          <div className="font-mono text-[11px] text-ink-dim">
            {allLessons.length} lessons
          </div>
        </div>

        {/* Progress bar */}
        <div className="px-4 py-3 border-b border-hairline">
          <div className="flex justify-between items-center mb-1.5">
            <span className="font-mono text-[10px] text-ink-dim tracking-widest uppercase">Progress</span>
            <span className="font-mono text-[11px] text-ink">{progressPct}%</span>
          </div>
          <div className="h-[3px] bg-hairline rounded-full overflow-hidden">
            <div
              className="h-full bg-gold rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Chapters + lessons */}
        <div className="flex-1 py-2">
          {course.chapters.map((chapter) => (
            <div key={chapter.title} className="mb-1">
              <div className="px-4 py-2 font-mono text-[9px] text-ink-dim tracking-widest uppercase">
                {chapter.title}
              </div>
              {chapter.lessons.map((l) => {
                const isActive = l.slug === activeLesson;
                const isDone = completedLessons.has(l.slug);
                const isAccessible = canAccessLesson(userTier, course.accessLevel, l.isFree);

                return (
                  <button
                    key={l.slug}
                    onClick={() => setActiveLesson(l.slug)}
                    className={`w-full text-left flex items-start gap-3 px-4 py-2.5 border-l-[3px] transition-all ${
                      isActive
                        ? "border-gold bg-forest-surface"
                        : "border-transparent hover:bg-forest-surface/60"
                    }`}
                  >
                    <div
                      className={`mt-0.5 w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] ${
                        isDone
                          ? "bg-forest text-white"
                          : isActive
                          ? "bg-gold text-white"
                          : isAccessible
                          ? "border-2 border-hairline text-ink-dim"
                          : "bg-hairline text-ink-dim"
                      }`}
                    >
                      {isDone ? "✓" : isActive ? "▶" : isAccessible ? "" : "🔒"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-[13px] leading-snug ${
                          isActive ? "text-ink font-medium" : isDone ? "text-ink-dim" : "text-ink-dim"
                        }`}
                      >
                        {l.title}
                      </div>
                      <div className="font-mono text-[10px] text-ink-dim mt-0.5">{l.duration}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Subscribe card */}
        <div className="p-4 border-t border-hairline bg-forest-surface">
          <div className="font-mono text-[10px] text-ink-dim tracking-widest uppercase mb-2">Full Access</div>
          <div className="font-mono text-[13px] text-ink-dim mb-3">
            Subscribe once. Access all courses.
          </div>
          <Link
            href="/pricing"
            className="block w-full text-center bg-forest hover:bg-forest-dark text-white rounded-lg py-2.5 text-[13px] font-medium transition-colors"
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
        <div className="flex-shrink-0 flex items-center justify-between px-5 py-3 bg-panel border-b border-hairline">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-ink-dim hover:text-ink transition-colors"
              aria-label="Toggle sidebar"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M2 5h16M2 10h16M2 15h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-20 bg-hairline rounded-full overflow-hidden">
                <div
                  className="h-full bg-gold rounded-full transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <span className="font-mono text-[11px] text-ink-dim">{progressPct}% complete</span>
            </div>
          </div>
          <span className="font-mono text-[12px] text-ink hidden sm:block">The Capital Gains</span>
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto">
          {isLocked ? (
            <LockedLesson isLoggedIn={isLoggedIn} reason={lockReason ?? "needs-subscription"} />
          ) : loading ? (
            <div className="flex items-center justify-center py-24 font-mono text-[13px] text-ink-dim">
              Loading lesson...
            </div>
          ) : lesson ? (
            <div className="max-w-[720px] mx-auto px-8 py-12">
              {/* Disclaimer */}
              <div className="font-mono text-[11px] text-ink-dim mb-6">
                Educational content only · Not investment advice
              </div>

              {/* Lesson header */}
              <h1 className="text-[30px] font-bold text-ink leading-[1.1] mb-3">
                {lesson.title}
              </h1>
              <div className="flex items-center gap-3 mb-8 pb-6 border-b border-hairline">
                <span className="font-mono text-[12px] text-ink-dim">{lesson.duration} read</span>
                {lesson.isFree && (
                  <span className="font-mono text-[10px] text-forest bg-forest-surface rounded px-2 py-0.5">
                    Free preview
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="flex flex-col gap-5">
                <PortableText value={lesson.body || []} components={portableTextComponents} />
              </div>

              {/* Nav footer */}
              <div className="flex items-center justify-between mt-12 pt-6 border-t border-hairline">
                {prevLesson ? (
                  <button
                    onClick={() => setActiveLesson(prevLesson.slug)}
                    className="font-mono text-[13px] text-ink-dim hover:text-ink transition-colors"
                  >
                    ← {prevLesson.title}
                  </button>
                ) : (
                  <div />
                )}
                {nextLesson ? (
                  <button
                    onClick={markCompleteAndNext}
                    className="bg-forest hover:bg-forest-dark text-white rounded-lg px-6 py-2.5 font-mono text-[13px] font-medium transition-colors"
                  >
                    Next: {nextLesson.title} →
                  </button>
                ) : (
                  <button
                    onClick={markFinalComplete}
                    className="bg-forest hover:bg-forest-dark text-white rounded-lg px-6 py-2.5 font-mono text-[13px] font-medium transition-colors"
                  >
                    Mark complete ✓
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="max-w-[720px] mx-auto px-8 py-12">
              <div className="font-mono text-[11px] text-ink-dim mb-6">Educational content only · Not investment advice</div>
              <div className="font-mono text-[12px] text-ink-dim">Content coming soon for this lesson.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
