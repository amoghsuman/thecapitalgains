"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { createClient } from "@/lib/supabase/client";
import {
  BookOpen,
  Flame,
  ArrowRight,
  LayoutDashboard,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

interface UserProgressSummary {
  completedCount: number;
  streak: number;
  activeCourse: {
    title: string;
    slug: string;
    lastLessonSlug?: string;
  } | null;
  displayName: string;
}

function calculateStreakFromTimestamps(
  timestamps: (string | undefined | null)[]
): number {
  const validTimestamps = timestamps.filter(
    (t): t is string => typeof t === "string" && t.length > 0
  );

  if (validTimestamps.length === 0) return 0;

  const dateSet = new Set<string>();
  for (const ts of validTimestamps) {
    const d = new Date(ts);
    if (!isNaN(d.getTime())) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      dateSet.add(`${year}-${month}-${day}`);
    }
  }

  if (dateSet.size === 0) return 0;

  const formatDay = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const now = new Date();
  const todayStr = formatDay(now);

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatDay(yesterday);

  let currentStreak = 0;
  let checkDate = new Date(now);

  if (dateSet.has(todayStr)) {
    // Activity today
    while (dateSet.has(formatDay(checkDate))) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
  } else if (dateSet.has(yesterdayStr)) {
    // Activity yesterday (streak intact for today's lesson)
    checkDate = new Date(yesterday);
    while (dateSet.has(formatDay(checkDate))) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
  } else {
    currentStreak = 0;
  }

  return currentStreak;
}

