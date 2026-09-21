import { MetadataRoute } from "next";
import { getAllCourses } from "@/lib/sanity/queries";

export const revalidate = 3600;

const BASE = "https://thecapitalgains.com";

const STATIC_ROUTES: { path: string; changeFrequency: "weekly" | "monthly"; priority: number }[] = [
  { path: "", changeFrequency: "weekly", priority: 1.0 },
  { path: "/courses", changeFrequency: "weekly", priority: 0.8 },
  { path: "/pricing", changeFrequency: "monthly", priority: 0.8 },
  { path: "/newsletter", changeFrequency: "monthly", priority: 0.5 },
  { path: "/portfolios", changeFrequency: "monthly", priority: 0.5 },
  { path: "/about", changeFrequency: "monthly", priority: 0.5 },
  { path: "/terms", changeFrequency: "monthly", priority: 0.5 },
  { path: "/privacy", changeFrequency: "monthly", priority: 0.5 },
  { path: "/refund", changeFrequency: "monthly", priority: 0.5 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: `${BASE}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  // A Sanity outage must not take the whole sitemap down with it.
  let courseSlugs: string[] = [];
  try {
    const courses: { slug?: string | null }[] = (await getAllCourses()) ?? [];
    courseSlugs = courses.map((c) => c.slug).filter((s): s is string => Boolean(s));
  } catch (err: unknown) {
    console.error("[sitemap] course fetch failed:", err instanceof Error ? err.message : err);
  }

  const courseEntries: MetadataRoute.Sitemap = courseSlugs.map((slug) => ({
    url: `${BASE}/courses/${slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticEntries, ...courseEntries];
}
