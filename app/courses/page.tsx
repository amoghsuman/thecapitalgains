"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAllCourses } from "@/lib/sanity/queries";

// ─── Types ────────────────────────────────────────────────────────────────────

type Course = {
  _id: string;
  title: string;
  slug: string;
  tag: string | null;
  price: number | null;
  accessLevel: string | null;
  badge: string | null;
  subtitle: string | null;
  lessonsCount: number | null;
  duration: string | null;
  description: string | null;
  topics: string[] | null;
  learningPath: string | null;
  orderRank: number | null;
};

type SortCol = "title" | "learningPath" | "tag" | "accessLevel" | "lessonsCount" | "duration" | "badge";
type SortDir = "asc" | "desc";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseDurationHrs(duration: string | null): number {
  if (!duration) return 0;
  return parseFloat(duration.replace(/[^0-9.]/g, "") || "0");
}

function durBucket(hrs: number): string {
  if (hrs < 2) return "lt2";
  if (hrs <= 4) return "2to4";
  return "gt4";
}

function levelColor(tag: string | null): string {
  if (!tag) return "bg-[#F4F1EB] text-[#7A7A8A]";
  const t = tag.toLowerCase();
  if (t.includes("advanced")) return "bg-[#FEF2F2] text-[#DC2626]";
  if (t.includes("intermediate")) return "bg-[#FDF3E3] text-[#D4860A]";
  if (t.includes("beginner")) return "bg-[#E8F5EE] text-[#1A7A4A]";
  return "bg-[#F4F1EB] text-[#7A7A8A]";
}

function accessColor(level: string | null): string {
  if (level === "free") return "bg-[#E8F5EE] text-[#1A7A4A]";
  if (level === "pro") return "bg-[#FDF3E3] text-[#D4860A]";
  return "bg-[#F4F1EB] text-[#7A7A8A]";
}

function accessLabel(level: string | null): string {
  if (level === "free") return "FREE";
  if (level === "pro") return "PRO";
  return "LEARNER+";
}

function badgeColor(badge: string | null): string {
  if (badge === "BESTSELLER") return "bg-[rgba(212,134,10,0.15)] text-[#D4860A]";
  if (badge === "NEW") return "bg-[rgba(26,122,74,0.15)] text-[#1A7A4A]";
  return "bg-[#F4F1EB] text-[#7A7A8A]";
}

