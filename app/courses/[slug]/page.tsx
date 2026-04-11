"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAllCourses } from "@/lib/sanity/queries";
import "@/app/premium-theme.css";

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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CoursesPage() {
  const router = useRouter();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [search, setSearch] = useState("");
  const [filterPath, setFilterPath] = useState("all");

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

  const uniquePaths = useMemo(() => {
    const seen = new Set<string>();
    courses.forEach((c) => { if (c.learningPath) seen.add(c.learningPath); });
    return Array.from(seen).sort();
  }, [courses]);

  const displayed = useMemo(() => {
    return courses.filter((c) => {
      if (search) {
        const q = search.toLowerCase();
        if (!c.title?.toLowerCase().includes(q) && !c.description?.toLowerCase().includes(q)) return false;
      }
      if (filterPath !== "all" && c.learningPath !== filterPath) return false;
      return true;
    });
  }, [courses, search, filterPath]);

  if (loading) return (
    <div className="bg-[#F8FAFC] min-h-screen flex items-center justify-center">
      <div className="premium-glow-dot animate-pulse" />
    </div>
  );

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-20">
      
      {/* ── HEADER ── */}
      <div className="premium-dark pt-32 pb-20 border-b border-[rgba(255,255,255,0.05)]">
        <div className="max-w-6xl mx-auto px-8">
          <div className="inline-flex items-center gap-2 bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.2)] rounded-full px-4 py-1.5 mb-6">
            <div className="premium-glow-dot" />
            <span className="font-mono text-[10px] text-[#A78BFA] tracking-[0.2em] uppercase">Curriculum</span>
          </div>
          <h1 className="text-5xl font-bold text-white tracking-tight leading-tight">
            Master the Markets
          </h1>
          <p className="text-[#94A3B8] text-lg mt-4 max-w-2xl">
            Structured playbooks for retail investors. No videos, just high-signal reading 
            and actionable exercises.
          </p>
        </div>
      </div>

      {/* ── CONTROLS ── */}
      <div className="max-w-6xl mx-auto px-8 -mt-8 relative z-10">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xl flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[240px]">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by topic or title..."
              className="w-full h-12 pl-12 pr-4 rounded-xl bg-slate-50 border-none text-sm focus:ring-2 focus:ring-violet-500/20 transition-all"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          <select 
            value={filterPath} 
            onChange={(e) => setFilterPath(e.target.value)}
            className="h-12 px-6 rounded-xl bg-slate-50 border-none text-sm font-semibold text-[#1C0F3F] focus:ring-2 focus:ring-violet-500/20"
          >
            <option value="all">All Learning Paths</option>
            {uniquePaths.map(p => <option key={p} value={p}>{p.toUpperCase()}</option>)}
          </select>
        </div>
      </div>

      {/* ── GRID ── */}
      <div className="max-w-6xl mx-auto px-8 mt-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayed.map((course) => (
            <Link key={course._id} href={`/courses/${course.slug}`}>
              <div className="bg-white border border-slate-200 rounded-2xl p-8 h-full flex flex-col hover:shadow-2xl hover:border-violet-200 hover:-translate-y-1 transition-all group">
                <div className="flex justify-between items-start mb-8">
                  <div className="p-3 bg-violet-50 rounded-2xl group-hover:bg-violet-600 group-hover:text-white transition-colors text-violet-600">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  {course.badge && (
                    <span className="bg-[#D4860A10] text-[#D4860A] text-[10px] font-bold px-3 py-1 rounded-full tracking-widest uppercase">
                      {course.badge}
                    </span>
                  )}
                </div>

                <div className="flex-1">
                  <div className="font-mono text-[10px] text-slate-400 tracking-[0.2em] uppercase mb-2">
                    {course.tag || "Core Curriculum"}
                  </div>
                  <h3 className="text-2xl font-bold text-[#1C0F3F] leading-tight mb-4 group-hover:text-violet-600 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed line-clamp-3">
                    {course.description || course.subtitle}
                  </p>
                </div>

                <div className="mt-10 pt-8 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Access</span>
                    <span className={`text-xs font-bold ${course.accessLevel === 'pro' ? 'text-[#D4860A]' : 'text-emerald-600'}`}>
                      {course.accessLevel?.toUpperCase() || 'LEARNER+'}
                    </span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lessons</span>
                    <span className="text-xs font-bold text-[#1C0F3F]">{course.lessonsCount || '—'} Modules</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
