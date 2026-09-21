// Single source of truth for a learner's progress numbers. Both /dashboard and
// the home page widget (via /api/learner-stats) call getLearnerStats(), so the
// two surfaces cannot disagree.
//
// Column names are the real ones (checked against the database):
//   lesson_progress:    user_id, course_slug, lesson_slug, completed_at, last_accessed_at
//   course_enrollments: user_id, course_slug, enrolled_at, completed_at, last_lesson_slug, last_accessed_at
// lesson_progress has no created_at. `completed_at` defaults to now() on insert
// and the reader's upsert never rewrites it, so it is the first-completion time.

import type { SupabaseClient } from "@supabase/supabase-js";
import { TRACK_GROUPS } from "@/lib/home/trackGroups";

// ─── Inputs ───────────────────────────────────────────────────────────────────

export type CatalogCourse = {
  slug: string;
  title: string;
  tag: string | null;
  learningPath: string | null;
  totalLessons: number;
};

// Built server-side from Sanity (lib/dashboard/catalog.ts). Lessons are keyed
// by slug because that is the only lesson key Supabase stores; lesson slugs
// are unique platform-wide.
export type LearnerCatalog = {
  courses: CatalogCourse[];
  lessonMinutes: Record<string, number>;
};

// ─── Output ───────────────────────────────────────────────────────────────────

export type LearnerCourse = {
  slug: string;
  title: string;
  completed: number;
  total: number;
  lastAccessedAt: string | null;
  lastLessonSlug: string | null;
  completedAt: string | null;
  isCompleted: boolean;
  group: string | null;
  tag: string | null;
};

export type WeeklyActivity = {
  /** ISO week label, e.g. "2026-W38". */
  isoWeek: string;
  /** Monday of that week as an IST calendar date, YYYY-MM-DD. */
  weekStart: string;
  lessons: number;
};

export type GroupStats = {
  group: string;
  title: string;
  coursesStarted: number;
  coursesCompleted: number;
  lessonsCompleted: number;
  lessonsTotal: number;
};

export type LearnerStats = {
  lessonsCompleted: number;
  coursesStarted: number;
  coursesCompleted: number;
  currentStreakDays: number;
  longestStreakDays: number;
  minutesStudied: number;
  weeklyActivity: WeeklyActivity[];
  byGroup: GroupStats[];
  courses: LearnerCourse[];
};

// ─── Rows ─────────────────────────────────────────────────────────────────────

type ProgressRow = {
  course_slug: string;
  lesson_slug: string;
  completed_at: string | null;
  last_accessed_at: string | null;
};

type EnrollmentRow = {
  course_slug: string;
  last_lesson_slug: string | null;
  last_accessed_at: string | null;
  completed_at: string | null;
};

const PAGE_SIZE = 1000;

// PostgREST silently caps a plain select at 1000 rows, so page through.
async function fetchAllProgress(supabase: SupabaseClient, userId: string): Promise<ProgressRow[]> {
  const rows: ProgressRow[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("lesson_progress")
      .select("course_slug, lesson_slug, completed_at, last_accessed_at")
      .eq("user_id", userId)
      .order("completed_at", { ascending: true })
      .order("lesson_slug", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);
    // Fail loudly: a swallowed error here is exactly what made the widget show 0.
    if (error) throw new Error(`lesson_progress query failed: ${error.message}`);
    const page = (data ?? []) as ProgressRow[];
    rows.push(...page);
    if (page.length < PAGE_SIZE) return rows;
  }
}

async function fetchEnrollments(supabase: SupabaseClient, userId: string): Promise<EnrollmentRow[]> {
  const { data, error } = await supabase
    .from("course_enrollments")
    .select("course_slug, last_lesson_slug, last_accessed_at, completed_at")
    .eq("user_id", userId)
    .order("last_accessed_at", { ascending: false });
  if (error) throw new Error(`course_enrollments query failed: ${error.message}`);
  return (data ?? []) as EnrollmentRow[];
}

// ─── IST calendar helpers ─────────────────────────────────────────────────────
//
// A "day" is an IST calendar day. Days are handled as UTC-midnight Date objects
// of the IST date, so day arithmetic never touches the server's own timezone.

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

function istDay(instant: Date): Date {
  const shifted = new Date(instant.getTime() + IST_OFFSET_MS);
  return new Date(Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate()));
}

function dayKey(day: Date): string {
  return day.toISOString().slice(0, 10);
}

function mondayOf(day: Date): Date {
  const daysSinceMonday = (day.getUTCDay() + 6) % 7;
  return new Date(day.getTime() - daysSinceMonday * DAY_MS);
}

function isoWeekLabel(monday: Date): string {
  // The ISO week-year is the year of that week's Thursday.
  const thursday = new Date(monday.getTime() + 3 * DAY_MS);
  const year = thursday.getUTCFullYear();
  const firstThursdayMonday = mondayOf(new Date(Date.UTC(year, 0, 4)));
  const week = Math.round((monday.getTime() - firstThursdayMonday.getTime()) / (7 * DAY_MS)) + 1;
  return `${year}-W${String(week).padStart(2, "0")}`;
}