function formatPath(path: string | null): string {
  if (!path) return "—";
  return path.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CoursesPage() {
  const router = useRouter();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [search, setSearch] = useState("");
  const [filterPath, setFilterPath] = useState("all");
  const [filterLevel, setFilterLevel] = useState("all");
  const [filterAccess, setFilterAccess] = useState("all");
  const [filterDur, setFilterDur] = useState("all");

  const [sortCol, setSortCol] = useState<SortCol>("title");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  useEffect(() => {
    getAllCourses()
      .then((data) => {
        setCourses(data as Course[]);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  // Unique learning paths from fetched data
  const uniquePaths = useMemo(() => {
    const seen = new Set<string>();
    courses.forEach((c) => { if (c.learningPath) seen.add(c.learningPath); });
    return Array.from(seen).sort();
  }, [courses]);

  // Unique level tags from fetched data
  const uniqueTags = useMemo(() => {
    const seen = new Set<string>();
    courses.forEach((c) => { if (c.tag) seen.add(c.tag); });
    return Array.from(seen).sort();
  }, [courses]);

  // Filtered + sorted courses
  const displayed = useMemo(() => {
    let list = courses.filter((c) => {
      // Search
      if (search) {
        const q = search.toLowerCase();
        const inTitle = c.title?.toLowerCase().includes(q);
        const inTopics = c.topics?.some((t) => t.toLowerCase().includes(q));
        const inPath = c.learningPath?.toLowerCase().includes(q);
        if (!inTitle && !inTopics && !inPath) return false;
      }
      // Learning path
      if (filterPath !== "all" && c.learningPath !== filterPath) return false;
      // Level — exact match on stored tag string
      if (filterLevel !== "all" && c.tag !== filterLevel) return false;
      // Access
      if (filterAccess !== "all") {
        const map: Record<string, string> = { "Free": "free", "Learner+": "learner", "Pro": "pro" };
        if (c.accessLevel !== (map[filterAccess] ?? filterAccess)) return false;
      }
      // Duration
      if (filterDur !== "all") {
        const hrs = parseDurationHrs(c.duration);
        const bucket = durBucket(hrs);
        if (filterDur === "lt2" && bucket !== "lt2") return false;
        if (filterDur === "2to4" && bucket !== "2to4") return false;
        if (filterDur === "gt4" && bucket !== "gt4") return false;
      }
      return true;
    });

    // Sort
    list = [...list].sort((a, b) => {
      let va: string | number = "";
      let vb: string | number = "";
      if (sortCol === "lessonsCount") {
        va = a.lessonsCount ?? 0;
        vb = b.lessonsCount ?? 0;
      } else if (sortCol === "duration") {
        va = parseDurationHrs(a.duration);
        vb = parseDurationHrs(b.duration);
      } else {
        va = (a[sortCol] ?? "").toString().toLowerCase();
        vb = (b[sortCol] ?? "").toString().toLowerCase();
      }
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return list;
  }, [courses, search, filterPath, filterLevel, filterAccess, filterDur, sortCol, sortDir]);

  function handleSort(col: SortCol) {
    if (sortCol === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortCol(col);
      setSortDir("asc");
    }
  }

  function clearFilters() {
    setSearch("");
    setFilterPath("all");
    setFilterLevel("all");
    setFilterAccess("all");
    setFilterDur("all");
  }

  const hasActiveFilters = search || filterPath !== "all" || filterLevel !== "all" || filterAccess !== "all" || filterDur !== "all";

  const SortArrow = ({ col }: { col: SortCol }) =>
    sortCol === col ? (
      <span className="ml-1">{sortDir === "asc" ? "↑" : "↓"}</span>
    ) : null;

  const thClass = (col: SortCol) =>
    `px-3 py-2 text-left font-mono text-[10px] tracking-wider uppercase cursor-pointer select-none transition-colors ${
      sortCol === col ? "text-[#D4860A]" : "text-[rgba(255,255,255,0.55)]"
    }`;

  const dropdownClass =
    "font-mono text-[11px] border border-[rgba(17,17,17,0.15)] rounded-[6px] px-[10px] bg-white h-[34px] outline-none focus:border-[rgba(17,17,17,0.35)] transition-colors text-[#111111]";

  if (loading) {
    return (
      <div className="bg-[#FAFAF7] min-h-screen flex items-center justify-center">
        <span className="font-mono text-[13px] text-[#7A7A8A]">Loading courses...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#FAFAF7] min-h-screen flex items-center justify-center">
        <span className="font-mono text-[13px] text-[#DC2626]">Failed to load courses.</span>
      </div>
    );
  }

  return (
    <div className="bg-[#FAFAF7] min-h-screen">

      {/* ── HEADER ── */}
      <div className="max-w-6xl mx-auto px-8 pt-10 pb-6">
        <h1 className="font-serif text-[32px] font-bold text-[#111111] leading-tight mb-1">
          All Courses
        </h1>
        <p className="text-[14px] text-[#7A7A8A]">
          Subscribe to access. Free previews available — no card required.
        </p>
      </div>

      {/* ── CONTROLS ── */}
      <div className="max-w-6xl mx-auto px-8 mb-3 flex gap-3 items-center flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px]">
          <svg
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9A9A9A]"
            width="13" height="13" viewBox="0 0 16 16" fill="none"
          >
            <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses, topics..."
            className="w-full h-[34px] pl-[34px] pr-3 py-2 border border-[rgba(17,17,17,0.15)] rounded-[6px] text-[13px] text-[#111111] placeholder:text-[#9A9A9A] bg-white outline-none focus:border-[rgba(17,17,17,0.35)] transition-colors"
          />
        </div>

        {/* Learning path */}
        <select value={filterPath} onChange={(e) => setFilterPath(e.target.value)} className={dropdownClass}>
          <option value="all">All paths</option>
          {uniquePaths.map((p) => (
            <option key={p} value={p}>{formatPath(p)}</option>
          ))}
        </select>

        {/* Level */}
        <select value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)} className={dropdownClass}>
          <option value="all">All levels</option>
          {uniqueTags.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        {/* Access */}
        <select value={filterAccess} onChange={(e) => setFilterAccess(e.target.value)} className={dropdownClass}>
          <option value="all">All access</option>
          <option value="Free">Free</option>
          <option value="Learner+">Learner+</option>
          <option value="Pro">Pro</option>
        </select>

        {/* Duration */}
        <select value={filterDur} onChange={(e) => setFilterDur(e.target.value)} className={dropdownClass}>
          <option value="all">Any duration</option>
          <option value="lt2">&lt; 2 hrs</option>
          <option value="2to4">2–4 hrs</option>
          <option value="gt4">4+ hrs</option>
        </select>
      </div>

      {/* ── ACTIVE FILTERS + COUNT ── */}
      <div className="max-w-6xl mx-auto px-8 mb-3 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          {search && (
            <span className="inline-flex items-center gap-1 bg-[#111111] text-white font-mono text-[10px] rounded-full px-2.5 py-1">
              &ldquo;{search}&rdquo;
              <button onClick={() => setSearch("")} className="ml-0.5 opacity-60 hover:opacity-100">×</button>
            </span>
          )}
          {filterPath !== "all" && (
            <span className="inline-flex items-center gap-1 bg-[#111111] text-white font-mono text-[10px] rounded-full px-2.5 py-1">
              {formatPath(filterPath)}
              <button onClick={() => setFilterPath("all")} className="ml-0.5 opacity-60 hover:opacity-100">×</button>
            </span>
          )}
          {filterLevel !== "all" && (
            <span className="inline-flex items-center gap-1 bg-[#111111] text-white font-mono text-[10px] rounded-full px-2.5 py-1">
              {filterLevel}
              <button onClick={() => setFilterLevel("all")} className="ml-0.5 opacity-60 hover:opacity-100">×</button>
            </span>
          )}
          {filterAccess !== "all" && (
            <span className="inline-flex items-center gap-1 bg-[#111111] text-white font-mono text-[10px] rounded-full px-2.5 py-1">
              {filterAccess}
              <button onClick={() => setFilterAccess("all")} className="ml-0.5 opacity-60 hover:opacity-100">×</button>
            </span>
          )}
          {filterDur !== "all" && (
            <span className="inline-flex items-center gap-1 bg-[#111111] text-white font-mono text-[10px] rounded-full px-2.5 py-1">
              {filterDur === "lt2" ? "< 2 hrs" : filterDur === "2to4" ? "2–4 hrs" : "4+ hrs"}
              <button onClick={() => setFilterDur("all")} className="ml-0.5 opacity-60 hover:opacity-100">×</button>
            </span>
          )}
        </div>
        <span className="font-mono text-[11px] text-[#9A9A9A] flex-shrink-0">
          {displayed.length} {displayed.length === 1 ? "course" : "courses"}
        </span>
      </div>

      {/* ── TABLE ── */}
      <div className="max-w-6xl mx-auto px-8 pb-20">
        <div className="border border-[rgba(17,17,17,0.12)] rounded-lg overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#111111]">
                <th className={thClass("title")} style={{ width: "30%" }} onClick={() => handleSort("title")}>
                  Course <SortArrow col="title" />
                </th>
                <th className={thClass("learningPath")} style={{ width: "16%" }} onClick={() => handleSort("learningPath")}>
                  Learning Path <SortArrow col="learningPath" />
                </th>
                <th className={thClass("tag")} style={{ width: "10%" }} onClick={() => handleSort("tag")}>
                  Level <SortArrow col="tag" />
                </th>
                <th className={thClass("accessLevel")} style={{ width: "9%" }} onClick={() => handleSort("accessLevel")}>
                  Access <SortArrow col="accessLevel" />
                </th>
                <th className={`${thClass("lessonsCount")} text-right`} style={{ width: "8%" }} onClick={() => handleSort("lessonsCount")}>
                  Lessons <SortArrow col="lessonsCount" />
                </th>
                <th className={`${thClass("duration")} text-right`} style={{ width: "8%" }} onClick={() => handleSort("duration")}>
                  Duration <SortArrow col="duration" />
                </th>
                <th className={thClass("badge")} style={{ width: "8%" }} onClick={() => handleSort("badge")}>
                  Badge <SortArrow col="badge" />
                </th>
                <th className="px-3 py-2 text-right font-mono text-[10px] tracking-wider uppercase text-[rgba(255,255,255,0.55)]" style={{ width: "11%" }}>
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {displayed.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-[13px] text-[#7A7A8A]">
                    No courses match your filters.{" "}
                    <button onClick={clearFilters} className="text-[#D4860A] hover:text-[#F0A020] font-medium transition-colors">
                      Clear filters
                    </button>
                  </td>
                </tr>
              ) : (
                displayed.map((course, i) => (
                  <tr
                    key={course._id}
                    onClick={() => router.push(`/courses/${course.slug}`)}
                    className={`border-b border-[rgba(17,17,17,0.05)] cursor-pointer transition-colors hover:bg-[#F0EDE6] ${
                      i % 2 === 0 ? "bg-white" : "bg-[#FAFAF7]"
                    }`}
                  >
                    {/* Course name */}
                    <td className="px-3 py-[7px] border-r border-[rgba(17,17,17,0.04)]">
                      <div className="font-medium text-[13px] text-[#111111] leading-snug">
                        {course.title}
                      </div>
                      {course.topics && course.topics.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {course.topics.slice(0, 3).map((t) => (
                            <span key={t} className="font-mono text-[9px] text-[#9A9A9A] bg-[#F4F1EB] rounded px-1.5 py-0.5">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>

                    {/* Learning path */}
                    <td className="px-3 py-[7px] border-r border-[rgba(17,17,17,0.04)]">
                      <span className="font-mono text-[10px] text-[#7A7A8A]">
                        {formatPath(course.learningPath)}
                      </span>
                    </td>

                    {/* Level */}
                    <td className="px-3 py-[7px] border-r border-[rgba(17,17,17,0.04)]">
                      {course.tag ? (
                        <span className={`font-mono text-[9px] font-medium rounded px-2 py-0.5 ${levelColor(course.tag)}`}>
                          {course.tag}
                        </span>
                      ) : (
                        <span className="text-[#9A9A9A]">—</span>
                      )}
                    </td>

                    {/* Access */}
                    <td className="px-3 py-[7px] border-r border-[rgba(17,17,17,0.04)]">
                      <span className={`font-mono text-[9px] font-medium rounded px-2 py-0.5 ${accessColor(course.accessLevel)}`}>
                        {accessLabel(course.accessLevel)}
                      </span>
                    </td>

                    {/* Lessons */}
                    <td className="px-3 py-[7px] border-r border-[rgba(17,17,17,0.04)] text-right">
                      <span className="font-mono text-[11px] text-[#7A7A8A]">
                        {course.lessonsCount ?? "—"}
                      </span>
                    </td>

                    {/* Duration */}
                    <td className="px-3 py-[7px] border-r border-[rgba(17,17,17,0.04)] text-right">
                      <span className="font-mono text-[11px] text-[#7A7A8A]">
                        {course.duration ?? "—"}
                      </span>
                    </td>

                    {/* Badge — exclude FREE/free (already shown in Access column) */}
                    <td className="px-3 py-[7px] border-r border-[rgba(17,17,17,0.04)]">
                      {course.badge && course.badge.toLowerCase() !== "free" ? (
                        <span className={`font-mono text-[9px] font-medium rounded px-2 py-0.5 ${badgeColor(course.badge)}`}>
                          {course.badge}
                        </span>
                      ) : null}
                    </td>

                    {/* Action */}
                    <td className="px-3 py-[7px] text-right">
                      <Link
                        href={`/courses/${course.slug}`}
                        onClick={(e) => e.stopPropagation()}
                        className="font-mono text-[11px] text-[#D4860A] hover:text-[#F0A020] transition-colors whitespace-nowrap"
                      >
                        {course.accessLevel === "free" ? "Start free →" : "Preview →"}
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── FOOTER NUDGE ── */}
      <div className="max-w-6xl mx-auto px-8 py-6 border-t border-[rgba(17,17,17,0.08)]">
        <p className="text-[13px] text-[#7A7A8A]">
          Looking for something specific?{" "}
          <Link href="/pricing" className="text-[#D4860A] hover:text-[#F0A020] transition-colors font-medium">
            Browse by learning path →
          </Link>
        </p>
      </div>

    </div>
  );
}
