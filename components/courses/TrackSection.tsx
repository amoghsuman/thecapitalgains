import CourseCard, { type CourseCardData } from "./CourseCard";

export default function TrackSection({
  title,
  courses,
}: {
  title: string;
  courses: CourseCardData[];
}) {
  return (
    <details open className="group/details mb-6">
      <summary
        className="flex items-center gap-3 cursor-pointer select-none py-3
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 focus-visible:ring-offset-ivory rounded-lg"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          className="flex-shrink-0 text-ink-dim motion-safe:transition-transform motion-safe:duration-200 group-open/details:rotate-90"
        >
          <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <h2
          className="text-[20px] font-semibold text-ink"
          style={{ fontFamily: "var(--font-course-serif)" }}
        >
          {title}
        </h2>
        <span className="text-[12px] font-medium text-ink-dim">
          {courses.length} course{courses.length === 1 ? "" : "s"}
        </span>
      </summary>

      <div
        className="grid gap-4 pt-2"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}
      >
        {courses.map((course) => (
          <CourseCard key={course.slug} course={course} />
        ))}
      </div>
    </details>
  );
}
