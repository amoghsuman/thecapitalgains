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
  const [filterLevel, setFilterLevel] = useState("all");

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
      if (filterLevel !== "all" && c.tag?.toLowerCase() !== filterLevel.toLowerCase()) return false;
      return true;
    });
  }, [courses, search, filterPath, filterLevel]);

  if (loading) return (
    <div className="bg-[#F8FAFC] min-h-screen flex items-center justify-center">
      <div className="premium-glow-dot animate-pulse" />
    </div>
  );

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-20 font-sans">
      
      {/* ── HEADER ── */}
      <div className="premium-dark pt-32 pb-20 border-b border-[rgba(255,255,255,0.05)]">
        <div className="max-w-7xl mx-auto px-8">
          <div className="inline-flex items-center gap-2 bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.2)] rounded-full px-4 py-1.5 mb-6">
            <div className="premium-glow-dot" />
            <span className="font-mono text-[10px] text-[#A78BFA] tracking-[0.2em] uppercase">Curriculum Explorer</span>
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight leading-tight">
            Our Learning Paths
          </h1>
          <p className="text-[#94A3B8] text-[16px] mt-2 max-w-2xl leading-relaxed">
            High-density, text-first curriculum designed for quick scanning and decision making. 
            No fluff. Filter by strategy to start your edge.
          </p>
        </div>
      </div>

      {/* ── CONTROLS ── */}
      <div className="max-w-7xl mx-auto px-8 -mt-8 relative z-10">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xl flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[280px]">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by strategy, instrument or title..."
              className="w-full h-12 pl-12 pr-4 rounded-xl bg-slate-50 border-none text-[13px] font-medium focus:ring-2 focus:ring-violet-500/20 transition-all"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          <select 
            value={filterPath} 
            onChange={(e) => setFilterPath(e.target.value)}
            className="h-12 px-6 rounded-xl bg-slate-50 border-none text-[13px] font-bold text-[#1C0F3F] focus:ring-2 focus:ring-violet-500/20"
          >
            <option value="all">All Learning Paths</option>
            {uniquePaths.map(p => <option key={p} value={p}>{p.toUpperCase()}</option>)}
          </select>

          <select 
            value={filterLevel} 
            onChange={(e) => setFilterLevel(e.target.value)}
            className="h-12 px-6 rounded-xl bg-slate-50 border-none text-[13px] font-bold text-[#1C0F3F] focus:ring-2 focus:ring-violet-500/20"
          >
            <option value="all">Any Level</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
      </div>

      {/* ── DATA TABLE ── */}
      <div className="max-w-7xl mx-auto px-8 mt-12 overflow-hidden">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-left font-mono text-[10px] text-slate-400 tracking-widest uppercase font-bold">Strategy & Title</th>
                <th className="px-6 py-4 text-left font-mono text-[10px] text-slate-400 tracking-widest uppercase font-bold">Level</th>
                <th className="px-6 py-4 text-left font-mono text-[10px] text-slate-400 tracking-widest uppercase font-bold">Access</th>
                <th className="px-6 py-4 text-left font-mono text-[10px] text-slate-400 tracking-widest uppercase font-bold">Duration</th>
                <th className="px-6 py-4 text-right font-mono text-[10px] text-slate-400 tracking-widest uppercase font-bold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayed.length > 0 ? (
                displayed.map((course) => (
                  <tr 
                    key={course._id} 
                    className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                    onClick={() => router.push(`/courses/${course.slug}`)}
                  >
                    <td className="px-6 py-5">
                      <div>
                        <div className="text-[14px] font-bold text-[#1C0F3F] mb-1 group-hover:text-violet-600 transition-colors">
                          {course.title}
                        </div>
                        <div className="text-[12px] text-slate-400 line-clamp-1 max-w-lg">
                          {course.subtitle || course.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                        course.tag?.includes('Beginner') ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        course.tag?.includes('Advanced') ? 'bg-rose-50 text-rose-600 border-rose-100' :
                        'bg-violet-50 text-violet-600 border-violet-100'
                      }`}>
                        {course.tag || 'Core'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`text-[10px] font-bold tracking-widest uppercase ${
                        course.accessLevel === 'free' ? 'text-emerald-500' : 'text-amber-500'
                      }`}>
                        {course.accessLevel || 'Learner+'}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-slate-400 text-[12px] font-mono">
                      {course.duration || '—'}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <Link 
                        href={`/courses/${course.slug}`}
                        className="text-[11px] font-black uppercase tracking-widest text-[#D4860A] hover:text-[#F0A020] transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Start →
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-slate-400 text-sm italic">
                    No results found for your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