function formatCourseSlugToTitle(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function UserSummaryDashboard() {
  const [summary, setSummary] = useState<UserProgressSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function loadUserData() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          setSummary(null);
          setLoading(false);
          return;
        }

        const user = session.user;

        // Fetch completed lesson progress
        const { data: progressRows } = await supabase
          .from("lesson_progress")
          .select("course_slug, lesson_slug, last_accessed_at, created_at")
          .eq("user_id", user.id);

        const completedCount = progressRows?.length || 0;

        // Collect timestamps for streak calculation
        const timestamps = (progressRows || []).map(
          (row: { last_accessed_at?: string; created_at?: string }) =>
            row.last_accessed_at || row.created_at
        );

        // Fetch course enrollments to identify active course
        const { data: enrollments } = await supabase
          .from("course_enrollments")
          .select("course_slug, last_lesson_slug, last_accessed_at")
          .eq("user_id", user.id)
          .order("last_accessed_at", { ascending: false })
          .limit(1);

        if (enrollments && enrollments.length > 0 && enrollments[0].last_accessed_at) {
          timestamps.push(enrollments[0].last_accessed_at);
        }

        // Calculate streak
        let calculatedStreak = calculateStreakFromTimestamps(timestamps);

        // Check local storage fallback/override if user just completed a lesson offline
        const streakStorageKey = `cg_user_streak_${user.id}`;
        try {
          const cachedStreak = localStorage.getItem(streakStorageKey);
          if (cachedStreak) {
            const parsed = parseInt(cachedStreak, 10);
            if (!isNaN(parsed) && parsed > calculatedStreak) {
              calculatedStreak = parsed;
            }
          }
          if (calculatedStreak > 0) {
            localStorage.setItem(streakStorageKey, calculatedStreak.toString());
          }
        } catch {
          // localStorage disabled or not accessible
        }

        // Resolve display name
        const rawName =
          (user.user_metadata?.full_name as string | undefined) ||
          user.email?.split("@")[0] ||
          "Investor";
        const firstName =
          rawName.trim().split(" ")[0].charAt(0).toUpperCase() +
          rawName.trim().split(" ")[0].slice(1);

        let activeCourse = null;
        if (enrollments && enrollments.length > 0 && enrollments[0].course_slug) {
          activeCourse = {
            slug: enrollments[0].course_slug,
            title: formatCourseSlugToTitle(enrollments[0].course_slug),
            lastLessonSlug: enrollments[0].last_lesson_slug || undefined,
          };
        }

        setSummary({
          completedCount,
          streak: calculatedStreak,
          activeCourse,
          displayName: firstName,
        });
      } catch (err) {
        console.error("Error loading user summary dashboard:", err);
      } finally {
        setLoading(false);
      }
    }

    loadUserData();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setSummary(null);
        setLoading(false);
      } else {
        loadUserData();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // If loading or not logged in, render nothing to maintain clean visitor experience
  if (loading || !summary) {
    return null;
  }

  const resumeUrl = summary.activeCourse
    ? summary.activeCourse.lastLessonSlug
      ? `/learn/${summary.activeCourse.slug}/${summary.activeCourse.lastLessonSlug}`
      : `/courses/${summary.activeCourse.slug}`
    : `/courses`;

  return (
    <motion.div
      id="user-summary-dashboard"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="w-full bg-panel/95 border border-hairline rounded-2xl p-4 sm:p-5 shadow-sm backdrop-blur-md relative overflow-hidden"
    >
      {/* Subtle top indicator bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-forest via-gold to-forest opacity-80" />

      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3.5 border-b border-hairline/60">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-forest opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-forest" />
          </span>
          <span className="font-mono text-[11px] font-bold tracking-[0.14em] uppercase text-forest">
            LEARNER BRIEFING
          </span>
          <span className="text-hairline">|</span>
          <p className="text-xs sm:text-sm font-semibold text-ink">
            Welcome back, <span className="text-olive font-bold">{summary.displayName}</span>
          </p>
        </div>

        <Link
          href="/dashboard"
          id="user-summary-view-dashboard-link"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest hover:text-olive transition-colors group"
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Full Dashboard</span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-center">
        {/* Metric 1: Completed Lessons */}
        <div className="sm:col-span-4 flex items-center gap-3 p-3 bg-ivory/80 border border-hairline/70 rounded-xl">
          <div className="w-10 h-10 rounded-lg bg-forest/10 border border-forest/20 flex items-center justify-center flex-shrink-0 text-forest">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-bold font-mono text-olive leading-none">
                {summary.completedCount}
              </span>
              <span className="text-[11px] font-mono text-ink-dim uppercase">
                {summary.completedCount === 1 ? "lesson" : "lessons"}
              </span>
            </div>
            <p className="text-[11px] text-ink-dim mt-0.5 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-forest inline" />
              <span>Completed Modules</span>
            </p>
          </div>
        </div>

        {/* Metric 2: Learning Streak */}
        <div className="sm:col-span-4 flex items-center gap-3 p-3 bg-ivory/80 border border-hairline/70 rounded-xl">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-center justify-center flex-shrink-0 text-amber-600">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-bold font-mono text-olive leading-none">
                {summary.streak}
              </span>
              <span className="text-[11px] font-mono text-ink-dim uppercase">
                {summary.streak === 1 ? "day streak" : "days streak"}
              </span>
            </div>
            <p className="text-[11px] text-ink-dim mt-0.5 font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-600 inline" />
              <span>
                {summary.streak > 0
                  ? "Discipline Active 🔥"
                  : "Start a lesson today"}
              </span>
            </p>
          </div>
        </div>

        {/* Metric 3: Resume Active Playbook */}
        <div className="sm:col-span-4 flex items-center justify-between gap-3 p-3 bg-forest-surface/70 border border-forest/15 rounded-xl">
          <div className="min-w-0 pr-1">
            <span className="block font-mono text-[9px] font-bold uppercase tracking-wider text-forest">
              {summary.activeCourse ? "CURRENT STUDY" : "RECOMMENDED NEXT"}
            </span>
            <p className="text-xs font-bold text-olive truncate mt-0.5">
              {summary.activeCourse
                ? summary.activeCourse.title
                : "Options Trading from Zero"}
            </p>
          </div>

          <Link
            href={resumeUrl}
            id="user-summary-resume-button"
            className="flex-shrink-0 inline-flex items-center gap-1 px-3 py-1.5 bg-forest hover:bg-forest/90 text-white text-xs font-semibold rounded-lg shadow-xs transition-all hover:gap-1.5"
          >
            <span>Resume</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
