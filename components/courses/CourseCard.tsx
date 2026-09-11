import Link from "next/link";
import LevelBadge from "./LevelBadge";

export type CourseCardData = {
  slug: string;
  title: string;
  tag: string | null;
  badge: string | null;
  duration: string | null;
  description: string | null;
  topics: string[] | null;
  whatYouLearn: string[] | null;
  completedCount: number;
  totalLessons: number;
  resumeLessonSlug?: string;
};

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className="flex-shrink-0 text-forest mt-[3px]">
      <path d="M3 8.5l3 3 7-7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function CourseCard({ course }: { course: CourseCardData }) {
  const {
    slug,
    title,
    tag,
    badge,
    duration,
    description,
    topics,
    whatYouLearn,
    completedCount,
    totalLessons,
    resumeLessonSlug,
  } = course;

  const pct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  const hasStarted = completedCount > 0;
  const isCompleted = totalLessons > 0 && pct >= 100;

  const href = hasStarted
    ? resumeLessonSlug
      ? `/learn/${slug}/${resumeLessonSlug}`
      : `/courses/${slug}`
    : `/courses/${slug}`;

  const actionLabel = isCompleted ? "Review" : hasStarted ? "Resume" : "Start Course";
  const statusLabel = isCompleted ? "Completed" : hasStarted ? `${Math.min(pct, 100)}% done` : "Not started";

  const masterItems = (whatYouLearn ?? []).slice(0, 3);
  const topicChips = (topics ?? []).slice(0, 2);

  return (
    <div
      className="flex flex-col rounded-2xl border border-hairline bg-panel p-5 h-[540px]
        hover:border-forest/40 hover:shadow-md motion-safe:transition-all motion-safe:duration-200"
    >
      {/* Top row — level + optional flag badge, duration + lessons right-aligned */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <LevelBadge level={tag} />
          {badge && (
            <span className="inline-flex items-center bg-gold text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full whitespace-nowrap">
              {badge}
            </span>
          )}
        </div>
        {(duration || totalLessons > 0) && (
          <span className="text-[11px] text-ink-dim font-medium whitespace-nowrap pt-1">
            {duration}
            {duration && totalLessons > 0 ? " · " : ""}
            {totalLessons > 0 ? `${totalLessons} lesson${totalLessons === 1 ? "" : "s"}` : ""}
          </span>
        )}
      </div>

      {/* Title — unclamped, wraps naturally */}
      <h3
        className="text-[19px] font-semibold text-ink leading-snug mt-3 min-h-[52px]"
        style={{ fontFamily: "var(--font-course-serif)" }}
      >
        {title}
      </h3>

      {/* Description — CSS-clamped to 2 lines */}
      {description ? (
        <p className="text-[13.5px] text-ink-dim leading-relaxed mt-2 min-h-[44px] line-clamp-2">
          {description}
        </p>
      ) : (
        <p className="text-[13.5px] text-ink-dim/50 italic leading-relaxed mt-2 min-h-[44px]">
          Description coming soon.
        </p>
      )}

      {masterItems.length > 0 && (
        <div className="mt-4">
          <div className="text-[10px] font-bold uppercase tracking-widest text-ink-dim/80 mb-2">
            What You Master
          </div>
          <ul className="space-y-1.5">
            {masterItems.map((item) => (
              <li key={item} className="flex items-start gap-2 text-[12.5px] text-ink leading-snug">
                <CheckIcon />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {topicChips.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {topicChips.map((topic) => (
            <span
              key={topic}
              className="inline-flex items-center border border-hairline text-ink-dim text-[11px] font-medium px-2.5 py-1 rounded-full"
            >
              {topic}
            </span>
          ))}
        </div>
      )}

      <div className="flex-1" />

      {/* Footer — pinned to bottom regardless of content above */}
      <div className="flex items-center justify-between gap-3 pt-3 mt-3 border-t border-hairline">
        <span className="text-[11.5px] font-medium text-ink-dim">
          {totalLessons > 0 ? `${totalLessons} Lesson${totalLessons === 1 ? "" : "s"}` : "Lessons TBD"}
          {" · "}
          {statusLabel}
        </span>
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-[12px] font-bold tracking-wide whitespace-nowrap text-white bg-forest rounded-lg px-3.5 py-2
            hover:bg-forest-dark motion-safe:transition-colors
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 focus-visible:ring-offset-panel"
        >
          {actionLabel} →
        </Link>
      </div>
    </div>
  );
}
