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
  const topicChips = topics ?? [];

  return (
    <div
      className="flex flex-col rounded-2xl border border-hairline bg-panel p-5 h-full
        hover:border-forest/40 hover:shadow-md motion-safe:transition-all motion-safe:duration-200"
    >
      {/* 1. Badge row — level + optional flag badge, duration only on the right */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <LevelBadge level={tag} />
          {badge && (
            <span className="inline-flex items-center bg-gold text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full whitespace-nowrap">
              {badge}
            </span>
          )}
        </div>
        {duration && (
          <span className="text-[11px] text-ink-dim font-medium whitespace-nowrap pt-1">
            {duration}
          </span>
        )}
      </div>

      {/* 2. Title — unclamped, wraps naturally */}
      <h3
        className="text-[19px] font-semibold text-ink leading-snug mt-3 min-h-[52px]"
        style={{ fontFamily: "var(--font-course-serif)" }}
      >
        {title}
      </h3>

      {/* 3. Description — CSS-clamped to 2 lines, never a manual/substring truncation */}
      {description ? (
        <p className="text-[12.5px] text-ink-dim leading-relaxed mt-2 min-h-[40px] line-clamp-2">
          {description}
        </p>
      ) : (
        <p className="text-[12.5px] text-ink-dim/50 italic leading-relaxed mt-2 min-h-[40px]">
          Description coming soon.
        </p>
      )}

      {/* 4-5. Hairline + "What You Master" checklist — collapses entirely when empty.
          Label uses gold-text (not ink-dim) and the mono face, for a distinct
          register from body text — see LevelBadge.tsx for why gold-text
          (not gold DEFAULT) is the contrast-safe choice on a light background. */}
      {masterItems.length > 0 && (
        <div className="mt-4 pt-4 border-t border-hairline">
          <div
            className="text-[10px] font-medium uppercase tracking-widest text-gold-text mb-2"
            style={{ fontFamily: "var(--font-course-mono)" }}
          >
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

      {/* 6-7. Hairline + topic chips — collapses entirely when empty. Renders
          every topic (was capped at 2 with a reserved min-height; both
          removed — that was fighting the natural content height this pass
          asks the card to have). flex-wrap only wraps to a 2nd line when a
          course's actual topics need it, no reserved space either way. */}
      {topicChips.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-hairline">
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

      {/* 8-9. Hairline + footer — always present, pinned to the bottom via margin-top: auto.
          flex-wrap + a min-w-0 text span: found the status text and the button
          overlapping instead of wrapping at 320px while testing this pass's
          fixes (pre-existing, not caused by either fix below — nothing above
          touches this row — but it's the same "don't overflow" quality bar
          this pass is held to, so fixed here too). */}
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 pt-3 mt-auto border-t border-hairline">
        <span className="text-[11.5px] font-medium text-ink-dim min-w-0">
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