function computeStreaks(days: Set<string>, today: Date): { current: number; longest: number } {
  if (days.size === 0) return { current: 0, longest: 0 };

  const sorted = Array.from(days).sort();
  let longest = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    const gap = Date.parse(sorted[i]) - Date.parse(sorted[i - 1]);
    run = gap === DAY_MS ? run + 1 : 1;
    if (run > longest) longest = run;
  }

  // The streak is still alive if the last completion was today or yesterday.
  let cursor = days.has(dayKey(today)) ? today : new Date(today.getTime() - DAY_MS);
  let current = 0;
  while (days.has(dayKey(cursor))) {
    current += 1;
    cursor = new Date(cursor.getTime() - DAY_MS);
  }

  return { current, longest };
}

// ─── Public API ───────────────────────────────────────────────────────────────

const WEEKS = 8;

function groupSlugFor(learningPath: string | null): string | null {
  if (!learningPath) return null;
  const match = TRACK_GROUPS.find((g) => (g.paths as readonly string[]).includes(learningPath));
  return match?.slug ?? null;
}

function titleFromSlug(slug: string): string {
  return slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

export async function getLearnerStats(
  supabase: SupabaseClient,
  userId: string,
  catalog: LearnerCatalog,
  options: { now?: Date } = {}
): Promise<LearnerStats> {
  const [progress, enrollments] = await Promise.all([
    fetchAllProgress(supabase, userId),
    fetchEnrollments(supabase, userId),
  ]);

  const today = istDay(options.now ?? new Date());
  const catalogBySlug = new Map(catalog.courses.map((c) => [c.slug, c]));

  // ── Per-lesson aggregates ──
  const completedByCourse = new Map<string, number>();
  const lastProgressByCourse = new Map<string, string>();
  const completionDays = new Set<string>();
  const lessonsByWeek = new Map<string, number>();
  let minutesStudied = 0;

  for (const row of progress) {
    completedByCourse.set(row.course_slug, (completedByCourse.get(row.course_slug) ?? 0) + 1);
    minutesStudied += catalog.lessonMinutes[row.lesson_slug] ?? 0;

    const touched = row.last_accessed_at ?? row.completed_at;
    const prev = lastProgressByCourse.get(row.course_slug);
    if (touched && (!prev || touched > prev)) lastProgressByCourse.set(row.course_slug, touched);

    const completedAt = row.completed_at ?? row.last_accessed_at;
    if (!completedAt) continue;
    const day = istDay(new Date(completedAt));
    completionDays.add(dayKey(day));
    const week = dayKey(mondayOf(day));
    lessonsByWeek.set(week, (lessonsByWeek.get(week) ?? 0) + 1);
  }

  // ── Per-course list: enrolments first (most recent first), then any course
  //    that has progress rows but no enrolment row ──
  const enrollmentBySlug = new Map(enrollments.map((e) => [e.course_slug, e]));
  const orderedSlugs = [
    ...enrollments.map((e) => e.course_slug),
    ...Array.from(completedByCourse.keys()).filter((slug) => !enrollmentBySlug.has(slug)),
  ];

  const courses: LearnerCourse[] = orderedSlugs.map((slug) => {
    const enrollment = enrollmentBySlug.get(slug);
    const meta = catalogBySlug.get(slug);
    const completed = completedByCourse.get(slug) ?? 0;
    const total = meta?.totalLessons ?? 0;
    return {
      slug,
      title: meta?.title ?? titleFromSlug(slug),
      completed,
      total,
      lastAccessedAt: enrollment?.last_accessed_at ?? lastProgressByCourse.get(slug) ?? null,
      lastLessonSlug: enrollment?.last_lesson_slug ?? null,
      completedAt: enrollment?.completed_at ?? null,
      isCompleted: Boolean(enrollment?.completed_at) || (total > 0 && completed >= total),
      group: groupSlugFor(meta?.learningPath ?? null),
      tag: meta?.tag ?? null,
    };
  });

  // ── Last 8 ISO weeks, oldest first, current week last ──
  const thisMonday = mondayOf(today);
  const weeklyActivity: WeeklyActivity[] = [];
  for (let i = WEEKS - 1; i >= 0; i--) {
    const monday = new Date(thisMonday.getTime() - i * 7 * DAY_MS);
    const weekStart = dayKey(monday);
    weeklyActivity.push({ isoWeek: isoWeekLabel(monday), weekStart, lessons: lessonsByWeek.get(weekStart) ?? 0 });
  }

  // ── By track group ──
  const byGroup: GroupStats[] = TRACK_GROUPS.map((g) => {
    const mine = courses.filter((c) => c.group === g.slug);
    const paths: readonly string[] = g.paths;
    const lessonsTotal = catalog.courses
      .filter((c) => c.learningPath && paths.includes(c.learningPath))
      .reduce((sum, c) => sum + c.totalLessons, 0);
    return {
      group: g.slug,
      title: g.title,
      coursesStarted: mine.length,
      coursesCompleted: mine.filter((c) => c.isCompleted).length,
      lessonsCompleted: mine.reduce((sum, c) => sum + c.completed, 0),
      lessonsTotal,
    };
  });

  const streaks = computeStreaks(completionDays, today);

  return {
    lessonsCompleted: progress.length,
    coursesStarted: courses.length,
    coursesCompleted: courses.filter((c) => c.isCompleted).length,
    currentStreakDays: streaks.current,
    longestStreakDays: streaks.longest,
    minutesStudied,
    weeklyActivity,
    byGroup,
    courses,
  };
}
