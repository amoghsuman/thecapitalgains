import { Source_Serif_4, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { getAllCourses } from "@/lib/sanity/queries";
import { LEARNING_PATHS } from "@/sanity/lib/learningPaths";
import { TRACK_GROUPS } from "@/lib/home/trackGroups";
import { LEVELS } from "@/lib/courses/level";
import CoursesCatalog, { type CatalogCourse } from "@/components/courses/CoursesCatalog";
import "@/app/premium-theme.css";

// Server component: courses are fetched here, so the catalogue is in the
// initial HTML (crawlable, and independent of Sanity CORS on preview hosts).
// The filtering UI and per-user progress live in <CoursesCatalog /> (client).
export const revalidate = 300;

// Scoped to this page only — the rest of the site runs on Inter (see
// tailwind.config.ts). These two are new per the redesign brief; if this
// becomes a site-wide rebrand, promote them into the root layout instead.
const courseSerif = Source_Serif_4({
  variable: "--font-course-serif",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});
const coursePlexSans = IBM_Plex_Sans({
  variable: "--font-course-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});
const coursePlexMono = IBM_Plex_Mono({
  variable: "--font-course-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

type SearchParams = Record<string, string | string[] | undefined>;

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function CoursesPage({ searchParams }: { searchParams: SearchParams }) {
  const courses: CatalogCourse[] = (await getAllCourses()) ?? [];

  // Only accept values we actually know; anything else falls back to "all".
  const groupParam = firstParam(searchParams.group);
  const pathParam = firstParam(searchParams.path);
  const initialGroup = TRACK_GROUPS.some((g) => g.slug === groupParam) && groupParam ? groupParam : "all";
  const initialPath = LEARNING_PATHS.some((p) => p.value === pathParam) && pathParam ? pathParam : "all";

  const trackCount = new Set(courses.map((c) => c.learningPath).filter(Boolean)).size;

  const header = (
    <div className="pt-32 pb-10">
      <div className="site-container">
        <div className="inline-flex items-center gap-2 bg-forest-surface border border-hairline rounded-full px-4 py-1.5 mb-6">
          <div className="premium-glow-dot" />
          <span className="text-[10px] text-gold-text tracking-[0.2em] uppercase font-semibold">Curriculum Explorer</span>
        </div>
        <h1
          className="text-4xl font-semibold text-ink tracking-tight leading-tight"
          style={{ fontFamily: "var(--font-course-serif)" }}
        >
          Our Learning Paths
        </h1>
        <p className="text-ink-dim text-[16px] mt-2 max-w-2xl leading-relaxed">
          Rigorous, high-density courses built for quick scanning and faster decisions.
          Filter by strategy and find your edge.
        </p>
        <div
          className="text-[11px] text-ink-dim tracking-[0.1em] uppercase mt-4"
          style={{ fontFamily: "var(--font-course-mono)" }}
        >
          {courses.length} Courses · {trackCount} Tracks · {LEVELS.length} Levels
        </div>
      </div>
    </div>
  );

  return (
    <div
      className={`${courseSerif.variable} ${coursePlexSans.variable} ${coursePlexMono.variable} min-h-screen pb-20`}
      style={{ fontFamily: "var(--font-course-sans)" }}
    >
      <CoursesCatalog
        courses={courses}
        initialGroup={initialGroup}
        initialPath={initialPath}
        header={header}
      />
    </div>
  );
}
