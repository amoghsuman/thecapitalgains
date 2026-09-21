// Server-only. Builds the Sanity side of getLearnerStats(): per-course titles
// and lesson totals, plus a lesson slug -> minutes map. Never import this from
// a client component; the browser gets stats through /api/learner-stats.

import { unstable_cache } from "next/cache";
import { client } from "@/lib/sanity/client";
import type { LearnerCatalog } from "@/lib/dashboard/stats";

type CatalogQueryRow = {
  slug: string | null;
  title: string | null;
  tag: string | null;
  learningPath: string | null;
  lessonsCount: number | null;
  lessons: ({ slug: string | null; duration: string | null } | null)[] | null;
};

const CATALOG_QUERY = `
  *[_type == "course"] {
    "slug": slug.current,
    title,
    tag,
    learningPath,
    lessonsCount,
    "lessons": chapters[].lessons[]->{ "slug": slug.current, duration }
  }
`;

// "8 min" / "12 min read" -> 8 / 12. Anything without a number counts as 0.
function parseMinutes(duration: string | null): number {
  const match = duration?.match(/\d+(\.\d+)?/);
  return match ? Math.round(Number(match[0])) : 0;
}

// Uncached loader. App code should use getLearnerCatalog() below; this is
// exported for scripts and tests, where Next's cache is not available.
export async function loadCatalog(): Promise<LearnerCatalog> {
  const rows = await client.fetch<CatalogQueryRow[]>(CATALOG_QUERY);
  const lessonMinutes: Record<string, number> = {};
  const courses: LearnerCatalog["courses"] = [];

  for (const row of rows ?? []) {
    if (!row.slug) continue;
    const lessons = (row.lessons ?? []).filter(
      (l): l is { slug: string; duration: string | null } => Boolean(l?.slug)
    );
    for (const lesson of lessons) lessonMinutes[lesson.slug] = parseMinutes(lesson.duration);
    courses.push({
      slug: row.slug,
      title: row.title ?? row.slug,
      tag: row.tag,
      learningPath: row.learningPath,
      // Real reference count first; the authored lessonsCount only as a fallback.
      totalLessons: lessons.length || row.lessonsCount || 0,
    });
  }

  return { courses, lessonMinutes };
}

// ~2,800 lessons: cache it rather than re-querying Sanity on every dashboard
// or widget request.
export const getLearnerCatalog = unstable_cache(loadCatalog, ["learner-catalog-v1"], {
  revalidate: 300,
  tags: ["learner-catalog"],
});
