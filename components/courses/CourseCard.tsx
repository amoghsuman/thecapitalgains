import Link from "next/link";
import LevelBadge from "./LevelBadge";
import ProgressBar from "./ProgressBar";
import { firstSentences } from "@/lib/courses/excerpt";

export type CourseCardData = {
  slug: string;
  title: string;
  tag: string | null;
  duration: string | null;
  description: string | null;
  completedCount: number;
  totalLessons: number;
  resumeLessonSlug?: string;
};

export default function CourseCard({ course }: { course: CourseCardData }) {
  const { slug, title, tag, duration, description, completedCount, totalLessons, resumeLessonSlug } = course;

  const pct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  const hasStarted = completedCount > 0;
  const isCompleted = totalLessons > 0 && pct >= 100;

  const href = hasStarted
    ? resumeLessonSlug
      ? `/learn/${slug}/${resumeLessonSlug}`
      : `/courses/${slug}`
    : `/courses/${slug}`;

  const actionLabel = isCompleted ? "Review course" : hasStarted ? "Resume course" : "Start course";
  const actionColor = isCompleted ? "text-forest" : hasStarted ? "text-gold-text" : "text-forest";

  const excerpt = description ? firstSentences(description, 2) : null;

  return (
    <Link
      href={href}
      className="group flex flex-col gap-3 rounded-2xl border border-hairline bg-panel p-5 h-full
        hover:border-forest hover:shadow-md motion-safe:transition-all motion-safe:duration-200
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 focus-visible:ring-offset-ivory"
    >
      <div className="flex items-center justify-between gap-3">
        <LevelBadge level={tag} />
        {duration && <span className="text-[11px] text-ink-dim font-medium whitespace-nowrap">{duration}</span>}
      </div>

      <h3
        className="text-[19px] font-semibold text-ink leading-snug line-clamp-2 group-hover:text-forest motion-safe:transition-colors"
        style={{ fontFamily: "var(--font-course-serif)" }}
      >
        {title}
      </h3>

      {excerpt ? (
        <p className="text-[13.5px] text-ink-dim leading-relaxed">{excerpt}</p>
      ) : (
        <p className="text-[13.5px] text-ink-dim/50 italic leading-relaxed">Description coming soon.</p>
      )}

      <div className="flex-1" />

      <div className="flex items-center justify-between gap-3 pt-2 border-t border-hairline">
        <div className="flex-1 min-w-0">
          {hasStarted ? (
            <ProgressBar pct={Math.min(pct, 100)} completed={isCompleted} />
          ) : (
            <span className="text-[11px] font-medium text-ink-dim/70">Not started</span>
          )}
        </div>
        <span className={`text-[12px] font-bold tracking-wide whitespace-nowrap ${actionColor}`}>
          {actionLabel} →
        </span>
      </div>
    </Link>
  );
}
